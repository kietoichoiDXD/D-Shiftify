import { Annotation } from '@langchain/langgraph';

export const AgentState = Annotation.Root({
  session_id: Annotation({ reducer: (_, y) => y,                       default: () => null }),
  intent:     Annotation({ reducer: (_, y) => y,                       default: () => 'intake' }),

  // nextStep drives the conditional edges.
  // Valid values: 'intake' | 'resume' | 'match' | 'xai' | 'hr' | 'end'
  // 'end' (and null/undefined) all cause the graph to exit via the END constant.
  nextStep:   Annotation({ reducer: (_, y) => y,                       default: () => 'intake' }),

  messages:      Annotation({ reducer: (x, y) => x.concat(y),          default: () => [] }),
  narrative_raw: Annotation({ reducer: (x, y) => (x ? `${x}\n${y}` : y), default: () => '' }),

  profile: Annotation({
    reducer: (x, y) => ({ ...x, ...y }),
    default: () => ({
      name: '', phone: '', location_lat: null, location_lng: null, address_label: '',
      hard_skills: [], soft_skills: [], inferred_skills: [],
      experience: [], education: [],
      accessibility_needs: [],
      preferences: { location: '', remote: false, radius_km: 10 },
      profile_completeness: 0,
    }),
  }),

  cv_data:             Annotation({ reducer: (_, y) => y, default: () => null }),
  narrative_embedding: Annotation({ reducer: (_, y) => y, default: () => null }),
  verified_sections:   Annotation({ reducer: (_, y) => y, default: () => [] }),

  matches:       Annotation({ reducer: (_, y) => y, default: () => [] }),
  profile_coach: Annotation({ reducer: (_, y) => y, default: () => null }),

  hr_result: Annotation({ reducer: (_, y) => y, default: () => null }),

  tts_text:     Annotation({ reducer: (_, y) => y, default: () => '' }),
  audio_base64: Annotation({ reducer: (_, y) => y, default: () => null }),

  // `errors` — accumulated list of all error messages across nodes this run
  errors: Annotation({ reducer: (x, y) => x.concat(y), default: () => [] }),

  // `error` — the most-recent single error string (last-write wins).
  //  Useful for callers that only want to check `state.error` quickly.
  error: Annotation({ reducer: (_, y) => y, default: () => null }),
});
