import { ApiDocument } from 'core/config/swagger.config';
import { SwaggerDocument } from 'packages/swagger';

ApiDocument.addModel('SkillItemDto', {
    name: SwaggerDocument.ApiProperty({ type: 'string', example: 'NodeJS', required: true }),
    type: SwaggerDocument.ApiProperty({ type: 'string', example: 'hard_skill', required: false }),
});

ApiDocument.addModel('CvExperiencePayloadDto', {
    company: SwaggerDocument.ApiProperty({ type: 'string', example: 'ABC Software', required: false }),
    position: SwaggerDocument.ApiProperty({ type: 'string', example: 'Backend Intern', required: false }),
    title: SwaggerDocument.ApiProperty({ type: 'string', example: 'Backend Intern', required: false }),
    description: SwaggerDocument.ApiProperty({ type: 'string', example: 'Developed REST APIs using ExpressJS and PostgreSQL', required: false }),
    startDate: SwaggerDocument.ApiProperty({ type: 'string', example: '2024-01-01', required: false }),
    endDate: SwaggerDocument.ApiProperty({ type: 'string', example: '2024-06-30', required: false }),
    current: SwaggerDocument.ApiProperty({ type: 'bool', required: false }),
});

ApiDocument.addModel('CvCustomSectionItemDto', {
    school: SwaggerDocument.ApiProperty({ type: 'string', example: 'Duy Tan University', required: false }),
    major: SwaggerDocument.ApiProperty({ type: 'string', example: 'Software Engineering', required: false }),
    degree: SwaggerDocument.ApiProperty({ type: 'string', example: 'Bachelor', required: false }),
    startDate: SwaggerDocument.ApiProperty({ type: 'string', example: '2021-09', required: false }),
    endDate: SwaggerDocument.ApiProperty({ type: 'string', example: '2025-06', required: false }),
    description: SwaggerDocument.ApiProperty({ type: 'string', example: 'GPA 3.4', required: false }),
    name: SwaggerDocument.ApiProperty({ type: 'string', example: 'Shiftify', required: false }),
    role: SwaggerDocument.ApiProperty({ type: 'string', example: 'Backend Developer', required: false }),
    technologies: SwaggerDocument.ApiProperty({ type: 'array', model: 'string', required: false, example: 'NodeJS' }),
});

ApiDocument.addModel('CvCustomSectionDto', {
    title: SwaggerDocument.ApiProperty({ type: 'string', example: 'education', required: true }),
    items: SwaggerDocument.ApiProperty({ type: 'array', model: 'CvCustomSectionItemDto', required: false }),
});

ApiDocument.addModel('CvNestedItemDto', {
    deviceIds: SwaggerDocument.ApiProperty({ type: 'array', model: 'string', required: false, example: '10db43b7-0603-4fb1-96a8-1dc2e0ce4ed6' }),
    jobType: SwaggerDocument.ApiProperty({ type: 'string', example: 'full_time', required: false }),
    workMode: SwaggerDocument.ApiProperty({ type: 'string', example: 'remote', required: false }),
    mobility: SwaggerDocument.ApiProperty({ type: 'string', example: 'can_relocate', required: false }),
    expectedJob: SwaggerDocument.ApiProperty({ type: 'string', example: 'Backend Developer', required: false }),
    skills: SwaggerDocument.ApiProperty({ type: 'array', model: 'SkillItemDto', required: false }),
    conditions: SwaggerDocument.ApiProperty({ type: 'array', model: 'string', required: false, example: 'health_insurance' }),
    experiences: SwaggerDocument.ApiProperty({ type: 'array', model: 'CvExperiencePayloadDto', required: false }),
    certificates: SwaggerDocument.ApiProperty({ type: 'array', model: 'string', required: false, example: 'TOEIC 650' }),
    customSections: SwaggerDocument.ApiProperty({ type: 'array', model: 'CvCustomSectionDto', required: false }),
});

