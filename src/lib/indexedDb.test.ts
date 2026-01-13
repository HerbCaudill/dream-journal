import { describe, it, expect, beforeEach, afterEach } from "vitest"
import {
  openDatabase,
  resetDatabase,
  saveEntries,
  loadEntries,
  savePendingChange,
  loadPendingChanges,
  clearPendingChanges,
  DB_NAME,
  DB_VERSION,
  ENTRIES_STORE,
  PENDING_STORE,
} from "./indexedDb"
import type { DreamEntry, PendingChange } from "../types"

const deleteDatabase = () =>
  new Promise<void>((resolve, reject) => {
    const request = indexedDB.deleteDatabase(DB_NAME)
    request.onsuccess = () => resolve()
    request.onerror = () => reject(request.error)
  })

describe("openDatabase", () => {
  beforeEach(async () => {
    resetDatabase()
    await deleteDatabase()
  })

  afterEach(async () => {
    resetDatabase()
    await deleteDatabase()
  })

  it("opens a database connection", async () => {
    const db = await openDatabase()
    expect(db).toBeInstanceOf(IDBDatabase)
    expect(db.name).toBe(DB_NAME)
    db.close()
  })

  it("creates the entries object store", async () => {
    const db = await openDatabase()
    expect(db.objectStoreNames.contains(ENTRIES_STORE)).toBe(true)
    db.close()
  })

  it("creates the pending changes object store", async () => {
    const db = await openDatabase()
    expect(db.objectStoreNames.contains(PENDING_STORE)).toBe(true)
    db.close()
  })

  it("uses the correct database version", async () => {
    const db = await openDatabase()
    expect(db.version).toBe(DB_VERSION)
    db.close()
  })

  it("returns the same database on subsequent calls", async () => {
    const db1 = await openDatabase()
    const db2 = await openDatabase()
    expect(db1).toBe(db2)
    db1.close()
  })
})

describe("saveEntries", () => {
  beforeEach(async () => {
    resetDatabase()
    await deleteDatabase()
  })

  afterEach(async () => {
    resetDatabase()
    await deleteDatabase()
  })

  it("saves entries to the database", async () => {
    const entries: DreamEntry[] = [
      { id: "1", date: "2024-01-15", content: "A vivid dream" },
      { id: "2", date: "2024-01-16", content: "Another dream" },
    ]

    await saveEntries(entries)

    const db = await openDatabase()
    const tx = db.transaction(ENTRIES_STORE, "readonly")
    const store = tx.objectStore(ENTRIES_STORE)
    const count = await new Promise<number>((resolve, reject) => {
      const request = store.count()
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })

    expect(count).toBe(2)
  })

  it("replaces all existing entries", async () => {
    const initialEntries: DreamEntry[] = [{ id: "1", date: "2024-01-15", content: "First dream" }]
    await saveEntries(initialEntries)

    const newEntries: DreamEntry[] = [{ id: "2", date: "2024-01-16", content: "Second dream" }]
    await saveEntries(newEntries)

    const db = await openDatabase()
    const tx = db.transaction(ENTRIES_STORE, "readonly")
    const store = tx.objectStore(ENTRIES_STORE)
    const allEntries = await new Promise<DreamEntry[]>((resolve, reject) => {
      const request = store.getAll()
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })

    expect(allEntries).toHaveLength(1)
    expect(allEntries[0].id).toBe("2")
  })
})

describe("loadEntries", () => {
  beforeEach(async () => {
    resetDatabase()
    await deleteDatabase()
  })

  afterEach(async () => {
    resetDatabase()
    await deleteDatabase()
  })

  it("returns empty array when no entries exist", async () => {
    const entries = await loadEntries()
    expect(entries).toEqual([])
  })

  it("returns all saved entries", async () => {
    const savedEntries: DreamEntry[] = [
      { id: "1", date: "2024-01-15", content: "Dream one" },
      { id: "2", date: "2024-01-16", content: "Dream two" },
    ]
    await saveEntries(savedEntries)

    const loadedEntries = await loadEntries()

    expect(loadedEntries).toHaveLength(2)
    expect(loadedEntries).toContainEqual(savedEntries[0])
    expect(loadedEntries).toContainEqual(savedEntries[1])
  })
})

