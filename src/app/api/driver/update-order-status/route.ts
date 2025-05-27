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
    const { orderId, status } = await req.json()

    // Verify the driver is assigned to this order
    const orderCheck = await query("SELECT order_status FROM orders WHERE order_id = $1 AND driver_id = $2", [
      orderId,
      driverId,
    ])

    if (orderCheck.rows.length === 0) {
      return NextResponse.json({ error: "Order not found or not assigned to this driver" }, { status: 404 })
    }

    // Update the order status
    const result = await query(
      `UPDATE orders 
       SET order_status = $1 
       WHERE order_id = $2 AND driver_id = $3
       RETURNING order_id, order_status`,
      [status, orderId, driverId],
    )

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Failed to update order status" }, { status: 500 })
    }

    return NextResponse.json({
      message: "Order status updated successfully",
      order: result.rows[0],
    })
  } catch (error) {
    console.error("Error updating order status:", error)
    return NextResponse.json({ error: "Failed to update order status" }, { status: 500 })
  }
}

