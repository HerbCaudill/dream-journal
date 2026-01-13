import { describe, it, expect, beforeEach, afterEach } from "vitest"
import {
  openDatabase,
  resetDatabase,
  saveEntries,
  loadEntries,
  DB_NAME,
  DB_VERSION,
  ENTRIES_STORE,
  PENDING_STORE,
} from "./indexedDb"
import type { DreamEntry } from "../types"

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
