# 🚀 Migrate to Supabase - Complete Guide

**From**: Local PostgreSQL + Local Backend  
**To**: Supabase Cloud (PostgreSQL + API Hosting)  
**Time**: ~30 minutes  
**Status**: Production Ready

---

## 📋 Pre-requisites

- ✅ Backend running locally (tested with Postman)
- ✅ All 9 endpoints working
- ✅ Supabase account (free tier available)
- ✅ Git repository ready

---

## 🎯 Phase 1: Setup Supabase Project (10 min)

### Step 1: Create Supabase Account

1. Go to https://supabase.com
2. Click **"Sign Up"**
3. Create account (GitHub login recommended)
4. Verify email

### Step 2: Create New Project

1. Click **"New Project"**
2. Fill in:
   - **Name**: `shiftify-production`
   - **Password**: Generate strong password (save it!)
   - **Region**: Choose closest to your users
3. Click **"Create new project"**
4. Wait 2-3 minutes for setup

### Step 3: Get Connection Details

1. Go to **Settings** → **Database**
2. Find **Connection string**:
   - **Standard**: `postgresql://user:password@host:5432/db`
   - Copy this

3. Also copy:
   - **Host**: supabase_host_url
   - **Port**: 5432
   - **User**: postgres
   - **Password**: (what you set)
   - **Database**: postgres

### Step 4: Create `.env.production`

In `backend/` directory, create `.env.production`:

```env
# Supabase PostgreSQL
DB_TYPE=postgres
DB_HOST=your_supabase_host
DB_PORT=5432
DB_USER=postgres
DB_PASS=your_password
DB_NAME=postgres

# API Configuration
API_URL=https://your-backend-url.com/api
NODE_ENV=production

# JWT Secret (change this!)
JWT_SECRET=your_super_secret_key_here_change_this_in_production

# File Upload (using Supabase Storage)
STORAGE_BUCKET=profile-avatars
STORAGE_TYPE=supabase
```

---

## 🔧 Phase 2: Migrate Database (10 min)

### Step 1: Connect to Supabase Database

```bash
# Install pgAdmin (optional, for GUI) or use psql
# Using psql (command line):

psql "postgresql://postgres:YOUR_PASSWORD@YOUR_HOST:5432/postgres"
```

### Step 2: Run Migrations

```bash
# In backend directory
cd backend

# Set environment to production
$env:NODE_ENV = "production"

# Or on Linux/Mac:
export NODE_ENV=production

# Run migrations to Supabase
npm run knex migrate:latest --env production
```

✅ This creates:
- `candidate_profiles` table
- All indexes
- Constraints
- Triggers

### Step 3: Verify Tables

In Supabase dashboard:
1. Go to **SQL Editor**
2. Run:
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';
```

✅ Should show:
- `candidate_profiles`
- `users`
- `migrations`
- Other tables

---

## 🚀 Phase 3: Deploy Backend (10-15 min)

### Option A: Deploy to Railway (Recommended - Free)

#### Step 1: Create Railway Account
1. Go to https://railway.app
2. Sign up with GitHub
3. Authorize Railway

#### Step 2: Deploy from GitHub

1. In Railway, click **"New Project"**
2. Select **"Deploy from GitHub repo"**
3. Authorize and select: `D-Shiftify`
4. Click **"Deploy"**

#### Step 3: Add Environment Variables

1. In Railway project, click **"Variables"**
2. Add from `.env.production`:

```
DB_HOST=your_supabase_host
DB_PORT=5432
DB_USER=postgres
DB_PASS=your_password
DB_NAME=postgres
JWT_SECRET=your_secret_key
NODE_ENV=production
```

3. Save

#### Step 4: Get Deployment URL

1. Click **"Settings"**
2. Find **"Domain"** (e.g., `https://shiftify-api.railway.app`)
3. Copy this URL

✅ Backend is now live!

---

### Option B: Deploy to Heroku

#### Step 1: Create Heroku Account
1. Go to https://heroku.com
2. Sign up
3. Install Heroku CLI

