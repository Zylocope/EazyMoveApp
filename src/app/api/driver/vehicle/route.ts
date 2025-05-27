import { NextResponse } from "next/server"
import { query } from "@/lib/db"
import { cookies } from "next/headers"
import { verifyJWT } from "@/lib/jwt"

export async function PUT(req: Request) {
  try {
    const token = (await cookies()).get("auth-token")
    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const verified = verifyJWT(token.value)
    if (!verified || !verified.id) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const driverId = verified.id
    const { license_plate } = await req.json()

    if (!license_plate) {
      return NextResponse.json({ error: "License plate is required" }, { status: 400 })
    }

    const result = await query(
      `UPDATE vehicles 
       SET license_plate = $1 
       WHERE driver_id = $2 
       RETURNING license_plate`,
      [license_plate, driverId],
    )

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Failed to update vehicle information" }, { status: 500 })
    }

    return NextResponse.json({
      message: "Vehicle information updated successfully",
      vehicle: result.rows[0],
    })
  } catch (error) {
    console.error("Error updating vehicle information:", error)
    return NextResponse.json({ error: "Error updating vehicle information" }, { status: 500 })
  }
}

