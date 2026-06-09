process.env.JWT_SECRET = process.env.JWT_SECRET || 'test_secret_key';
process.env.JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'test_refresh_secret';

const {
    AiMatchParamInterceptor,
    AiMatchQueryInterceptor,
} = require('../../src/core/modules/ai/interceptor/ai.interceptor');

describe('AI match API contract', () => {
    it('parses recommendation query defaults and constraints', async () => {
        const req = { params: { profileId: 'candidate-1' }, query: {}, method: 'GET' };
        const next = jest.fn();

        await AiMatchParamInterceptor.intercept(req, {}, next);
        await AiMatchQueryInterceptor.intercept(req, {}, next);

        expect(req.params).toEqual({ profileId: 'candidate-1' });
        expect(req.query).toEqual({
            limit: 10,
            minScore: 0,
            explain: false,
            includeDescription: true,
        });
        expect(next).toHaveBeenCalledTimes(2);
    });
});
