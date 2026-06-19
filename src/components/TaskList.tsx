"use client"

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core"
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable"
import { Task, TaskStatus } from "@/types"
import TaskItem from "./TaskItem"
import { useState } from "react"

interface Props {
  tasks: Task[]
  onReorder: (tasks: Task[]) => void
  onStatusChange: (id: string, status: TaskStatus) => void
  onDelete: (id: string) => void
  updatingId: string | null
}

export default function TaskList({
  tasks,
  onReorder,
  onStatusChange,
  onDelete,
  updatingId,
}: Props) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = tasks.findIndex((t) => t.id === active.id)
    const newIndex = tasks.findIndex((t) => t.id === over.id)
    const reordered = arrayMove(tasks, oldIndex, newIndex)
    onReorder(reordered)
  }

  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-ink-faint">
        <span className="text-4xl mb-4 opacity-30">○</span>
        <p className="text-sm font-mono">sin tareas</p>
      </div>
    )
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={tasks.map((t) => t.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="flex flex-col gap-1.5">
          {tasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              onStatusChange={onStatusChange}
              onDelete={onDelete}
              updating={updatingId === task.id}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  )
}
