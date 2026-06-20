import { google } from "googleapis"
import { Task, TaskStatus } from "@/types"

const SHEET_NAME = "Tasks"
const RANGE = `${SHEET_NAME}!A:E`

function getAuth() {
  const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON!)
  return new google.auth.GoogleAuth({
    credentials,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  })
}

function getSheets() {
  const auth = getAuth()
  return google.sheets({ version: "v4", auth })
}

function rowToTask(row: string[], index: number): Task {
  return {
    id: row[0] || "",
    title: row[1] || "",
    status: (row[2] as TaskStatus) || "pendiente",
    priority: index,
    createdAt: row[4] || "",
  }
}

export async function getTasks(): Promise<Task[]> {
  const sheets = getSheets()
  const spreadsheetId = process.env.SPREADSHEET_ID!

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: RANGE,
  })

  const rows = res.data.values || []
  // Skip header row
  return rows
    .slice(1)
    .filter((r) => r[0])
    .map((row, i) => rowToTask(row, i + 1))
}

export async function addTask(title: string): Promise<Task> {
  const sheets = getSheets()
  const spreadsheetId = process.env.SPREADSHEET_ID!

  const id = `task_${Date.now()}`
  const createdAt = new Date().toISOString()
  const status: TaskStatus = "pendiente"

  // Get current row count to set priority
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: RANGE,
  })
  const rowCount = (res.data.values || []).length
  const priority = rowCount // last position

  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: RANGE,
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values: [[id, title, status, priority, createdAt]],
    },
  })

  return { id, title, status, priority, createdAt }
}

export async function updateTaskStatus(
  id: string,
  status: TaskStatus
): Promise<void> {
  const sheets = getSheets()
  const spreadsheetId = process.env.SPREADSHEET_ID!

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: RANGE,
  })

  const rows = res.data.values || []
  const rowIndex = rows.findIndex((r) => r[0] === id)
  if (rowIndex === -1) throw new Error("Task not found")

  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `${SHEET_NAME}!C${rowIndex + 1}`,
    valueInputOption: "USER_ENTERED",
    requestBody: { values: [[status]] },
  })
}

export async function reorderTasks(orderedIds: string[]): Promise<void> {
  const sheets = getSheets()
  const spreadsheetId = process.env.SPREADSHEET_ID!

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: RANGE,
  })

  const rows = res.data.values || []
  const header = rows[0]
  const dataRows = rows.slice(1)

  // Reorder rows according to orderedIds
  const reordered = orderedIds
    .map((id) => dataRows.find((r) => r[0] === id))
    .filter(Boolean) as string[][]

  // Any rows not in the orderedIds go at the end
  const remaining = dataRows.filter((r) => !orderedIds.includes(r[0]))
  const newRows = [header, ...reordered, ...remaining]

  // Clear and rewrite
  await sheets.spreadsheets.values.clear({
    spreadsheetId,
    range: RANGE,
  })

  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: RANGE,
    valueInputOption: "USER_ENTERED",
    requestBody: { values: newRows },
  })
}

export async function updateTaskTitle(id: string, title: string): Promise<void> {
  const sheets = getSheets()
  const spreadsheetId = process.env.SPREADSHEET_ID!

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: RANGE,
  })

  const rows = res.data.values || []
  const rowIndex = rows.findIndex((r) => r[0] === id)
  if (rowIndex === -1) throw new Error("Task not found")

  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `${SHEET_NAME}!B${rowIndex + 1}`,
    valueInputOption: "USER_ENTERED",
    requestBody: { values: [[title]] },
  })
}

export async function deleteTask(id: string): Promise<void> {
  const sheets = getSheets()
  const spreadsheetId = process.env.SPREADSHEET_ID!

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: RANGE,
  })

  const rows = res.data.values || []
  const rowIndex = rows.findIndex((r) => r[0] === id)
  if (rowIndex === -1) throw new Error("Task not found")

  // Get the spreadsheet to find the sheetId
  const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId })
  const sheet = spreadsheet.data.sheets?.find(
    (s) => s.properties?.title === SHEET_NAME
  )
  const sheetId = sheet?.properties?.sheetId ?? 0

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: {
      requests: [
        {
          deleteDimension: {
            range: {
              sheetId,
              dimension: "ROWS",
              startIndex: rowIndex,
              endIndex: rowIndex + 1,
            },
          },
        },
      ],
    },
  })
}

export async function initSheet(): Promise<void> {
  const sheets = getSheets()
  const spreadsheetId = process.env.SPREADSHEET_ID!

  // Check if the "Tasks" sheet tab exists
  const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId })
  const existingSheet = spreadsheet.data.sheets?.find(
    (s) => s.properties?.title === SHEET_NAME
  )

  if (!existingSheet) {
    // Create the sheet tab
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: [{ addSheet: { properties: { title: SHEET_NAME } } }],
      },
    })
    // Write header row
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${SHEET_NAME}!A1:E1`,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [["id", "title", "status", "priority", "createdAt"]],
      },
    })
    return
  }

  // Sheet exists — ensure header row is present
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${SHEET_NAME}!A1:E1`,
  })
  const rows = res.data.values || []
  if (rows.length === 0) {
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${SHEET_NAME}!A1:E1`,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [["id", "title", "status", "priority", "createdAt"]],
      },
    })
  }
}
