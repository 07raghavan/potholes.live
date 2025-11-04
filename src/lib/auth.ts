// Firebase Authentication setup and utilities
import { getDb } from './firebase';

let auth: any = null;

export async function getAuth() {
  if (auth) return auth;
  try {
    console.log('[Auth] Initializing authentication...');
    const { getAuth: fbGetAuth } = await import('firebase/auth');
    const db = await getDb();
    if (!db) {
      console.error('[Auth] ❌ Cannot initialize: Firestore not available');
      return null;
    }
    const { getApps } = await import('firebase/app');
    const apps = getApps();
    if (apps.length === 0) {
      console.error('[Auth] ❌ No Firebase app found');
      return null;
    }
    auth = fbGetAuth(apps[0]);
    console.log('[Auth] ✅ Authentication initialized');
    return auth;
  } catch (error: any) {
    console.error('[Auth] ❌ Initialization failed:', error.message);
    return null;
  }
}

export async function signUpWithEmail(email: string, password: string) {
  const auth = await getAuth();
  if (!auth) throw new Error('Auth not initialized');
  const { createUserWithEmailAndPassword } = await import('firebase/auth');
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  return cred.user;
}

export async function signInWithEmail(email: string, password: string) {
  const auth = await getAuth();
  if (!auth) throw new Error('Auth not initialized');
  const { signInWithEmailAndPassword } = await import('firebase/auth');
  const cred = await signInWithEmailAndPassword(auth, email, password);
  return cred.user;
}

export async function signOut() {
  const auth = await getAuth();
  if (!auth) return;
  const { signOut: fbSignOut } = await import('firebase/auth');
  await fbSignOut(auth);
}

export async function getCurrentUser() {
  const auth = await getAuth();
  return auth?.currentUser || null;
}

export async function onAuthStateChanged(callback: (user: any) => void) {
  const auth = await getAuth();
  if (!auth) return () => {};
  const { onAuthStateChanged: fbOnAuthStateChanged } = await import('firebase/auth');
  return fbOnAuthStateChanged(auth, callback);
}
