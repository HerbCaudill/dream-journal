import { useCallback, useEffect, useState } from "react"
import {
  clearPendingChanges as clearPendingChangesDb,
  loadEntries,
  loadPendingChanges,
  saveEntries as saveEntriesDb,
  savePendingChange,
} from "../lib/indexedDb"
import type { DreamEntry, PendingChange } from "../types"

export const useOfflineCache = () => {
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
        setEntries(loadedEntries)
        setPendingChanges(loadedPendingChanges)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load cache")
      } finally {
        setIsLoading(false)
      }
    }

    load()
  }, [])

  const saveEntries = useCallback(async (newEntries: DreamEntry[]) => {
    try {
      await saveEntriesDb(newEntries)
      setEntries(newEntries)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save entries")
    }
  }, [])

  const addPendingChange = useCallback(async (change: PendingChange) => {
    try {
      await savePendingChange(change)
      setPendingChanges(prev => [...prev, change])
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save pending change")
    }
  }, [])

  const clearPendingChanges = useCallback(async () => {
    try {
      await clearPendingChangesDb()
      setPendingChanges([])
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to clear pending changes")
    }
  }, [])

  return {
    entries,
    pendingChanges,
    isLoading,
    error,
    hasPendingChanges: pendingChanges.length > 0,
    saveEntries,
    addPendingChange,
    clearPendingChanges,
  }
}

export type UseOfflineCacheReturn = ReturnType<typeof useOfflineCache>
