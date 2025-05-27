import { NextResponse } from "next/server"
import { query } from "@/lib/db"
import { hash } from "bcryptjs"

export async function POST(req: Request) {
  try {
    const { name, email, password, phone_number } = await req.json()

    // Validate required fields
    if (!name || !email || !password || !phone_number) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 })
    }

    // Check if email already exists
    const existingUser = await query("SELECT customer_id FROM customers WHERE email = $1", [email])

    if (existingUser.rows.length > 0) {
      return NextResponse.json({ error: "Email already registered" }, { status: 400 })
    }

    // Hash the password
    const hashedPassword = await hash(password, 10)

    // Insert new customer
    const result = await query(
      "INSERT INTO customers (name, email, password, phone_number, status) VALUES ($1, $2, $3, $4, $5) RETURNING customer_id",
      [name, email, hashedPassword, phone_number, "active"],
    )

    return NextResponse.json({
      message: "User registered successfully",
      userId: result.rows[0].customer_id,
    })
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json(
      {
        error: "Error registering user",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

