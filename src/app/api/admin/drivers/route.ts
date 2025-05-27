import { NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function GET() {
  try {
    const result = await query(
      `SELECT 
        d.driver_id,
        d.driver_username,
        d.email,
        d.phone_number,
        d.status,
        d.driver_license,
        v.vehicle_type,
        v.license_plate,
        v.experience
      FROM drivers d
      LEFT JOIN vehicles v ON d.driver_id = v.driver_id
      ORDER BY 
        CASE 
          WHEN d.status = 'pending' THEN 0 
          ELSE 1 
        END,
        d.driver_id DESC`,
    )

    return NextResponse.json(result.rows)
  } catch (error) {
    console.error("Error fetching drivers:", error)
    return NextResponse.json({ error: "Failed to fetch drivers" }, { status: 500 })
  }
}

