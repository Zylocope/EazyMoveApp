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

    // Get the driver's current active order
    const result = await query(
      `SELECT o.*, 
              pl.name as pickup_address, 
              dl.name as dropoff_address,
              d.driver_username,
              d.phone_number as driver_phone
       FROM orders o
       LEFT JOIN locations pl ON o.pickup_location = pl.location_id
       LEFT JOIN locations dl ON o.dropoff_location = dl.location_id
       LEFT JOIN drivers d ON o.driver_id = d.driver_id
       WHERE o.driver_id = $1 
       AND o.order_status NOT IN ('delivered', 'cancelled')
       ORDER BY o.order_id DESC
       LIMIT 1`,
      [driverId],
    )

    if (result.rows.length === 0) {
      return NextResponse.json({ order: null })
    }

    return NextResponse.json({ order: result.rows[0] })
  } catch (error) {
    console.error("Error fetching current order:", error)
    return NextResponse.json({ error: "Failed to fetch current order" }, { status: 500 })
  }
}

