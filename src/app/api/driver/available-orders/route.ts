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

    // First get the driver's vehicle type
    const driverResult = await query(
      `SELECT v.vehicle_type 
       FROM vehicles v 
       WHERE v.driver_id = $1`,
      [driverId],
    )

    if (driverResult.rows.length === 0) {
      return NextResponse.json({ error: "Driver vehicle information not found" }, { status: 404 })
    }

    const vehicleType = driverResult.rows[0].vehicle_type

    // Then get available orders matching the vehicle type
    const result = await query(
      `SELECT o.order_id, o.pickup_location, o.dropoff_location, o.price,
          pl.name as pickup_address, dl.name as dropoff_address
   FROM orders o
   LEFT JOIN locations pl ON o.pickup_location = pl.location_id
   LEFT JOIN locations dl ON o.dropoff_location = dl.location_id
   WHERE o.order_status = 'pending' 
   AND o.vehicle_type = $1
   AND o.driver_id IS NULL
   ORDER BY o.order_id DESC`,
      [vehicleType],
    )

    return NextResponse.json(result.rows)
  } catch (error) {
    console.error("Error fetching available orders:", error)
    return NextResponse.json({ error: "Failed to fetch available orders" }, { status: 500 })
  }
}

