import { NextResponse } from "next/server"
import { query } from "@/lib/db"
import { cookies } from "next/headers"
import { verifyJWT } from "@/lib/jwt"

// POST new order
export async function POST(req: Request) {
  try {
    // Get customer_id from JWT token
    const token = (await cookies()).get("auth-token")
    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const verified = verifyJWT(token.value)
    if (!verified || !verified.id) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const customer_id = verified.id
    const { pickup_location, dropoff_location, vehicle_type, price } = await req.json()

    // Validate required fields
    if (!pickup_location || !dropoff_location || !vehicle_type || !price) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 })
    }

    const result = await query(
      `INSERT INTO orders 
        (customer_id, pickup_location, dropoff_location, vehicle_type, 
         order_status, price, payment, driver_id, order_date)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP)
      RETURNING order_id`,
      [
        customer_id,
        pickup_location,
        dropoff_location,
        vehicle_type,
        "pending", // Initial order status
        price,
        "unpaid", // Initial payment status
        null, // No driver assigned yet
      ],
    )

    return NextResponse.json({
      message: "Order created successfully",
      orderId: result.rows[0].order_id,
    })
  } catch (error) {
    console.error("Error creating order:", error)
    return NextResponse.json({ error: "Error creating order" }, { status: 500 })
  }
}

// GET all orders for a customer
export async function GET(req: Request) {
  try {
    // Get customer_id from JWT token
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
      `SELECT o.*, 
        pl.name as pickup_address,
        dl.name as dropoff_address,
        d.driver_username, d.phone_number as driver_phone
      FROM orders o
      LEFT JOIN locations pl ON o.pickup_location = pl.location_id
      LEFT JOIN locations dl ON o.dropoff_location = dl.location_id
      LEFT JOIN drivers d ON o.driver_id = d.driver_id
      WHERE o.customer_id = $1
      ORDER BY o.order_id DESC`,
      [customer_id],
    )

    return NextResponse.json(result.rows)
  } catch (error) {
    console.error("Error fetching orders:", error)
    return NextResponse.json({ error: "Error fetching orders" }, { status: 500 })
  }
}

