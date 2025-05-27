"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle2, AlertCircle } from "lucide-react"

export default function TestAuthPage() {
  const [authStatus, setAuthStatus] = useState<{
    success?: boolean
    message?: string
    user?: any
  }>({})

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth/test")
        const data = await response.json()

        if (response.ok) {
          setAuthStatus({
            success: true,
            message: data.message,
            user: data.user,
          })
        } else {
          setAuthStatus({
            success: false,
            message: data.error,
          })
        }
      } catch (error) {
        setAuthStatus({
          success: false,
          message: "Failed to check authentication",
        })
      }
    }

    checkAuth()
  }, [])

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>Authentication Test</CardTitle>
        </CardHeader>
        <CardContent>
          {authStatus.message && (
            <Alert variant={authStatus.success ? "default" : "destructive"}>
              {authStatus.success ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
              <AlertTitle>{authStatus.success ? "Success" : "Error"}</AlertTitle>
              <AlertDescription>
                {authStatus.message}
                {authStatus.user && (
                  <pre className="mt-2 bg-secondary p-2 rounded-md overflow-auto">
                    {JSON.stringify(authStatus.user, null, 2)}
                  </pre>
                )}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

