"use client"

import { TaskStatus } from "@/types"

const STATUS_CONFIG: Record<
  TaskStatus,
  { label: string; classes: string; next: TaskStatus }
> = {
  pendiente: {
    label: "pendiente",
    classes: "text-ink border-ink-faint/40 hover:border-ink-faint",
    next: "finalizado",
  },
  finalizado: {
    label: "finalizado",
    classes: "text-status-done border-status-done/30 hover:border-status-done",
    next: "suspendido",
  },
  suspendido: {
    label: "suspendido",
    classes:
      "text-status-suspended border-status-suspended/30 hover:border-status-suspended",
    next: "pendiente",
  },
}

interface Props {
  status: TaskStatus
  onChange: (next: TaskStatus) => void
  disabled?: boolean
}

export default function StatusBadge({ status, onChange, disabled }: Props) {
  const config = STATUS_CONFIG[status]

  return (
    <button
      onClick={() => !disabled && onChange(config.next)}
      disabled={disabled}
      title="Cambiar estado"
      className={`
        text-xs font-mono px-2 py-0.5 rounded border transition-colors whitespace-nowrap
        ${config.classes}
        ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
      `}
    >
      {config.label}
    </button>
  )
}
