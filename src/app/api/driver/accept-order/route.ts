import { NextResponse } from "next/server"
import { query } from "@/lib/db"
import { cookies } from "next/headers"
import { verifyJWT } from "@/lib/jwt"

export async function POST(req: Request) {
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
    const { orderId } = await req.json()

    // Update order with driver information and change status
    const result = await query(
      `UPDATE orders 
       SET driver_id = $1, order_status = 'on route' 
       WHERE order_id = $2 AND order_status = 'pending' 
       RETURNING order_id, pickup_location, dropoff_location, price`,
      [driverId, orderId],
    )

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Order not found or already accepted" }, { status: 404 })
    }

    // Get full order details including location names
    const orderDetails = await query(
      `SELECT o.*, 
              pl.name as pickup_address, 
              dl.name as dropoff_address,
              d.driver_username,
              d.phone_number as driver_phone
       FROM orders o
       LEFT JOIN locations pl ON o.pickup_location = pl.location_id
       LEFT JOIN locations dl ON o.dropoff_location = dl.location_id
       LEFT JOIN drivers d ON o.driver_id = d.driver_id
       WHERE o.order_id = $1`,
      [orderId],
    )

    return NextResponse.json({
      message: "Order accepted successfully",
      order: orderDetails.rows[0],
    })
  } catch (error) {
    console.error("Error accepting order:", error)
    return NextResponse.json({ error: "Failed to accept order" }, { status: 500 })
  }
}

