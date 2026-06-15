import { MediaResolver } from 'core/api/media';
import { UserResolver } from 'core/api/user/user.resolver';
import { ApiDocument } from 'core/config/swagger.config';
import { HandlerResolver } from '../../packages/handler/HandlerResolver';
import { AuthResolver } from './auth/auth.resolver';
import { AiResolver } from './ai/ai.resolver';
import { CandidateResolver } from './candidate/candidate.resolver';
import { EducationResolver } from './education';
import { RecruitmentResolver } from './recruitment';
import { ChatResolver } from './chat';
import { CvResolver } from './cv';
import { JobResolver } from './job';

// Eagerly load DTO definitions to register them with ApiDocument (SwaggerBuilder)
import 'core/modules/recruitment/dto';
import 'core/modules/education/dto';

export const ModuleResolver = HandlerResolver
    .builder()
    .addSwaggerBuilder(ApiDocument)
    .addModule([
        AuthResolver,
        UserResolver,
        MediaResolver,
        AiResolver,
        CandidateResolver,
        EducationResolver,
        RecruitmentResolver,
        ChatResolver,
        CvResolver,
        JobResolver,
    ]);
