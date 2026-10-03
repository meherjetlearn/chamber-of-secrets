import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  signInAnonymously,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDocFromServer,
  collection,
  setDoc,
  deleteDoc,
  updateDoc,
  onSnapshot,
  query,
  orderBy,
  getDocs,
  Unsubscribe,
} from 'firebase/firestore';
import { JournalEntry } from './types/journal';

export const firebaseConfig = {
  apiKey: "AIzaSyCdt_MVv1wDmiddthIwWBYUtiMdiXpXq8c",
  authDomain: "chamberofsecrets-a2f6a.firebaseapp.com",
  projectId: "chamberofsecrets-a2f6a",
  storageBucket: "chamberofsecrets-a2f6a.firebasestorage.app",
  messagingSenderId: "695069902579",
  appId: "1:695069902579:web:6e70896f2f276abb279986",
  measurementId: "G-260Z4158ME",
};

// Initialize Firebase SDK
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// Error Handling Specification
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Test connection on boot
export async function testFirestoreConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firestore is running in offline mode. Please check connection.');
    }
  }
}

// Authentication Helpers
export async function loginWithGoogle(): Promise<User> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (err: any) {
    if (err?.code === 'auth/unauthorized-domain') {
      const currentHost = typeof window !== 'undefined' ? window.location.hostname : '';
      console.warn(
        `Firebase domain unauthorized: ${currentHost}. Add it to Firebase Console -> Authentication -> Settings -> Authorized Domains.`
      );
    }
    throw err;
  }
}

// Fallback guest user generator
export function getOrCreateGuestId(): string {
  if (typeof window === 'undefined') return 'guest_seeker';
  let id = localStorage.getItem('chamber_guest_id');
  if (!id) {
    id = 'guest_' + Math.random().toString(36).substring(2, 10);
    localStorage.setItem('chamber_guest_id', id);
  }
  return id;
}

export async function loginAsGuest(): Promise<{ uid: string; displayName: string; isAnonymous: boolean }> {
  try {
    const result = await signInAnonymously(auth);
    return {
      uid: result.user.uid,
      displayName: 'Guest Seeker',
      isAnonymous: true,
    };
  } catch (err: any) {
    // If anonymous auth is disabled in Firebase console (auth/admin-restricted-operation),
    // smoothly fallback to a persistent local guest seeker session without throwing errors
    if (err?.code === 'auth/admin-restricted-operation' || err?.message?.includes('admin-restricted-operation')) {
      console.info(
        'Anonymous auth is disabled in Firebase Console. Using local guest seeker mode.'
      );
      const guestId = getOrCreateGuestId();
      return {
        uid: guestId,
        displayName: 'Guest Seeker (Local)',
        isAnonymous: true,
      };
    }
    throw err;
  }
}

export async function logoutUser(): Promise<void> {
  try {
    await signOut(auth);
  } catch (err: any) {
    console.error('Logout failed:', err);
    throw err;
  }
}

