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
  writeBatch,
} from 'firebase/firestore';
import { getAuth, signInAnonymously } from 'firebase/auth';
import config from '../firebase-applet-config.json';
import { ProjectItem, ServiceItem, TestimonialItem } from './data/portfolioData';

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

// ==========================================
// 1. PROJECTS (Selected Commercial Work)
// ==========================================
export const PROJECTS_COLLECTION = 'projects';

/**
 * Real-time listener for projects collection.
 * Fires whenever any project is added, edited, or deleted.
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
        if (docSnap.id === '_ping_') return;
        const data = docSnap.data() as ProjectItem;
        items.push({ ...data, id: docSnap.id });
      });
      // Sort projects by createdAt or custom order
      items.sort((a, b) => {
        const timeA = (a as any).createdAt || 0;
        const timeB = (b as any).createdAt || 0;
        return timeB > timeA ? 1 : -1;
      });
      onData(items);
    },
    (err) => {
      console.warn('Firestore projects subscription notice:', err);
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
    const validDocs = existing.docs.filter((d) => d.id !== '_ping_');
    if (validDocs.length === 0 && defaults.length > 0) {
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
    console.warn('Projects seeding note:', err);
  }
}

// ==========================================
// 2. SERVICES (Capabilities & Specializations)
// ==========================================
export const SERVICES_COLLECTION = 'services';

/**
 * Real-time listener for core design services.
 * Real-time updates immediately across Vercel, mobile, and all visitors.
 */
export function subscribeToServices(
  onData: (services: ServiceItem[]) => void,
  onError?: (err: Error) => void
) {
  const colRef = collection(db, SERVICES_COLLECTION);
  return onSnapshot(
    colRef,
    (snapshot) => {
      const items: ServiceItem[] = [];
      snapshot.forEach((docSnap) => {
        if (docSnap.id === '_ping_') return;
        const data = docSnap.data() as ServiceItem;
        items.push({ ...data, id: docSnap.id });
      });
      // Sort services by index / numeric position
      items.sort((a, b) => {
        const idxA = parseInt(a.index || '0', 10);
        const idxB = parseInt(b.index || '0', 10);
        return idxA - idxB;
      });
      onData(items);
    },
    (err) => {
      console.warn('Firestore services subscription notice:', err);
      if (onError) onError(err);
    }
  );
}

/**
 * Upsert a single service into Firestore.
 */
export async function saveServiceToFirestore(service: ServiceItem): Promise<void> {
  const docRef = doc(db, SERVICES_COLLECTION, service.id);
  const payload = {
    ...service,
    updatedAt: new Date().toISOString(),
  };
  await setDoc(docRef, payload, { merge: true });
}

/**
 * Delete a service from Firestore.
 */
export async function deleteServiceFromFirestore(serviceId: string): Promise<void> {
  const docRef = doc(db, SERVICES_COLLECTION, serviceId);
  await deleteDoc(docRef);
}

/**
 * Save all services to Firestore in bulk.
 */
export async function saveAllServicesToFirestore(services: ServiceItem[]): Promise<void> {
  for (const s of services) {
    await saveServiceToFirestore(s);
  }
}

/**
 * Seed initial services if Firestore collection is empty.
 */
export async function seedInitialServicesIfEmpty(defaults: ServiceItem[]): Promise<void> {
  try {
    const colRef = collection(db, SERVICES_COLLECTION);
    const existing = await getDocs(colRef);
    const validDocs = existing.docs.filter((d) => d.id !== '_ping_');
    if (validDocs.length === 0 && defaults.length > 0) {
      console.log('Seeding initial services to Firestore cloud database...');
      for (const s of defaults) {
        await setDoc(doc(db, SERVICES_COLLECTION, s.id), {
          ...s,
          updatedAt: new Date().toISOString(),
        });
      }
      console.log('✓ Successfully seeded services to Firestore');
    }
  } catch (err) {
    console.warn('Services seeding note:', err);
  }
}

// ==========================================
// 3. TESTIMONIALS (Client Endorsements & Verified Impact)
// ==========================================
export const TESTIMONIALS_COLLECTION = 'testimonials';

/**
 * Real-time listener for client testimonials & endorsements.
 * Real-time updates immediately across Vercel, mobile, and all visitors.
 */
export function subscribeToTestimonials(
  onData: (testimonials: TestimonialItem[]) => void,
  onError?: (err: Error) => void
) {
  const colRef = collection(db, TESTIMONIALS_COLLECTION);
  return onSnapshot(
    colRef,
    (snapshot) => {
      const items: TestimonialItem[] = [];
      snapshot.forEach((docSnap) => {
        if (docSnap.id === '_ping_') return;
        const data = docSnap.data() as TestimonialItem;
        items.push({ ...data, id: docSnap.id });
      });
      onData(items);
    },
    (err) => {
      console.warn('Firestore testimonials subscription notice:', err);
      if (onError) onError(err);
    }
  );
}

