import { NextResponse } from "next/server"
import { query } from "@/lib/db"
import { cookies } from "next/headers"
import { verifyJWT } from "@/lib/jwt"

export async function GET() {
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

    const result = await query(
      `SELECT o.*, 
        pl.name as pickup_address,
        dl.name as dropoff_address,
        c.name as customer_name,
        c.phone_number as customer_phone
      FROM orders o
      LEFT JOIN locations pl ON o.pickup_location = pl.location_id
      LEFT JOIN locations dl ON o.dropoff_location = dl.location_id
      LEFT JOIN customers c ON o.customer_id = c.customer_id
      WHERE o.driver_id = $1 AND o.order_status = 'delivered'
      ORDER BY o.order_date DESC`,
      [driverId],
    )

    return NextResponse.json(result.rows)
  } catch (error) {
    console.error("Error fetching order history:", error)
    return NextResponse.json({ error: "Failed to fetch order history" }, { status: 500 })
  }
}

