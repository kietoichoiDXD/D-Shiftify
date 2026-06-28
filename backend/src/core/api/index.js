import { MediaResolver } from 'core/api/media';
import { UserResolver } from 'core/api/user/user.resolver';
import { ApiDocument } from 'core/config/swagger.config';
import { HandlerResolver } from '../../packages/handler/HandlerResolver';
import { AuthResolver } from './auth/auth.resolver';
import {ChatResolver} from './chat/chat.resolver';
import { CVResolver } from './cv/cv.resolver';
import { CVsResolver } from './cv/cvs.resolver';
import { ProfileResolver } from './profile/profile.resolver';
import { ApplicationsResolver } from './applications/applications.resolver';
import { JobResolver, AdminJobResolver, RecruiterJobResolver } from './job/job.resolver';
import { MatchingResolver } from './ai/matching.resolver';
import { MatchesResolver } from './ai/matches.resolver';
import { SpeechResolver } from './ai/speech.resolver';
import { CompanyResolver } from './company/company.resolver';
import { TrainingResolver } from './training/training.resolver';
import { TrainingCentersResolver } from './training/training-centers.resolver';
import { CoursesResolver } from './training/courses.resolver';
import { CommunityResolver } from './community/community.resolver';
import { VoiceResolver } from './voice/voice.resolver';

export const ModuleResolver = HandlerResolver.builder()
    .addSwaggerBuilder(ApiDocument)
    .addModule([
        AuthResolver,
        UserResolver,
        MediaResolver,
        ChatResolver,
        CVResolver,
        CVsResolver,
        ProfileResolver,
        ApplicationsResolver,
        JobResolver,
        AdminJobResolver,
        RecruiterJobResolver,
        MatchingResolver,
        MatchesResolver,
        SpeechResolver,
        CompanyResolver,
        TrainingResolver,
        TrainingCentersResolver,
        CoursesResolver,
        CommunityResolver,
        VoiceResolver,
    ]);
