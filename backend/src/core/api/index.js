import { MediaResolver } from 'core/api/media';
import { UserResolver } from 'core/api/user/user.resolver';
import { ApiDocument } from 'core/config/swagger.config';
import { HandlerResolver } from '../../packages/handler/HandlerResolver';
import { AuthResolver } from './auth/auth.resolver';
import {ChatResolver} from './chat/chat.resolver';
import { CVResolver } from './cv/cv.resolver';
import { ProfileResolver } from './profile/profile.resolver';
import { ApplicationsResolver } from './applications/applications.resolver';
import { JobResolver, AdminJobResolver, RecruiterJobResolver } from './job/job.resolver';
import { MatchingResolver } from './ai/matching.resolver';
import { SpeechResolver } from './ai/speech.resolver';
import { CompanyResolver } from './company/company.resolver';
import { TrainingResolver } from './training/training.resolver';

export const ModuleResolver = HandlerResolver.builder()
    .addSwaggerBuilder(ApiDocument)
    .addModule([
        AuthResolver,
        UserResolver,
        MediaResolver,
        ChatResolver,
        CVResolver,
        ProfileResolver,
        ApplicationsResolver,
        JobResolver,
        AdminJobResolver,
        RecruiterJobResolver,
        MatchingResolver,
        SpeechResolver,
        CompanyResolver,
        TrainingResolver,
    ]);
