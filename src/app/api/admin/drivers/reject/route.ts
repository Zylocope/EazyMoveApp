import { NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function POST(req: Request) {
  try {
    const { driverId } = await req.json()

    await query("UPDATE drivers SET status = 'rejected' WHERE driver_id = $1", [driverId])

    return NextResponse.json({
      message: "Driver application rejected successfully",
    })
  } catch (error) {
    console.error("Driver rejection error:", error)
    return NextResponse.json({ error: "Error rejecting driver" }, { status: 500 })
  }
}

