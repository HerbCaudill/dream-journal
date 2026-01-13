import { describe, it, expect, beforeEach, afterEach } from "vitest"
import {
  openDatabase,
  resetDatabase,
  DB_NAME,
  DB_VERSION,
  ENTRIES_STORE,
  PENDING_STORE,
} from "./indexedDb"

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
