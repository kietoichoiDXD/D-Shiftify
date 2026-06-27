import connection from 'core/database';
import { NotFoundException } from 'packages/httpException';
import { ForbiddenException } from 'packages/httpException/ForbiddenException';
import { evaluateMatch, MATCHING_CRITERIA_V2 } from '../../../ai/retrieval/match.scoring';
import { refineMatchWithAI } from '../../../ai/matching/agentic.matcher';

const AI_REFINE_TOP_N = Number.parseInt(process.env.AI_MATCH_REFINE_TOP_N || '10', 10);

const parseJsonArray = value => {
    if (Array.isArray(value)) return value;
    if (!value) return [];
    try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
        return [];
    }
};

class MatchingServiceClass {
    getCriteria() {
        return {
            version: 'v2',
            criteria: MATCHING_CRITERIA_V2,
            note: 'Thứ tự ưu tiên do người dùng chọn sẽ nhận dần bộ trọng số 25, 20, 15, 15, 10, 5, 5, 5.',
        };
    }

    async getCandidateProfile(cvId, userId) {
        const cv = await connection('cvs')
            .innerJoin('profiles', 'profiles.id', 'cvs.profile_id')
            .where('cvs.id', cvId)
            .whereNull('cvs.deleted_at')
            .select(
                'cvs.id',
                'cvs.profile_id',
                'cvs.job_type',
                'cvs.work_mode',
                'cvs.mobility',
                'cvs.expected_job',
                'cvs.skills',
                'cvs.conditions',
                'cvs.experiences',
                'cvs.certificates',
                'cvs.custom_sections',
                'profiles.user_id',
            )
            .first();

        if (!cv) throw new NotFoundException('CV not found');
        if (cv.user_id !== userId) throw new ForbiddenException('You do not have permission to match this CV');

        const devices = await connection('user_devices')
            .innerJoin('assistive_devices', 'assistive_devices.id', 'user_devices.device_id')
            .where('user_devices.profile_id', cv.profile_id)
            .whereNull('user_devices.deleted_at')
            .pluck('assistive_devices.name');

        return {
            id: cv.id,
            jobType: cv.job_type,
            workMode: cv.work_mode,
            mobility: cv.mobility,
            expectedJob: cv.expected_job,
            skills: parseJsonArray(cv.skills),
            conditions: parseJsonArray(cv.conditions),
            experiences: parseJsonArray(cv.experiences),
            certificates: parseJsonArray(cv.certificates),
            customSections: parseJsonArray(cv.custom_sections),
            devices,
        };
    }

    async getJobs(jobIds, limit) {
        const query = connection('jobs')
            .leftJoin('companies', 'companies.id', 'jobs.company_id')
            .where('jobs.status', 'open')
            .whereNull('jobs.deleted_at')
            .select(
                'jobs.id',
                'jobs.title',
                'jobs.job_type',
                'jobs.work_mode',
                'jobs.experience_required',
                'jobs.skills',
                'jobs.location',
                'jobs.description',
                'companies.name as company_name',
                'companies.policy_for_disabled',
                'companies.experience_with_disabled',
            )
            .orderBy('jobs.created_at', 'desc')
            .limit(limit);

        if (jobIds.length) query.whereIn('jobs.id', jobIds);
        const jobs = await query;
        if (!jobs.length) return [];

        const deviceRows = await connection('job_devices')
            .innerJoin('assistive_devices', 'assistive_devices.id', 'job_devices.device_id')
            .whereIn('job_devices.job_id', jobs.map(job => job.id))
            .select('job_devices.job_id', 'assistive_devices.name');
        const devicesByJob = deviceRows.reduce((result, row) => ({
            ...result,
            [row.job_id]: [...(result[row.job_id] || []), row.name],
        }), {});

        return jobs.map(job => ({
            id: job.id,
            title: job.title,
            jobType: job.job_type,
            workMode: job.work_mode,
            experienceRequired: job.experience_required,
            skills: parseJsonArray(job.skills),
            location: job.location,
            description: [
                job.description,
                job.policy_for_disabled,
                job.experience_with_disabled,
            ].filter(Boolean).join('\n'),
            company: { name: job.company_name },
            devices: devicesByJob[job.id] || [],
        }));
    }

    async matchCvToJobs({ cvId, jobIds = [], priorities = [], limit = 20, useAi = true }, userId) {
        const profile = await this.getCandidateProfile(cvId, userId);
        const jobs = await this.getJobs(jobIds, Math.min(limit, 50));

        // Step 1 — deterministic v2 scoring for every retrieved job (fast, auditable).
        const baseMatches = jobs
            .map(job => ({
                jobRecord: job,
                jobSummary: {
                    id: job.id,
                    title: job.title,
                    company: job.company,
                    location: job.location,
                    workMode: job.workMode,
                },
                result: evaluateMatch(profile, job, priorities),
            }))
            .sort((left, right) => right.result.score - left.result.score);

        // Step 2 — agentic refinement (Gemini LLM-as-judge) on the top-N only, to bound cost.
        // Each call falls back to the deterministic result on any failure.
        const refined = await Promise.all(
            baseMatches.map(async (entry, index) => {
                const result = useAi && index < AI_REFINE_TOP_N
                    ? await refineMatchWithAI(profile, entry.jobRecord, entry.result)
                    : { ...entry.result, aiRefined: false };
                return { job: entry.jobSummary, ...result };
            }),
        );

        // Re-sort because AI refinement can change individual scores.
        const matches = refined.sort((left, right) => right.score - left.score);
        const aiRefinedCount = matches.filter(match => match.aiRefined).length;

        return {
            cvId,
            criteriaVersion: 'v2',
            engine: aiRefinedCount > 0 ? 'agentic-rag' : 'deterministic',
            aiRefinedCount,
            generatedAt: new Date().toISOString(),
            count: matches.length,
            matches,
        };
    }
}

export const MatchingService = new MatchingServiceClass();
