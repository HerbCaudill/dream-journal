import { BrowserRouter, Routes, Route } from "react-router-dom"
import { HomePage } from "@/pages/HomePage"

export function App() {
  const handleSubmit = (entry: { date: string; content: string }) => {
    // TODO: Implement with useEntries hook
    console.log("Entry submitted:", entry)
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage onSubmit={handleSubmit} />} />
        <Route path="/history" element={<div>History page coming soon</div>} />
      </Routes>
    </BrowserRouter>
  )
}
