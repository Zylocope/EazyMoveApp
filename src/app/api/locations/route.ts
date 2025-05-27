import { NextResponse } from "next/server"
import { query } from "@/lib/db"

// GET locations for a customer
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const customerId = searchParams.get("customerId")

    if (!customerId) {
      return NextResponse.json({ error: "Customer ID is required" }, { status: 400 })
    }

    const result = await query("SELECT * FROM locations WHERE customer_id = $1", [customerId])

    return NextResponse.json(result.rows)
  } catch (error) {
    console.error("Error fetching locations:", error)
    return NextResponse.json({ error: "Error fetching locations" }, { status: 500 })
  }
}

// POST new location
export async function POST(req: Request) {
  try {
    const { name, latitude, longitude } = await req.json()

    const result = await query(
      "INSERT INTO locations (name, latitude, longitude) VALUES ($1, $2, $3) RETURNING location_id",
      [name, latitude, longitude],
    )

    return NextResponse.json({
      message: "Location added successfully",
      locationId: result.rows[0].location_id,
    })
  } catch (error) {
    console.error("Error adding location:", error)
    return NextResponse.json({ error: "Error adding location" }, { status: 500 })
  }
}

