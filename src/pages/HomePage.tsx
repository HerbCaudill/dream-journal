import { EntryForm } from "@/components/EntryForm"

export function HomePage({ onSubmit }: Props) {
  return (
    <div className="flex min-h-screen flex-col items-center px-4 py-12">
      <div className="w-full max-w-md">
        <h1 className="mb-8 text-center font-serif text-3xl font-light tracking-tight">
          Dream journal
        </h1>
        <EntryForm onSubmit={onSubmit} />
      </div>
    </div>
  )
}

type Props = {
  onSubmit: (entry: { date: string; content: string }) => void
}
