import dotenv from 'dotenv';
import { join } from 'path';
import sampleData from './sample-matching-data.json';
dotenv.config({ path: join(__dirname, '../.env') });

import connection from '../src/core/database';
import { BcryptService } from '../src/core/modules/auth/service/bcrypt.service';

async function seedData() {
  console.log('=== SEEDING MATCHING TEST DATA INTO SUPABASE ===\n');

  // 1. Get or create candidate role
  let roleRow = await connection('roles').where('name', sampleData.candidate.role).first();
  if (!roleRow) {
    roleRow = await connection('roles').where('name', 'candidate').first();
  }
  if (!roleRow) {
    const [newRole] = await connection('roles').insert({ name: 'candidate' }, ['id']);
    roleRow = { id: newRole.id || newRole };
  }

  // 2. Check or create User
  let user = await connection('users').where('email', sampleData.candidate.email).first();
  if (!user) {
    const passwordHash = BcryptService.hash(sampleData.candidate.password);
    const [insertedUser] = await connection('users').insert(
      {
        email: sampleData.candidate.email,
        password_hash: passwordHash,
        role_id: roleRow.id,
      },
      ['id']
    );
    const userId = insertedUser.id || insertedUser;
    user = { id: userId, email: sampleData.candidate.email };
    console.log(`[+] Created test user: ${user.email} (ID: ${user.id})`);
  } else {
    console.log(`[*] User already exists: ${user.email} (ID: ${user.id})`);
  }

  // 3. Check or create Profile
  let profile = await connection('profiles').where('user_id', user.id).first();
  if (!profile) {
    const [insertedProfile] = await connection('profiles').insert(
      {
        user_id: user.id,
        full_name: sampleData.candidate.full_name,
        phone: sampleData.candidate.phone,
        disability_status: sampleData.candidate.disability_status,
      },
      ['id']
    );
    const profileId = insertedProfile.id || insertedProfile;
    profile = { id: profileId };
    console.log(`[+] Created candidate profile for user (Profile ID: ${profile.id})`);
  } else {
    await connection('profiles').where('id', profile.id).update({
      full_name: sampleData.candidate.full_name,
      phone: sampleData.candidate.phone,
      disability_status: sampleData.candidate.disability_status,
    });
    console.log(`[*] Updated candidate profile (Profile ID: ${profile.id})`);
  }

  // 4. Create or update CV
  let cv = await connection('cvs').where('profile_id', profile.id).whereNull('deleted_at').first();
  const cvPayload = {
    profile_id: profile.id,
    job_type: sampleData.candidate.job_type,
    work_mode: sampleData.candidate.work_mode,
    mobility: sampleData.candidate.mobility,
    expected_job: sampleData.candidate.expected_job,
    skills: JSON.stringify(sampleData.candidate.skills),
    conditions: JSON.stringify(sampleData.candidate.conditions),
    experiences: JSON.stringify(sampleData.candidate.experiences),
    certificates: JSON.stringify(sampleData.candidate.certificates),
    custom_sections: JSON.stringify(sampleData.candidate.custom_sections),
  };

  if (!cv) {
    const [insertedCv] = await connection('cvs').insert(cvPayload, ['id']);
    cv = { id: insertedCv.id || insertedCv };
    console.log(`[+] Created candidate CV (CV ID: ${cv.id})`);
  } else {
    await connection('cvs').where('id', cv.id).update(cvPayload);
    console.log(`[*] Updated candidate CV (CV ID: ${cv.id})`);
  }

  // 5. Seed Assistive Devices for Candidate Profile
  if (sampleData.candidate.devices && sampleData.candidate.devices.length > 0) {
    await connection('user_devices').where('profile_id', profile.id).delete();
    for (const devName of sampleData.candidate.devices) {
      let deviceRow = await connection('assistive_devices').where('name', devName).first();
      if (!deviceRow) {
        const [newDev] = await connection('assistive_devices').insert({ name: devName }, ['id']);
        deviceRow = { id: newDev.id || newDev };
      }
      await connection('user_devices').insert({
        profile_id: profile.id,
        device_id: deviceRow.id,
      });
    }
    console.log(`[+] Linked ${sampleData.candidate.devices.length} assistive devices to profile`);
  }

  // 6. Check or Create Company
  let company = await connection('companies').where('name', sampleData.company.name).first();
  if (!company) {
    const [insertedCompany] = await connection('companies').insert(
      {
        user_id: user.id,
        name: sampleData.company.name,
        email: 'contact@alpha.com',
        policy_for_disabled: sampleData.company.policy_for_disabled,
        experience_with_disabled: sampleData.company.experience_with_disabled,
      },
      ['id']
    );
    const companyId = insertedCompany.id || insertedCompany;
    company = { id: companyId };
    console.log(`[+] Created test company: ${sampleData.company.name}`);
  }

  // 7. Seed Jobs
  for (const jobItem of sampleData.jobs) {
    let existingJob = await connection('jobs')
      .where('company_id', company.id)
      .where('title', jobItem.title)
      .whereNull('deleted_at')
      .first();

    const jobPayload = {
      company_id: company.id,
      title: jobItem.title,
      job_type: jobItem.job_type,
      work_mode: jobItem.work_mode,
      experience_required: jobItem.experience_required,
      skills: JSON.stringify(jobItem.skills),
      salary_min: jobItem.salary_min,
      salary_max: jobItem.salary_max,
      location: jobItem.location,
      description: jobItem.description,
      status: 'open',
    };

    let jobId;
    if (!existingJob) {
      const [insertedJob] = await connection('jobs').insert(jobPayload, ['id']);
      jobId = insertedJob.id || insertedJob;
      console.log(`[+] Created job posting: "${jobItem.title}"`);
    } else {
      jobId = existingJob.id;
      await connection('jobs').where('id', jobId).update(jobPayload);
      console.log(`[*] Updated job posting: "${jobItem.title}"`);
    }

    // Link Job Devices
    if (jobItem.devices && jobItem.devices.length > 0) {
      await connection('job_devices').where('job_id', jobId).delete();
      for (const devName of jobItem.devices) {
        let deviceRow = await connection('assistive_devices').where('name', devName).first();
        if (!deviceRow) {
          const [newDev] = await connection('assistive_devices').insert({ name: devName }, ['id']);
          deviceRow = { id: newDev.id || newDev };
        }
        await connection('job_devices').insert({
          job_id: jobId,
          device_id: deviceRow.id,
        });
      }
    }
  }

  console.log('\n=== SEEDING COMPLETED SUCCESSFULLY ===');
  console.log('You can now log in with:');
  console.log(`  Email:    ${sampleData.candidate.email}`);
  console.log(`  Password: ${sampleData.candidate.password}`);
  console.log('Or test AI matching via http://localhost:4000/disability/jobs');

  process.exit(0);
}

seedData().catch((err) => {
  console.error('Error seeding matching test data:', err);
  process.exit(1);
});