// Firestore Entries Service
export function subscribeToUserEntries(
  userId: string,
  onEntriesChange: (entries: JournalEntry[]) => void
): Unsubscribe {
  const path = `users/${userId}/entries`;
  const q = query(collection(db, path), orderBy('timestamp', 'desc'));

  return onSnapshot(
    q,
    (snapshot) => {
      const items: JournalEntry[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        items.push({
          id: docSnap.id,
          timestamp: data.timestamp || Date.now(),
          dateFormatted: data.dateFormatted || '',
          moonPhase: data.moonPhase || '',
          astronomyHour: data.astronomyHour || '',
          title: data.title || '',
          content: data.content || '',
          diaryReply: data.diaryReply || '',
          house: data.house || 'Slytherin',
          inkColor: data.inkColor || 'obsidian',
          mood: data.mood || 'Quiet Wonder',
          isFavorite: Boolean(data.isFavorite),
          isConcealed: Boolean(data.isConcealed),
        });
      });
      onEntriesChange(items);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

export async function testFirestoreWrite(): Promise<{ success: boolean; message: string }> {
  try {
    const testDocRef = doc(db, 'test', 'connection');
    await setDoc(
      testDocRef,
      {
        ping: 'Chamber of Secrets connection verified',
        updatedAt: Date.now(),
      },
      { merge: true }
    );
    return { success: true, message: 'Successfully wrote to Firestore test document!' };
  } catch (err: any) {
    console.error('Firestore write test error:', err);
    return {
      success: false,
      message: err?.message || String(err),
    };
  }
}

export async function saveEntryToFirestore(
  userId: string | null | undefined,
  entry: JournalEntry
): Promise<{ success: boolean; error?: string }> {
  const targetId = userId || getOrCreateGuestId();
  const path = `users/${targetId}/entries/${entry.id}`;
  try {
    const docRef = doc(db, 'users', targetId, 'entries', entry.id);
    await setDoc(docRef, {
      userId: targetId,
      title: entry.title.slice(0, 200),
      content: entry.content.slice(0, 5000),
      diaryReply: entry.diaryReply.slice(0, 5000),
      house: entry.house,
      inkColor: entry.inkColor,
      mood: entry.mood,
      dateFormatted: entry.dateFormatted,
      moonPhase: entry.moonPhase,
      astronomyHour: entry.astronomyHour,
      isFavorite: entry.isFavorite,
      isConcealed: entry.isConcealed || false,
      timestamp: entry.timestamp,
    });
    return { success: true };
  } catch (error: any) {
    console.error('Firestore save failed:', error);
    return {
      success: false,
      error: error?.message || String(error),
    };
  }
}

export async function deleteEntryFromFirestore(userId: string, entryId: string): Promise<void> {
  const path = `users/${userId}/entries/${entryId}`;
  try {
    const docRef = doc(db, 'users', userId, 'entries', entryId);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function fetchUserEntriesOnce(userId: string): Promise<JournalEntry[]> {
  const path = `users/${userId}/entries`;
  try {
    const q = query(collection(db, path), orderBy('timestamp', 'desc'));
    const snapshot = await getDocs(q);
    const items: JournalEntry[] = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      items.push({
        id: docSnap.id,
        timestamp: data.timestamp || Date.now(),
        dateFormatted: data.dateFormatted || '',
        moonPhase: data.moonPhase || '',
        astronomyHour: data.astronomyHour || '',
        title: data.title || '',
        content: data.content || '',
        diaryReply: data.diaryReply || '',
        house: data.house || 'Slytherin',
        inkColor: data.inkColor || 'obsidian',
        mood: data.mood || 'Quiet Wonder',
        isFavorite: Boolean(data.isFavorite),
        isConcealed: Boolean(data.isConcealed),
      });
    });
    return items;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

export async function syncAndMergeEntries(
  userId: string,
  localEntries: JournalEntry[]
): Promise<JournalEntry[]> {
  const cloudEntries = await fetchUserEntriesOnce(userId);
  const cloudMap = new Map<string, JournalEntry>();
  cloudEntries.forEach((e) => cloudMap.set(e.id, e));

  // Merge any local entries that aren't yet in Firestore
  for (const local of localEntries) {
    if (!cloudMap.has(local.id)) {
      try {
        await saveEntryToFirestore(userId, local);
        cloudMap.set(local.id, local);
      } catch (err) {
        console.error('Failed to sync local entry to Firestore:', err);
      }
    }
  }

  return Array.from(cloudMap.values()).sort((a, b) => b.timestamp - a.timestamp);
}

export async function toggleFavoriteInFirestore(
  userId: string,
  entryId: string,
  isFavorite: boolean
): Promise<void> {
  const path = `users/${userId}/entries/${entryId}`;
  try {
    const docRef = doc(db, 'users', userId, 'entries', entryId);
    await updateDoc(docRef, { isFavorite });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}
