import { AiService } from '../../modules/ai/services/ai.service.js';
import { ingestJob } from '../../modules/ai/services/job.ingestion.service.js';
import { getMarketTrends } from '../../modules/ai/services/market.trend.service.js';
import { getSkillGapForJob } from '../../modules/ai/services/skill.gap.service.js';
import { SkillProfileRepository } from '../../modules/ai/repositories/skill.profile.repository.js';
import { streamSpeech } from '../../ai/agents/shared/tts.js';
import { ValidHttpResponse } from '../../../packages/handler/response/validHttp.response.js';
import { getUserContext } from '../../../packages/authModel/module/user';
import { BadRequestException } from '../../../packages/httpException';

class Controller {
  /** POST /ai/chat  { session_id, message } */
  chat = async req => {
      const { session_id, message } = req.body;
      if (!session_id || !message) throw new BadRequestException('session_id and message are required');
      const result = await AiService.chat(_resolveOwnedSessionId(req, session_id), message);
      return ValidHttpResponse.toOkResponse(_format(result));
  };

  /** POST /ai/voice  { session_id, audio, encoding? } */
  voice = async req => {
      const { session_id, audio, encoding } = req.body;
      if (!session_id || !audio) throw new BadRequestException('session_id and audio are required');
      const result = await AiService.voiceChat(_resolveOwnedSessionId(req, session_id), audio, encoding);
      return ValidHttpResponse.toOkResponse(_format(result));
  };

  /** POST /ai/audit-jd  { jd } */
  auditJD = async req => {
      const { jd } = req.body;
      if (!jd) throw new BadRequestException('jd is required');
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
  postJob = async req => {
      const { id } = getUserContext(req);
      const result = await ingestJob({ ...req.body, employer_user_id: id });
      return ValidHttpResponse.toOkResponse(result);
  };

  /** DELETE /ai/session/:id */
  clearSession = async req => {
      await AiService.clearSession(_resolveOwnedSessionId(req, req.params.id));
      return ValidHttpResponse.toOkResponse({ cleared: true });
  };

  /** GET /ai/voice/stream?text=... — SSE streaming TTS */
  streamTts = async (req, res) => {
      const { text } = req.query;
      if (!text || typeof text !== 'string') {
          throw new BadRequestException('text is required');
      }
      let decodedText;
      try {
          decodedText = decodeURIComponent(text);
      } catch (_error) {
          throw new BadRequestException('text is malformed');
      }
      await streamSpeech(decodedText, res);
  };

  /** GET /ai/market-trends */
  marketTrends = async _req => {
      const trends = await getMarketTrends();
      return ValidHttpResponse.toOkResponse(trends);
  };

  /** GET /ai/jobs/:id/skill-gap?score=65  (body or query: profile JSON) */
  skillGap = async req => {
      const { id } = req.params;
      const score = parseFloat(req.query.score ?? '0');
      const { id: userId } = getUserContext(req);
      const profile = await SkillProfileRepository.findByUserId(userId);
      const gap = await getSkillGapForJob(id, profile, score);
      return ValidHttpResponse.toOkResponse(gap);
  };
}

const _resolveOwnedSessionId = (req, sessionId) => {
    const { id } = getUserContext(req);
    const expectedSessionId = String(id);
    if (String(sessionId) !== expectedSessionId) {
        throw new BadRequestException('session_id must match authenticated user');
    }
    return expectedSessionId;
};

const _format = r => ({
    tts_text: r.tts_text,
    audio_base64: r.audio_base64,
    profile: r.profile,
    profile_completeness: r.profile?.profile_completeness,
    matches: r.matches,
    profile_coach: r.profile_coach,
    nextStep: r.nextStep,
    errors: r.errors,
});

export const AiController = new Controller();
