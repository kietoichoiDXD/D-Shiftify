import { ApiDocument } from 'core/config/swagger.config';
import { SwaggerDocument } from 'packages/swagger';

ApiDocument.addModel('TranscribeSpeechDto', {
    audioBase64: SwaggerDocument.ApiProperty({ type: 'string' }),
    encoding: SwaggerDocument.ApiProperty({ type: 'string', required: false }),
    sampleRateHertz: SwaggerDocument.ApiProperty({ type: 'number', required: false }),
    languageCode: SwaggerDocument.ApiProperty({ type: 'string', required: false }),
});

ApiDocument.addModel('SynthesizeSpeechDto', {
    text: SwaggerDocument.ApiProperty({ type: 'string' }),
    languageCode: SwaggerDocument.ApiProperty({ type: 'string', required: false }),
    voiceName: SwaggerDocument.ApiProperty({ type: 'string', required: false }),
    gender: SwaggerDocument.ApiProperty({ type: 'string', required: false }),
    speakingRate: SwaggerDocument.ApiProperty({ type: 'number', required: false }),
    pitch: SwaggerDocument.ApiProperty({ type: 'number', required: false }),
});
