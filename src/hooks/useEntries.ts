import { useCallback, useEffect, useState } from "react"
import {
  loadEntries,
  loadPendingChanges,
  saveEntries as saveEntriesDb,
  savePendingChange,
} from "../lib/indexedDb"
import type { DreamEntry, PendingChange } from "../types"

export const useEntries = () => {
  const [entries, setEntries] = useState<DreamEntry[]>([])
  const [pendingChanges, setPendingChanges] = useState<PendingChange[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        const [loadedEntries, loadedPendingChanges] = await Promise.all([
          loadEntries(),
          loadPendingChanges(),
        ])
        setEntries(sortEntriesByDate(loadedEntries))
        setPendingChanges(loadedPendingChanges)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load entries")
      } finally {
        setIsLoading(false)
      }
    }

    load()
  }, [])

  const addEntry = useCallback(
    async (date: string, content: string) => {
      const id = generateId()
      const newEntry: DreamEntry = { id, date, content }

      const updatedEntries = sortEntriesByDate([...entries, newEntry])
      setEntries(updatedEntries)
      setError(null)

      try {
        await saveEntriesDb(updatedEntries)
        const change: PendingChange = {
          id: generateId(),
          type: "add",
          entryId: id,
          entry: newEntry,
          timestamp: Date.now(),
        }
        await savePendingChange(change)
        setPendingChanges(prev => [...prev, change])
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to save entry")
      }
    },
    [entries],
  )

  const updateEntry = useCallback(
    async (id: string, content: string) => {
      const entryIndex = entries.findIndex(e => e.id === id)
      if (entryIndex === -1) {
        return
      }

      const updatedEntry = { ...entries[entryIndex], content }
      const updatedEntries = [...entries]
      updatedEntries[entryIndex] = updatedEntry

      setEntries(updatedEntries)
      setError(null)

      try {
        await saveEntriesDb(updatedEntries)
        const change: PendingChange = {
          id: generateId(),
          type: "update",
          entryId: id,
          entry: updatedEntry,
          timestamp: Date.now(),
        }
        await savePendingChange(change)
        setPendingChanges(prev => [...prev, change])
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to update entry")
      }
    },
    [entries],
  )

  const deleteEntry = useCallback(
    async (id: string) => {
      const entryExists = entries.some(e => e.id === id)
      if (!entryExists) {
        return
      }

      const updatedEntries = entries.filter(e => e.id !== id)
      setEntries(updatedEntries)
      setError(null)

      try {
        await saveEntriesDb(updatedEntries)
        const change: PendingChange = {
          id: generateId(),
          type: "delete",
          entryId: id,
          timestamp: Date.now(),
        }
        await savePendingChange(change)
        setPendingChanges(prev => [...prev, change])
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to delete entry")
      }
    },
    [entries],
  )

  const getEntryById = useCallback(
    (id: string): DreamEntry | undefined => {
      return entries.find(e => e.id === id)
    },
    [entries],
  )

  return {
    entries,
    isLoading,
    error,
    hasPendingChanges: pendingChanges.length > 0,
    addEntry,
    updateEntry,
    deleteEntry,
    getEntryById,
  }
}

const generateId = (): string => {
  return crypto.randomUUID()
}

const sortEntriesByDate = (entries: DreamEntry[]): DreamEntry[] => {
  return [...entries].sort((a, b) => b.date.localeCompare(a.date))
}

export type UseEntriesReturn = ReturnType<typeof useEntries>
