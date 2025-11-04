// User profile management in Firestore
import { getDb } from './firebase';

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  createdAt: any;
  lastActive: any;
  potholeCount: number;
}

/**
 * Create or update user profile in Firestore
 * Called after successful signup or signin
 */
export async function createOrUpdateUserProfile(user: any): Promise<void> {
  try {
    const db = await getDb();
    if (!db) {
      console.warn('[UserService] Firebase not initialized, skipping profile creation');
      return;
    }

    const { doc, setDoc, serverTimestamp } = await import('firebase/firestore');
    
    const userRef = doc(db, 'users', user.uid);
    
    // Use merge: true to avoid overwriting existing data on re-login
    await setDoc(userRef, {
      uid: user.uid,
      email: user.email || null,
      displayName: user.displayName || null,
      photoURL: user.photoURL || null,
      lastActive: serverTimestamp(),
      // Only set these on first creation (merge won't overwrite existing values)
      createdAt: serverTimestamp(),
      potholeCount: 0,
    }, { merge: true });

    console.log('[UserService] User profile created/updated:', user.uid);
  } catch (error) {
    console.error('[UserService] Failed to create user profile:', error);
    // Don't throw - profile creation failure shouldn't block auth
  }
}

/**
 * Increment user's pothole count
 */
export async function incrementUserPotholeCount(userId: string, incrementBy: number = 1): Promise<void> {
  try {
    const db = await getDb();
    if (!db) return;

    const { doc, updateDoc, increment, serverTimestamp } = await import('firebase/firestore');
    
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      potholeCount: increment(incrementBy),
      lastActive: serverTimestamp(),
    } as any);
  } catch (error) {
    console.error('[UserService] Failed to increment pothole count:', error);
  }
}

/**
 * Get user profile from Firestore
 */
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  try {
    const db = await getDb();
    if (!db) return null;

    const { doc, getDoc } = await import('firebase/firestore');
    
    const userRef = doc(db, 'users', userId);
    const docSnap = await getDoc(userRef);
    
    if (docSnap.exists()) {
      return docSnap.data() as UserProfile;
    }
    return null;
  } catch (error) {
    console.error('[UserService] Failed to get user profile:', error);
    return null;
  }
}
