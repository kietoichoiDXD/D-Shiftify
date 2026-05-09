import { AiService } from '../../modules/ai/services/ai.service.js';
import { ingestJob } from '../../modules/ai/services/job.ingestion.service.js';
import { getMarketTrends } from '../../modules/ai/services/market.trend.service.js';
import { getSkillGapForJob } from '../../modules/ai/services/skill.gap.service.js';
import { ValidHttpResponse } from '../../../packages/handler/response/validHttp.response.js';

class Controller {
  /** POST /ai/chat  { session_id, message } */
  chat = async (req) => {
    const { session_id, message } = req.body;
    if (!session_id || !message) throw new Error('session_id and message are required');
    const result = await AiService.chat(session_id, message);
    return ValidHttpResponse.toOkResponse(_format(result));
  };

  /** POST /ai/voice  { session_id, audio, encoding? } */
  voice = async (req) => {
    const { session_id, audio, encoding } = req.body;
    if (!session_id || !audio) throw new Error('session_id and audio are required');
    const result = await AiService.voiceChat(session_id, audio, encoding);
    return ValidHttpResponse.toOkResponse(_format(result));
  };

  /** POST /ai/audit-jd  { jd } */
  auditJD = async (req) => {
    const { jd } = req.body;
    if (!jd) throw new Error('jd is required');
    const result = await AiService.auditJD(jd);
    const hr = result.hr_result || {};
    return ValidHttpResponse.toOkResponse({
      score: hr.score,
      level: hr.level,
      issues: hr.issues,
      suggestions: hr.suggestions,
      rewritten_jd: hr.rewritten_jd,
      audio_summary_base64: result.audio_base64,
    });
  };

  /** POST /ai/jobs  { employer_id, title, description_raw, ... } */
  postJob = async (req) => {
    const result = await ingestJob(req.body);
    return ValidHttpResponse.toOkResponse(result);
  };

  /** DELETE /ai/session/:id */
  clearSession = async (req) => {
    await AiService.clearSession(req.params.id);
    return ValidHttpResponse.toOkResponse({ cleared: true });
  };

  /** GET /ai/market-trends */
  marketTrends = async (_req) => {
    const trends = await getMarketTrends();
    return ValidHttpResponse.toOkResponse(trends);
  };

  /** GET /ai/jobs/:id/skill-gap?score=65  (body or query: profile JSON) */
  skillGap = async (req) => {
    const { id } = req.params;
    const score = parseFloat(req.query.score ?? '0');
    const profile = req.body?.profile || {};
    const gap = await getSkillGapForJob(id, profile, score);
    return ValidHttpResponse.toOkResponse(gap);
  };
}

const _format = (r) => ({
  tts_text: r.tts_text,
  audio_base64: r.audio_base64,
  profile: r.profile,
  profile_completeness: r.profile?.profile_completeness,
  matches: r.matches,
  nextStep: r.nextStep,
  errors: r.errors,
});

export const AiController = new Controller();
