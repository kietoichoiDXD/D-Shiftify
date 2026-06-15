import { HumanMessage } from '@langchain/core/messages';
import { embedText } from '../../../ai/embeddings/embedder.js';
import { hrNode } from '../../../ai/agents/hr.agent.js';
import { JobRepository } from '../repositories/job.repository.js';
import { runAlertJob } from './alert.job.service.js';
import { inferWeights } from '../../../ai/retrieval/match.scoring.js';

/**
 * Called when HR posts a new job.
 * 1. Run HR agent → accessibility score + rewrite
 * 2. Embed description_raw → vector(768)
 * 3. Save to job_descriptions
 */
export const ingestJob = async jobPayload => {
    const {
        employer_id, employer_user_id, title, description_raw,
        required_skills = [], salary_min, salary_max,
        has_insurance = false, is_remote = false,
        location_lat, location_lng, work_environment,
    } = jobPayload;

    // 1. Accessibility audit + rewrite + weights (all parallel)
    const [hrState, embedding, weights] = await Promise.all([
        hrNode({ messages: [new HumanMessage(description_raw)], nextStep: 'hr', narrative_raw: '' }),
        embedText(description_raw),
        inferWeights({ job_id: 'temp', description_raw, title }),
    ]);

    const hr = hrState.hr_result || {};

    // 2. Use rewritten JD if available and score improved
    const finalDescription = hr.rewritten_jd || description_raw;
    const [finalEmbedding] = hr.rewritten_jd
        ? await Promise.all([embedText(finalDescription)])
        : [embedding];

    // 3. Save
    const job = await JobRepository.save({
        employer_id, employer_user_id, title,
        description_raw: finalDescription,
        required_skills,
        salary_min, salary_max, has_insurance, is_remote,
        location_lat, location_lng, work_environment,
        accessibility_score: hr.score ?? null,
        accessibility_level: hr.level ?? 'A',
        embedding_vector: `[${finalEmbedding.join(',')}]`,
        weights_json: JSON.stringify(weights),
    });

    // Fire-and-forget: notify matching candidates
    runAlertJob(job);

    return {
        job,
        accessibility: {
            score: hr.score,
            level: hr.level,
            issues: hr.issues,
            suggestions: hr.suggestions,
            audio_summary_base64: hrState.audio_base64,
        },
    };
};
