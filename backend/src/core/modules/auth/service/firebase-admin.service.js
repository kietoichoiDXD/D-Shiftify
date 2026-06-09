import admin from 'firebase-admin';
import {
    FIREBASE_CLIENT_EMAIL,
    FIREBASE_PRIVATE_KEY,
    FIREBASE_PROJECT_ID,
} from 'core/env';

let app;

const hasFirebaseConfig = Boolean(
    FIREBASE_PROJECT_ID && FIREBASE_CLIENT_EMAIL && FIREBASE_PRIVATE_KEY,
);

const getApp = () => {
    if (!hasFirebaseConfig) return null;

    if (!app) {
        app = admin.apps.length
            ? admin.app()
            : admin.initializeApp({
                credential: admin.credential.cert({
                    projectId: FIREBASE_PROJECT_ID,
                    clientEmail: FIREBASE_CLIENT_EMAIL,
                    privateKey: FIREBASE_PRIVATE_KEY,
                }),
            });
    }

    return app;
};

export const FirebaseAdminService = {
    isConfigured() {
        return hasFirebaseConfig;
    },

    async verifyIdToken(token) {
        const firebaseApp = getApp();
        if (!firebaseApp) return null;

        const decoded = await admin.auth(firebaseApp).verifyIdToken(token);
        return decoded;
    },
};
