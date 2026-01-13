/**
 * @vitest-environment jsdom
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { renderHook, act, waitFor } from "@testing-library/react"
import { useOfflineCache } from "./useOfflineCache"
import * as indexedDb from "../lib/indexedDb"
import type { DreamEntry, PendingChange } from "../types"

vi.mock("../lib/indexedDb")

const mockEntries: DreamEntry[] = [
  { id: "1", date: "2024-01-15", content: "Flying dream" },
  { id: "2", date: "2024-01-14", content: "Ocean dream" },
]

const mockPendingChanges: PendingChange[] = [
  {
    id: "p1",
    type: "add",
    entryId: "3",
    entry: { id: "3", date: "2024-01-16", content: "New dream" },
    timestamp: 1000,
  },
]

describe("useOfflineCache", () => {
  beforeEach(() => {
    vi.mocked(indexedDb.loadEntries).mockResolvedValue([])
    vi.mocked(indexedDb.loadPendingChanges).mockResolvedValue([])
    vi.mocked(indexedDb.saveEntries).mockResolvedValue()
    vi.mocked(indexedDb.savePendingChange).mockResolvedValue()
    vi.mocked(indexedDb.clearPendingChanges).mockResolvedValue()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe("initialization", () => {
    it("loads entries from IndexedDB on mount", async () => {
      vi.mocked(indexedDb.loadEntries).mockResolvedValue(mockEntries)

      const { result } = renderHook(() => useOfflineCache())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(indexedDb.loadEntries).toHaveBeenCalled()
      expect(result.current.entries).toEqual(mockEntries)
    })

    it("loads pending changes from IndexedDB on mount", async () => {
      vi.mocked(indexedDb.loadPendingChanges).mockResolvedValue(mockPendingChanges)

      const { result } = renderHook(() => useOfflineCache())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(indexedDb.loadPendingChanges).toHaveBeenCalled()
      expect(result.current.pendingChanges).toEqual(mockPendingChanges)
    })

    it("sets isLoading to true during initial load", () => {
      const { result } = renderHook(() => useOfflineCache())

      expect(result.current.isLoading).toBe(true)
    })

    it("handles load error gracefully", async () => {
      vi.mocked(indexedDb.loadEntries).mockRejectedValue(new Error("Load failed"))

      const { result } = renderHook(() => useOfflineCache())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.entries).toEqual([])
      expect(result.current.error).toBe("Load failed")
    })
  })

  describe("saveEntries", () => {
    it("saves entries to IndexedDB and updates state", async () => {
      const { result } = renderHook(() => useOfflineCache())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      await act(async () => {
        await result.current.saveEntries(mockEntries)
      })

      expect(indexedDb.saveEntries).toHaveBeenCalledWith(mockEntries)
      expect(result.current.entries).toEqual(mockEntries)
    })

    it("handles save error", async () => {
      vi.mocked(indexedDb.saveEntries).mockRejectedValue(new Error("Save failed"))

      const { result } = renderHook(() => useOfflineCache())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      await act(async () => {
        await result.current.saveEntries(mockEntries)
      })

      expect(result.current.error).toBe("Save failed")
    })
  })

  describe("addPendingChange", () => {
    it("adds pending change to IndexedDB and updates state", async () => {
      const { result } = renderHook(() => useOfflineCache())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      const newChange: PendingChange = {
        id: "p2",
        type: "add",
        entryId: "4",
        entry: { id: "4", date: "2024-01-17", content: "Another dream" },
        timestamp: 2000,
      }

      await act(async () => {
        await result.current.addPendingChange(newChange)
      })

      expect(indexedDb.savePendingChange).toHaveBeenCalledWith(newChange)
      expect(result.current.pendingChanges).toContainEqual(newChange)
    })
  })

  describe("clearPendingChanges", () => {
    it("clears pending changes from IndexedDB and state", async () => {
      vi.mocked(indexedDb.loadPendingChanges).mockResolvedValue(mockPendingChanges)

      const { result } = renderHook(() => useOfflineCache())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.pendingChanges).toHaveLength(1)

      await act(async () => {
        await result.current.clearPendingChanges()
      })

      expect(indexedDb.clearPendingChanges).toHaveBeenCalled()
      expect(result.current.pendingChanges).toEqual([])
    })
  })

  describe("hasPendingChanges", () => {
    it("returns true when there are pending changes", async () => {
      vi.mocked(indexedDb.loadPendingChanges).mockResolvedValue(mockPendingChanges)

      const { result } = renderHook(() => useOfflineCache())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.hasPendingChanges).toBe(true)
    })

    it("returns false when there are no pending changes", async () => {
      const { result } = renderHook(() => useOfflineCache())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.hasPendingChanges).toBe(false)
    })
  })
})
