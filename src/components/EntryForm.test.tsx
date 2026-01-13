/**
 * @vitest-environment jsdom
 */

import "@testing-library/jest-dom/vitest"
import { render, screen, fireEvent, cleanup } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { EntryForm } from "./EntryForm"
import * as entries from "@/lib/entries"

describe("EntryForm", () => {
  beforeEach(() => {
    vi.spyOn(entries, "getTodayDate").mockReturnValue("2024-03-15")
  })

  afterEach(() => {
    vi.restoreAllMocks()
    cleanup()
  })

  it("renders with today's date by default", () => {
    render(<EntryForm onSubmit={() => {}} />)

    const dateInput = screen.getByLabelText("Date") as HTMLInputElement
    expect(dateInput.value).toBe("2024-03-15")
  })

  it("renders the textarea with placeholder", () => {
    render(<EntryForm onSubmit={() => {}} />)

    expect(screen.getByPlaceholderText("Describe your dream...")).toBeInTheDocument()
  })

  it("disables submit button when content is empty", () => {
    render(<EntryForm onSubmit={() => {}} />)

    const submitButton = screen.getByRole("button", { name: "Save entry" })
    expect(submitButton).toBeDisabled()
  })

  it("enables submit button when content is entered", () => {
    render(<EntryForm onSubmit={() => {}} />)

    const textarea = screen.getByLabelText("What did you dream?")
    fireEvent.change(textarea, { target: { value: "I dreamed about flying" } })

    const submitButton = screen.getByRole("button", { name: "Save entry" })
    expect(submitButton).toBeEnabled()
  })

  it("calls onSubmit with date and content when submitted", () => {
    const handleSubmit = vi.fn()
    render(<EntryForm onSubmit={handleSubmit} />)

    const textarea = screen.getByLabelText("What did you dream?")
    fireEvent.change(textarea, { target: { value: "I dreamed about flying" } })

    const submitButton = screen.getByRole("button", { name: "Save entry" })
    fireEvent.click(submitButton)

    expect(handleSubmit).toHaveBeenCalledWith({
      date: "2024-03-15",
      content: "I dreamed about flying",
    })
  })

  it("clears the content after submission", () => {
    render(<EntryForm onSubmit={() => {}} />)

    const textarea = screen.getByLabelText("What did you dream?") as HTMLTextAreaElement
    fireEvent.change(textarea, { target: { value: "I dreamed about flying" } })
    expect(textarea.value).toBe("I dreamed about flying")

    const submitButton = screen.getByRole("button", { name: "Save entry" })
    fireEvent.click(submitButton)

    expect(textarea.value).toBe("")
  })

  it("trims whitespace from content before submitting", () => {
    const handleSubmit = vi.fn()
    render(<EntryForm onSubmit={handleSubmit} />)

    const textarea = screen.getByLabelText("What did you dream?")
    fireEvent.change(textarea, { target: { value: "  Flying dream  " } })

    const submitButton = screen.getByRole("button", { name: "Save entry" })
    fireEvent.click(submitButton)

    expect(handleSubmit).toHaveBeenCalledWith({
      date: "2024-03-15",
      content: "Flying dream",
    })
  })

  it("does not submit if content is only whitespace", () => {
    const handleSubmit = vi.fn()
    render(<EntryForm onSubmit={handleSubmit} />)

    const textarea = screen.getByLabelText("What did you dream?")
    fireEvent.change(textarea, { target: { value: "   " } })

    const submitButton = screen.getByRole("button", { name: "Save entry" })
    expect(submitButton).toBeDisabled()
  })

  it("allows changing the date", () => {
    const handleSubmit = vi.fn()
    render(<EntryForm onSubmit={handleSubmit} />)

    const dateInput = screen.getByLabelText("Date")
    fireEvent.change(dateInput, { target: { value: "2024-03-10" } })

    const textarea = screen.getByLabelText("What did you dream?")
    fireEvent.change(textarea, { target: { value: "A dream from last week" } })

    const submitButton = screen.getByRole("button", { name: "Save entry" })
    fireEvent.click(submitButton)

    expect(handleSubmit).toHaveBeenCalledWith({
      date: "2024-03-10",
      content: "A dream from last week",
    })
  })

  it("disables all inputs when disabled prop is true", () => {
    render(<EntryForm onSubmit={() => {}} disabled />)

    expect(screen.getByLabelText("Date")).toBeDisabled()
    expect(screen.getByLabelText("What did you dream?")).toBeDisabled()
    expect(screen.getByRole("button", { name: "Save entry" })).toBeDisabled()
  })
})
