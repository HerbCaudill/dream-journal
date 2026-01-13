import type { DreamEntry, PendingChange } from "../types"

export const DB_NAME = "dream-journal"
export const DB_VERSION = 1
export const ENTRIES_STORE = "entries"
export const PENDING_STORE = "pending"

let dbInstance: IDBDatabase | null = null

export const openDatabase = (): Promise<IDBDatabase> => {
  if (dbInstance) {
    return Promise.resolve(dbInstance)
  }

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onerror = () => {
      reject(request.error)
    }

    request.onsuccess = () => {
      dbInstance = request.result
      resolve(dbInstance)
    }

    request.onupgradeneeded = event => {
      const db = (event.target as IDBOpenDBRequest).result

      if (!db.objectStoreNames.contains(ENTRIES_STORE)) {
        db.createObjectStore(ENTRIES_STORE, { keyPath: "id" })
      }

      if (!db.objectStoreNames.contains(PENDING_STORE)) {
        db.createObjectStore(PENDING_STORE, { keyPath: "id" })
      }
    }
  })
}

export const resetDatabase = (): void => {
  if (dbInstance) {
    dbInstance.close()
    dbInstance = null
  }
}

export const saveEntries = async (entries: DreamEntry[]): Promise<void> => {
  const db = await openDatabase()

  return new Promise((resolve, reject) => {
    const tx = db.transaction(ENTRIES_STORE, "readwrite")
    const store = tx.objectStore(ENTRIES_STORE)

    // Clear existing entries first
    const clearRequest = store.clear()

    clearRequest.onerror = () => {
      reject(clearRequest.error)
    }

    clearRequest.onsuccess = () => {
      // Add all new entries
      for (const entry of entries) {
        store.put(entry)
      }
    }

    tx.oncomplete = () => {
      resolve()
    }

    tx.onerror = () => {
      reject(tx.error)
    }
  })
}

export const loadEntries = async (): Promise<DreamEntry[]> => {
  const db = await openDatabase()

  return new Promise((resolve, reject) => {
    const tx = db.transaction(ENTRIES_STORE, "readonly")
    const store = tx.objectStore(ENTRIES_STORE)
    const request = store.getAll()

    request.onsuccess = () => {
      resolve(request.result)
    }

    request.onerror = () => {
      reject(request.error)
    }
  })
}

export const savePendingChange = async (change: PendingChange): Promise<void> => {
  const db = await openDatabase()

  return new Promise((resolve, reject) => {
    const tx = db.transaction(PENDING_STORE, "readwrite")
    const store = tx.objectStore(PENDING_STORE)
    const request = store.put(change)

    request.onerror = () => {
      reject(request.error)
    }

    tx.oncomplete = () => {
      resolve()
    }

    tx.onerror = () => {
      reject(tx.error)
    }
  })
}

export const loadPendingChanges = async (): Promise<PendingChange[]> => {
  const db = await openDatabase()

  return new Promise((resolve, reject) => {
    const tx = db.transaction(PENDING_STORE, "readonly")
    const store = tx.objectStore(PENDING_STORE)
    const request = store.getAll()

    request.onsuccess = () => {
      const changes = request.result as PendingChange[]
      changes.sort((a, b) => a.timestamp - b.timestamp)
      resolve(changes)
    }

    request.onerror = () => {
      reject(request.error)
    }
  })
}

export const clearPendingChanges = async (): Promise<void> => {
  const db = await openDatabase()

  return new Promise((resolve, reject) => {
    const tx = db.transaction(PENDING_STORE, "readwrite")
    const store = tx.objectStore(PENDING_STORE)
    const request = store.clear()

    request.onerror = () => {
      reject(request.error)
    }

    tx.oncomplete = () => {
      resolve()
    }

    tx.onerror = () => {
      reject(tx.error)
    }
  })
}
