import { ApiDocument } from 'core/config/swagger.config';
import { SwaggerDocument } from 'packages/swagger';

ApiDocument.addModel('CreateMessageDto', {
    conversationId: SwaggerDocument.ApiProperty({ type: 'string' }),
    content: SwaggerDocument.ApiProperty({ type: 'string' }),
    voiceUrl: SwaggerDocument.ApiProperty({type: 'string',required: false }),
});

export const CreateMessageDto = body => ({
    conversation_id: body.conversationId,
    content: body.content,
    voice_url: body.voiceUrl || null,
});

ApiDocument.addModel('UpdateMessageDto', {
    content: SwaggerDocument.ApiProperty({ type: 'string', required: false }),
    voiceUrl: SwaggerDocument.ApiProperty({ type: 'string', required: false }),
});

export const UpdateMessageDto = body => {
    const data = {};
    if (body.content !== undefined) data.content = body.content;
    if (body.voiceUrl !== undefined) data.voice_url = body.voiceUrl;
    return data;
};
