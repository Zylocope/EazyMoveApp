import { NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function GET() {
  try {
    // Test the database connection
    const result = await query("SELECT NOW()")

    return NextResponse.json({
      message: "Database connection successful",
      timestamp: result.rows[0].now,
      dbConfig: {
        host: process.env.POSTGRES_HOST,
        database: process.env.POSTGRES_DATABASE,
        port: process.env.POSTGRES_PORT,
        user: process.env.POSTGRES_USER,
        // Don't expose the password
      },
    })
  } catch (error) {
    console.error("Database connection error:", error)
    return NextResponse.json(
      {
        error: "Database connection failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

