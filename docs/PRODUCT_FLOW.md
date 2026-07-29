# D-Shiftify — Luồng chạy sản phẩm (End-to-End)

> Trạng thái: **đã kiểm thử live end-to-end** trên Supabase (register → JWT → gọi API thật).
> Mọi endpoint dưới đây có prefix `/api/v1`. Auth dùng `Authorization: Bearer <access_token>`.

---

## 1. Tổng quan các actor

| Actor | Role (đăng ký) | Vai trò |
|---|---|---|
| Người khuyết tật / ứng viên | `candidate` | Tạo CV, nhận gợi ý việc, ứng tuyển, chat/call |
| Doanh nghiệp / nhà tuyển dụng | `recruiter` | Tạo công ty + tin tuyển dụng, duyệt ứng viên, chat/call |
| Cơ sở đào tạo | `training_center` | Quản lý hồ sơ trung tâm + khóa học + kỹ năng |

---

## 2. Luồng cốt lõi: Ứng viên ↔ Nhà tuyển dụng (đã verify live)

```
┌──────────────┐         ┌──────────────┐
│   CANDIDATE  │         │   RECRUITER  │
└──────┬───────┘         └──────┬───────┘
       │                        │
  (1) POST /auth/register {role:candidate}    (1') POST /auth/register {role:recruiter}
       │                        │
       │                  (2') PUT /company/me   ← tạo hồ sơ công ty
       │                        │
       │                  (3') POST /jobs        ← đăng tin (cần assistive_devices[])
       │                        │
  (4) POST /cvs           ┌─────┘
       │  ← tạo CV        │
       │                  │
  (5) GET /matches/jobs   │  ← AI chấm điểm CV ↔ jobs (match_score + reason)
       │                  │
  (6) POST /applications  │  ← nộp đơn {job_id, cv_id}  → status "applied"
       │ ───────────────► │
       │                  │
       │            (7') GET /applications?job_id=…  ← xem ứng viên
       │                  │     {candidate{full_name,phone}, cv_summary{expected_job,skills}}
       │                  │
       │            (8') PATCH /applications/:id {status:"accepted"}
       │                  │           │
       │                  │           ▼
       │        ╔═════════════════════════════════════╗
       │        ║ AUTO: tạo conversation + 2 participant ║  ← createConversationFromApplication
       │        ╚═════════════════════════════════════╝
       │                  │
  (9) GET /chat/conversations  ◄──►  (9') GET /chat/conversations   ← cả 2 thấy hội thoại
       │                  │
 (10) POST /chat/conversations/:id/messages   ← nhắn tin (REST + Socket.io realtime)
       │                  │
 (11) GET  /chat/conversations/:id/messages   ← đọc lịch sử (cursor pagination)
       │                  │
 (12) /call hoặc /video-call?room=:id   ← gọi audio/video (WebRTC qua signaling socket)
```

**Điểm mấu chốt:** Hội thoại KHÔNG tạo thủ công — nó được sinh **tự động** khi nhà tuyển dụng `accept` một đơn (chỉ accept lần đầu). Recruiter resolve qua `companies.user_id`, candidate qua `cvs.profile_id → profiles.user_id`.

---

## 3. Luồng Accessibility (người khiếm thị / khiếm thính / vận động)

```
Đăng nhập ──► GET /api/v1/profile/me ──► đọc disabilityStatus + devices
                      │
                      ▼
   classify-disability → needs: visual | hearing | motor
                      │
        ┌─────────────┼──────────────┐
        ▼             ▼              ▼
   VISUAL         HEARING         MOTOR
   auto-TTS       captions        auto-STT (rảnh tay)
   auto-STT       haptic rung     nút lớn
   tương phản     (vibrate)       haptic rung
        │             │              │
        └─────────────┴──────────────┘
                      ▼
        Chatbot trợ lý tự bật + tự chào (TTS/captions)
        Nói lệnh: "tìm việc / tin nhắn / hồ sơ / trợ giúp / dừng" → tự điều hướng
```

STT thật qua `POST /api/v1/voice/stt` (Groq Whisper); TTS qua `POST /api/v1/voice/tts` (Google). Mỗi lần ghi `voice_logs` (status processing→success/failed).

---

## 4. Luồng Cơ sở đào tạo

```
POST /training-centers (đăng ký hồ sơ) ─► GET /training-centers/me
        │
        ├─► POST /training-centers/me/courses (tạo khóa học)
        │       │
        │       ├─► POST /courses/:id/skills  (gán kỹ năng)
        │       ├─► GET  /courses/:id/skills
        │       └─► DELETE /courses/:id/skills/:skill_id
        │
        └─► PATCH/DELETE /courses/:id
Public: GET /training-centers, GET /training-centers/:id, GET /courses, GET /courses/:id
```

---

## 5. Module backend (tất cả đã build + verify live)

| Module | Prefix | Ghi chú |
|---|---|---|
| Auth | `/auth` | register/login/refresh/forgot/reset |
| Profile | `/profile` | `/me`, `/assistive-devices`, `/me/devices` |
| CV | `/cvs` (+ legacy `/cv`) | CRUD; shape khớp sheet |
| Jobs | `/jobs` | CRUD; cần `assistive_devices[]` khi tạo |
| Applications | `/applications` | apply / list (enriched) / accept→auto-conversation |
| Matches | `/matches` | `/jobs` (cho candidate), `/candidates/:job_id` (cho recruiter) |
| Chat | `/chat` | conversations + participants + messages + read (REST) + Socket.io |
| Call | (frontend) | WebRTC `/call`, `/video-call` qua signaling socket |
| Voice | `/voice` | stt/tts thật + logs CRUD + summary |
| Community | `/community` | posts + comments CRUD |
| Training centers | `/training-centers` | CRUD hồ sơ + courses |
| Courses | `/courses` | CRUD + course-skills |

---

## 6. Còn TODO (không chặn luồng chính)

- TTS trả `audio_base64` (chưa upload CDN → `audio_url` null). Cần CDN để trả URL thật.
- `/voice/stt/batch` chưa có hàng đợi async thật.
- `applications.candidate.avatar_url` = null (profiles chưa có cột avatar; cần join media_assets).
- TTS Google cần bật billing trên GCP.
- Fetch `audio_url` trong STT cần allowlist host (chống SSRF) trước khi public.
