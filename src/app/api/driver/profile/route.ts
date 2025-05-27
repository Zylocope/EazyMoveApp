import { NextResponse } from "next/server"
import { query } from "@/lib/db"
import { hash, compare } from "bcryptjs"
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

    // Get driver and vehicle information
    const result = await query(
      `SELECT d.*, v.vehicle_type, v.license_plate, v.experience 
       FROM DRIVERS d 
       LEFT JOIN VEHICLES v ON d.driver_id = v.driver_id 
       WHERE d.driver_id = $1`,
      [driverId],
    )

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Driver not found" }, { status: 404 })
    }

    const driver = result.rows[0]

    // Remove sensitive information
    delete driver.password

    return NextResponse.json(driver)
  } catch (error) {
    console.error("Error fetching driver profile:", error)
    return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 })
  }
}

export async function PUT(req: Request) {
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
    const body = await req.json()

    // If updating password
    if (body.currentPassword && body.newPassword) {
      // Verify current password
      const userResult = await query("SELECT password FROM DRIVERS WHERE driver_id = $1", [driverId])

      if (!userResult.rows.length) {
        return NextResponse.json({ error: "Driver not found" }, { status: 404 })
      }

      const validPassword = await compare(body.currentPassword, userResult.rows[0].password)
      if (!validPassword) {
        return NextResponse.json({ error: "Current password is incorrect" }, { status: 401 })
      }

      // Update with new password
      const hashedPassword = await hash(body.newPassword, 10)
      await query("UPDATE DRIVERS SET password = $1 WHERE driver_id = $2", [hashedPassword, driverId])

      return NextResponse.json({ message: "Password updated successfully" })
    }

    // Start transaction for profile/vehicle update
    await query("BEGIN")

    try {
      // If updating personal information
      if (body.personalInfo) {
        const { driver_username, phone_number, driver_license } = body.personalInfo

        if (!driver_username || !phone_number || !driver_license) {
          throw new Error("Missing required fields")
        }

        await query(
          `UPDATE DRIVERS 
           SET driver_username = $1, phone_number = $2, driver_license = $3 
           WHERE driver_id = $4`,
          [driver_username, phone_number, driver_license, driverId],
        )
      }

      // If updating vehicle information
      if (body.vehicleInfo) {
        const { vehicle_type, license_plate } = body.vehicleInfo

        if (!vehicle_type || !license_plate) {
          throw new Error("Missing required fields")
        }

        await query(
          `UPDATE VEHICLES 
           SET vehicle_type = $1, license_plate = $2 
           WHERE driver_id = $3`,
          [vehicle_type, license_plate, driverId],
        )
      }

      await query("COMMIT")

      // Fetch updated data
      const result = await query(
        `SELECT d.*, v.vehicle_type, v.license_plate, v.experience 
         FROM DRIVERS d 
         LEFT JOIN VEHICLES v ON d.driver_id = v.driver_id 
         WHERE d.driver_id = $1`,
        [driverId],
      )

      const updatedDriver = result.rows[0]
      delete updatedDriver.password

      return NextResponse.json({
        message: "Profile updated successfully",
        driver: updatedDriver,
      })
    } catch (error) {
      await query("ROLLBACK")
      throw error
    }
  } catch (error) {
    console.error("Error updating driver profile:", error)
    return NextResponse.json(
      {
        error: "Failed to update profile",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

