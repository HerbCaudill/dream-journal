/**
 * @vitest-environment jsdom
 */

import "@testing-library/jest-dom/vitest"
import { render, screen, cleanup } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, it, expect, afterEach, vi } from "vitest"
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

  describe("inline editing", () => {
    it("enters edit mode when content is clicked", async () => {
      const user = userEvent.setup()
      const entry: DreamEntry = {
        id: "1",
        date: "2024-03-15",
        content: "Flying through clouds",
      }

      render(<HistoryEntry entry={entry} onUpdate={vi.fn()} />)

      await user.click(screen.getByText("Flying through clouds"))

      expect(screen.getByRole("textbox")).toBeInTheDocument()
      expect(screen.getByRole("textbox")).toHaveValue("Flying through clouds")
    })

    it("does not enter edit mode when onUpdate is not provided", async () => {
      const user = userEvent.setup()
      const entry: DreamEntry = {
        id: "1",
        date: "2024-03-15",
        content: "Flying through clouds",
      }

      render(<HistoryEntry entry={entry} />)

      await user.click(screen.getByText("Flying through clouds"))

      expect(screen.queryByRole("textbox")).not.toBeInTheDocument()
    })

    it("saves and exits edit mode when clicking outside", async () => {
      const user = userEvent.setup()
      const onUpdate = vi.fn()
      const entry: DreamEntry = {
        id: "1",
        date: "2024-03-15",
        content: "Flying through clouds",
      }

      render(<HistoryEntry entry={entry} onUpdate={onUpdate} />)

      await user.click(screen.getByText("Flying through clouds"))
      const textbox = screen.getByRole("textbox")
      await user.clear(textbox)
      await user.type(textbox, "Swimming in the ocean")
      await user.click(document.body)

      expect(onUpdate).toHaveBeenCalledWith("1", "Swimming in the ocean")
      expect(screen.queryByRole("textbox")).not.toBeInTheDocument()
      expect(screen.getByText("Swimming in the ocean")).toBeInTheDocument()
    })

    it("saves and exits edit mode when pressing Escape", async () => {
      const user = userEvent.setup()
      const onUpdate = vi.fn()
      const entry: DreamEntry = {
        id: "1",
        date: "2024-03-15",
        content: "Flying through clouds",
      }

      render(<HistoryEntry entry={entry} onUpdate={onUpdate} />)

      await user.click(screen.getByText("Flying through clouds"))
      const textbox = screen.getByRole("textbox")
      await user.clear(textbox)
      await user.type(textbox, "New content")
      await user.keyboard("{Escape}")

      expect(onUpdate).toHaveBeenCalledWith("1", "New content")
      expect(screen.queryByRole("textbox")).not.toBeInTheDocument()
    })

    it("does not call onUpdate if content is unchanged", async () => {
      const user = userEvent.setup()
      const onUpdate = vi.fn()
      const entry: DreamEntry = {
        id: "1",
        date: "2024-03-15",
        content: "Flying through clouds",
      }

      render(<HistoryEntry entry={entry} onUpdate={onUpdate} />)

      await user.click(screen.getByText("Flying through clouds"))
      await user.keyboard("{Escape}")

      expect(onUpdate).not.toHaveBeenCalled()
    })

    it("has cursor pointer style when editable", () => {
      const entry: DreamEntry = {
        id: "1",
        date: "2024-03-15",
        content: "Flying through clouds",
      }

      render(<HistoryEntry entry={entry} onUpdate={vi.fn()} />)

      const content = screen.getByText("Flying through clouds")
      expect(content).toHaveClass("cursor-pointer")
    })
  })
})
