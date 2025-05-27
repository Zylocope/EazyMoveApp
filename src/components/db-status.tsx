"use client"

import { useEffect, useState } from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle2, XCircle, Loader2 } from "lucide-react"

export function DatabaseStatus() {
  const [status, setStatus] = useState<{
    connected: boolean
    message: string
    error?: string
  } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function checkConnection() {
      try {
        const response = await fetch("/api/db-status")
        const data = await response.json()
        setStatus(data)
      } catch (error) {
        setStatus({
          connected: false,
          message: "Failed to check database connection",
          error: error instanceof Error ? error.message : "Unknown error",
        })
      } finally {
        setLoading(false)
      }
    }

    checkConnection()
  }, [])

  if (loading) {
    return (
      <Alert>
        <Loader2 className="h-4 w-4 animate-spin" />
        <AlertTitle>Checking Database Connection</AlertTitle>
        <AlertDescription>Please wait while we verify the connection...</AlertDescription>
      </Alert>
    )
  }

  if (!status) return null

  return (
    <Alert variant={status.connected ? "default" : "destructive"}>
      {status.connected ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
      <AlertTitle>{status.connected ? "Connected" : "Connection Error"}</AlertTitle>
      <AlertDescription>
        {status.message}
        {status.error && (
          <div className="mt-2 text-sm">
            <strong>Error details:</strong> {status.error}
          </div>
        )}
      </AlertDescription>
    </Alert>
  )
}

