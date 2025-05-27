import { Pool } from "pg"

// Create a new pool instance
const pool = new Pool({
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  host: process.env.POSTGRES_HOST,
  port: Number.parseInt(process.env.POSTGRES_PORT || "5432"),
  database: process.env.POSTGRES_DATABASE,
})

// Helper function to run queries
export async function query(text: string, params?: any[]) {
  const client = await pool.connect()
  try {
    const result = await client.query(text, params)
    return result
  } finally {
    client.release()
  }
}

// Export types for our database tables
export type Customer = {
  customer_id: number
  password: string
  name: string
  email: string
  phone_number: string
  status: string
}

export type Driver = {
  driver_id: number
  driver_username: string
  password: string
  email: string
  phone_number: string
  status: string
  driver_license: string
}

export type Order = {
  order_id: number
  customer_id: number
  driver_id: number | null
  pickup_location: number
  dropoff_location: number
  vehicle_type: string
  order_status: string
  price: number
  payment: string
}

export type Location = {
  location_id: number
  customer_id: number
  address: string
}

export type Vehicle = {
  vehicle_id: number
  driver_id: number
  vehicle_type: string
  license_plate: string
  experience: string
}

export type Admin = {
  admin_email: string
  password: string
}

