import { SkillProfileRepository } from '../repositories/skill.profile.repository.js';
import { AlertRepository } from '../repositories/alert.repository.js';
import { hybridScore } from '../../../ai/retrieval/match.scoring.js';
import { JobRepository } from '../repositories/job.repository.js';

const ALERT_THRESHOLD = parseInt(process.env.ALERT_SCORE_THRESHOLD || '65', 10);

/**
 * Called after a new job is ingested.
 * Scans all stored profiles, creates alerts for matches >= threshold.
 * Fire-and-forget — does not block the job ingestion response.
 */
export const runAlertJob = async job => {
    try {
        const profiles = await SkillProfileRepository.getAllProfiles();

        const alerts = [];
        for (const profile of profiles) {
            const score = hybridScore(profile, job);
            if (score >= ALERT_THRESHOLD) {
                alerts.push({ user_id: profile.user_id, job_id: job.job_id, job_title: job.title, score });
            }
        }

        if (alerts.length) {
            await AlertRepository.saveAlerts(alerts);
        }
    } catch {
    // background job — never throw
    }
};
