import { NextRequest, NextResponse } from "next/server"
import { updateTaskStatus, updateTaskTitle, updateTaskDueDate, deleteTask } from "@/lib/sheets"
import { TaskStatus } from "@/types"

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json()
    if (body.status !== undefined) {
      await updateTaskStatus(decodeURIComponent(params.id), body.status as TaskStatus)
    }
    if (body.title !== undefined) {
      await updateTaskTitle(decodeURIComponent(params.id), body.title as string)
    }
    if (body.dueDate !== undefined) {
      await updateTaskDueDate(decodeURIComponent(params.id), body.dueDate as string)
    }
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("PATCH /api/tasks/[id] error:", error)
    return NextResponse.json({ error: "Failed to update task" }, { status: 500 })
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await deleteTask(decodeURIComponent(params.id))
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("DELETE /api/tasks/[id] error:", error)
    return NextResponse.json({ error: "Failed to delete task" }, { status: 500 })
  }
}
