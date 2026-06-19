"use client"

import { useState, useRef } from "react"

interface Props {
  onAdd: (title: string) => Promise<void>
}

export default function TaskInput({ onAdd }: Props) {
  const [value, setValue] = useState("")
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleSubmit = async () => {
    const title = value.trim()
    if (!title || loading) return
    setLoading(true)
    setValue("")
    await onAdd(title)
    setLoading(false)
    inputRef.current?.focus()
  }

  return (
    <div className="flex items-center gap-3 bg-surface-2 border border-surface-4 rounded-lg px-4 py-3 focus-within:border-accent/50 transition-colors">
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
      {loading && (
        <div className="w-3 h-3 border border-accent/40 border-t-accent rounded-full animate-spin" />
      )}
    </div>
  )
}
