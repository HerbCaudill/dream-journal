/**
 * @vitest-environment jsdom
 */

import "@testing-library/jest-dom/vitest"
import { render, screen, cleanup } from "@testing-library/react"
import { describe, it, expect, afterEach } from "vitest"
import { HistoryEntry } from "./HistoryEntry"
import type { DreamEntry } from "@/types"

describe("HistoryEntry", () => {
  afterEach(() => {
    cleanup()
  })

  it("renders the entry content", () => {
    const entry: DreamEntry = {
      id: "1",
      date: "2024-03-15",
      content: "Flying through clouds",
    }

    render(<HistoryEntry entry={entry} />)

    expect(screen.getByText("Flying through clouds")).toBeInTheDocument()
  })

  it("renders the formatted date", () => {
    const entry: DreamEntry = {
      id: "1",
      date: "2024-03-15",
      content: "A dream",
    }

    render(<HistoryEntry entry={entry} />)

    expect(screen.getByText("March 15, 2024")).toBeInTheDocument()
  })

  it("renders as an article element", () => {
    const entry: DreamEntry = {
      id: "1",
      date: "2024-03-15",
      content: "A dream",
    }

    render(<HistoryEntry entry={entry} />)

    expect(screen.getByRole("article")).toBeInTheDocument()
  })

  it("preserves whitespace in content", () => {
    const entry: DreamEntry = {
      id: "1",
      date: "2024-03-15",
      content: "Line one\nLine two",
    }

    render(<HistoryEntry entry={entry} />)

    const contentElement = screen.getByText(/Line one/)
    expect(contentElement).toHaveClass("whitespace-pre-wrap")
  })

  it("uses a time element for the date", () => {
    const entry: DreamEntry = {
      id: "1",
      date: "2024-03-15",
      content: "A dream",
    }

    render(<HistoryEntry entry={entry} />)

    const timeElement = screen.getByText("March 15, 2024")
    expect(timeElement.tagName).toBe("TIME")
  })
})
