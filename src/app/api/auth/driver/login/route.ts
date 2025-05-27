import { NextResponse } from "next/server"
import { query } from "@/lib/db"
import { compare } from "bcryptjs"
import { signJWT } from "@/lib/jwt"
import { cookies } from "next/headers"

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json()

    // Get driver with status
    const result = await query(
      `SELECT d.*, v.vehicle_type 
       FROM drivers d
       LEFT JOIN vehicles v ON d.driver_id = v.driver_id
       WHERE d.email = $1`,
      [email],
    )

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    const driver = result.rows[0]

    // Check driver status
    if (driver.status === "rejected") {
      return NextResponse.json({ error: "Your application has been rejected" }, { status: 403 })
    } else if (driver.status !== "approved") {
      return NextResponse.json({ error: "Your application is still pending approval" }, { status: 403 })
    }

    // Verify password
    const validPassword = await compare(password, driver.password)
    if (!validPassword) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    // Create JWT token
    const user = {
      id: driver.driver_id,
      name: driver.driver_username,
      email: driver.email,
      phone: driver.phone_number,
      role: "driver",
      vehicleType: driver.vehicle_type,
    }

    const token = signJWT(user)

    ;(await cookies()).set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 86400, // 24 hours
    })

    return NextResponse.json({
      message: "Login successful",
      user,
    })
  } catch (error) {
    console.error("Driver login error:", error)
    return NextResponse.json({ error: "Error during login" }, { status: 500 })
  }
}

