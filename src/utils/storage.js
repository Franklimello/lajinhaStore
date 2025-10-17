// Unified storage with TTL across memory, sessionStorage, and localStorage
// Falls back gracefully when APIs are unavailable (SSR or privacy modes)

const memoryStore = new Map();
const memoryKeysByNamespace = new Map();

function safeGet(storage, key) {
  try {
    return storage.getItem(key);
  } catch (_) {
    return null;
  }
}

function safeSet(storage, key, value) {
  try {
    storage.setItem(key, value);
    return true;
  } catch (_) {
    return false;
  }
}

function safeRemove(storage, key) {
  try {
    storage.removeItem(key);
  } catch (_) {
    // ignore
  }
}

const hasWindow = typeof window !== "undefined";
const ss = hasWindow && window.sessionStorage ? window.sessionStorage : null;
const ls = hasWindow && window.localStorage ? window.localStorage : null;

function now() {
  return Date.now();
}

function toPayload(value, ttlMs) {
  const expiresAt = typeof ttlMs === "number" && ttlMs > 0 ? now() + ttlMs : null;
  return JSON.stringify({ v: value, e: expiresAt });
}

function fromPayload(raw) {
  if (raw == null) return { hit: false, expired: false, value: null };
  try {
    const { v, e } = JSON.parse(raw);
    if (e && now() > e) {
      return { hit: true, expired: true, value: null };
    }
    return { hit: true, expired: false, value: v };
  } catch (_) {
    return { hit: false, expired: false, value: null };
  }
}

function namespaced(key, namespace) {
  return namespace ? `${namespace}::${key}` : key;
}

export const storage = {
  get(key, { namespace } = {}) {
    const k = namespaced(key, namespace);
    // memory first
    if (memoryStore.has(k)) {
      const { v, e } = memoryStore.get(k);
      if (e && now() > e) {
        memoryStore.delete(k);
      } else {
        return v;
      }
    }
    // sessionStorage
    if (ss) {
      const res = fromPayload(safeGet(ss, k));
      if (res.hit && !res.expired) {
        memoryStore.set(k, { v: res.value, e: null });
        return res.value;
      }
      if (res.hit && res.expired) safeRemove(ss, k);
    }
    // localStorage
    if (ls) {
      const res = fromPayload(safeGet(ls, k));
      if (res.hit && !res.expired) {
        memoryStore.set(k, { v: res.value, e: null });
        return res.value;
      }
      if (res.hit && res.expired) safeRemove(ls, k);
    }
    return null;
  },

  set(key, value, { ttlMs, persist = "session", namespace } = {}) {
    const k = namespaced(key, namespace);
    const payload = toPayload(value, ttlMs);
    const memExpiry = typeof ttlMs === "number" && ttlMs > 0 ? now() + ttlMs : null;
    memoryStore.set(k, { v: value, e: memExpiry });
    if (namespace) {
      if (!memoryKeysByNamespace.has(namespace)) memoryKeysByNamespace.set(namespace, new Set());
      memoryKeysByNamespace.get(namespace).add(k);
    }
    if (persist === "local" && ls) {
      safeSet(ls, k, payload);
    } else if (persist === "session" && ss) {
      safeSet(ss, k, payload);
    }
  },

  remove(key, { namespace } = {}) {
    const k = namespaced(key, namespace);
    memoryStore.delete(k);
    if (ss) safeRemove(ss, k);
    if (ls) safeRemove(ls, k);
  },

  clearNamespace(namespace) {
    if (!namespace) return;
    const prefix = `${namespace}::`;
    // memory
    if (memoryKeysByNamespace.has(namespace)) {
      for (const k of memoryKeysByNamespace.get(namespace).values()) {
        memoryStore.delete(k);
      }
      memoryKeysByNamespace.delete(namespace);
    }
    // session/local
    if (ss) {
      for (let i = ss.length - 1; i >= 0; i--) {
        const key = ss.key(i);
        if (key && key.startsWith(prefix)) ss.removeItem(key);
      }
    }
    if (ls) {
      for (let i = ls.length - 1; i >= 0; i--) {
        const key = ls.key(i);
        if (key && key.startsWith(prefix)) ls.removeItem(key);
      }
    }
  },

  clearByPrefix(prefix, { namespace } = {}) {
    const fullPrefix = namespaced(prefix, namespace);
    // memory
    for (const k of Array.from(memoryStore.keys())) {
      if (k.startsWith(fullPrefix)) memoryStore.delete(k);
    }
    // session/local
    if (ss) {
      for (let i = ss.length - 1; i >= 0; i--) {
        const key = ss.key(i);
        if (key && key.startsWith(fullPrefix)) ss.removeItem(key);
      }
    }
    if (ls) {
      for (let i = ls.length - 1; i >= 0; i--) {
        const key = ls.key(i);
        if (key && key.startsWith(fullPrefix)) ls.removeItem(key);
      }
    }
  },
};

export function buildKey(parts) {
  return parts.filter(Boolean).join(":");
}


