import { NextResponse } from "next/server"
import { query } from "@/lib/db"
import { verifyJWT } from "@/lib/jwt"
import { cookies } from "next/headers"

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

    const userId = verified.id

    // Get active orders
    const activeOrdersResult = await query(
      `SELECT o.*, 
        pl.name as pickup_address,
        dl.name as dropoff_address,
        d.driver_username, d.phone_number as driver_phone
      FROM orders o
      LEFT JOIN locations pl ON o.pickup_location = pl.location_id
      LEFT JOIN locations dl ON o.dropoff_location = dl.location_id
      LEFT JOIN drivers d ON o.driver_id = d.driver_id
      WHERE o.customer_id = $1 AND o.order_status NOT IN ('Delivered', 'cancelled')
      ORDER BY o.order_id DESC`,
      [userId],
    )

    // Get completed orders count
    const completedOrdersResult = await query(
      "SELECT COUNT(*) as completed_count FROM orders WHERE customer_id = $1 AND order_status = 'Delivered'",
      [userId],
    )

    return NextResponse.json({
      activeOrders: activeOrdersResult.rows,
      completedOrdersCount: Number.parseInt(completedOrdersResult.rows[0].completed_count),
    })
  } catch (error) {
    console.error("Error fetching dashboard stats:", error)
    return NextResponse.json({ error: "Failed to fetch dashboard statistics" }, { status: 500 })
  }
}

