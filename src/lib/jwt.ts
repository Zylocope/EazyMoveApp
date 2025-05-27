import jwt, { type JwtPayload } from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key" // In production, always use environment variable

// Define custom payload type
export interface CustomJwtPayload extends JwtPayload {
  id: string | number
  email: string
  role: "admin" | "customer" | "driver"
  status?: string
}

export function signJWT(payload: any) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "24h" })
}

export function verifyJWT(token: string): CustomJwtPayload | null {
  try {
    const verified = jwt.verify(token, JWT_SECRET) as CustomJwtPayload
    return verified
  } catch (error) {
    return null
  }
}

