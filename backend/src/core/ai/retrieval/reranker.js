import { z } from 'zod';
import { analystModel } from '../llm/gemini.client.js';
import { logger } from '../../../packages/logger/index.js';

const RerankSchema = z.object({
  refined_score: z.number().min(0).max(100),
  rationale: z.string(),
});

const rerankModel = analystModel.withStructuredOutput(RerankSchema);

/**
 * Re-ranks candidate jobs using Gemini Cross-Encoder Re-ranking
 */
export const rerankJobs = async (profile, jobs) => {
  logger.info(`[Reranker] Re-ranking ${jobs.length} jobs with Gemini Cross-Encoder`);
  
  const reranked = await Promise.all(
    jobs.map(async (job) => {
      try {
        const result = await rerankModel.invoke(
          `Bạn là chuyên gia tuyển dụng dành cho người khuyết tật.\n` +
          `Hãy đánh giá mức độ tương thích giữa Hồ sơ ứng viên khiếm thị và Mô tả công việc (JD).\n\n` +
          `Hồ sơ ứng viên: ${JSON.stringify(profile)}\n` +
          `Công việc: ${job.title} - Yêu cầu: ${job.description_raw || job.title}\n\n` +
          `Hãy trả về điểm số refined_score từ 0 đến 100 và 1 câu giải thích ngắn gọn, thân thiện (rationale).`
        );
        return {
          ...job,
          final_score: result.refined_score,
          explanation: result.rationale,
        };
      } catch (err) {
        logger.error(`[Reranker] Error reranking job ${job.job_id}: ${err.message}`);
        return {
          ...job,
          final_score: Math.round((job.hybrid_score || job.final_score || 0.5) * 100),
          explanation: job.explanation || 'Ứng viên có các kỹ năng phù hợp với yêu cầu tuyển dụng.',
        };
      }
    })
  );

  return reranked.sort((a, b) => b.final_score - a.final_score);
};
