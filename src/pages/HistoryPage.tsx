import { Link } from "react-router-dom"
import { IconArrowLeft } from "@tabler/icons-react"
import type { DreamEntry } from "@/types"

export function HistoryPage({ entries, isLoading }: Props) {
  return (
    <div className="flex min-h-screen flex-col items-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 flex items-center gap-4">
          <Link
            to="/"
            className="text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Back"
          >
            <IconArrowLeft className="size-5" />
          </Link>
          <h1 className="font-serif text-3xl font-light tracking-tight">History</h1>
        </div>

        {isLoading ?
          <p className="text-muted-foreground text-center">Loading...</p>
        : entries.length === 0 ?
          <p className="text-muted-foreground text-center">No entries yet</p>
        : <div className="flex flex-col gap-6">
            {entries.map(entry => (
              <article key={entry.id} className="flex flex-col gap-2">
                <time className="text-muted-foreground text-sm">{formatDate(entry.date)}</time>
                <p className="leading-relaxed whitespace-pre-wrap">{entry.content}</p>
              </article>
            ))}
          </div>
        }
      </div>
    </div>
  )
}

function formatDate(dateString: string): string {
  const date = new Date(dateString + "T00:00:00")
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

type Props = {
  entries: DreamEntry[]
  isLoading: boolean
}
