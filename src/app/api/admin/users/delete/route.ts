import { NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function POST(req: Request) {
  try {
    const { userId } = await req.json()

    // First delete related records from locations table
    await query("DELETE FROM locations WHERE customer_id = $1", [userId])

    // Then delete from customers table
    await query("DELETE FROM customers WHERE customer_id = $1", [userId])

    return NextResponse.json({
      message: "User deleted successfully",
    })
  } catch (error) {
    console.error("User deletion error:", error)
    return NextResponse.json({ error: "Error deleting user" }, { status: 500 })
  }
}

