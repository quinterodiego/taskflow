"use client"

import { useState, useRef } from "react"

interface Props {
  onAdd: (title: string, dueDate?: string) => Promise<void>
}

export default function TaskInput({ onAdd }: Props) {
  const [value, setValue] = useState("")
  const [dueDate, setDueDate] = useState("")
  const [showDate, setShowDate] = useState(false)
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleSubmit = async () => {
    const title = value.trim()
    if (!title || loading) return
    setLoading(true)
    setValue("")
    setDueDate("")
    setShowDate(false)
    await onAdd(title, dueDate || undefined)
    setLoading(false)
    inputRef.current?.focus()
  }

  const toggleDate = () => {
    setShowDate((s) => !s)
    if (showDate) setDueDate("")
  }

  return (
    <div className="bg-surface-2 border border-surface-4 rounded-lg px-4 py-3 focus-within:border-accent/50 transition-colors">
      <div className="flex items-center gap-3">
        <span className="text-accent font-mono text-sm select-none">+</span>
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          placeholder="Nueva tarea… Enter para agregar"
          disabled={loading}
          className="flex-1 bg-transparent text-ink placeholder:text-ink-faint text-sm outline-none font-sans"
          autoFocus
        />
        {loading ? (
          <div className="w-3 h-3 border border-accent/40 border-t-accent rounded-full animate-spin" />
        ) : (
          <button
            onClick={toggleDate}
            title={showDate ? "Quitar fecha" : "Agregar fecha de vencimiento"}
            className={`transition-colors flex-shrink-0 ${
              showDate || dueDate ? "text-accent" : "text-ink-faint hover:text-ink-muted"
            }`}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="1" y="2.5" width="12" height="11" rx="1.5" />
              <line x1="1" y1="5.5" x2="13" y2="5.5" />
              <line x1="4" y1="1" x2="4" y2="4" />
              <line x1="10" y1="1" x2="10" y2="4" />
            </svg>
          </button>
        )}
      </div>

      {showDate && (
        <div className="flex items-center gap-2 mt-2 pt-2 border-t border-surface-4">
          <svg width="12" height="12" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-ink-faint flex-shrink-0">
            <rect x="1" y="2.5" width="12" height="11" rx="1.5" />
            <line x1="1" y1="5.5" x2="13" y2="5.5" />
            <line x1="4" y1="1" x2="4" y2="4" />
            <line x1="10" y1="1" x2="10" y2="4" />
          </svg>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="flex-1 bg-transparent text-ink text-xs font-mono outline-none"
          />
          {dueDate && (
            <button
              onClick={() => setDueDate("")}
              className="text-ink-faint hover:text-ink transition-colors text-xs"
            >
              ×
            </button>
          )}
        </div>
      )}
    </div>
  )
}
