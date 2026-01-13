import { useState, useRef, useEffect } from "react"
import { cn } from "@/lib/utils"
import type { DreamEntry } from "@/types"

export function HistoryEntry({ entry, onUpdate }: Props) {
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState(entry.content)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const isEditable = Boolean(onUpdate)

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus()
      textareaRef.current.selectionStart = textareaRef.current.value.length
    }
  }, [isEditing])

  const handleClick = () => {
    if (isEditable && !isEditing) {
      setIsEditing(true)
      setEditContent(entry.content)
    }
  }

  const handleSave = () => {
    setIsEditing(false)
    if (editContent !== entry.content && onUpdate) {
      onUpdate(entry.id, editContent)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      handleSave()
    }
  }

  return (
    <article className="flex flex-col gap-2">
      <time className="text-muted-foreground text-sm">{formatDate(entry.date)}</time>
      {isEditing ?
        <textarea
          ref={textareaRef}
          value={editContent}
          onChange={e => setEditContent(e.target.value)}
          onBlur={handleSave}
          onKeyDown={handleKeyDown}
          className="resize-none border-0 bg-transparent p-0 leading-relaxed whitespace-pre-wrap focus:ring-0 focus:outline-none"
          rows={editContent.split("\n").length + 1}
        />
      : <p
          onClick={handleClick}
          className={cn(
            "leading-relaxed whitespace-pre-wrap",
            isEditable &&
              "hover:bg-muted/50 -mx-2 -my-1 cursor-pointer rounded px-2 py-1 transition-colors",
          )}
        >
          {editContent}
        </p>
      }
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
  onUpdate?: (id: string, content: string) => void
}
