"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { Task, TaskStatus, Filter } from "@/types"
import TaskInput from "@/components/TaskInput"
import TaskList from "@/components/TaskList"
import FilterBar from "@/components/FilterBar"
import ThemeToggle from "@/components/ThemeToggle"

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [filter, setFilter] = useState<Filter>("todas")
  const [loading, setLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const [undoTask, setUndoTask] = useState<Task | null>(null)
  const undoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const fetchTasks = useCallback(async () => {
    try {
      const res = await fetch("/api/tasks")
      if (!res.ok) throw new Error("Error al cargar tareas")
      const data = await res.json()
      setTasks(data)
      setError(null)
    } catch {
      setError("No se pudieron cargar las tareas. Revisá la configuración.")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchTasks()
  }, [fetchTasks])

  // Auto-dismiss error after 5s
  useEffect(() => {
    if (!error) return
    const t = setTimeout(() => setError(null), 5000)
    return () => clearTimeout(t)
  }, [error])

  // Auto-dismiss toast after 2s
  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 2000)
    return () => clearTimeout(t)
  }, [toast])

  // Pending count in tab title
  useEffect(() => {
    const count = tasks.filter((t) => t.status === "pendiente").length
    document.title = count > 0 ? `(${count}) TaskFlow` : "TaskFlow"
  }, [tasks])

  const handleAdd = async (title: string, dueDate?: string) => {
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, dueDate }),
      })
      if (!res.ok) throw new Error()
      const task = await res.json()
      setTasks((prev) => [...prev, task])
      setToast("Tarea agregada")
    } catch {
      setError("No se pudo agregar la tarea.")
    }
  }

  const handleStatusChange = async (id: string, status: TaskStatus) => {
    setUpdatingId(id)
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status } : t)))
    try {
      const res = await fetch(`/api/tasks/${encodeURIComponent(id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })
      if (!res.ok) throw new Error()
    } catch {
      fetchTasks()
      setError("No se pudo actualizar el estado.")
    } finally {
      setUpdatingId(null)
    }
  }

  const handleDueDateChange = async (id: string, dueDate: string) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, dueDate: dueDate || undefined } : t)))
    try {
      const res = await fetch(`/api/tasks/${encodeURIComponent(id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dueDate }),
      })
      if (!res.ok) throw new Error()
    } catch {
      fetchTasks()
      setError("No se pudo actualizar la fecha.")
    }
  }

  const handleTitleChange = async (id: string, title: string) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, title } : t)))
    try {
      const res = await fetch(`/api/tasks/${encodeURIComponent(id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      })
      if (!res.ok) throw new Error()
    } catch {
      fetchTasks()
      setError("No se pudo actualizar el título.")
    }
  }

  const handleDelete = (id: string) => {
    const task = tasks.find((t) => t.id === id)
    if (!task) return

    if (undoTimerRef.current) clearTimeout(undoTimerRef.current)

    setTasks((prev) => prev.filter((t) => t.id !== id))
    setUndoTask(task)

    undoTimerRef.current = setTimeout(async () => {
      setUndoTask(null)
      try {
        const res = await fetch(`/api/tasks/${encodeURIComponent(id)}`, {
          method: "DELETE",
        })
        if (!res.ok) throw new Error()
      } catch {
        fetchTasks()
        setError("No se pudo eliminar la tarea.")
      }
    }, 4000)
  }

  const handleUndoDelete = () => {
    if (undoTimerRef.current) clearTimeout(undoTimerRef.current)
    if (undoTask) {
      setTasks((prev) =>
        [...prev, undoTask].sort((a, b) => a.priority - b.priority)
      )
      setUndoTask(null)
    }
  }

  const handleReorder = async (reordered: Task[]) => {
    setTasks(reordered)
    try {
      await fetch("/api/tasks/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderedIds: reordered.map((t) => t.id) }),
      })
    } catch {
      fetchTasks()
    }
  }

  const filtered =
    filter === "todas" ? tasks : tasks.filter((t) => t.status === filter)

  const counts = {
    todas: tasks.length,
    pendiente: tasks.filter((t) => t.status === "pendiente").length,
    finalizado: tasks.filter((t) => t.status === "finalizado").length,
    suspendido: tasks.filter((t) => t.status === "suspendido").length,
  }

  return (
    <main className="min-h-screen bg-surface-0 px-4 py-6 sm:py-12">
      <div className="max-w-xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-ink font-mono text-lg font-medium tracking-tight">
              taskflow
              <span className="text-accent">.</span>
            </h1>
            <p className="text-ink-faint text-xs font-mono mt-0.5">
              {counts.pendiente} pendiente{counts.pendiente !== 1 ? "s" : ""}
            </p>
          </div>
          <ThemeToggle />
        </div>

        {/* Toast de éxito */}
        {toast && (
          <div className="mb-4 px-4 py-2.5 rounded-lg bg-accent/10 border border-accent/20 text-accent text-xs font-mono animate-fade-in">
            {toast}
          </div>
        )}

        {/* Error banner */}
        {error && (
          <div className="mb-4 px-4 py-2.5 rounded-lg bg-status-suspended/10 border border-status-suspended/20 text-status-suspended text-xs font-mono flex items-center justify-between animate-fade-in">
            {error}
            <button
              onClick={() => setError(null)}
              className="ml-4 opacity-60 hover:opacity-100"
            >
              ×
            </button>
          </div>
        )}

        {/* Undo banner */}
        {undoTask && (
          <div className="mb-4 px-4 py-2.5 rounded-lg bg-surface-2 border border-surface-4 text-ink-muted text-xs font-mono flex items-center justify-between animate-fade-in">
            <span>Tarea eliminada</span>
            <button
              onClick={handleUndoDelete}
              className="ml-4 text-accent hover:opacity-80 font-medium"
            >
              Deshacer
            </button>
          </div>
        )}

        {/* Quick add */}
        <div className="mb-6">
          <TaskInput onAdd={handleAdd} />
        </div>

        {/* Filters */}
        <div className="mb-4 -mx-2">
          <FilterBar active={filter} counts={counts} onChange={setFilter} />
        </div>

        {/* Task list */}
        {loading ? (
          <div className="flex items-center justify-center py-20 text-ink-faint">
            <div className="w-4 h-4 border border-surface-4 border-t-accent rounded-full animate-spin mr-3" />
            <span className="text-sm font-mono">cargando…</span>
          </div>
        ) : (
          <TaskList
            tasks={filtered}
            filter={filter}
            onReorder={handleReorder}
            onStatusChange={handleStatusChange}
            onDelete={handleDelete}
            onTitleChange={handleTitleChange}
            onDueDateChange={handleDueDateChange}
            updatingId={updatingId}
          />
        )}
      </div>
    </main>
  )
}