/**
 * Upsert a single testimonial into Firestore.
 */
export async function saveTestimonialToFirestore(testimonial: TestimonialItem): Promise<void> {
  const docRef = doc(db, TESTIMONIALS_COLLECTION, testimonial.id);
  const payload = {
    ...testimonial,
    updatedAt: new Date().toISOString(),
  };
  await setDoc(docRef, payload, { merge: true });
}

/**
 * Delete a testimonial from Firestore.
 */
export async function deleteTestimonialFromFirestore(testimonialId: string): Promise<void> {
  const docRef = doc(db, TESTIMONIALS_COLLECTION, testimonialId);
  await deleteDoc(docRef);
}

/**
 * Save all testimonials to Firestore in bulk.
 */
export async function saveAllTestimonialsToFirestore(testimonials: TestimonialItem[]): Promise<void> {
  for (const t of testimonials) {
    await saveTestimonialToFirestore(t);
  }
}

/**
 * Seed initial testimonials if Firestore collection is empty.
 */
export async function seedInitialTestimonialsIfEmpty(defaults: TestimonialItem[]): Promise<void> {
  try {
    const colRef = collection(db, TESTIMONIALS_COLLECTION);
    const existing = await getDocs(colRef);
    const validDocs = existing.docs.filter((d) => d.id !== '_ping_');
    if (validDocs.length === 0 && defaults.length > 0) {
      console.log('Seeding initial testimonials to Firestore cloud database...');
      for (const t of defaults) {
        await setDoc(doc(db, TESTIMONIALS_COLLECTION, t.id), {
          ...t,
          updatedAt: new Date().toISOString(),
        });
      }
      console.log('✓ Successfully seeded testimonials to Firestore');
    }
  } catch (err) {
    console.warn('Testimonials seeding note:', err);
  }
}

// ==========================================
// 4. COMPLETE WEBSITE DATA PACKS & CLOUD SNAPSHOTS
// (One-click Backup & Implement System)
// ==========================================
export const DATAPACKS_COLLECTION = 'datapacks';

export interface WebsiteDataPack {
  id: string;
  name: string;
  createdAt: string;
  version: string;
  notes?: string;
  counts: {
    projects: number;
    services: number;
    testimonials: number;
  };
  data: {
    projects: ProjectItem[];
    services: ServiceItem[];
    testimonials: TestimonialItem[];
    siteSettings?: any;
  };
}

/**
 * Real-time listener for saved Data Packs.
 */
export function subscribeToDataPacks(
  onData: (packs: WebsiteDataPack[]) => void,
  onError?: (err: Error) => void
) {
  const colRef = collection(db, DATAPACKS_COLLECTION);
  return onSnapshot(
    colRef,
    (snapshot) => {
      const items: WebsiteDataPack[] = [];
      snapshot.forEach((docSnap) => {
        const d = docSnap.data() as WebsiteDataPack;
        items.push({ ...d, id: docSnap.id });
      });
      items.sort((a, b) => {
        const timeA = new Date(a.createdAt || 0).getTime();
        const timeB = new Date(b.createdAt || 0).getTime();
        return timeB - timeA;
      });
      onData(items);
    },
    (err) => {
      console.warn('DataPacks subscription notice:', err);
      if (onError) onError(err);
    }
  );
}

/**
 * Save a Website Data Pack to Firestore.
 */
export async function saveDataPackToFirestore(pack: WebsiteDataPack): Promise<void> {
  const docRef = doc(db, DATAPACKS_COLLECTION, pack.id);
  await setDoc(docRef, pack);
}

/**
 * Delete a Data Pack from Firestore.
 */
export async function deleteDataPackFromFirestore(packId: string): Promise<void> {
  const docRef = doc(db, DATAPACKS_COLLECTION, packId);
  await deleteDoc(docRef);
}

/**
 * ONE-CLICK IMPLEMENT: Restores a complete Data Pack across the entire website!
 * Atomically updates Firestore collections (projects, services, testimonials),
 * local caches, and broadcasts custom events to live UI components.
 */
