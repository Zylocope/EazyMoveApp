import { NextResponse } from "next/server"
import { verifyJWT } from "@/lib/jwt"
import { cookies } from "next/headers"
import { query } from "@/lib/db"

export async function GET() {
  try {
    const token = (await cookies()).get("auth-token")

    if (!token) {
      return NextResponse.json({ error: "No authentication token found" }, { status: 401 })
    }

    const verified = verifyJWT(token.value)
    if (!verified) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    // If it's a driver, fetch additional driver information
    if (verified.role === "driver") {
      const driverResult = await query(
        `SELECT d.driver_username as name, d.email, d.phone_number as phone, 
                d.driver_license, v.vehicle_type as vehicleType
         FROM drivers d
         LEFT JOIN vehicles v ON d.driver_id = v.driver_id
         WHERE d.driver_id = $1`,
        [verified.id],
      )

      if (driverResult.rows.length > 0) {
        const driver = driverResult.rows[0]
        return NextResponse.json({
          message: "Authentication successful",
          user: {
            ...verified,
            name: driver.name,
            email: driver.email,
            phone: driver.phone,
            driver_license: driver.driver_license,
            vehicleType: driver.vehicle_type,
          },
        })
      }
    }

    return NextResponse.json({
      message: "Authentication successful",
      user: verified,
    })
  } catch (error) {
    console.error("Auth test error:", error)
    return NextResponse.json({ error: "Authentication error" }, { status: 500 })
  }
}

