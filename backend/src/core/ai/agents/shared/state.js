import { Annotation } from '@langchain/langgraph';

export const AgentState = Annotation.Root({
  // ── Session ────────────────────────────────────────────────────────────────
  session_id: Annotation({ reducer: (_, y) => y, default: () => null }),
  intent: Annotation({ reducer: (_, y) => y, default: () => 'intake' }),
  // 'intake' | 'resume' | 'match' | 'hr' | 'end'
  nextStep: Annotation({ reducer: (_, y) => y, default: () => 'intake' }),

  // ── Conversation ───────────────────────────────────────────────────────────
  messages: Annotation({
    reducer: (x, y) => x.concat(y),
    default: () => [],
  }),
  // Full raw conversation text — MUST be preserved for semantic matching
  narrative_raw: Annotation({
    reducer: (x, y) => (x ? `${x}\n${y}` : y),
    default: () => '',
  }),

  // ── Candidate Profile ──────────────────────────────────────────────────────
  profile: Annotation({
    reducer: (x, y) => ({ ...x, ...y }),
    default: () => ({
      name: '',
      phone: '',
      location_lat: null,
      location_lng: null,
      address_label: '',
      hard_skills: [],
      soft_skills: [],
      inferred_skills: [],
      experience: [],
      education: [],
      accessibility_needs: [], // ['screen_reader','voice_control','braille','large_text']
      preferences: { location: '', remote: false, radius_km: 10 },
      profile_completeness: 0,
    }),
  }),

  // ── Resume ─────────────────────────────────────────────────────────────────
  cv_data: Annotation({ reducer: (_, y) => y, default: () => null }),
  narrative_embedding: Annotation({ reducer: (_, y) => y, default: () => null }),
  // CV verification: tracks which sections user has confirmed
  verified_sections: Annotation({ reducer: (_, y) => y, default: () => [] }),

  // ── Job Matching ───────────────────────────────────────────────────────────
  matches: Annotation({ reducer: (_, y) => y, default: () => [] }),
  profile_coach: Annotation({ reducer: (_, y) => y, default: () => null }),

  // ── HR ─────────────────────────────────────────────────────────────────────
  hr_result: Annotation({ reducer: (_, y) => y, default: () => null }),

  // ── Voice output ───────────────────────────────────────────────────────────
  // Text to be read via TTS — always set by the last active node
  tts_text: Annotation({ reducer: (_, y) => y, default: () => '' }),
  audio_base64: Annotation({ reducer: (_, y) => y, default: () => null }),

  // ── Errors ─────────────────────────────────────────────────────────────────
  errors: Annotation({ reducer: (x, y) => x.concat(y), default: () => [] }),
});
