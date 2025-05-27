import { NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function POST(req: Request) {
  try {
    const { userId, status } = await req.json()

    await query("UPDATE customers SET status = $1 WHERE customer_id = $2", [status, userId])

    return NextResponse.json({
      message: `User ${status === "active" ? "activated" : "suspended"} successfully`,
    })
  } catch (error) {
    console.error("User status update error:", error)
    return NextResponse.json({ error: "Error updating user status" }, { status: 500 })
  }
}

