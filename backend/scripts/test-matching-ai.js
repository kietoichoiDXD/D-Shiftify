import dotenv from 'dotenv';
import { join } from 'path';
dotenv.config({ path: join(__dirname, '../.env') });

import connection from '../src/core/database';
import { evaluateMatch } from '../src/core/ai/retrieval/match.scoring';
import { refineMatchWithAI } from '../src/core/ai/matching/agentic.matcher';

async function runTest() {
  console.log('=== TEST AI MATCHING ENGINE & GEMINI ===');
  
  const jobs = await connection('jobs')
    .whereNull('deleted_at')
    .select('id', 'title', 'job_type', 'work_mode', 'experience_required', 'skills', 'location', 'description');

  console.log(`Found ${jobs.length} jobs in Supabase DB.`);

  const cvs = await connection('cvs')
    .innerJoin('profiles', 'profiles.id', 'cvs.profile_id')
    .whereNull('cvs.deleted_at')
    .select('cvs.*', 'profiles.user_id', 'profiles.full_name');

  console.log(`Found ${cvs.length} CVs in Supabase DB.`);

  if (jobs.length > 0 && cvs.length > 0) {
    const cv = cvs[0];
    const job = jobs[0];

    const profileData = {
      id: cv.id,
      jobType: cv.job_type || 'fulltime',
      workMode: cv.work_mode || 'remote',
      mobility: cv.mobility || 'high',
      expectedJob: cv.expected_job || 'Developer',
      skills: typeof cv.skills === 'string' ? JSON.parse(cv.skills || '[]') : (cv.skills || []),
      conditions: typeof cv.conditions === 'string' ? JSON.parse(cv.conditions || '[]') : (cv.conditions || []),
      experiences: typeof cv.experiences === 'string' ? JSON.parse(cv.experiences || '[]') : (cv.experiences || []),
      certificates: typeof cv.certificates === 'string' ? JSON.parse(cv.certificates || '[]') : (cv.certificates || []),
      customSections: typeof cv.custom_sections === 'string' ? JSON.parse(cv.custom_sections || '[]') : (cv.custom_sections || []),
      devices: ['Laptop', 'Camera', 'NVDA']
    };

    const jobData = {
      id: job.id,
      title: job.title,
      jobType: job.job_type,
      workMode: job.work_mode,
      experienceRequired: job.experience_required,
      skills: typeof job.skills === 'string' ? JSON.parse(job.skills || '[]') : (job.skills || []),
      location: job.location,
      description: job.description || 'Tuyển dụng vị trí lập trình viên',
      company: { name: 'Shiftify Tech' },
      devices: ['Laptop']
    };

    console.log(`\nEvaluating 8-criteria match for CV [${cv.id}] vs Job [${job.title}]...`);
    const evalResult = evaluateMatch(profileData, jobData, []);
    console.log('Deterministic Score:', evalResult.score, '%');
    console.log('Criteria scores:', evalResult.criteria.map(c => `${c.label}: ${c.score}pt`));

    console.log('\nRefining match with Gemini AI LLM-as-judge...');
    const aiResult = await refineMatchWithAI(profileData, jobData, evalResult);
    console.log('Final AI Refined Score:', aiResult.score, '%');
    console.log('AI Explanation:', aiResult.explanation);
    console.log('AI Refined Flag:', aiResult.aiRefined);
  } else {
    console.log('Skipping evaluation: missing jobs or CVs in DB.');
  }

  process.exit(0);
}

runTest().catch(err => {
  console.error('Error running AI matching test:', err);
  process.exit(1);
});
