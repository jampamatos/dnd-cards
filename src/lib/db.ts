// Tiny IndexedDB KV helper (promises + fallbacks)

const DB_NAME = "dnd-cards";
const DB_VERSION = 1;
const STORE = "kv";

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      // fallback> resolve a dummy object to use localStorage paths
      // @ts-expect-error: accept null sentinel so callers can use localStorage fallback
      resolve(null);
      return;
    }
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function idbGet<T = unknown>(key: string): Promise<T | undefined> {
  const db = await openDB();
  if (!db) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : undefined;
    } catch {
      return undefined;
    }
  }
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readonly");
    const st = tx.objectStore(STORE);
    const r = st.get(key);
    r.onsuccess = () => resolve(r.result as T | undefined);
    r.onerror = () => reject(r.error);
  });
}

export async function idbSet<T = unknown>(key: string, value: T): Promise<void> {
  const db = await openDB();
  if (!db) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* noop: ignore quota/security errors when localStorage is unavailable */
    }
    return;
  }
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    const st = tx.objectStore(STORE);
    const r = st.put(value, key);
    r.onsuccess = () => resolve();
    r.onerror = () => reject(r.error);
  });
}

export async function idbDel(key: string): Promise<void> {
  const db = await openDB();
  if (!db) {
    try {
      localStorage.removeItem(key);
    } catch {
      /* noop: ignore deletion errors when localStorage is unavailable */
    }
    return;
  }
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    const st = tx.objectStore(STORE);
    const r = st.delete(key);
    r.onsuccess = () => resolve();
    r.onerror = () => reject(r.error);
  });
}

export async function idbUpdate<T = unknown>(
    key: string,
    updater: (oldVal: T | undefined) => T
): Promise<T> {
  const current = await idbGet<T>(key);
  const next = updater(current);
  await idbSet(key, next);
  return next;
}
