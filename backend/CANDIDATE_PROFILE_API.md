# 🎯 Candidate Profile API Documentation

**Base URL**: `http://localhost:3000/api`  
**Authentication**: JWT Bearer Token (required for all endpoints)  
**Content-Type**: `application/json`

---

## 📋 Table of Contents

1. [Profile Endpoints](#profile-endpoints)
2. [Education Endpoints](#education-endpoints)
3. [Experience Endpoints](#experience-endpoints)
4. [Error Codes](#error-codes)
5. [Request/Response Examples](#requestresponse-examples)

---

## Profile Endpoints

### GET /candidate/profile

Fetch current user's candidate profile.

**Request**:
```bash
GET /api/candidate/profile
Authorization: Bearer {token}
```

**Response** (200 OK):
```json
{
  "status": "success",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "userId": "550e8400-e29b-41d4-a716-446655440001",
    "fullName": "John Doe",
    "email": "john@example.com",
    "phone": "1234567890",
    "location": "San Francisco, CA",
    "headline": "Senior Full Stack Developer",
    "bio": "Passionate about building scalable web applications",
    "profileImage": "https://example.com/avatars/user123.jpg",
    "skills": ["JavaScript", "React", "Node.js", "TypeScript", "PostgreSQL"],
    "education": [
      {
        "id": "edu-1",
        "school": "Stanford University",
        "degree": "Bachelor of Science",
        "fieldOfStudy": "Computer Science",
        "startDate": "2015-09-01",
        "endDate": "2019-05-31"
      }
    ],
    "experience": [
      {
        "id": "exp-1",
        "title": "Senior Developer",
        "company": "Tech Company",
        "description": "Led development team building microservices",
        "startDate": "2020-01-01",
        "endDate": "2024-05-21",
        "current": true
      }
    ],
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-05-21T14:45:00Z"
  }
}
```

**Error Responses**:

```json
// 401 Unauthorized
{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Invalid or expired token"
  }
}

// 404 Not Found
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Candidate profile not found"
  }
}
```

---

### PUT /candidate/profile

Update current user's candidate profile.

**Request**:
```bash
PUT /api/candidate/profile
Authorization: Bearer {token}
Content-Type: application/json

{
  "fullName": "John Doe",
  "phone": "1234567890",
  "location": "San Francisco, CA",
  "headline": "Senior Full Stack Developer",
  "bio": "Passionate about building scalable applications",
  "skills": ["JavaScript", "React", "Node.js", "TypeScript", "PostgreSQL"]
}
```

**Note**: All fields are optional. Only send the fields you want to update.

**Response** (200 OK):
```json
{
  "status": "success",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "userId": "550e8400-e29b-41d4-a716-446655440001",
    "fullName": "John Doe",
    "email": "john@example.com",
    "phone": "1234567890",
    "location": "San Francisco, CA",
    "headline": "Senior Full Stack Developer",
    "bio": "Passionate about building scalable applications",
    "profileImage": null,
    "skills": ["JavaScript", "React", "Node.js", "TypeScript", "PostgreSQL"],
    "education": [],
    "experience": [],
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-05-21T15:00:00Z"
  }
}
```

**Validation Errors** (422 Unprocessable Entity):
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": {
      "fields": {
        "fullName": "fullName must be a string",
        "skills": "skills must be an array"
      }
    }
  }
}
```

---

### POST /candidate/profile/upload-avatar

Upload profile avatar image.

**Request**:
```bash
POST /api/candidate/profile/upload-avatar
Authorization: Bearer {token}
Content-Type: multipart/form-data

[file]: <binary image file>
```

**Supported Formats**: `.jpg`, `.jpeg`, `.png`, `.gif`, `.webp`  
**Max Size**: 5MB

**Response** (200 OK):
```json
{
  "status": "success",
  "data": {
    "imageUrl": "https://res.cloudinary.com/example/image/upload/v123456789/avatars/user123.jpg"
  }
}
```

**Error Responses**:
```json
// 400 Bad Request - No file
{
  "error": {
    "code": "BAD_REQUEST",
    "message": "No file uploaded"
  }
}

// 422 Unprocessable Entity - Invalid file type
{
  "error": {
    "code": "INVALID_FILE",
    "message": "File must be an image (jpg, png, gif, webp)"
  }
}

// 413 Payload Too Large
{
  "error": {
    "code": "FILE_TOO_LARGE",
    "message": "File size must be less than 5MB"
  }
}
```

---

## Education Endpoints

### POST /candidate/profile/education

Add education record to profile.

**Request**:
```bash
POST /api/candidate/profile/education
Authorization: Bearer {token}
Content-Type: application/json

{
  "school": "Stanford University",
  "degree": "Bachelor of Science",
  "fieldOfStudy": "Computer Science",
  "startDate": "2015-09-01",
  "endDate": "2019-05-31"
}
```

**Required Fields**: `school`, `degree`, `startDate`, `endDate`  
**Optional Fields**: `fieldOfStudy`

**Response** (200 OK):
```json
{
  "status": "success",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "userId": "550e8400-e29b-41d4-a716-446655440001",
    "fullName": "John Doe",
    "email": "john@example.com",
    "phone": "1234567890",
    "location": "San Francisco, CA",
    "headline": "Senior Full Stack Developer",
    "bio": null,
    "profileImage": null,
    "skills": [],
    "education": [
      {
        "id": "edu-1",
        "school": "Stanford University",
        "degree": "Bachelor of Science",
        "fieldOfStudy": "Computer Science",
        "startDate": "2015-09-01",
        "endDate": "2019-05-31"
      }
    ],
    "experience": [],
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-05-21T15:00:00Z"
  }
}
```

**Validation Errors** (422):
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": {
      "fields": {
        "school": "school is required",
        "degree": "degree is required"
      }
    }
  }
}
```

---

### PUT /candidate/profile/education/:id

Update education record.

**Request**:
```bash
PUT /api/candidate/profile/education/edu-1
Authorization: Bearer {token}
Content-Type: application/json

{
  "school": "Stanford University",
  "degree": "Master of Science",
  "fieldOfStudy": "Computer Science",
  "startDate": "2019-06-01",
  "endDate": "2021-05-31"
}
```

**Note**: All fields are optional.

**Response** (200 OK):
```json
{
  "status": "success",
  "data": {
    // ... full profile with updated education
  }
}
```

---

### DELETE /candidate/profile/education/:id

Delete education record.

**Request**:
```bash
DELETE /api/candidate/profile/education/edu-1
Authorization: Bearer {token}
```

**Response** (200 OK):
```json
{
  "status": "success",
  "data": {
    // ... full profile with education record removed
  }
}
```

**Error Response** (404):
```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Education record not found"
  }
}
```

---

## Experience Endpoints

### POST /candidate/profile/experience

Add experience record to profile.

**Request**:
```bash
POST /api/candidate/profile/experience
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "Senior Developer",
  "company": "Tech Company",
  "description": "Led development team building microservices",
  "startDate": "2020-01-01",
  "endDate": "2024-05-21",
  "current": true
}
```

**Required Fields**: `title`, `company`, `startDate`  
**Optional Fields**: `description`, `endDate`, `current`

**Response** (200 OK):
```json
{
  "status": "success",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "userId": "550e8400-e29b-41d4-a716-446655440001",
    "fullName": "John Doe",
    "email": "john@example.com",
    "phone": "1234567890",
    "location": "San Francisco, CA",
    "headline": "Senior Full Stack Developer",
    "bio": null,
    "profileImage": null,
    "skills": [],
    "education": [],
    "experience": [
      {
        "id": "exp-1",
        "title": "Senior Developer",
        "company": "Tech Company",
        "description": "Led development team building microservices",
        "startDate": "2020-01-01",
        "endDate": "2024-05-21",
        "current": true
      }
    ],
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-05-21T15:00:00Z"
  }
}
```

---

### PUT /candidate/profile/experience/:id

Update experience record.

**Request**:
```bash
PUT /api/candidate/profile/experience/exp-1
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "Lead Developer",
  "company": "Another Company",
  "description": "Architected cloud infrastructure",
  "startDate": "2020-01-01",
  "endDate": "2024-05-21",
  "current": false
}
```

**Note**: All fields are optional.

**Response** (200 OK):
```json
{
  "status": "success",
  "data": {
    // ... full profile with updated experience
  }
}
```

---

### DELETE /candidate/profile/experience/:id

Delete experience record.

**Request**:
```bash
DELETE /api/candidate/profile/experience/exp-1
Authorization: Bearer {token}
```

**Response** (200 OK):
```json
{
  "status": "success",
  "data": {
    // ... full profile with experience record removed
  }
}
```

---

## Error Codes

| Code | HTTP | Meaning | Action |
|------|------|---------|--------|
| `UNAUTHORIZED` | 401 | Invalid or expired token | Re-login |
| `FORBIDDEN` | 403 | No permission for resource | Check user role |
| `NOT_FOUND` | 404 | Resource doesn't exist | Create or refresh data |
| `VALIDATION_ERROR` | 422 | Input validation failed | Check field errors |
| `BAD_REQUEST` | 400 | Invalid request | Review request format |
| `INTERNAL_ERROR` | 500 | Server error | Retry or contact support |
| `RATE_LIMIT` | 429 | Too many requests | Wait and retry |

---

## Request/Response Examples

### Complete Example: Create Profile Flow

**1. Create Profile (on registration)**

```bash
POST /api/candidate/profile
Authorization: Bearer {token}
Content-Type: application/json

{
  "fullName": "Jane Smith",
  "phone": "+1-555-0123",
  "location": "New York, NY",
  "headline": "UX/UI Designer",
  "bio": "Creative designer with 5+ years experience",
  "skills": ["Figma", "UI Design", "Prototyping"]
}
```

**2. Add Education**

```bash
POST /api/candidate/profile/education
Authorization: Bearer {token}
Content-Type: application/json

{
  "school": "Rhode Island School of Design",
  "degree": "Bachelor of Fine Arts",
  "fieldOfStudy": "Graphic Design",
  "startDate": "2015-09-01",
  "endDate": "2019-05-31"
}
```

**3. Add Experience**

```bash
POST /api/candidate/profile/experience
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "Senior UX Designer",
  "company": "Design Studio",
  "description": "Led design team for 20+ projects",
  "startDate": "2019-06-01",
  "current": true
}
```

**4. Upload Avatar**

```bash
POST /api/candidate/profile/upload-avatar
Authorization: Bearer {token}
Content-Type: multipart/form-data

[file]: avatar.jpg
```

---

## Authentication

All endpoints require JWT authentication via `Authorization` header:

```bash
Authorization: Bearer {jwt_token}
```

### Token Format

```
Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Obtaining Token

Token is obtained during login:

```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

Response:
```json
{
  "status": "success",
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "email": "user@example.com",
      "fullName": "Jane Smith",
      "role": "candidate"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

## Rate Limiting

- **Limit**: 15 requests per 15 minutes
- **Auth endpoints**: 5 requests per 15 minutes
- **File upload**: 10 requests per hour

When rate limited, response:
```
Status: 429 Too Many Requests

Retry-After: 60
X-RateLimit-Limit: 15
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1621600000
```

---

## Testing with cURL

### Get Profile
```bash
curl -X GET http://localhost:3000/api/candidate/profile \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json"
```

### Update Profile
```bash
curl -X PUT http://localhost:3000/api/candidate/profile \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "John Doe",
    "headline": "Senior Developer"
  }'
```

### Add Education
```bash
curl -X POST http://localhost:3000/api/candidate/profile/education \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "school": "Stanford",
    "degree": "BS",
    "fieldOfStudy": "CS",
    "startDate": "2015-09-01",
    "endDate": "2019-05-31"
  }'
```

### Upload Avatar
```bash
curl -X POST http://localhost:3000/api/candidate/profile/upload-avatar \
  -H "Authorization: Bearer {token}" \
  -F "file=@avatar.jpg"
```

---

## Support

For issues or questions:
- Check error response details
- Review request format against examples
- Verify authentication token is valid
- Check server logs for more context

**Last Updated**: May 21, 2026  
**Version**: 1.0.0 - Production Ready ✅
