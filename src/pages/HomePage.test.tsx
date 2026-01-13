/**
 * @vitest-environment jsdom
 */

import "@testing-library/jest-dom/vitest"
import { render, screen, fireEvent, cleanup } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { MemoryRouter } from "react-router-dom"
import { HomePage } from "./HomePage"
import * as entries from "@/lib/entries"

describe("HomePage", () => {
  beforeEach(() => {
    vi.spyOn(entries, "getTodayDate").mockReturnValue("2024-03-15")
  })

  afterEach(() => {
    vi.restoreAllMocks()
    cleanup()
  })

  it("renders the heading", () => {
    render(
      <MemoryRouter>
        <HomePage onSubmit={() => {}} />
      </MemoryRouter>,
    )

    expect(screen.getByRole("heading", { name: "Dream journal" })).toBeInTheDocument()
  })

  it("renders the entry form", () => {
    render(
      <MemoryRouter>
        <HomePage onSubmit={() => {}} />
      </MemoryRouter>,
    )

    expect(screen.getByLabelText("Date")).toBeInTheDocument()
    expect(screen.getByLabelText("What did you dream?")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Save entry" })).toBeInTheDocument()
  })

  it("passes onSubmit to EntryForm", () => {
    const handleSubmit = vi.fn()
    render(
      <MemoryRouter>
        <HomePage onSubmit={handleSubmit} />
      </MemoryRouter>,
    )

    const textarea = screen.getByLabelText("What did you dream?")
    fireEvent.change(textarea, { target: { value: "Flying dream" } })

    const submitButton = screen.getByRole("button", { name: "Save entry" })
    fireEvent.click(submitButton)

    expect(handleSubmit).toHaveBeenCalledWith({
      date: "2024-03-15",
      content: "Flying dream",
    })
  })

  it("renders a link to history page", () => {
    render(
      <MemoryRouter>
        <HomePage onSubmit={() => {}} />
      </MemoryRouter>,
    )

    const historyLink = screen.getByRole("link", { name: /history/i })
    expect(historyLink).toBeInTheDocument()
    expect(historyLink).toHaveAttribute("href", "/history")
  })
})
