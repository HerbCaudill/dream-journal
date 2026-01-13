import { BrowserRouter, Routes, Route } from "react-router-dom"
import { HomePage } from "@/pages/HomePage"
import { HistoryPage } from "@/pages/HistoryPage"
import { useEntries } from "@/hooks/useEntries"

export function App() {
  const { entries, isLoading, addEntry, updateEntry } = useEntries()

  const handleSubmit = (entry: { date: string; content: string }) => {
    addEntry(entry.date, entry.content)
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage onSubmit={handleSubmit} />} />
        <Route
          path="/history"
          element={<HistoryPage entries={entries} isLoading={isLoading} onUpdate={updateEntry} />}
        />
      </Routes>
    </BrowserRouter>
  )
}
