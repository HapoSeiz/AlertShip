import { initializeApp, cert, getApps, getApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

console.log('FIREBASE_PROJECT_ID:', process.env.FIREBASE_PROJECT_ID);
console.log('FIREBASE_CLIENT_EMAIL:', process.env.FIREBASE_CLIENT_EMAIL);
console.log('FIREBASE_PRIVATE_KEY:', process.env.FIREBASE_PRIVATE_KEY ? 'Exists' : 'Missing');
console.log('FIREBASE_DATABASE_URL:', process.env.FIREBASE_DATABASE_URL);

const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
const databaseURL = process.env.FIREBASE_DATABASE_URL;

if (!projectId || !clientEmail || !privateKey || !databaseURL) {
  throw new Error(
    'Missing Firebase Admin credentials. Check your .env.local file for FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY, and FIREBASE_DATABASE_URL.'
  );
}

const serviceAccount = {
  projectId,
  clientEmail,
  privateKey,
};

const app = !getApps().length
  ? initializeApp({
      credential: cert(serviceAccount as any),
    })
  : getApp();

export const db = getFirestore(app);

export { app, getAuth }; 