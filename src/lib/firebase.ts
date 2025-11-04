// Firebase initialization (Firestore only) using Vite env variables
// Note: Firebase config is safe to expose - security is handled by Firestore Security Rules
const cfg = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY as string | undefined,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string | undefined,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID as string | undefined,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET as string | undefined,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID as string | undefined,
  appId: import.meta.env.VITE_FIREBASE_APP_ID as string | undefined,
};

// Only log presence of config values, never the actual values in production
if (import.meta.env.DEV) {
  console.log('[Firebase] Configuration check (dev mode):', {
    hasApiKey: !!cfg.apiKey,
    hasProjectId: !!cfg.projectId,
    projectId: cfg.projectId // Only show in dev
  });
} else {
  // In production, only log boolean flags
  console.log('[Firebase] Configuration check:', {
    hasApiKey: !!cfg.apiKey,
    hasProjectId: !!cfg.projectId
  });
}

let db: any = null;

export async function getDb(): Promise<any | null> {
  if (db) return db;
  
  if (!cfg.projectId || !cfg.apiKey) {
    console.error('[Firebase] Missing required config:', {
      apiKey: cfg.apiKey ? 'present' : 'MISSING',
      projectId: cfg.projectId || 'MISSING'
    });
    return null;
  }
  
  try {
    console.log('[Firebase] Initializing app...');
    const { initializeApp } = await import('firebase/app');
    const { getFirestore } = await import('firebase/firestore');
    const app = initializeApp(cfg as any);
    db = getFirestore(app);
    console.log('[Firebase] ✅ Firestore initialized successfully');
    return db;
  } catch (error: any) {
    console.error('[Firebase] ❌ Initialization failed:', error.message);
    return null;
  }
}