#### Step 2: Deploy

```bash
cd backend

# Login to Heroku
heroku login

# Create app
heroku create shiftify-api

# Add buildpack (Node.js)
heroku buildpacks:add heroku/nodejs

# Set environment variables
heroku config:set DB_HOST=your_supabase_host
heroku config:set DB_PORT=5432
heroku config:set DB_USER=postgres
heroku config:set DB_PASS=your_password
heroku config:set DB_NAME=postgres
heroku config:set JWT_SECRET=your_secret_key
heroku config:set NODE_ENV=production

# Deploy
git push heroku main

# View logs
heroku logs --tail
```

✅ Backend deployed at `https://shiftify-api.herokuapp.com`

---

### Option C: Deploy to DigitalOcean (Advanced)

1. Create DigitalOcean account
2. Create App (connect GitHub)
3. Set environment variables
4. Deploy
5. Get URL from dashboard

---

## 🔄 Phase 4: Update Frontend (5 min)

### Step 1: Update API URL

In `frontend/.env.production`:

```env
VITE_API_URL=https://your-backend-url.com/api
```

Replace `your-backend-url` with actual Supabase/Railway URL.

### Step 2: Build Frontend

```bash
cd frontend

# Build for production
npm run build

# Test locally (optional)
npm run preview
```

### Step 3: Deploy Frontend

#### Option A: Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

Follow prompts:
- Connect GitHub account
- Select repository
- Set environment variables
- Deploy

✅ Frontend live at `https://your-project.vercel.app`

#### Option B: Netlify

1. Go to https://netlify.com
2. Click **"Add new site"**
3. Select GitHub repo
4. Set build command: `npm run build`
5. Set publish directory: `dist`
6. Deploy

#### Option C: Cloudflare Pages

1. Go to https://pages.cloudflare.com
2. Connect GitHub
3. Select repository
4. Configure build
5. Deploy

---

## 📮 Phase 5: Update Postman (2 min)

### Step 1: Create Production Environment

1. In Postman, click **"Environments"**
2. Click **"Create Environment"**
3. Name: `Supabase Production`
4. Add variables:

| Variable | Value |
|----------|-------|
| `baseUrl` | `https://your-backend-url.com/api` |
| `token` | (empty - will be filled) |
| `userId` | (empty) |
| `educationId` | (empty) |
| `experienceId` | (empty) |

5. Save

### Step 2: Test with Production

1. Select `Supabase Production` environment (top right)
2. Run **Login** request
3. If ✅ Works → All 9 endpoints ready to test
4. Test all endpoints again

---

## ✅ Verification Checklist

### Database

- [ ] Supabase project created
- [ ] Connection string copied
- [ ] `.env.production` created
- [ ] Migrations ran successfully
- [ ] Tables visible in Supabase dashboard
- [ ] Indexes created

### Backend

- [ ] Code pushed to GitHub
- [ ] Deployed to Railway/Heroku/DigitalOcean
- [ ] Environment variables set
- [ ] Server running (check logs)
- [ ] Health check endpoint responds
- [ ] Database connection works

### Frontend

- [ ] `.env.production` updated with new API URL
- [ ] Built with `npm run build`
- [ ] Deployed to Vercel/Netlify/Cloudflare
- [ ] Environment variables set
- [ ] Can access app at live URL

### API Testing

- [ ] Login endpoint works
- [ ] GET profile works
- [ ] PUT profile works
- [ ] Education endpoints work
- [ ] Experience endpoints work
- [ ] Avatar upload works (if using Supabase Storage)

### Integration

- [ ] Frontend calls backend
- [ ] Token is saved
- [ ] Profile displays from Supabase
- [ ] Create/update/delete all work
- [ ] No errors in console

---

## 🔗 Environment URLs

After deployment:

```
Frontend URL:      https://shiftify-app.vercel.app
Backend URL:       https://shiftify-api.railway.app/api
Supabase Console:  https://app.supabase.com/project/[project-id]
```

