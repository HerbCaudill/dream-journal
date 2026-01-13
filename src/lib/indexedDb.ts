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
