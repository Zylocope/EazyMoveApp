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

    const customer_id = verified.id
    const { orderId } = await req.json()

    // First check the order status
    const orderCheck = await query("SELECT order_status FROM orders WHERE order_id = $1 AND customer_id = $2", [
      orderId,
      customer_id,
    ])

    if (orderCheck.rows.length === 0) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    const orderStatus = orderCheck.rows[0].order_status.toLowerCase()

    // Only allow cancellation for pending or on route orders
    if (orderStatus === "pending") {
      // Delete the order if it's pending
      await query("DELETE FROM orders WHERE order_id = $1", [orderId])
    } else if (orderStatus === "on route") {
      // Update status to cancelled if it's on route
      await query("UPDATE orders SET order_status = 'cancelled' WHERE order_id = $1", [orderId])
    } else {
      return NextResponse.json(
        {
          error: "Order cannot be cancelled in its current status",
        },
        { status: 400 },
      )
    }

    return NextResponse.json({ message: "Order cancelled successfully" })
  } catch (error) {
    console.error("Error cancelling order:", error)
    return NextResponse.json({ error: "Failed to cancel order" }, { status: 500 })
  }
}