Update these in:
- Frontend `.env.production`
- Postman environment variables
- Any documentation

---

## 🐛 Troubleshooting

### Issue: Database Connection Failed

```
Error: "connect ECONNREFUSED"
```

**Cause**: Wrong connection details  
**Fix**:
```bash
# Test connection
psql "postgresql://postgres:PASSWORD@HOST:5432/postgres"

# Check in Supabase dashboard:
# Settings → Database → Connection string
```

### Issue: Migrations Failed

```
Error: "relation 'candidate_profiles' already exists"
```

**Cause**: Already migrated  
**Fix**: Check migrations table and rollback if needed
```bash
npm run knex migrate:rollback
npm run knex migrate:latest
```

### Issue: Backend Deploy Failed

**Cause**: Missing environment variables or build error  
**Fix**:
```bash
# Check logs
heroku logs --tail
# or Railway dashboard

# Verify all .env variables are set
heroku config
```

### Issue: Frontend Can't Call Backend

```
Error: "CORS error" or "404 not found"
```

**Cause**: Wrong API URL  
**Fix**:
1. Check `VITE_API_URL` in `.env.production`
2. Verify backend is running
3. Test with curl:
```bash
curl https://your-backend-url.com/api/candidate/profile
```

### Issue: Token Not Saving

**Cause**: Postman script error  
**Fix**:
1. Click **"Login"** → **"Tests"** tab
2. Verify script syntax
3. Check browser console for errors

---

## 📊 Deployment Comparison

| Platform | Cost | Setup | Scaling | Recommended |
|----------|------|-------|---------|-------------|
| Railway | $5+/mo | 5 min | Auto | ⭐⭐⭐ |
| Heroku | Free-$7/mo | 5 min | Manual | ⭐⭐⭐ |
| DigitalOcean | $5+/mo | 15 min | Manual | ⭐⭐ |
| Render | Free-$7/mo | 5 min | Auto | ⭐⭐⭐ |

---

## 🎯 Production Checklist

### Security

- [ ] Change all default passwords
- [ ] Set strong JWT_SECRET
- [ ] Enable HTTPS (automatic)
- [ ] Enable Supabase RLS (Row Level Security)
- [ ] Setup firewall rules
- [ ] Enable database backups

### Performance

- [ ] Enable query caching
- [ ] Setup CDN for static files
- [ ] Monitor response times
- [ ] Setup error tracking (Sentry)
- [ ] Monitor database connections

### Monitoring

- [ ] Setup Supabase alerting
- [ ] Monitor Railway/Heroku logs
- [ ] Setup error tracking
- [ ] Monitor API response times
- [ ] Setup performance monitoring

### Backup

- [ ] Enable automated backups
- [ ] Test restore procedure
- [ ] Document recovery steps
- [ ] Archive logs

---

## 📞 Support Resources

| Issue | Link |
|-------|------|
| Supabase Docs | https://supabase.com/docs |
| Railway Docs | https://docs.railway.app |
| Heroku Docs | https://devcenter.heroku.com |
| Vercel Docs | https://vercel.com/docs |

---

## 🎉 You're Live!

After completing all steps:

✅ Backend running on Supabase  
✅ Frontend deployed to cloud  
✅ Database in Supabase PostgreSQL  
✅ All 9 API endpoints working  
✅ Postman configured for production  

### Next Steps:

1. Monitor logs for issues
2. Gather user feedback
3. Plan new features
4. Schedule optimization review
5. Setup analytics

---

## 🔄 Rollback Procedure

If something goes wrong:

```bash
# Rollback database migrations
npm run knex migrate:rollback

# Rollback frontend
# Go to Vercel/Netlify dashboard
# Select previous deployment
# Click "Promote to Production"

# Rollback backend
# Go to Railway/Heroku dashboard
# Select previous deployment
# Click "Redeploy"
```

---

**Status**: ✅ Deployment Ready  
**Time Required**: ~30 minutes  
**Complexity**: Medium  
**Success Rate**: High with this guide

**Good luck with your deployment!** 🚀
