"use client"

import { useState, useRef, useEffect } from "react"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Task, TaskStatus } from "@/types"
import StatusBadge from "./StatusBadge"

function formatRelativeDate(iso: string): string {
  if (!iso) return ""
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000)
  if (diff === 0) return "hoy"
  if (diff === 1) return "ayer"
  if (diff < 7) return `hace ${diff} días`
  if (diff < 30) return `hace ${Math.floor(diff / 7)} sem.`
  return new Date(iso).toLocaleDateString("es-AR", { day: "numeric", month: "short" })
}

interface Props {
  task: Task
  onStatusChange: (id: string, status: TaskStatus) => void
  onDelete: (id: string) => void
  onTitleChange: (id: string, title: string) => void
  updating: boolean
}

export default function TaskItem({
  task,
  onStatusChange,
  onDelete,
  onTitleChange,
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

  const [editing, setEditing] = useState(false)
  const [editValue, setEditValue] = useState(task.title)
  const editInputRef = useRef<HTMLInputElement>(null)

  const [swipeX, setSwipeX] = useState(0)
  const touchStartRef = useRef<{ x: number; y: number } | null>(null)

  useEffect(() => {
    if (editing) editInputRef.current?.focus()
  }, [editing])

  const isStruck = task.status === "finalizado" || task.status === "suspendido"

  const handleTitleSave = () => {
    const trimmed = editValue.trim()
    if (trimmed && trimmed !== task.title) {
      onTitleChange(task.id, trimmed)
    } else {
      setEditValue(task.title)
    }
    setEditing(false)
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStartRef.current) return
    const deltaX = e.touches[0].clientX - touchStartRef.current.x
    const deltaY = e.touches[0].clientY - touchStartRef.current.y
    if (Math.abs(deltaX) < Math.abs(deltaY)) return
    if (deltaX < 0) setSwipeX(Math.max(deltaX, -120))
  }

  const handleTouchEnd = () => {
    if (swipeX < -80) {
      onDelete(task.id)
    } else {
      setSwipeX(0)
    }
    touchStartRef.current = null
  }

  const finalStyle = swipeX !== 0
    ? { transform: `translateX(${swipeX}px)`, transition: "none" }
    : { transform: CSS.Transform.toString(transform), transition }

  return (
    <div
      ref={setNodeRef}
      style={finalStyle}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
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

      {/* Title — editing or display */}
      {editing ? (
        <input
          ref={editInputRef}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleTitleSave}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleTitleSave()
            if (e.key === "Escape") {
              setEditValue(task.title)
              setEditing(false)
            }
          }}
          className="flex-1 bg-transparent text-ink text-sm outline-none border-b border-accent/50 min-w-0 font-sans pb-px"
        />
      ) : (
        <div
          onDoubleClick={() => !updating && setEditing(true)}
          title="Doble click para editar"
          className="flex-1 min-w-0 flex flex-col gap-0.5 cursor-default select-none"
        >
          <span
            className={`
              text-sm transition-all duration-300 truncate
              ${isStruck ? "line-through text-ink-faint" : "text-ink"}
            `}
          >
            {task.title}
          </span>
          <span className="text-xs text-ink-faint font-mono">
            {formatRelativeDate(task.createdAt)}
          </span>
        </div>
      )}

      {/* Status badge — hidden while editing */}
      {!editing && (
        <StatusBadge
          status={task.status}
          onChange={(next) => onStatusChange(task.id, next)}
          disabled={updating}
        />
      )}

      {/* Delete button — hidden while editing */}
      {!editing && (
        <button
          onClick={() => onDelete(task.id)}
          disabled={updating}
          className="opacity-100 sm:opacity-40 sm:group-hover:opacity-100 text-ink-faint hover:text-status-suspended transition-all disabled:opacity-20 flex-shrink-0"
          title="Eliminar tarea"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <line x1="2" y1="2" x2="12" y2="12" />
            <line x1="12" y1="2" x2="2" y2="12" />
          </svg>
        </button>
      )}
    </div>
  )
}
