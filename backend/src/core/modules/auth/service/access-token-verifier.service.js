import { JwtService } from './jwt.service';
import { TokenRevocationService } from './token-revocation.service';
import { FirebaseAdminService } from './firebase-admin.service';

const normalizeToken = token => token?.replace('Bearer ', '');

const mapFirebasePayload = payload => ({
    ...payload,
    id: payload?.uid,
    roles: Array.isArray(payload?.roles)
        ? payload.roles
        : payload?.role
            ? [payload.role].flat()
            : [],
    permissions: payload?.permissions ?? [],
    authProvider: 'firebase',
});

export const AccessTokenVerifierService = {
    async verify(token) {
        const rawToken = normalizeToken(token);
        if (!rawToken) {
            throw new Error('Missing access token');
        }

        if (await TokenRevocationService.isRevoked(rawToken)) {
            throw new Error('Token revoked');
        }

        if (FirebaseAdminService.isConfigured()) {
            try {
                const firebasePayload = await FirebaseAdminService.verifyIdToken(rawToken);
                if (firebasePayload?.uid) {
                    return mapFirebasePayload(firebasePayload);
                }
            } catch (error) {
                // Fall back to existing JWT auth flow.
            }
        }

        return JwtService.verify(rawToken);
    },
};
