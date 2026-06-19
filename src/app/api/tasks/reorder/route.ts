import { NextRequest, NextResponse } from "next/server"
import { reorderTasks } from "@/lib/sheets"

export async function POST(req: NextRequest) {
  try {
    const { orderedIds } = await req.json()
    await reorderTasks(orderedIds)
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("POST /api/tasks/reorder error:", error)
    return NextResponse.json({ error: "Failed to reorder tasks" }, { status: 500 })
  }
}
