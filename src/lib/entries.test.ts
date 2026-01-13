import { describe, expect, it } from "vitest"
import { parseEntries, serializeEntries, getTodayDate } from "./entries"
import type { DreamEntry } from "../types"

describe("parseEntries", () => {
  it("parses valid JSON array of entries", () => {
    const json = JSON.stringify([
      { id: "1", date: "2026-01-13", content: "I dreamed of flying" },
      { id: "2", date: "2026-01-12", content: "I dreamed of swimming" },
    ])
    const entries = parseEntries(json)
    expect(entries).toHaveLength(2)
    expect(entries[0]).toEqual({
      id: "1",
      date: "2026-01-13",
      content: "I dreamed of flying",
    })
  })

  it("returns empty array for empty JSON array", () => {
    const entries = parseEntries("[]")
    expect(entries).toEqual([])
  })

  it("returns empty array for empty string", () => {
    const entries = parseEntries("")
    expect(entries).toEqual([])
  })

  it("returns empty array for invalid JSON", () => {
    const entries = parseEntries("not valid json")
    expect(entries).toEqual([])
  })

  it("returns empty array for null JSON", () => {
    const entries = parseEntries("null")
    expect(entries).toEqual([])
  })

  it("filters out entries with missing fields", () => {
    const json = JSON.stringify([
      { id: "1", date: "2026-01-13", content: "Valid entry" },
      { id: "2", content: "Missing date" },
      { date: "2026-01-12", content: "Missing id" },
      { id: "3", date: "2026-01-11" },
    ])
    const entries = parseEntries(json)
    expect(entries).toHaveLength(1)
    expect(entries[0].id).toBe("1")
  })
})

describe("serializeEntries", () => {
  it("serializes entries to JSON string", () => {
    const entries: DreamEntry[] = [{ id: "1", date: "2026-01-13", content: "I dreamed of flying" }]
    const json = serializeEntries(entries)
    expect(JSON.parse(json)).toEqual(entries)
  })

  it("serializes empty array", () => {
    const json = serializeEntries([])
    expect(json).toBe("[]")
  })

  it("preserves special characters in content", () => {
    const entries: DreamEntry[] = [
      { id: "1", date: "2026-01-13", content: 'Line 1\nLine 2\t"quoted"' },
    ]
    const json = serializeEntries(entries)
    const parsed = JSON.parse(json)
    expect(parsed[0].content).toBe('Line 1\nLine 2\t"quoted"')
  })
})

describe("getTodayDate", () => {
  it("returns date in YYYY-MM-DD format", () => {
    const today = getTodayDate()
    expect(today).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })
})
