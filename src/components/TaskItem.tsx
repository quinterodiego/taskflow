"use client"

import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Task, TaskStatus } from "@/types"
import StatusBadge from "./StatusBadge"

interface Props {
  task: Task
  onStatusChange: (id: string, status: TaskStatus) => void
  onDelete: (id: string) => void
  updating: boolean
}

export default function TaskItem({
  task,
  onStatusChange,
  onDelete,
  updating,
}: Props) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const isStruck =
    task.status === "finalizado" || task.status === "suspendido"

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        group flex items-center gap-3 px-4 py-3 rounded-lg border transition-all
        ${isDragging
          ? "bg-surface-3 border-accent/30 shadow-lg shadow-black/40 z-50 opacity-90"
          : "bg-surface-1 border-surface-3 hover:border-surface-4"
        }
        animate-slide-in
      `}
    >
      {/* Drag handle */}
      <button
        {...attributes}
        {...listeners}
        className="text-ink-faint hover:text-ink-muted cursor-grab active:cursor-grabbing transition-colors flex-shrink-0 touch-none"
        title="Arrastrar para reordenar"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
          <circle cx="4" cy="4" r="1.2" />
          <circle cx="10" cy="4" r="1.2" />
          <circle cx="4" cy="7" r="1.2" />
          <circle cx="10" cy="7" r="1.2" />
          <circle cx="4" cy="10" r="1.2" />
          <circle cx="10" cy="10" r="1.2" />
        </svg>
      </button>

      {/* Title */}
      <span
        className={`
          flex-1 text-sm transition-colors min-w-0 truncate
          ${isStruck ? "line-through text-ink-faint" : "text-ink"}
        `}
      >
        {task.title}
      </span>

      {/* Status badge */}
      <StatusBadge
        status={task.status}
        onChange={(next) => onStatusChange(task.id, next)}
        disabled={updating}
      />

      {/* Delete button */}
      <button
        onClick={() => onDelete(task.id)}
        disabled={updating}
        className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 text-ink-faint hover:text-status-suspended transition-all disabled:opacity-20 flex-shrink-0"
        title="Eliminar tarea"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
          <line x1="2" y1="2" x2="12" y2="12" />
          <line x1="12" y1="2" x2="2" y2="12" />
        </svg>
      </button>
    </div>
  )
}
