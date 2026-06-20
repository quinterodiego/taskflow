export type TaskStatus = "pendiente" | "finalizado" | "suspendido"

export type Filter = "todas" | TaskStatus

export interface Task {
  id: string
  title: string
  status: TaskStatus
  priority: number // row order in sheet
  createdAt: string
}
