import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  getDocs,
  getDocFromServer,
} from 'firebase/firestore';
import { getAuth, signInAnonymously } from 'firebase/auth';
import config from '../firebase-applet-config.json';
import { ProjectItem } from './data/portfolioData';

const app = getApps().length > 0 ? getApp() : initializeApp(config);

export const db = config.firestoreDatabaseId
  ? getFirestore(app, config.firestoreDatabaseId)
  : getFirestore(app);

export const auth = getAuth(app);

/**
 * Optional helper for anonymous authentication.
 * Silently skips if the Anonymous provider is not enabled in Firebase Console (auth/admin-restricted-operation).
 */
export async function tryAnonymousAuth(): Promise<void> {
  try {
    if (!auth.currentUser) {
      await signInAnonymously(auth);
    }
  } catch (err: any) {
    // Only log unexpected auth errors; admin-restricted-operation means anonymous auth is not enabled,
    // which is expected and completely fine since our Firestore rules allow public access.
    if (err?.code !== 'auth/admin-restricted-operation') {
      console.debug('Firebase auth info:', err?.message || err);
    }
  }
}

// Lightweight connection check to verify Firestore connectivity
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'projects', '_ping_'));
  } catch (error: any) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.debug('Firebase connection offline check:', error.message);
    }
  }
}
testConnection();

const PROJECTS_COLLECTION = 'projects';

/**
 * Real-time listener for projects collection.
 * Fires whenever any card is added, edited, or deleted in the database.
 */
export function subscribeToProjects(
  onData: (projects: ProjectItem[]) => void,
  onError?: (err: Error) => void
) {
  const colRef = collection(db, PROJECTS_COLLECTION);
  return onSnapshot(
    colRef,
    (snapshot) => {
      const items: ProjectItem[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data() as ProjectItem;
        items.push({ ...data, id: docSnap.id });
      });
      // Sort projects if order / createdAt exists
      items.sort((a, b) => {
        const timeA = (a as any).createdAt || 0;
        const timeB = (b as any).createdAt || 0;
        return timeB > timeA ? 1 : -1;
      });
      onData(items);
    },
    (err) => {
      console.warn('Firestore subscription notice:', err);
      if (onError) onError(err);
    }
  );
}

/**
 * Upsert a project item directly into Firestore.
 */
export async function saveProjectToFirestore(project: ProjectItem): Promise<void> {
  const docRef = doc(db, PROJECTS_COLLECTION, project.id);
  const payload = {
    ...project,
    updatedAt: new Date().toISOString(),
  };
  await setDoc(docRef, payload, { merge: true });
}

/**
 * Delete a project item from Firestore.
 */
export async function deleteProjectFromFirestore(projectId: string): Promise<void> {
  const docRef = doc(db, PROJECTS_COLLECTION, projectId);
  await deleteDoc(docRef);
}

/**
 * Seed initial projects if Firestore collection is empty.
 */
export async function seedInitialProjectsIfEmpty(defaults: ProjectItem[]): Promise<void> {
  try {
    const colRef = collection(db, PROJECTS_COLLECTION);
    const existing = await getDocs(colRef);
    if (existing.empty && defaults.length > 0) {
      console.log('Seeding initial projects to Firestore cloud database...');
      for (const p of defaults) {
        await setDoc(doc(db, PROJECTS_COLLECTION, p.id), {
          ...p,
          createdAt: new Date().toISOString(),
        });
      }
      console.log('✓ Successfully seeded projects to Firestore');
    }
  } catch (err) {
    console.warn('Seeding note:', err);
  }
}
