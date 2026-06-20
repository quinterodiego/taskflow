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
import { Task, TaskStatus, Filter } from "@/types"
import TaskItem from "./TaskItem"

const EMPTY_MESSAGES: Record<Filter, string> = {
  todas: "sin tareas aún",
  pendiente: "no hay tareas pendientes",
  finalizado: "no hay tareas finalizadas",
  suspendido: "no hay tareas suspendidas",
}

interface Props {
  tasks: Task[]
  filter: Filter
  onReorder: (tasks: Task[]) => void
  onStatusChange: (id: string, status: TaskStatus) => void
  onDelete: (id: string) => void
  onTitleChange: (id: string, title: string) => void
  onDueDateChange: (id: string, dueDate: string) => void
  updatingId: string | null
}

export default function TaskList({
  tasks,
  filter,
  onReorder,
  onStatusChange,
  onDelete,
  onTitleChange,
  onDueDateChange,
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
        <p className="text-sm font-mono">{EMPTY_MESSAGES[filter]}</p>
        {filter === "todas" && (
          <p className="text-xs font-mono mt-2 opacity-50">
            escribí algo arriba para empezar
          </p>
        )}
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
              onTitleChange={onTitleChange}
              onDueDateChange={onDueDateChange}
              updating={updatingId === task.id}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  )
}
