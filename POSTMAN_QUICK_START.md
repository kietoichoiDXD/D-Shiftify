# 🎯 Postman + Supabase Testing - Hướng Dẫn Nhanh

**Created Files**:
- ✅ `Candidate_Profile_API.postman_collection.json` (9 endpoints)
- ✅ `POSTMAN_TESTING_GUIDE.md` (Hướng dẫn test)
- ✅ `POSTMAN_TO_SUPABASE_MIGRATION.md` (Migration guide)

**Recommended UI**: [Swagger UI](http://localhost:3000/docs)

---

## 🧭 Swagger UI (Recommended)

1. Chạy backend: `npm run dev`
2. Mở [http://localhost:3000/docs](http://localhost:3000/docs)
3. Chọn **Authorize** và nhập JWT theo dạng `Bearer <token>`
4. Dùng **Try it out** để test trực tiếp từng endpoint

---

## ⚡ Bắt Đầu Nhanh (3 Bước)

### Bước 1: Mở Postman

1. Tải Postman: https://www.postman.com/downloads/
2. Cài đặt & tạo account

### Bước 2: Import Collection

1. Postman → Click **"Import"**
2. Chọn file: `Candidate_Profile_API.postman_collection.json`
3. Click **"Import"**

### Bước 3: Setup Environment

1. Click **"Environments"** (sidebar)
2. Create new: `Local Development`
  - Or open the shared environment: [Postman Environment](https://kietoichoidxd-3815730.postman.co/workspace/KENJI's-Workspace~d1b5c9d9-b895-464d-8e45-c637924bad42/environment/48308628-651d40f3-98ce-4e5c-9b5d-be49ceb52a04?action=share&source=copy-link&creator=48308628)
3. Thêm biến:
   - `baseUrl` = `http://localhost:3000/api`
   - `token` = (leave empty)
4. Save & select environment

---

## 🧪 Test Workflow

1. **Click "Login"** → Nhập email/password → Send
   - ✅ Token tự động lưu vào environment
   
2. **Click "PUT - Create/Update Profile"** → Send
   - ✅ Profile được tạo

3. **Click "GET - Get Profile"** → Send
   - ✅ Lấy profile vừa tạo

4. **Thêm Education** → Update → Delete
   - ✅ CRUD hoàn chỉnh

5. **Thêm Experience** → Update → Delete
   - ✅ CRUD hoàn chỉnh

---

## 📊 Tất Cả 9 Endpoints

| Loại | Method | Endpoint | Mô Tả |
|------|--------|----------|-------|
| Auth | POST | `/auth/login` | Lấy JWT token |
| Profile | GET | `/candidate/profile` | Lấy profile |
| Profile | PUT | `/candidate/profile` | Tạo/cập nhật profile |
| Profile | POST | `/candidate/profile/upload-avatar` | Tải avatar |
| Education | POST | `/candidate/profile/education` | Thêm học vấn |
| Education | PUT | `/candidate/profile/education/:id` | Cập nhật học vấn |
| Education | DELETE | `/candidate/profile/education/:id` | Xóa học vấn |
| Experience | POST | `/candidate/profile/experience` | Thêm kinh nghiệm |
| Experience | PUT | `/candidate/profile/experience/:id` | Cập nhật kinh nghiệm |
| Experience | DELETE | `/candidate/profile/experience/:id` | Xóa kinh nghiệm |

---

## ✅ Trước Khi Test

Đảm bảo:

```bash
# 1. Backend chạy
cd backend
npm run dev

# 2. Database chạy
# PostgreSQL phải on

# 3. Migration chạy
npm run knex migrate:latest
```

---

## 🎯 Test Steps

### Lần đầu tiên:

1. ✅ Login (get token)
2. ✅ PUT profile (create)
3. ✅ GET profile (verify)
4. ✅ POST education (add)
5. ✅ PUT education (update)
6. ✅ DELETE education (delete)
7. ✅ POST experience (add)
8. ✅ PUT experience (update)
9. ✅ DELETE experience (delete)

### Mỗi test sau:

1. Login (refresh token)
2. Run collection runner → test tất cả

---

## 🚀 Sau Khi Test Xong

Đọc: `POSTMAN_TO_SUPABASE_MIGRATION.md`

**Các bước**:
1. Tạo Supabase project
2. Migrate database
3. Deploy backend (Railway/Heroku)
4. Deploy frontend (Vercel/Netlify)
5. Update Postman với production URL

---

## 📁 File Structure

```
D-Shiftify/
├── Candidate_Profile_API.postman_collection.json  ← Import này
├── POSTMAN_TESTING_GUIDE.md                      ← Đọc khi test
├── POSTMAN_TO_SUPABASE_MIGRATION.md              ← Đọc trước deploy
├── backend/
│   ├── src/core/api/candidate/
│   │   ├── candidate.controller.js
│   │   └── candidate.resolver.js
│   ├── src/core/modules/candidate/
│   │   ├── candidate.service.js
│   │   └── candidate.repository.js
│   └── src/database/migrations/
│       └── 20260521140000_candidate_profiles.js
└── frontend/
    └── src/...
```

---

## 🎓 Quick Reference

### Login Response
```json
{
  "status": "success",
  "data": {
    "accessToken": "eyJhbGc...",
    "user": {
      "id": "uuid",
      "email": "user@example.com"
    }
  }
}
```

### Profile Response
```json
{
  "status": "success",
  "data": {
    "id": "uuid",
    "fullName": "John Doe",
    "email": "john@example.com",
    "phone": "1234567890",
    "location": "San Francisco",
    "headline": "Senior Developer",
    "bio": "...",
    "profileImage": "...",
    "skills": [...],
    "education": [...],
    "experience": [...],
    "createdAt": "2026-05-21T...",
    "updatedAt": "2026-05-21T..."
  }
}
```

### Error Response
```json
{
  "status": "error",
  "code": 422,
  "message": "Validation failed",
  "details": {
    "fields": {
      "fullName": "Field is required"
    }
  }
}
```

---

## 🔐 Authorization

Tất cả requests (trừ login) cần token:

```
Authorization: Bearer {token}
```

Postman tự động inject vào header.

---

## 📝 Test Data

**Để modify test data**:

1. Click request
2. Click **"Body"** tab
3. Edit JSON
4. Click **"Send"**

---

## 🧪 Automated Tests

Mỗi request có script test tự động:

```javascript
pm.test('✅ Profile created successfully', function() {
  pm.expect(pm.response.code).to.equal(200);
  pm.expect(responseBody.data.fullName).to.exist;
});
```

✅ Green = passed  
❌ Red = failed

---

## 📊 Collection Runner

Test tất cả endpoints:

1. Click **"Run"** button
2. Select collection
3. Select environment
4. Click **"Run"**

Xem kết quả: ✅/❌ each endpoint

---

## 🐛 Thường Gặp

| Lỗi | Giải pháp |
|-----|----------|
| 401 Unauthorized | Login lại |
| 404 Not Found | Tạo profile trước (PUT) |
| 422 Validation Error | Kiểm tra required fields |
| Connection refused | Backend không chạy |

---

## 🚀 Tiếp Theo

### Sau khi test xong local:

1. Đọc `POSTMAN_TO_SUPABASE_MIGRATION.md` (30 phút)
2. Tạo Supabase project
3. Migrate database
4. Deploy backend
5. Deploy frontend
6. Update Postman + test production

---

## 📚 Files Cần Đọc

| File | Khi Nào | Thời Gian |
|------|---------|----------|
| `POSTMAN_TESTING_GUIDE.md` | Test local | 10 phút |
| `POSTMAN_TO_SUPABASE_MIGRATION.md` | Trước deploy | 20 phút |
| `CANDIDATE_PROFILE_API.md` | Chi tiết API | 15 phút |
| `BACKEND_SETUP_GUIDE.md` | Setup backend | 20 phút |

---

## ✨ Các Features Trong Collection

- ✅ 9 endpoints đầy đủ
- ✅ Auto token injection
- ✅ Auto environment variables save
- ✅ Built-in test scripts
- ✅ Error handling tests
- ✅ Request templates
- ✅ Response verification

---

## 🎉 Status

- ✅ Postman collection ready
- ✅ All 9 endpoints documented
- ✅ Auto tests included
- ✅ Ready for local testing
- ✅ Ready for production migration

---

**Bắt đầu test ngay!** 🚀

1. Import collection
2. Setup environment
3. Click "Login" → "Send"
4. Test các endpoints khác

**Enjoy!** 💻
