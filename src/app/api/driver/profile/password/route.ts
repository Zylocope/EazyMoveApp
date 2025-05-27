import { NextResponse } from "next/server"
import { query } from "@/lib/db"
import { hash, compare } from "bcryptjs"
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
    const { currentPassword, newPassword } = await req.json()

    // Get current password hash
    const result = await query("SELECT password FROM drivers WHERE driver_id = $1", [driverId])

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Driver not found" }, { status: 404 })
    }

    // Verify current password
    const validPassword = await compare(currentPassword, result.rows[0].password)
    if (!validPassword) {
      return NextResponse.json({ error: "Current password is incorrect" }, { status: 401 })
    }

    // Hash and update new password
    const hashedPassword = await hash(newPassword, 10)
    await query("UPDATE drivers SET password = $1 WHERE driver_id = $2", [hashedPassword, driverId])

    return NextResponse.json({ message: "Password updated successfully" })
  } catch (error) {
    console.error("Error updating password:", error)
    return NextResponse.json({ error: "Error updating password" }, { status: 500 })
  }
}

