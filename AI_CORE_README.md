# D-Shiftify — AI System

AI-first recruitment platform for visually impaired users in Vietnam. All interactions are voice-driven — no screen, no keyboard, no forms.

---

## Architecture

```
[Mic] ──WebM/Opus──► POST /api/ai/voice
[Text] ────────────► POST /api/ai/chat
[HR JD] ───────────► POST /api/ai/jobs
                           │
                    LangGraph Orchestrator
                           │
          ┌────────────────┼────────────────┐
          ▼                ▼                ▼
       intake           resume            match
      (NER+AT)       (CV gen+TTS      (pgvector+
                      verify)         hybrid score)
                                           │
                                          xai
                                    (RAG explain+
                                     skill gap)
          ▼
        hr (employer flow — JD audit + rewrite)
```

---

## AI Stack

| Layer | Technology |
|---|---|
| LLM | Gemini 2.0 Flash |
| Agent Framework | LangGraph.js |
| Embedding | Google Text Embedding 004 (768 dims) |
| Vector DB | PostgreSQL + pgvector |
| Profile DB | MongoDB |
| Session Store | Redis (TTL 30 min) |
| STT | Groq Whisper v3 Turbo |
| TTS | FPT AI (fallback: Google Translate TTS) |
| NER | PhoBERT ONNX via @xenova/transformers (fallback: Gemini) |
| Vietnamese NLP | VnCoreNLP (word segmentation) |

---

## LangGraph Flow

```
START
  │
  ├─(employer)──► hr ──► END
  │
  └─(job_seeker)
        │
        ▼
     intake ◄──loop (profile_completeness < 0.6)
        │
        └─(≥ 0.6)
              ▼
           resume
           (CV gen + section-by-section TTS verification)
              │
              ▼
            match
            (pgvector ANN → hybrid score)
              │
              ▼
             xai
            (RAG explanation + skill gap analysis)
              │
              ▼
            END + TTS
```

---

## Agents

### Intake Agent
Extracts structured profile from free-form Vietnamese voice input.

- NER via PhoBERT ONNX (4 entity types: SKILL, EXP, EDU, AT_TOOL)
- AT tool detection (NVDA, JAWS, VoiceOver, Braille, voice control...)
- Loops until `profile_completeness ≥ 0.6`
- Asks one question per turn, max 15 words

### Resume Agent
Generates ATS-compatible CV and verifies it section by section via TTS.

- Single-column linear format (no tables, no special chars)
- Embeds `narrative_raw` → vector(768) for semantic matching
- Persists `SkillProfile` to MongoDB
- TTS read-back: user says "đúng rồi" to confirm, "sửa lại" to edit

### Match Agent
Finds top-K jobs using hybrid scoring.

```
Final Score (0–100) =
  0.40 × skill_score
  0.20 × experience_score
  0.25 × AT_match_score      ← accessibility compatibility
  0.15 × geo_score           ← Haversine distance
```

- Pre-filter: pgvector ANN search (HNSW index, cosine similarity)
- AT Match: checks if job supports screen reader / remote work / WCAG level
- Filters out jobs with accessibility_level = 'A'

### XAI Agent
Explains why each job matches using RAG, and identifies skill gaps.

- Retrieves top evidence sentences from job description
- Generates 2-sentence natural language explanation via Gemini
- Skill gap: compares candidate skills vs job requirements
- If score < 70: suggests courses (static catalog + Gemini for unknowns)
- TTS output: "Bạn còn thiếu kỹ năng X. Bạn có thể học tại Y trong Z giờ."

### HR Agent
Audits job descriptions for accessibility and inclusive language.

- Detects ableist language patterns (nhanh nhẹn → linh hoạt, etc.)
- Scores JD 0–100 across 5 WCAG criteria
- Assigns level: A (0–49) / AA (50–79) / AAA (80–100)
- Rewrites JD and generates audio summary for candidates
- Jobs with level A are blocked from candidate search results

---

## Voice Pipeline

**STT:** Groq Whisper v3 Turbo
- Language hint: `vi`
- Post-processing: removes filler words (ừm, à, ờ), deduplicates repeated words

**TTS:** FPT AI (primary) → Google Translate TTS (fallback)
- Chunks text at sentence boundaries ≤ 200 chars
- Sanitizes markdown, converts numbers ("85%" → "tám mươi lăm phần trăm")
- Always appends action hint ("Nói 'tiếp theo' để nghe việc làm kế tiếp.")