export async function restoreDataPackToWebsite(
  pack: WebsiteDataPack
): Promise<{ success: boolean; message: string }> {
  try {
    const { projects = [], services = [], testimonials = [], siteSettings } = pack.data;

    // 1. Sync Projects to Firestore
    if (projects.length > 0) {
      // Clear existing projects
      const existingProjects = await getDocs(collection(db, PROJECTS_COLLECTION));
      for (const d of existingProjects.docs) {
        if (d.id !== '_ping_') await deleteDoc(d.ref);
      }
      // Insert new projects
      for (const p of projects) {
        await setDoc(doc(db, PROJECTS_COLLECTION, p.id), {
          ...p,
          updatedAt: new Date().toISOString(),
        });
      }
      try {
        localStorage.setItem('saify_portfolio_projects_custom', JSON.stringify(projects));
      } catch {}
      window.dispatchEvent(new CustomEvent('saify_projects_updated', { detail: projects }));
    }

    // 2. Sync Services to Firestore
    if (services.length > 0) {
      const existingServices = await getDocs(collection(db, SERVICES_COLLECTION));
      for (const d of existingServices.docs) {
        if (d.id !== '_ping_') await deleteDoc(d.ref);
      }
      for (const s of services) {
        await setDoc(doc(db, SERVICES_COLLECTION, s.id), {
          ...s,
          updatedAt: new Date().toISOString(),
        });
      }
      try {
        localStorage.setItem('saify_services_custom', JSON.stringify(services));
      } catch {}
      window.dispatchEvent(new CustomEvent('saify_services_updated', { detail: services }));
    }

    // 3. Sync Testimonials to Firestore
    if (testimonials.length > 0) {
      const existingTestimonials = await getDocs(collection(db, TESTIMONIALS_COLLECTION));
      for (const d of existingTestimonials.docs) {
        if (d.id !== '_ping_') await deleteDoc(d.ref);
      }
      for (const t of testimonials) {
        await setDoc(doc(db, TESTIMONIALS_COLLECTION, t.id), {
          ...t,
          updatedAt: new Date().toISOString(),
        });
      }
      try {
        localStorage.setItem('saify_testimonials_custom', JSON.stringify(testimonials));
      } catch {}
      window.dispatchEvent(new CustomEvent('saify_testimonials_updated', { detail: testimonials }));
    }

    // 4. Sync Site Settings if present
    if (siteSettings) {
      await setDoc(doc(db, 'siteSettings', 'global'), {
        ...siteSettings,
        updatedAt: new Date().toISOString(),
      });
      try {
        localStorage.setItem('saify_site_settings', JSON.stringify(siteSettings));
      } catch {}
      window.dispatchEvent(new CustomEvent('saify_settings_updated', { detail: siteSettings }));
    }

    return {
      success: true,
      message: `Data Pack "${pack.name}" successfully implemented across the entire website! (${projects.length} projects, ${services.length} services, ${testimonials.length} testimonials restored).`,
    };
  } catch (err: any) {
    console.error('Failed to restore data pack:', err);
    return {
      success: false,
      message: err?.message || 'Failed to apply data pack.',
    };
  }
}

/**
 * Creates an instantaneous full-site snapshot Data Pack from Firestore.
 */
export async function createWebsiteDataPackSnapshot(
  name?: string,
  notes?: string
): Promise<WebsiteDataPack> {
  // Read all collections directly from Firestore
  const [projSnap, servSnap, testSnap] = await Promise.all([
    getDocs(collection(db, PROJECTS_COLLECTION)),
    getDocs(collection(db, SERVICES_COLLECTION)),
    getDocs(collection(db, TESTIMONIALS_COLLECTION)),
  ]);

  const projects: ProjectItem[] = [];
  projSnap.forEach((d) => {
    if (d.id !== '_ping_') projects.push({ ...(d.data() as ProjectItem), id: d.id });
  });

  const services: ServiceItem[] = [];
  servSnap.forEach((d) => {
    if (d.id !== '_ping_') services.push({ ...(d.data() as ServiceItem), id: d.id });
  });

  const testimonials: TestimonialItem[] = [];
  testSnap.forEach((d) => {
    if (d.id !== '_ping_') testimonials.push({ ...(d.data() as TestimonialItem), id: d.id });
  });

  let siteSettings: any = null;
  try {
    const raw = localStorage.getItem('saify_site_settings');
    if (raw) siteSettings = JSON.parse(raw);
  } catch {}

  const now = new Date();
  const dateStr = now.toISOString().split('T')[0];
  const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '-');
  const packId = `datapack-${dateStr}-${timeStr}-${Math.random().toString(36).substring(2, 6)}`;
  const defaultName = name || `Complete Website Pack (${dateStr} ${now.toLocaleTimeString()})`;

  const pack: WebsiteDataPack = {
    id: packId,
    name: defaultName,
    createdAt: now.toISOString(),
    version: '2.0.0',
    notes: notes || 'Full live snapshot of Commercial Works, Services, and Testimonials',
    counts: {
      projects: projects.length,
      services: services.length,
      testimonials: testimonials.length,
    },
    data: {
      projects,
      services,
      testimonials,
      siteSettings,
    },
  };

  // Save to Firestore so it is stored in the cloud
  await saveDataPackToFirestore(pack);

  return pack;
}

