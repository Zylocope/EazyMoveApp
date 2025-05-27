import { query } from "./db"

export async function initializeDatabase() {
  try {
    // Create tables if they don't exist
    await query(`
      -- ADMINS table
      CREATE TABLE IF NOT EXISTS ADMINS (
        admin_email VARCHAR(255) PRIMARY KEY,
        password VARCHAR(255) NOT NULL
      );

      -- CUSTOMERS table
      CREATE TABLE IF NOT EXISTS CUSTOMERS (
        customer_id SERIAL PRIMARY KEY,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone_number VARCHAR(20) NOT NULL,
        status VARCHAR(20) NOT NULL
      );

      -- DRIVERS table
      CREATE TABLE IF NOT EXISTS DRIVERS (
        driver_id SERIAL PRIMARY KEY,
        driver_username VARCHAR(255) NOT NULL,
        password VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone_number VARCHAR(20) NOT NULL,
        status VARCHAR(20) NOT NULL,
        driver_license VARCHAR(20) NOT NULL
      );

      -- LOCATIONS table
      CREATE TABLE IF NOT EXISTS LOCATIONS (
        location_id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        latitude FLOAT NOT NULL,
        longitude FLOAT NOT NULL
      );

      -- ORDERS table
      CREATE TABLE IF NOT EXISTS ORDERS (
        order_id SERIAL PRIMARY KEY,
        customer_id INTEGER NOT NULL,
        driver_id INTEGER,
        pickup_location INTEGER NOT NULL,
        dropoff_location INTEGER NOT NULL,
        vehicle_type VARCHAR(50) NOT NULL,
        order_status VARCHAR(20) NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        payment VARCHAR(50) NOT NULL,
        order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        pickup_time TIMESTAMP,
        dropoff_time TIMESTAMP,
        FOREIGN KEY (customer_id) REFERENCES CUSTOMERS(customer_id),
        FOREIGN KEY (driver_id) REFERENCES DRIVERS(driver_id),
        FOREIGN KEY (pickup_location) REFERENCES LOCATIONS(location_id),
        FOREIGN KEY (dropoff_location) REFERENCES LOCATIONS(location_id)
      );

      -- VEHICLES table
      CREATE TABLE IF NOT EXISTS VEHICLES (
        vehicle_id SERIAL PRIMARY KEY,
        driver_id INTEGER NOT NULL,
        vehicle_type VARCHAR(50) NOT NULL,
        license_plate VARCHAR(20) NOT NULL,
        experience VARCHAR(20) NOT NULL,
        FOREIGN KEY (driver_id) REFERENCES DRIVERS(driver_id)
      );
    `)

    return { success: true, message: "Database initialized successfully" }
  } catch (error) {
    console.error("Error initializing database:", error)
    return {
      success: false,
      message: "Failed to initialize database",
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

