import { NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function POST(req: Request) {
  try {
    const { driverId } = await req.json()

    await query("UPDATE drivers SET status = 'approved' WHERE driver_id = $1", [driverId])

    return NextResponse.json({
      message: "Driver approved successfully",
    })
  } catch (error) {
    console.error("Driver approval error:", error)
    return NextResponse.json({ error: "Error approving driver" }, { status: 500 })
  }
}