ApiDocument.addModel('CvProfileItemDto', {
    fullName: SwaggerDocument.ApiProperty({ type: 'string', example: 'Nguyen Anh Thư', required: false }),
    dob: SwaggerDocument.ApiProperty({ type: 'string', example: '2002-01-15', required: false }),
    gender: SwaggerDocument.ApiProperty({ type: 'string', example: 'male', required: false }),
    phone: SwaggerDocument.ApiProperty({ type: 'string', example: '0905123456', required: false }),
    disabilityStatus: SwaggerDocument.ApiProperty({ type: 'string', example: 'none', required: false }),
    location: SwaggerDocument.ApiProperty({ type: 'string', example: 'Da Nang', required: false }),
    headline: SwaggerDocument.ApiProperty({ type: 'string', example: 'Backend Developer', required: false }),
    bio: SwaggerDocument.ApiProperty({ type: 'string', example: 'Looking for backend engineering roles', required: false }),
    profileImage: SwaggerDocument.ApiProperty({ type: 'string', example: 'https://example.com/avatar.jpg', required: false }),
});

ApiDocument.addModel('CvProfileCreateDto', {
    fullName: SwaggerDocument.ApiProperty({ type: 'string', example: 'Nguyen Anh Thu', required: false }),
    phone: SwaggerDocument.ApiProperty({ type: 'string', example: '0901234567', required: false }),
    location: SwaggerDocument.ApiProperty({ type: 'string', example: 'Da Nang', required: false }),
    headline: SwaggerDocument.ApiProperty({ type: 'string', example: 'Backend Developer', required: false }),
    bio: SwaggerDocument.ApiProperty({ type: 'string', example: 'NodeJS and PostgreSQL developer', required: false }),
    profileImage: SwaggerDocument.ApiProperty({ type: 'string', example: 'https://example.com/avatar.jpg', required: false }),
    dob: SwaggerDocument.ApiProperty({ type: 'string', example: '2002-01-15', required: false }),
    gender: SwaggerDocument.ApiProperty({ type: 'string', example: 'male', required: false }),
    disabilityStatus: SwaggerDocument.ApiProperty({ type: 'string', example: 'none', required: false }),
    deviceIds: SwaggerDocument.ApiProperty({ type: 'array', model: 'string', required: false, example: '10db43b7-0603-4fb1-96a8-1dc2e0ce4ed6' }),
    jobType: SwaggerDocument.ApiProperty({ type: 'string', example: 'full_time', required: false }),
    workMode: SwaggerDocument.ApiProperty({ type: 'string', example: 'remote', required: false }),
    mobility: SwaggerDocument.ApiProperty({ type: 'string', example: 'can_relocate', required: false }),
    expectedJob: SwaggerDocument.ApiProperty({ type: 'string', example: 'Backend Developer', required: false }),
    skills: SwaggerDocument.ApiProperty({ type: 'array', model: 'string', required: false, example: 'NodeJS' }),
    conditions: SwaggerDocument.ApiProperty({ type: 'array', model: 'string', required: false, example: 'health_insurance' }),
    certificates: SwaggerDocument.ApiProperty({ type: 'array', model: 'string', required: false, example: 'TOEIC 650' }),
    customSections: SwaggerDocument.ApiProperty({ type: 'array', model: 'object', required: false }),
    profile: SwaggerDocument.ApiProperty({ type: 'model', model: 'CvProfileItemDto', required: false }),
    cv: SwaggerDocument.ApiProperty({ type: 'model', model: 'CvNestedItemDto', required: false }),
});

