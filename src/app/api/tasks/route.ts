import { NextRequest, NextResponse } from "next/server"
import { getTasks, addTask, initSheet } from "@/lib/sheets"

export async function GET() {
  try {
    await initSheet()
    const tasks = await getTasks()
    return NextResponse.json(tasks)
  } catch (error) {
    console.error("GET /api/tasks error:", error)
    return NextResponse.json({ error: "Failed to fetch tasks" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { title } = await req.json()
    if (!title?.trim()) {
      return NextResponse.json({ error: "Title required" }, { status: 400 })
    }
    const task = await addTask(title.trim())
    return NextResponse.json(task)
  } catch (error) {
    console.error("POST /api/tasks error:", error)
    return NextResponse.json({ error: "Failed to add task" }, { status: 500 })
  }
}
