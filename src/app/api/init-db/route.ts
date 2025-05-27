import { NextResponse } from "next/server"
import { initializeDatabase } from "@/lib/init-db"

export async function POST() {
  try {
    const result = await initializeDatabase()

    if (result.success) {
      return NextResponse.json({
        message: result.message,
      })
    } else {
      return NextResponse.json(
        {
          error: result.message,
          details: result.error,
        },
        { status: 500 },
      )
    }
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to initialize database",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