describe("savePendingChange", () => {
  beforeEach(async () => {
    resetDatabase()
    await deleteDatabase()
  })

  afterEach(async () => {
    resetDatabase()
    await deleteDatabase()
  })

  it("saves an add pending change", async () => {
    const change: PendingChange = {
      id: "change-1",
      type: "add",
      entryId: "entry-1",
      entry: { id: "entry-1", date: "2024-01-15", content: "A dream" },
      timestamp: 1705312800000,
    }

    await savePendingChange(change)

    const changes = await loadPendingChanges()
    expect(changes).toHaveLength(1)
    expect(changes[0]).toEqual(change)
  })

  it("saves an update pending change", async () => {
    const change: PendingChange = {
      id: "change-1",
      type: "update",
      entryId: "entry-1",
      entry: { id: "entry-1", date: "2024-01-15", content: "Updated dream" },
      timestamp: 1705312800000,
    }

    await savePendingChange(change)

    const changes = await loadPendingChanges()
    expect(changes).toHaveLength(1)
    expect(changes[0].type).toBe("update")
  })

  it("saves a delete pending change", async () => {
    const change: PendingChange = {
      id: "change-1",
      type: "delete",
      entryId: "entry-1",
      timestamp: 1705312800000,
    }

    await savePendingChange(change)

    const changes = await loadPendingChanges()
    expect(changes).toHaveLength(1)
    expect(changes[0].type).toBe("delete")
    expect(changes[0].entry).toBeUndefined()
  })

  it("saves multiple pending changes", async () => {
    const change1: PendingChange = {
      id: "change-1",
      type: "add",
      entryId: "entry-1",
      entry: { id: "entry-1", date: "2024-01-15", content: "Dream 1" },
      timestamp: 1705312800000,
    }
    const change2: PendingChange = {
      id: "change-2",
      type: "update",
      entryId: "entry-2",
      entry: { id: "entry-2", date: "2024-01-16", content: "Dream 2" },
      timestamp: 1705312900000,
    }

    await savePendingChange(change1)
    await savePendingChange(change2)

    const changes = await loadPendingChanges()
    expect(changes).toHaveLength(2)
  })
})

describe("loadPendingChanges", () => {
  beforeEach(async () => {
    resetDatabase()
    await deleteDatabase()
  })

  afterEach(async () => {
    resetDatabase()
    await deleteDatabase()
  })

  it("returns empty array when no pending changes exist", async () => {
    const changes = await loadPendingChanges()
    expect(changes).toEqual([])
  })

  it("returns changes sorted by timestamp", async () => {
    const change1: PendingChange = {
      id: "change-1",
      type: "add",
      entryId: "entry-1",
      entry: { id: "entry-1", date: "2024-01-15", content: "Dream 1" },
      timestamp: 1705312900000,
    }
    const change2: PendingChange = {
      id: "change-2",
      type: "add",
      entryId: "entry-2",
      entry: { id: "entry-2", date: "2024-01-16", content: "Dream 2" },
      timestamp: 1705312800000,
    }

    await savePendingChange(change1)
    await savePendingChange(change2)

    const changes = await loadPendingChanges()
    expect(changes[0].id).toBe("change-2")
    expect(changes[1].id).toBe("change-1")
  })
})

describe("clearPendingChanges", () => {
  beforeEach(async () => {
    resetDatabase()
    await deleteDatabase()
  })

  afterEach(async () => {
    resetDatabase()
    await deleteDatabase()
  })

  it("removes all pending changes", async () => {
    const change1: PendingChange = {
      id: "change-1",
      type: "add",
      entryId: "entry-1",
      entry: { id: "entry-1", date: "2024-01-15", content: "Dream 1" },
      timestamp: 1705312800000,
    }
    const change2: PendingChange = {
      id: "change-2",
      type: "delete",
      entryId: "entry-2",
      timestamp: 1705312900000,
    }

    await savePendingChange(change1)
    await savePendingChange(change2)

    await clearPendingChanges()

    const changes = await loadPendingChanges()
    expect(changes).toEqual([])
  })

  it("does nothing when no pending changes exist", async () => {
    await clearPendingChanges()
    const changes = await loadPendingChanges()
    expect(changes).toEqual([])
  })
})
