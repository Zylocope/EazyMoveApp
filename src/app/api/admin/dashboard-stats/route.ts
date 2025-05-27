import { NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function GET() {
  try {
    // Get total users (excluding admin)
    const usersResult = await query("SELECT COUNT(*) as total_users FROM customers")

    // Get active drivers (only approved ones)
    const driversResult = await query("SELECT COUNT(*) as active_drivers FROM drivers WHERE status = 'approved'")

    // Get pending orders
    const ordersResult = await query("SELECT COUNT(*) as pending_orders FROM orders WHERE order_status = 'pending'")

    return NextResponse.json({
      totalUsers: Number(usersResult.rows[0].total_users),
      activeDrivers: Number(driversResult.rows[0].active_drivers),
      pendingOrders: Number(ordersResult.rows[0].pending_orders),
    })
  } catch (error) {
    console.error("Error fetching dashboard stats:", error)
    return NextResponse.json({ error: "Failed to fetch dashboard statistics" }, { status: 500 })
  }
}