ApiDocument.addModel('CvProfileUpdateDto', {
    fullName: SwaggerDocument.ApiProperty({ type: 'string', example: 'Nguyen Anh Thu', required: false }),
    phone: SwaggerDocument.ApiProperty({ type: 'string', example: '0901234567', required: false }),
    location: SwaggerDocument.ApiProperty({ type: 'string', example: 'Da Nang', required: false }),
    headline: SwaggerDocument.ApiProperty({ type: 'string', example: 'Backend Developer', required: false }),
    bio: SwaggerDocument.ApiProperty({ type: 'string', example: 'Updated profile summary', required: false }),
    profileImage: SwaggerDocument.ApiProperty({ type: 'string', example: 'https://example.com/avatar.jpg', required: false }),
    dob: SwaggerDocument.ApiProperty({ type: 'string', example: '2002-01-15', required: false }),
    gender: SwaggerDocument.ApiProperty({ type: 'string', example: 'male', required: false }),
    disabilityStatus: SwaggerDocument.ApiProperty({ type: 'string', example: 'none', required: false }),
    deviceIds: SwaggerDocument.ApiProperty({ type: 'array', model: 'string', required: false, example: '10db43b7-0603-4fb1-96a8-1dc2e0ce4ed6' }),
    jobType: SwaggerDocument.ApiProperty({ type: 'string', example: 'full_time', required: false }),
    workMode: SwaggerDocument.ApiProperty({ type: 'string', example: 'remote', required: false }),
    mobility: SwaggerDocument.ApiProperty({ type: 'string', example: 'can_relocate', required: false }),
    expectedJob: SwaggerDocument.ApiProperty({ type: 'string', example: 'Backend Developer', required: false }),
    skills: SwaggerDocument.ApiProperty({ type: 'array', model: 'string', required: false, example: 'PostgreSQL' }),
    conditions: SwaggerDocument.ApiProperty({ type: 'array', model: 'string', required: false, example: 'flexible_working_hours' }),
    certificates: SwaggerDocument.ApiProperty({ type: 'array', model: 'string', required: false, example: 'AWS Cloud Practitioner' }),
    customSections: SwaggerDocument.ApiProperty({ type: 'array', model: 'object', required: false }),
    profile: SwaggerDocument.ApiProperty({ type: 'model', model: 'CvProfileItemDto', required: false }),
    cv: SwaggerDocument.ApiProperty({ type: 'model', model: 'CvNestedItemDto', required: false }),
});

ApiDocument.addModel('CvEducationCreateDto', {
    school: SwaggerDocument.ApiProperty({ type: 'string', example: 'Duy Tan University', required: true }),
    degree: SwaggerDocument.ApiProperty({ type: 'string', example: 'Bachelor', required: true }),
    fieldOfStudy: SwaggerDocument.ApiProperty({ type: 'string', example: 'Software Engineering', required: false }),
    startDate: SwaggerDocument.ApiProperty({ type: 'string', example: '2021-09', required: true }),
    endDate: SwaggerDocument.ApiProperty({ type: 'string', example: '2025-06', required: true }),
});

ApiDocument.addModel('CvEducationUpdateDto', {
    school: SwaggerDocument.ApiProperty({ type: 'string', example: 'Duy Tan University', required: false }),
    degree: SwaggerDocument.ApiProperty({ type: 'string', example: 'Bachelor', required: false }),
    fieldOfStudy: SwaggerDocument.ApiProperty({ type: 'string', example: 'Software Engineering', required: false }),
    startDate: SwaggerDocument.ApiProperty({ type: 'string', example: '2021-09', required: false }),
    endDate: SwaggerDocument.ApiProperty({ type: 'string', example: '2025-06', required: false }),
});

ApiDocument.addModel('CvExperienceCreateDto', {
    title: SwaggerDocument.ApiProperty({ type: 'string', example: 'Backend Developer', required: true }),
    company: SwaggerDocument.ApiProperty({ type: 'string', example: 'ABC Software', required: true }),
    description: SwaggerDocument.ApiProperty({ type: 'string', example: 'Developed REST APIs using ExpressJS and PostgreSQL', required: false }),
    startDate: SwaggerDocument.ApiProperty({ type: 'string', example: '2024-01-01', required: true }),
    endDate: SwaggerDocument.ApiProperty({ type: 'string', example: '2024-06-30', required: false }),
    current: SwaggerDocument.ApiProperty({ type: 'bool', required: false }),
});

ApiDocument.addModel('CvExperienceUpdateDto', {
    title: SwaggerDocument.ApiProperty({ type: 'string', example: 'Backend Developer', required: false }),
    company: SwaggerDocument.ApiProperty({ type: 'string', example: 'ABC Software', required: false }),
    description: SwaggerDocument.ApiProperty({ type: 'string', example: 'Updated description', required: false }),
    startDate: SwaggerDocument.ApiProperty({ type: 'string', example: '2024-01-01', required: false }),
    endDate: SwaggerDocument.ApiProperty({ type: 'string', example: '2024-06-30', required: false }),
    current: SwaggerDocument.ApiProperty({ type: 'bool', required: false }),
});
