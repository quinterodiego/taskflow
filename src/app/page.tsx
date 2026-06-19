"use client"

import { useEffect, useState, useCallback } from "react"
import { Task, TaskStatus } from "@/types"
import TaskInput from "@/components/TaskInput"
import TaskList from "@/components/TaskList"
import FilterBar from "@/components/FilterBar"

type Filter = "todas" | TaskStatus

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [filter, setFilter] = useState<Filter>("todas")
  const [loading, setLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const fetchTasks = useCallback(async () => {
    try {
      const res = await fetch("/api/tasks")
      if (!res.ok) throw new Error("Error al cargar tareas")
      const data = await res.json()
      setTasks(data)
      setError(null)
    } catch (e) {
      setError("No se pudieron cargar las tareas. Revisá la configuración.")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchTasks()
  }, [fetchTasks])

  const handleAdd = async (title: string) => {
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      })
      if (!res.ok) throw new Error()
      const task = await res.json()
      setTasks((prev) => [...prev, task])
    } catch {
      setError("No se pudo agregar la tarea.")
    }
  }

  const handleStatusChange = async (id: string, status: TaskStatus) => {
    setUpdatingId(id)
    // Optimistic update
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status } : t))
    )
    try {
      const res = await fetch(`/api/tasks/${encodeURIComponent(id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })
      if (!res.ok) throw new Error()
    } catch {
      // Rollback
      fetchTasks()
      setError("No se pudo actualizar el estado.")
    } finally {
      setUpdatingId(null)
    }
  }

  const handleDelete = async (id: string) => {
    setUpdatingId(id)
    // Optimistic
    setTasks((prev) => prev.filter((t) => t.id !== id))
    try {
      const res = await fetch(`/api/tasks/${encodeURIComponent(id)}`, {
        method: "DELETE",
      })
      if (!res.ok) throw new Error()
    } catch {
      fetchTasks()
      setError("No se pudo eliminar la tarea.")
    } finally {
      setUpdatingId(null)
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
        <div className="mb-8">
          <h1 className="text-ink font-mono text-lg font-medium tracking-tight">
            taskflow
            <span className="text-accent">.</span>
          </h1>
          <p className="text-ink-faint text-xs font-mono mt-0.5">
            {counts.pendiente} pendiente{counts.pendiente !== 1 ? "s" : ""}
          </p>
        </div>

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
            <div className="w-4 h-4 border border-surface-4 border-t-ink-faint rounded-full animate-spin mr-3" />
            <span className="text-sm font-mono">cargando…</span>
          </div>
        ) : (
          <TaskList
            tasks={filtered}
            onReorder={handleReorder}
            onStatusChange={handleStatusChange}
            onDelete={handleDelete}
            updatingId={updatingId}
          />
        )}
      </div>
    </main>
  )
}
