import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

if (!getApps().length) {
  const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_JSON
    ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON)
    : null;

  if (serviceAccount) {
    initializeApp({ credential: cert(serviceAccount) });
  } else {
    // Fallback for local dev with ADC or projectId only
    initializeApp({
      projectId: process.env.FIREBASE_PROJECT_ID || 'ai-studio-applet-webapp-cf859',
    });
  }
}

export const adminAuth = getAuth();
