import { ApiDocument } from 'core/config/swagger.config';
import { SwaggerDocument } from 'packages/swagger';

ApiDocument.addModel('CreateConversationDto', {
    participantIds: SwaggerDocument.ApiProperty({ type: 'array' }),
});

export const CreateConversationDto = body => ({
    participantIds: body.participantIds || body.participant_ids || [],
});

ApiDocument.addModel('AddParticipantsDto', {
    userIds: SwaggerDocument.ApiProperty({ type: 'array' }),
});

export const AddParticipantsDto = body => ({
    userIds: body.userIds || body.user_ids || (body.userId ? [body.userId] : []),
});

ApiDocument.addModel('RemoveParticipantDto', {
    userId: SwaggerDocument.ApiProperty({ type: 'string' }),
});

export const RemoveParticipantDto = body => ({
    userId: body.userId || body.user_id,
});
