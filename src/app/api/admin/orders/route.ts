import { NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function GET() {
  try {
    const result = await query(
      `SELECT 
        o.*,
        c.name as customer_name,
        c.phone_number as customer_phone,
        d.driver_username,
        d.phone_number as driver_phone,
        pl.name as pickup_address,
        dl.name as dropoff_address
      FROM orders o
      LEFT JOIN customers c ON o.customer_id = c.customer_id
      LEFT JOIN drivers d ON o.driver_id = d.driver_id
      LEFT JOIN locations pl ON o.pickup_location = pl.location_id
      LEFT JOIN locations dl ON o.dropoff_location = dl.location_id
      ORDER BY o.order_date DESC`,
    )

    return NextResponse.json(result.rows)
  } catch (error) {
    console.error("Error fetching orders:", error)
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 })
  }
}

