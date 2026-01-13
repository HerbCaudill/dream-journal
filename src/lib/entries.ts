import type { DreamEntry } from "../types"

export const parseEntries = (json: string): DreamEntry[] => {
  if (!json || json.trim() === "") {
    return []
  }

  try {
    const data = JSON.parse(json)
    if (!Array.isArray(data)) {
      return []
    }
    return data.filter(isValidEntry)
  } catch {
    return []
  }
}

export const serializeEntries = (entries: DreamEntry[]): string => {
  return JSON.stringify(entries)
}

export const getTodayDate = (): string => {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, "0")
  const day = String(now.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

const isValidEntry = (entry: unknown): entry is DreamEntry => {
  if (typeof entry !== "object" || entry === null) {
    return false
  }
  const obj = entry as Record<string, unknown>
  return (
    typeof obj.id === "string" && typeof obj.date === "string" && typeof obj.content === "string"
  )
}
