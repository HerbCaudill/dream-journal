import { useState } from "react"
import { Button } from "@/components/ui/button"
import { getTodayDate } from "@/lib/entries"
import { cn } from "@/lib/utils"

export function EntryForm({ onSubmit, disabled = false }: Props) {
  const [content, setContent] = useState("")
  const [date, setDate] = useState(getTodayDate)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (content.trim() === "") return
    onSubmit({ date, content: content.trim() })
    setContent("")
    setDate(getTodayDate())
  }

  const canSubmit = content.trim() !== "" && !disabled

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <label htmlFor="date" className="text-muted-foreground text-sm">
          Date
        </label>
        <input
          type="date"
          id="date"
          value={date}
          onChange={e => setDate(e.target.value)}
          disabled={disabled}
          className={cn(
            "border-input bg-background w-fit rounded-md border px-3 py-2",
            "focus:ring-ring text-sm focus:ring-2 focus:ring-offset-2 focus:outline-none",
            "disabled:cursor-not-allowed disabled:opacity-50",
          )}
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="content" className="text-muted-foreground text-sm">
          What did you dream?
        </label>
        <textarea
          id="content"
          value={content}
          onChange={e => setContent(e.target.value)}
          disabled={disabled}
          placeholder="Describe your dream..."
          rows={8}
          className={cn(
            "border-input bg-background w-full resize-none rounded-md border px-4 py-3",
            "placeholder:text-muted-foreground/60 text-base leading-relaxed",
            "focus:ring-ring focus:ring-2 focus:ring-offset-2 focus:outline-none",
            "disabled:cursor-not-allowed disabled:opacity-50",
          )}
        />
      </div>

      <Button type="submit" disabled={!canSubmit} className="self-end">
        Save entry
      </Button>
    </form>
  )
}

type Props = {
  onSubmit: (entry: { date: string; content: string }) => void
  disabled?: boolean
}
