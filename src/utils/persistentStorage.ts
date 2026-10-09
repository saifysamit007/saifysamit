// Lightweight, robust multi-layer persistence utility (LocalStorage + IndexedDB + Server sync)
// Ensures admin customizations (photos, text edits, projects, settings) NEVER disappear.

const DB_NAME = 'SaifyPortfolioAdminDB';
const DB_VERSION = 1;
const STORE_NAME = 'admin_persistent_data';

// Open or initialize browser IndexedDB (Unlimited multi-megabyte photo & text storage)
function openIndexedDB(): Promise<IDBDatabase | null> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      resolve(null);
      return;
    }

    try {
      const request = window.indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event: any) => {
        const db = event.target?.result as IDBDatabase;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      };

      request.onsuccess = (event: any) => {
        resolve(event.target?.result as IDBDatabase);
      };

      request.onerror = () => {
        resolve(null);
      };
    } catch {
      resolve(null);
    }
  });
}

// Save item to IndexedDB
export async function idbSetItem<T = any>(key: string, value: T): Promise<boolean> {
  const db = await openIndexedDB();
  if (!db) return false;

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(value, key);

      req.onsuccess = () => resolve(true);
      req.onerror = () => resolve(false);
    } catch {
      resolve(false);
    }
  });
}

// Get item from IndexedDB
export async function idbGetItem<T = any>(key: string): Promise<T | null> {
  const db = await openIndexedDB();
  if (!db) return null;

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(key);

      req.onsuccess = () => {
        resolve(req.result !== undefined ? req.result : null);
      };
      req.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

// Remove item from IndexedDB
export async function idbRemoveItem(key: string): Promise<boolean> {
  const db = await openIndexedDB();
  if (!db) return false;

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(key);

      req.onsuccess = () => resolve(true);
      req.onerror = () => resolve(false);
    } catch {
      resolve(false);
    }
  });
}

/**
 * Universal Permanent Save:
 * 1. Synchronously saves in LocalStorage for fast initial render
 * 2. Asynchronously backs up in browser IndexedDB (prevents 5MB quota loss for high-res pictures)
 * 3. Broadcasts cross-tab window event
 */
export async function savePermanently<T = any>(key: string, value: T): Promise<void> {
  // 1. LocalStorage
  try {
    const serialized = typeof value === 'string' ? value : JSON.stringify(value);
    localStorage.setItem(key, serialized);
  } catch (err) {
    console.warn(`LocalStorage quota reached for "${key}". Backing up to IndexedDB.`, err);
  }

  // 2. IndexedDB Backup
  await idbSetItem(key, value);

  // 3. Broadcast update event
  try {
    window.dispatchEvent(new CustomEvent(`saify_data_changed_${key}`, { detail: value }));
  } catch {}
}

/**
 * Universal Permanent Load:
 * Checks LocalStorage first; if missing or empty, retrieves from IndexedDB backup
 */
export async function loadPermanently<T = any>(key: string, fallback: T): Promise<T> {
  // 1. Try LocalStorage
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      if (typeof fallback === 'string') {
        return raw as unknown as T;
      }
      return JSON.parse(raw) as T;
    }
  } catch {}

  // 2. Try IndexedDB backup
  try {
    const idbVal = await idbGetItem<T>(key);
    if (idbVal !== null && idbVal !== undefined) {
      // Re-populate LocalStorage if it was purged
      try {
        const serialized = typeof idbVal === 'string' ? idbVal : JSON.stringify(idbVal);
        localStorage.setItem(key, serialized);
      } catch {}
      return idbVal;
    }
  } catch {}

  return fallback;
}
