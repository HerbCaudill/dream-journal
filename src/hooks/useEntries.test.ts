/**
 * @vitest-environment jsdom
 */
import { act, renderHook, waitFor } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { useEntries } from "./useEntries"
import * as indexedDb from "../lib/indexedDb"
import type { DreamEntry, PendingChange } from "../types"

vi.mock("../lib/indexedDb")

const mockLoadEntries = vi.mocked(indexedDb.loadEntries)
const mockSaveEntries = vi.mocked(indexedDb.saveEntries)
const mockLoadPendingChanges = vi.mocked(indexedDb.loadPendingChanges)
const mockSavePendingChange = vi.mocked(indexedDb.savePendingChange)
const mockClearPendingChanges = vi.mocked(indexedDb.clearPendingChanges)

describe("useEntries", () => {
  beforeEach(() => {
    vi.resetAllMocks()
    mockLoadEntries.mockResolvedValue([])
    mockLoadPendingChanges.mockResolvedValue([])
    mockSaveEntries.mockResolvedValue()
    mockSavePendingChange.mockResolvedValue()
    mockClearPendingChanges.mockResolvedValue()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe("initial state", () => {
    it("loads entries from cache on mount, sorted by date descending", async () => {
      const entries: DreamEntry[] = [
        { id: "1", date: "2024-01-01", content: "Dream 1" },
        { id: "2", date: "2024-01-02", content: "Dream 2" },
      ]
      mockLoadEntries.mockResolvedValue(entries)

      const { result } = renderHook(() => useEntries())

      expect(result.current.isLoading).toBe(true)

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      // Entries are sorted by date descending
      expect(result.current.entries).toEqual([
        { id: "2", date: "2024-01-02", content: "Dream 2" },
        { id: "1", date: "2024-01-01", content: "Dream 1" },
      ])
      expect(mockLoadEntries).toHaveBeenCalledTimes(1)
    })

    it("starts with empty entries when cache is empty", async () => {
      mockLoadEntries.mockResolvedValue([])

      const { result } = renderHook(() => useEntries())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.entries).toEqual([])
    })

    it("sets error when loading fails", async () => {
      mockLoadEntries.mockRejectedValue(new Error("Load failed"))

      const { result } = renderHook(() => useEntries())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.error).toBe("Load failed")
    })
  })

  describe("addEntry", () => {
    it("adds a new entry to the list", async () => {
      mockLoadEntries.mockResolvedValue([])

      const { result } = renderHook(() => useEntries())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      await act(async () => {
        await result.current.addEntry("2024-01-15", "New dream")
      })

      expect(result.current.entries).toHaveLength(1)
      expect(result.current.entries[0].date).toBe("2024-01-15")
      expect(result.current.entries[0].content).toBe("New dream")
      expect(result.current.entries[0].id).toBeDefined()
    })

    it("saves entries to cache after adding", async () => {
      mockLoadEntries.mockResolvedValue([])

      const { result } = renderHook(() => useEntries())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      await act(async () => {
        await result.current.addEntry("2024-01-15", "New dream")
      })

      expect(mockSaveEntries).toHaveBeenCalledWith(result.current.entries)
    })

    it("records pending change when adding entry", async () => {
      mockLoadEntries.mockResolvedValue([])

      const { result } = renderHook(() => useEntries())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      await act(async () => {
        await result.current.addEntry("2024-01-15", "New dream")
      })

      expect(mockSavePendingChange).toHaveBeenCalledTimes(1)
      const savedChange = mockSavePendingChange.mock.calls[0][0] as PendingChange
      expect(savedChange.type).toBe("add")
      expect(savedChange.entry?.content).toBe("New dream")
    })

    it("sorts entries by date descending after adding", async () => {
      const existingEntries: DreamEntry[] = [{ id: "1", date: "2024-01-10", content: "Old dream" }]
      mockLoadEntries.mockResolvedValue(existingEntries)

      const { result } = renderHook(() => useEntries())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      await act(async () => {
        await result.current.addEntry("2024-01-15", "Newer dream")
      })

      expect(result.current.entries[0].date).toBe("2024-01-15")
      expect(result.current.entries[1].date).toBe("2024-01-10")
    })
  })

  describe("updateEntry", () => {
    it("updates an existing entry", async () => {
      const entries: DreamEntry[] = [{ id: "1", date: "2024-01-01", content: "Original" }]
      mockLoadEntries.mockResolvedValue(entries)

      const { result } = renderHook(() => useEntries())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      await act(async () => {
        await result.current.updateEntry("1", "Updated content")
      })

      expect(result.current.entries[0].content).toBe("Updated content")
    })

    it("saves entries to cache after updating", async () => {
      const entries: DreamEntry[] = [{ id: "1", date: "2024-01-01", content: "Original" }]
      mockLoadEntries.mockResolvedValue(entries)

      const { result } = renderHook(() => useEntries())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      await act(async () => {
        await result.current.updateEntry("1", "Updated")
      })

      expect(mockSaveEntries).toHaveBeenCalledWith(result.current.entries)
    })

    it("records pending change when updating entry", async () => {
      const entries: DreamEntry[] = [{ id: "1", date: "2024-01-01", content: "Original" }]
      mockLoadEntries.mockResolvedValue(entries)

      const { result } = renderHook(() => useEntries())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      await act(async () => {
        await result.current.updateEntry("1", "Updated")
      })

      expect(mockSavePendingChange).toHaveBeenCalledTimes(1)
      const savedChange = mockSavePendingChange.mock.calls[0][0] as PendingChange
      expect(savedChange.type).toBe("update")
      expect(savedChange.entryId).toBe("1")
    })

    it("does nothing when entry not found", async () => {
      const entries: DreamEntry[] = [{ id: "1", date: "2024-01-01", content: "Original" }]
      mockLoadEntries.mockResolvedValue(entries)

      const { result } = renderHook(() => useEntries())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      await act(async () => {
        await result.current.updateEntry("nonexistent", "Updated")
      })

      expect(result.current.entries[0].content).toBe("Original")
      expect(mockSaveEntries).not.toHaveBeenCalled()
    })
  })

  describe("deleteEntry", () => {
    it("removes an entry from the list", async () => {
      const entries: DreamEntry[] = [
        { id: "1", date: "2024-01-01", content: "Dream 1" },
        { id: "2", date: "2024-01-02", content: "Dream 2" },
      ]
      mockLoadEntries.mockResolvedValue(entries)

      const { result } = renderHook(() => useEntries())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      await act(async () => {
        await result.current.deleteEntry("1")
      })

      expect(result.current.entries).toHaveLength(1)
      expect(result.current.entries[0].id).toBe("2")
    })

    it("saves entries to cache after deleting", async () => {
      const entries: DreamEntry[] = [{ id: "1", date: "2024-01-01", content: "Dream 1" }]
      mockLoadEntries.mockResolvedValue(entries)

      const { result } = renderHook(() => useEntries())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      await act(async () => {
        await result.current.deleteEntry("1")
      })

      expect(mockSaveEntries).toHaveBeenCalledWith([])
    })

    it("records pending change when deleting entry", async () => {
      const entries: DreamEntry[] = [{ id: "1", date: "2024-01-01", content: "Dream 1" }]
      mockLoadEntries.mockResolvedValue(entries)

      const { result } = renderHook(() => useEntries())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      await act(async () => {
        await result.current.deleteEntry("1")
      })

      expect(mockSavePendingChange).toHaveBeenCalledTimes(1)
      const savedChange = mockSavePendingChange.mock.calls[0][0] as PendingChange
      expect(savedChange.type).toBe("delete")
      expect(savedChange.entryId).toBe("1")
    })

    it("does nothing when entry not found", async () => {
      const entries: DreamEntry[] = [{ id: "1", date: "2024-01-01", content: "Dream 1" }]
      mockLoadEntries.mockResolvedValue(entries)

      const { result } = renderHook(() => useEntries())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      await act(async () => {
        await result.current.deleteEntry("nonexistent")
      })

      expect(result.current.entries).toHaveLength(1)
      expect(mockSaveEntries).not.toHaveBeenCalled()
    })
  })

  describe("getEntryById", () => {
    it("returns the entry with matching id", async () => {
      const entries: DreamEntry[] = [
        { id: "1", date: "2024-01-01", content: "Dream 1" },
        { id: "2", date: "2024-01-02", content: "Dream 2" },
      ]
      mockLoadEntries.mockResolvedValue(entries)

      const { result } = renderHook(() => useEntries())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      const entry = result.current.getEntryById("2")
      expect(entry?.content).toBe("Dream 2")
    })

    it("returns undefined when entry not found", async () => {
      const entries: DreamEntry[] = [{ id: "1", date: "2024-01-01", content: "Dream 1" }]
      mockLoadEntries.mockResolvedValue(entries)

      const { result } = renderHook(() => useEntries())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      const entry = result.current.getEntryById("nonexistent")
      expect(entry).toBeUndefined()
    })
  })

  describe("pending changes", () => {
    it("loads pending changes on mount", async () => {
      const pendingChanges: PendingChange[] = [
        { id: "p1", type: "add", entryId: "1", timestamp: 1000 },
      ]
      mockLoadPendingChanges.mockResolvedValue(pendingChanges)

      const { result } = renderHook(() => useEntries())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.hasPendingChanges).toBe(true)
    })

    it("reports no pending changes when list is empty", async () => {
      mockLoadPendingChanges.mockResolvedValue([])

      const { result } = renderHook(() => useEntries())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.hasPendingChanges).toBe(false)
    })
  })
})
