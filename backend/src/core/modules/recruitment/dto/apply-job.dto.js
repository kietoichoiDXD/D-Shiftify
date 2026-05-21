import { z } from 'zod';

export const ApplyJobSchema = z.object({
    job_id: z.string().trim().uuid(),
}).strict();

export const ApplyJobDto = (body, candidateId) => ({
    job_id: body.job_id,
    candidate_id: candidateId,
});
