import { NextResponse } from "next/server"
import { query } from "@/lib/db"
import { hash, compare } from "bcryptjs"
import { cookies } from "next/headers"
import { verifyJWT } from "@/lib/jwt"

export async function PUT(req: Request) {
  try {
    // Get user ID from JWT token
    const token = (await cookies()).get("auth-token")
    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const verified = verifyJWT(token.value)
    if (!verified || !verified.id) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const userId = verified.id
    const body = await req.json()

    // If updating password
    if (body.currentPassword && body.newPassword) {
      // First verify the user exists and get their current password
      const userResult = await query("SELECT password FROM customers WHERE customer_id = $1", [userId])

      if (!userResult.rows.length) {
        return NextResponse.json({ error: "User not found" }, { status: 404 })
      }

      // Verify current password
      const validPassword = await compare(body.currentPassword, userResult.rows[0].password)
      if (!validPassword) {
        return NextResponse.json({ error: "Current password is incorrect" }, { status: 401 })
      }

      // Update with new password
      const hashedPassword = await hash(body.newPassword, 10)
      await query("UPDATE customers SET password = $1 WHERE customer_id = $2", [hashedPassword, userId])

      return NextResponse.json({ message: "Password updated successfully" })
    }
    // If updating profile info
    else if (body.name || body.phone_number || body.email) {
      // Prevent email updates
      if (body.email) {
        return NextResponse.json({ error: "Email cannot be changed" }, { status: 400 })
      }
      // Verify user exists
      const userResult = await query("SELECT customer_id FROM customers WHERE customer_id = $1", [userId])

      if (!userResult.rows.length) {
        return NextResponse.json({ error: "User not found" }, { status: 404 })
      }

      // Validate required fields
      if (!body.name || !body.phone_number) {
        return NextResponse.json({ error: "Name and phone number are required" }, { status: 400 })
      }

      // Update profile information
      const result = await query(
        "UPDATE customers SET name = $1, phone_number = $2 WHERE customer_id = $3 RETURNING name, phone_number",
        [body.name, body.phone_number, userId],
      )

      if (result.rows.length === 0) {
        return NextResponse.json({ error: "Failed to update profile" }, { status: 500 })
      }

      return NextResponse.json({
        message: "Profile updated successfully",
        user: {
          name: result.rows[0].name,
          phone_number: result.rows[0].phone_number,
        },
      })
    } else {
      return NextResponse.json({ error: "No valid update parameters provided" }, { status: 400 })
    }
  } catch (error) {
    console.error("Profile update error:", error)
    return NextResponse.json(
      {
        error: "Error updating profile",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

