"use client"

import { useState, useRef, useEffect } from "react"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Task, TaskStatus } from "@/types"
import StatusBadge from "./StatusBadge"


function formatDueDate(iso: string): { text: string; color: string } {
  const due = new Date(iso)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  due.setHours(0, 0, 0, 0)
  const diff = Math.round((due.getTime() - today.getTime()) / 86_400_000)

  const DAYS = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"]

  if (diff === -1) return { text: "venció ayer", color: "text-status-suspended" }
  if (diff >= -6) return { text: `venció el ${DAYS[due.getDay()]}`, color: "text-status-suspended" }
  if (diff < -6) return { text: `venció el ${due.toLocaleDateString("es-AR", { day: "numeric", month: "short" })}`, color: "text-status-suspended" }
  if (diff === 0) return { text: "vence hoy", color: "text-accent" }
  if (diff <= 6) return { text: DAYS[due.getDay()], color: "text-status-done" }
  return {
    text: due.toLocaleDateString("es-AR", { day: "numeric", month: "short" }),
    color: "text-status-done",
  }
}

interface Props {
  task: Task
  onStatusChange: (id: string, status: TaskStatus) => void
  onDelete: (id: string) => void
  onTitleChange: (id: string, title: string) => void
  onDueDateChange: (id: string, dueDate: string) => void
  updating: boolean
}

export default function TaskItem({
  task,
  onStatusChange,
  onDelete,
  onTitleChange,
  onDueDateChange,
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

  const [editingDue, setEditingDue] = useState(false)
  const dueDateInputRef = useRef<HTMLInputElement>(null)

  const [swipeX, setSwipeX] = useState(0)
  const touchStartRef = useRef<{ x: number; y: number } | null>(null)
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (editing) editInputRef.current?.focus()
  }, [editing])

  useEffect(() => {
    if (editingDue) dueDateInputRef.current?.showPicker?.()
  }, [editingDue])

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

  const handleDueSave = (value: string) => {
    setEditingDue(false)
    if (value !== (task.dueDate ?? "")) {
      onDueDateChange(task.id, value)
    }
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

  const due = task.dueDate ? formatDueDate(task.dueDate) : null

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

      {/* Title + meta */}
      <div className="flex-1 min-w-0 flex flex-col gap-0.5">
        {editing ? (
          <input
            ref={editInputRef}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={handleTitleSave}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleTitleSave()
              if (e.key === "Escape") { setEditValue(task.title); setEditing(false) }
            }}
            className="bg-transparent text-ink text-sm outline-none border-b border-accent/50 min-w-0 font-sans pb-px"
          />
        ) : (
          <span
            onDoubleClick={() => !updating && setEditing(true)}
            onTouchStart={() => {
              if (updating) return
              longPressTimer.current = setTimeout(() => setEditing(true), 500)
            }}
            onTouchMove={() => {
              if (longPressTimer.current) clearTimeout(longPressTimer.current)
            }}
            onTouchEnd={() => {
              if (longPressTimer.current) clearTimeout(longPressTimer.current)
            }}
            title="Doble click para editar"
            className={`
              text-sm transition-all duration-300 truncate cursor-default select-none
              ${isStruck ? "line-through text-ink-faint" : "text-ink"}
            `}
          >
            {task.title}
          </span>
        )}

        {/* Due date / created date */}
        <div className="flex items-center gap-1">
          {editingDue ? (
            <input
              ref={dueDateInputRef}
              type="date"
              defaultValue={task.dueDate ?? ""}
              onBlur={(e) => handleDueSave(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleDueSave((e.target as HTMLInputElement).value)
                if (e.key === "Escape") setEditingDue(false)
              }}
              className="bg-transparent text-xs font-mono text-ink outline-none"
            />
          ) : due ? (
            <button
              onClick={() => !updating && setEditingDue(true)}
              title="Click para cambiar fecha"
              className={`text-xs font-mono transition-colors hover:opacity-80 ${due.color}`}
            >
              {due.text}
            </button>
          ) : (
            <button
              onClick={() => !updating && setEditingDue(true)}
              title="Agregar fecha de vencimiento"
              className="flex items-center gap-1.5 text-ink-faint hover:text-ink-muted transition-colors opacity-0 group-hover:opacity-100 text-xs font-mono"
            >
              <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="1" y="2.5" width="12" height="11" rx="1.5" />
                <line x1="1" y1="5.5" x2="13" y2="5.5" />
                <line x1="4" y1="1" x2="4" y2="4" />
                <line x1="10" y1="1" x2="10" y2="4" />
              </svg>
              vto
            </button>
          )}
        </div>
      </div>

      {/* Status badge */}
      {!editing && (
        <StatusBadge
          status={task.status}
          onChange={(next) => onStatusChange(task.id, next)}
          disabled={updating}
        />
      )}

      {/* Delete button */}
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
