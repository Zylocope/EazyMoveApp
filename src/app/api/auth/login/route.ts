import { NextResponse } from "next/server"
import { query } from "@/lib/db"
import { compare } from "bcryptjs"
import { signJWT } from "@/lib/jwt"
import { cookies } from "next/headers"

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json()

    // First check if it's an admin login
    if (email === "Zyne@eazymove.com") {
      const adminResult = await query("SELECT * FROM admins WHERE admin_email = $1", [email])

      if (adminResult.rows.length > 0) {
        // For the specified admin account, do a direct comparison since we know the password
        if (password === "zyne") {
          const admin = {
            id: "admin",
            email: email,
            role: "admin",
          }

          const token = signJWT(admin)

          ;(await cookies()).set("auth-token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 86400, // 24 hours
          })

          return NextResponse.json({
            message: "Login successful",
            user: {
              id: "admin",
              email: email,
              role: "admin",
            },
          })
        }
      }
    }

    // If not admin or admin auth failed, check customer login
    const result = await query(
      "SELECT customer_id, password, name, phone_number, status FROM customers WHERE email = $1",
      [email],
    )

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    // Check if user is suspended
    if (result.rows[0].status === "suspended") {
      return NextResponse.json({ error: "Your account has been suspended" }, { status: 403 })
    }

    // Verify customer password
    const validPassword = await compare(password, result.rows[0].password)

    if (!validPassword) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    // Create JWT token for customer
    const user = {
      id: result.rows[0].customer_id,
      name: result.rows[0].name,
      email: email,
      phone: result.rows[0].phone_number,
      role: "customer",
      status: result.rows[0].status,
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
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "Error during login" }, { status: 500 })
  }
}

