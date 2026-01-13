import { Link } from "react-router-dom"
import { IconArrowLeft } from "@tabler/icons-react"
import { HistoryEntry } from "@/components/HistoryEntry"
import type { DreamEntry } from "@/types"

export function HistoryPage({ entries, isLoading, onUpdate }: Props) {
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
              <HistoryEntry key={entry.id} entry={entry} onUpdate={onUpdate} />
            ))}
          </div>
        }
      </div>
    </div>
  )
}

type Props = {
  entries: DreamEntry[]
  isLoading: boolean
  onUpdate?: (id: string, content: string) => void
}
