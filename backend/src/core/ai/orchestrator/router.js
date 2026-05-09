import { z } from 'zod';
import { routerModel } from '../agents/shared/llm.js';

const IntentSchema = z.object({
  intent: z.enum(['job_seeker', 'employer']),
  nextStep: z.enum(['intake', 'hr']),
});

const model = routerModel.withStructuredOutput(IntentSchema);

export const detectIntent = async (input) => {
  try {
    return await model.invoke(
      `Phân loại người dùng trong hệ thống tuyển dụng D-Shiftify.
Input: "${input}"
- Người tìm việc (khiếm thị) → job_seeker, intake
- Nhà tuyển dụng / HR → employer, hr`,
    );
  } catch {
    return { intent: 'job_seeker', nextStep: 'intake' };
  }
};
