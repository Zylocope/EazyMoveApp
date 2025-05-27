import { NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function POST(req: Request) {
  try {
    const { driverId } = await req.json()

    // First delete from vehicles table due to foreign key constraint
    await query("DELETE FROM vehicles WHERE driver_id = $1", [driverId])

    // Then delete from drivers table
    await query("DELETE FROM drivers WHERE driver_id = $1", [driverId])

    return NextResponse.json({
      message: "Driver deleted successfully",
    })
  } catch (error) {
    console.error("Driver deletion error:", error)
    return NextResponse.json({ error: "Error deleting driver" }, { status: 500 })
  }
}

