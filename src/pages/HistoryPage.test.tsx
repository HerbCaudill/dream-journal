/**
 * @vitest-environment jsdom
 */

import "@testing-library/jest-dom/vitest"
import { render, screen, cleanup } from "@testing-library/react"
import { describe, it, expect, afterEach } from "vitest"
import { MemoryRouter } from "react-router-dom"
import { HistoryPage } from "./HistoryPage"
import type { DreamEntry } from "@/types"

describe("HistoryPage", () => {
  afterEach(() => {
    cleanup()
  })

  it("renders the heading", () => {
    render(
      <MemoryRouter>
        <HistoryPage entries={[]} isLoading={false} />
      </MemoryRouter>,
    )

    expect(screen.getByRole("heading", { name: "History" })).toBeInTheDocument()
  })

  it("renders a back link to home page", () => {
    render(
      <MemoryRouter>
        <HistoryPage entries={[]} isLoading={false} />
      </MemoryRouter>,
    )

    const backLink = screen.getByRole("link", { name: /back/i })
    expect(backLink).toBeInTheDocument()
    expect(backLink).toHaveAttribute("href", "/")
  })

  it("shows loading state when isLoading is true", () => {
    render(
      <MemoryRouter>
        <HistoryPage entries={[]} isLoading={true} />
      </MemoryRouter>,
    )

    expect(screen.getByText("Loading...")).toBeInTheDocument()
  })

  it("shows empty state when there are no entries", () => {
    render(
      <MemoryRouter>
        <HistoryPage entries={[]} isLoading={false} />
      </MemoryRouter>,
    )

    expect(screen.getByText("No entries yet")).toBeInTheDocument()
  })

  it("renders entries when provided", () => {
    const entries: DreamEntry[] = [
      { id: "1", date: "2024-03-15", content: "Flying through clouds" },
      { id: "2", date: "2024-03-14", content: "Swimming in the ocean" },
    ]

    render(
      <MemoryRouter>
        <HistoryPage entries={entries} isLoading={false} />
      </MemoryRouter>,
    )

    expect(screen.getByText("Flying through clouds")).toBeInTheDocument()
    expect(screen.getByText("Swimming in the ocean")).toBeInTheDocument()
  })

  it("displays entry dates formatted correctly", () => {
    const entries: DreamEntry[] = [{ id: "1", date: "2024-03-15", content: "A dream" }]

    render(
      <MemoryRouter>
        <HistoryPage entries={entries} isLoading={false} />
      </MemoryRouter>,
    )

    expect(screen.getByText("March 15, 2024")).toBeInTheDocument()
  })
})
