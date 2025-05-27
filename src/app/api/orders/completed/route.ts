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

    const customer_id = verified.id

    const result = await query(
      `SELECT 
        o.*,
        pl.name as pickup_address,
        dl.name as dropoff_address,
        d.driver_username,
        d.phone_number as driver_phone
      FROM orders o
      LEFT JOIN locations pl ON o.pickup_location = pl.location_id
      LEFT JOIN locations dl ON o.dropoff_location = dl.location_id
      LEFT JOIN drivers d ON o.driver_id = d.driver_id
      WHERE o.customer_id = $1 
      AND o.order_status = 'delivered' 
      AND o.payment = 'paid'
      ORDER BY o.order_date DESC`,
      [customer_id],
    )

    return NextResponse.json(result.rows)
  } catch (error) {
    console.error("Error fetching completed orders:", error)
    return NextResponse.json({ error: "Failed to fetch completed orders" }, { status: 500 })
  }
}

