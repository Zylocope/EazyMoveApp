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

    // Start transaction
    await query("BEGIN")

    try {
      // Get order details and verify ownership
      const orderResult = await query(
        `SELECT o.*, d.driver_id, d.earning 
         FROM orders o 
         LEFT JOIN drivers d ON o.driver_id = d.driver_id 
         WHERE o.order_id = $1 AND o.customer_id = $2`,
        [orderId, customer_id],
      )

      if (orderResult.rows.length === 0) {
        throw new Error("Order not found")
      }

      const order = orderResult.rows[0]

      if (order.payment === "paid") {
        throw new Error("Order is already paid")
      }

      if (order.order_status !== "delivered") {
        throw new Error("Order must be delivered before payment")
      }

      // Update order payment status
      await query("UPDATE orders SET payment = 'paid' WHERE order_id = $1", [orderId])

      // Update driver earnings
      if (order.driver_id) {
        const newEarnings = Number(order.earning || 0) + Number(order.price)
        await query("UPDATE drivers SET earning = $1 WHERE driver_id = $2", [newEarnings, order.driver_id])
      }

      await query("COMMIT")

      return NextResponse.json({
        message: "Payment processed successfully",
        order: {
          ...order,
          payment: "paid",
        },
      })
    } catch (error) {
      await query("ROLLBACK")
      throw error
    }
  } catch (error) {
    console.error("Payment processing error:", error)
    return NextResponse.json(
      {
        error: "Failed to process payment",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

