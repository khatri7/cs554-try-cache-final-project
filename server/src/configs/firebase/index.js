import { initializeApp, cert } from 'firebase-admin/app';
import admin from 'firebase-admin';
import serviceAccount from './serviceAccountKey.json' assert { type: 'json' };

initializeApp({
	credential: cert(serviceAccount),
});

export const auth = admin.auth();
