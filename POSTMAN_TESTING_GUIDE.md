# 📮 Postman Testing Guide

**Postman Collection**: `Candidate_Profile_API.postman_collection.json`  
**Total Endpoints**: 9  
**Collection File**: Ready to import

**Recommended UI**: Swagger UI at [http://localhost:3000/docs](http://localhost:3000/docs)

---

## 🧭 Swagger UI (Recommended)

1. Start the backend with `npm run dev`
2. Open [http://localhost:3000/docs](http://localhost:3000/docs)
3. Click **Authorize** and paste your JWT as `Bearer <token>`
4. Use **Try it out** on each endpoint to test requests directly in the browser

---

## 🚀 Setup Postman (5 Minutes)

### Step 1: Download Postman
- Go to https://www.postman.com/downloads/
- Download & Install
- Create account (free)

### Step 2: Import Collection

#### Option A: Direct Import (Recommended)
1. Open Postman
2. Click **"Import"** button (top left)
3. Select **"File"** tab
4. Choose: `Candidate_Profile_API.postman_collection.json`
5. Click **"Import"**

#### Option B: From JSON
1. Copy entire JSON from collection file
2. In Postman: Click **"Import"** 
3. Select **"Raw text"** tab
4. Paste JSON
5. Click **"Import"**

### Step 3: Setup Environment Variables

1. Click **"Environments"** (left sidebar)
2. Click **"Create Environment"** or **"+"**
3. Name it: `Local Development`
  - Or open the shared environment: [Postman Environment](https://kietoichoidxd-3815730.postman.co/workspace/KENJI's-Workspace~d1b5c9d9-b895-464d-8e45-c637924bad42/environment/48308628-651d40f3-98ce-4e5c-9b5d-be49ceb52a04?action=share&source=copy-link&creator=48308628)
4. Add variables:

| Variable | Value | Type |
|----------|-------|------|
| `baseUrl` | `http://localhost:3000/api` | String |
| `token` | (leave empty - auto-filled after login) | String |
| `userId` | (leave empty) | String |
| `educationId` | (leave empty) | String |
| `experienceId` | (leave empty) | String |

5. Click **"Save"**
6. Select this environment in top right dropdown

---

## ✅ Before Testing

Make sure:
- ✅ Backend is running: `npm run dev` (port 3000)
- ✅ Database is running: PostgreSQL
- ✅ Migration completed: `npm run knex migrate:latest`
- ✅ Test account exists in database

---

## 🧪 Test Flow

### 1️⃣ Login First (Required!)

**Request**: `POST /auth/login`

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

✅ **What happens**:
- Script automatically saves `token` to environment
- Token is used for all following requests
- Check: Environment variables panel shows token

---

### 2️⃣ Get Profile (Optional - First Time Will Fail)

**Request**: `GET /candidate/profile`

✅ **Expected**: 
- 200 OK (if profile exists)
- 404 Not Found (normal, create one first)

---

### 3️⃣ Create/Update Profile

**Request**: `PUT /candidate/profile`

```json
{
  "fullName": "John Doe",
  "email": "john@example.com",
  "phone": "1234567890",
  "location": "San Francisco, CA",
  "headline": "Senior Full Stack Developer",
  "bio": "Passionate about building scalable applications",
  "skills": ["JavaScript", "React", "Node.js", "PostgreSQL"]
}
```

✅ **Expected**: 200 OK

---

### 4️⃣ Upload Avatar (Optional)

**Request**: `POST /candidate/profile/upload-avatar`

1. Click **"Body"** → **"form-data"**
2. Key: `file` (type: File)
3. Click file icon → choose image
4. Send

✅ **Expected**: 200 OK with image URL

---

### 5️⃣ Add Education

**Request**: `POST /candidate/profile/education`

```json
{
  "school": "Stanford University",
  "degree": "Bachelor of Science",
  "fieldOfStudy": "Computer Science",
  "startDate": "2015-09-01",
  "endDate": "2019-05-31"
}
```

✅ **What happens**:
- Script saves `educationId` to environment
- Use this ID for update/delete

---

### 6️⃣ Update Education

**Request**: `PUT /candidate/profile/education/{{educationId}}`

(educationId auto-filled from environment)

```json
{
  "school": "Stanford University",
  "degree": "Master of Science",
  "fieldOfStudy": "Computer Science",
  "startDate": "2019-09-01",
  "endDate": "2021-05-31"
}
```

✅ **Expected**: 200 OK

---

### 7️⃣ Delete Education

**Request**: `DELETE /candidate/profile/education/{{educationId}}`

✅ **Expected**: 200 OK

---

### 8️⃣ Add Experience

**Request**: `POST /candidate/profile/experience`

```json
{
  "title": "Senior Full Stack Developer",
  "company": "Tech Company Inc.",
  "description": "Led development of scalable applications",
  "startDate": "2020-01-15",
  "endDate": null,
  "current": true
}
```

✅ **What happens**:
- Script saves `experienceId` to environment
- Use this ID for update/delete

---

### 9️⃣ Update Experience

**Request**: `PUT /candidate/profile/experience/{{experienceId}}`

```json
{
  "title": "Principal Engineer",
  "company": "Tech Company Inc.",
  "description": "Led development and mentored team",
  "startDate": "2020-01-15",
  "endDate": null,
  "current": true
}
```

✅ **Expected**: 200 OK

---

### 🔟 Delete Experience

**Request**: `DELETE /candidate/profile/experience/{{experienceId}}`

✅ **Expected**: 200 OK

---

## 🎯 Test Results

All endpoints have **automated tests**. After each request:

✅ Green checkmark = Test passed  
❌ Red X = Test failed

Look for messages like:
- ✅ Profile created successfully
- ✅ Education added successfully
- ✅ Experience updated successfully

---

## 🔐 Authentication

### How Token Works

1. **Login** → Backend sends JWT token
2. **Auto Save** → Postman script saves to environment
3. **Auto Inject** → All requests use `Bearer {{token}}`
4. **Valid For** → Usually 24 hours

### If Token Expires

- ❌ Error: `401 Unauthorized`
- **Solution**: Run **Login** request again

---

## 🐛 Common Issues & Solutions

### Issue: 401 Unauthorized
```
Error: "Unauthorized"
```
**Cause**: Invalid or missing token  
**Fix**: 
1. Run "Login" request again
2. Check token in environment variables
3. Verify token is not empty

### Issue: 404 Not Found (GET profile)
```
Error: "Profile not found"
```
**Cause**: Profile doesn't exist  
**Fix**: Run "PUT - Create/Update Profile" first

### Issue: 422 Validation Error
```
Error: "Validation failed"
```
**Cause**: Missing required fields  
**Fix**: Check error.details.fields for specifics

### Issue: Connection Refused
```
Error: "Could not connect to localhost:3000"
```
**Cause**: Backend not running  
**Fix**: 
```bash
cd backend
npm run dev
```

### Issue: Database Error
```
Error: "Database connection failed"
```
**Cause**: PostgreSQL not running  
**Fix**: Check PostgreSQL service

---

## 💡 Pro Tips

### 1. Save Response to Variables
Any test can save response to environment:
```javascript
pm.environment.set('myVariable', responseBody.data.id);
```

### 2. Conditional Tests
Run tests based on response:
```javascript
if (pm.response.code === 200) {
  pm.test('Success', function() { ... });
}
```

### 3. Pre-request Scripts
Run code before each request:
```javascript
console.log('Request to:', pm.request.url);
```

### 4. Run All Tests
Click "Send" for individual test or use **Collection Runner**:
1. Click **"Run"** button
2. Select collection
3. Select environment
4. Click **"Run"**

### 5. Export Results
After running tests:
1. Click **"Export Results"**
2. Save as JSON
3. Share with team

---

## 📊 Collection Structure

```
Candidate Profile API
├── Authentication
│   └── Login
├── Profile Management
│   ├── GET - Get Profile
│   ├── PUT - Create/Update Profile
│   └── POST - Upload Avatar
├── Education Management
│   ├── POST - Add Education
│   ├── PUT - Update Education
│   └── DELETE - Delete Education
└── Experience Management
    ├── POST - Add Experience
    ├── PUT - Update Experience
    └── DELETE - Delete Experience
```

---

## 🔄 Testing Workflow

**Recommended order**:

1. Login (get token) ✅
2. Create/Update Profile ✅
3. Get Profile (verify) ✅
4. Add Education ✅
5. Update Education ✅
6. Delete Education ✅
7. Add Experience ✅
8. Update Experience ✅
9. Delete Experience ✅

---

## 📝 Request Templates

### Edit Request Data

Each request has default data. To customize:

1. Click request name
2. Click **"Body"** tab
3. Edit JSON values
4. Click **"Send"**

Example:
```json
{
  "fullName": "Your Name",
  "email": "your@email.com",
  "phone": "your-phone",
  "location": "Your City",
  "headline": "Your Title",
  "bio": "Your bio",
  "skills": ["Skill1", "Skill2", "Skill3"]
}
```

---

## ✨ What Each Test Checks

| Endpoint | Status | Message | Auto-Save |
|----------|--------|---------|-----------|
| Login | 200 | Token saved | ✅ token |
| GET Profile | 200/404 | Profile exists | - |
| PUT Profile | 200 | Updated | - |
| POST Avatar | 200 | Image URL | - |
| POST Education | 200 | Education added | ✅ educationId |
| PUT Education | 200 | Field updated | - |
| DELETE Education | 200 | Removed | - |
| POST Experience | 200 | Experience added | ✅ experienceId |
| PUT Experience | 200 | Field updated | - |
| DELETE Experience | 200 | Removed | - |

---

## 🎓 Learning Resources

- **Postman Docs**: https://learning.postman.com/
- **JavaScript in Postman**: https://learning.postman.com/docs/writing-scripts/
- **Pre-request Scripts**: https://learning.postman.com/docs/writing-scripts/pre-request-scripts/
- **Test Scripts**: https://learning.postman.com/docs/writing-scripts/test-scripts/

---

## 🚀 Next Steps

After successful testing:
1. ✅ Review test results
2. ✅ Document any issues
3. ✅ Prepare for Supabase migration
4. ✅ Read migration guide: `POSTMAN_TO_SUPABASE_MIGRATION.md`

---

**Status**: Ready to test ✅  
**Total Endpoints**: 9  
**Auto Tests**: Included  
**Collection**: Importable JSON format

**Happy testing!** 🎉
