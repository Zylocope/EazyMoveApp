import { NextResponse } from "next/server"
import { query } from "@/lib/db"
import { hash } from "bcryptjs"

export async function POST(req: Request) {
  try {
    const { fullName, email, phoneNumber, licenseNumber, vehicleType, experience, password } = await req.json()

    // Validate required fields
    if (!fullName || !email || !phoneNumber || !licenseNumber || !vehicleType || !experience || !password) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 })
    }

    // Check if email already exists
    const existingDriver = await query("SELECT driver_id FROM DRIVERS WHERE email = $1", [email])
    if (existingDriver.rows.length > 0) {
      return NextResponse.json({ error: "Email already registered" }, { status: 400 })
    }

    // Hash the password
    const hashedPassword = await hash(password, 10)

    // Start a transaction
    await query("BEGIN")

    try {
      // Insert new driver with pending status
      const driverResult = await query(
        `INSERT INTO DRIVERS 
         (driver_username, email, password, phone_number, driver_license, status) 
         VALUES ($1, $2, $3, $4, $5, $6) 
         RETURNING driver_id`,
        [fullName, email, hashedPassword, phoneNumber, licenseNumber, "pending"],
      )

      const driverId = driverResult.rows[0].driver_id

      // Insert vehicle information
      await query(
        `INSERT INTO VEHICLES 
         (driver_id, vehicle_type, license_plate, experience) 
         VALUES ($1, $2, $3, $4)`,
        [driverId, vehicleType, licenseNumber, experience],
      )

      // Commit the transaction
      await query("COMMIT")

      return NextResponse.json({
        message: "Driver application submitted successfully",
        driverId: driverId,
      })
    } catch (error) {
      // Rollback in case of error
      await query("ROLLBACK")
      throw error
    }
  } catch (error) {
    console.error("Driver registration error:", error)
    return NextResponse.json(
      {
        error: "Error submitting driver application",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

