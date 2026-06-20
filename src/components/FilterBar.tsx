"use client"

import { Filter } from "@/types"

interface Props {
  active: Filter
  counts: Record<Filter, number>
  onChange: (f: Filter) => void
}

const FILTERS: { key: Filter; label: string }[] = [
  { key: "todas", label: "todas" },
  { key: "pendiente", label: "pendiente" },
  { key: "finalizado", label: "finalizado" },
  { key: "suspendido", label: "suspendido" },
]

export default function FilterBar({ active, counts, onChange }: Props) {
  return (
    <div className="flex flex-wrap items-center gap-1">
      {FILTERS.map(({ key, label }) => (
        <button
          key={key}
          onClick={() => onChange(key)}
          className={`
            text-xs font-mono px-3 py-1.5 rounded transition-all
            ${active === key
              ? "bg-surface-3 text-ink"
              : "text-ink-faint hover:text-ink-muted hover:bg-surface-2"
            }
          `}
        >
          {label}
          <span className={`ml-1.5 ${active === key ? "text-accent" : "text-ink-faint"}`}>
            {counts[key]}
          </span>
        </button>
      ))}
    </div>
  )
}