---

## NLP Pipeline

```
raw voice text
      │
      ▼
VnCoreNLP (word segmentation)
"trình đọc màn hình" → "trình_đọc_màn_hình"
      │
      ▼
PhoBERT ONNX (NER)
→ { SKILL, EXP, EDU, AT_TOOL }
      │
      ▼ (if PhoBERT unavailable)
Gemini Flash structured output (fallback)
      │
      ▼
Redis cache (TTL 5 min)
```

---

## Hybrid Matching Detail

Semantic score (Google Text Embedding cosine similarity) is used as **pre-filter** via pgvector ANN search, not as a direct scoring weight. This lets the system find candidates even when skills are described differently ("Screen Reader" ≡ "Trình đọc màn hình").

AT Match Score (25% of final score):
- Job supports NVDA/JAWS/screen_reader in work environment → +0.5
- Job is remote + candidate needs voice control → +0.3
- Job is WCAG AAA → +0.2, AA → +0.1

---

## API Endpoints

```
POST   /api/ai/chat                    text chat turn
POST   /api/ai/voice                   voice turn (base64 WebM/Opus)
POST   /api/ai/audit-jd                HR: audit a job description
POST   /api/ai/jobs                    HR: post new job (auto-audits + embeds)
GET    /api/ai/jobs/:id/skill-gap      skill gap for a specific job
GET    /api/ai/market-trends           accessible job trends by industry
DELETE /api/ai/session/:id             clear session

GET    /api/candidate/profile          get persisted SkillProfile from MongoDB
```

---

## File Structure

```
backend/src/core/
├── ai/
│   ├── agents/
│   │   ├── shared/
│   │   │   ├── llm.js              Gemini Flash models
│   │   │   ├── embedding.js        Google Text Embedding 004
│   │   │   ├── geo.js              Haversine distance
│   │   │   ├── tts.js              FPT AI + Google Translate TTS
│   │   │   ├── stt.js              Groq Whisper v3 Turbo
│   │   │   ├── state.js            LangGraph AgentState
│   │   │   ├── nlp.js              NER via Gemini (PhoBERT wrapper)
│   │   │   └── at_detector.js      AT tool keyword detection
│   │   ├── intake/intake.agent.js
│   │   ├── resume/resume.agent.js
│   │   ├── match/
│   │   │   ├── match.agent.js
│   │   │   └── match.scoring.js
│   │   ├── xai/
│   │   │   ├── xai.agent.js
│   │   │   └── skill_gap.js
│   │   └── hr/hr.agent.js
│   ├── orchestrator/
│   │   ├── graph.js                LangGraph compiled graph
│   │   └── router.js               Intent detection (job_seeker / employer)
│   └── nlp/
│       ├── vncorenlp.client.js     VnCoreNLP REST client
│       └── phobert.ner.js          PhoBERT ONNX + Redis cache
│
├── modules/ai/
│   ├── models/skill.profile.model.js
│   ├── repositories/
│   │   ├── job.repository.js
│   │   └── skill.profile.repository.js
│   └── services/
│       ├── ai.service.js
│       ├── job.ingestion.service.js
│       ├── market.trend.service.js
│       └── skill.gap.service.js
│
├── api/ai/
│   ├── ai.controller.js
│   └── ai.resolver.js
│
└── infrastructure/
    └── session.store.js            Redis session persistence

frontend/src/
├── core/services/ai.service.ts     typed API client
└── hooks/
    ├── use-voice-chat.ts           mic → base64 → /ai/voice → play audio
    └── use-ai-chat.ts              text chat hook
```

---

## Environment Variables

```env
GEMINI_API_KEY=
GROQ_API_KEY=
FPT_AI_API_KEY=
MONGO_URL=mongodb://localhost:27017/dshiftify
REDIS_URL=redis://localhost:6379
DATABASE_URL=postgresql://...
TTS_CHUNK_SIZE=200
VNCORENLP_URL=http://localhost:9000
MATCH_SKILL_WEIGHT=0.40
MATCH_EXP_WEIGHT=0.20
MATCH_AT_WEIGHT=0.25
MATCH_GEO_WEIGHT=0.15
SKILL_GAP_THRESHOLD=70
```
