"use client"

import { useEffect, useState, useCallback } from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Loader2, CheckCircle2, XCircle, RefreshCw } from "lucide-react"

interface ConnectionStatus {
  status: "success" | "error"
  message: string
  error?: string
  timestamp: string
}

export function ConnectionTest() {
  const [status, setStatus] = useState<ConnectionStatus | null>(null)
  const [loading, setLoading] = useState(true)

  const checkConnection = useCallback(async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/test-connection", {
        // Add cache control headers to prevent caching
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      })

      // Check if response is ok before trying to parse JSON
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const contentType = response.headers.get("content-type")
      if (!contentType || !contentType.includes("application/json")) {
        throw new TypeError("Response is not JSON")
      }

      const data = await response.json()
      setStatus(data)
    } catch (error) {
      console.error("Connection test error:", error)
      setStatus({
        status: "error",
        message: "Failed to check connection",
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    checkConnection()
  }, [checkConnection])

  return (
    <div className="space-y-4">
      <Alert variant={status?.status === "success" ? "default" : "destructive"}>
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : status?.status === "success" ? (
          <CheckCircle2 className="h-4 w-4" />
        ) : (
          <XCircle className="h-4 w-4" />
        )}
        <AlertTitle>
          {loading ? "Checking Connection..." : status?.status === "success" ? "Connected" : "Connection Error"}
        </AlertTitle>
        <AlertDescription>
          <div>{status?.message}</div>
          {status?.error && (
            <div className="mt-2 text-sm">
              <strong>Error details:</strong> {status.error}
            </div>
          )}
          {status?.timestamp && (
            <div className="mt-2 text-sm text-muted-foreground">
              Last checked: {new Date(status.timestamp).toLocaleString()}
            </div>
          )}
        </AlertDescription>
      </Alert>
      <Button
        variant="outline"
        size="sm"
        onClick={checkConnection}
        disabled={loading}
        className="flex items-center gap-2"
      >
        <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        Test Connection
      </Button>
    </div>
  )
}

