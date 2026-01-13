export type DreamEntry = {
  id: string
  date: string
  content: string
}

export type PendingChangeType = "add" | "update" | "delete"

export type PendingChange = {
  id: string
  type: PendingChangeType
  entryId: string
  entry?: DreamEntry
  timestamp: number
}
