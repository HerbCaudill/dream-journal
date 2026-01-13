import type { DreamEntry } from "@/types"

export function HistoryEntry({ entry }: Props) {
  return (
    <article className="flex flex-col gap-2">
      <time className="text-muted-foreground text-sm">{formatDate(entry.date)}</time>
      <p className="leading-relaxed whitespace-pre-wrap">{entry.content}</p>
    </article>
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
  entry: DreamEntry
}
