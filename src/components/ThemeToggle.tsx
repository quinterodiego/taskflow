"use client"

import { useEffect, useState } from "react"

export default function ThemeToggle() {
  const [dark, setDark] = useState<boolean | null>(null)

  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"))
  }, [])

  const toggle = () => {
    const next = !dark
    setDark(next)
    if (next) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
    localStorage.setItem("theme", next ? "dark" : "light")
  }

  // Don't render until we know the actual theme (avoids hydration flash)
  if (dark === null) return <div className="w-6 h-6" />

  return (
    <button
      onClick={toggle}
      title={dark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
      className="text-ink-faint hover:text-ink transition-colors p-1"
    >
      {dark ? (
        // Sol — estás en dark, click va a light
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
          <circle cx="8" cy="8" r="3" />
          <line x1="8" y1="1" x2="8" y2="2.5" />
          <line x1="8" y1="13.5" x2="8" y2="15" />
          <line x1="1" y1="8" x2="2.5" y2="8" />
          <line x1="13.5" y1="8" x2="15" y2="8" />
          <line x1="2.93" y1="2.93" x2="3.99" y2="3.99" />
          <line x1="12.01" y1="12.01" x2="13.07" y2="13.07" />
          <line x1="2.93" y1="13.07" x2="3.99" y2="12.01" />
          <line x1="12.01" y1="3.99" x2="13.07" y2="2.93" />
        </svg>
      ) : (
        // Luna — estás en light, click va a dark
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M13.5 10.5A6 6 0 0 1 5.5 2.5a6 6 0 1 0 8 8z" />
        </svg>
      )}
    </button>
  )
}
