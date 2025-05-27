"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, CheckCircle, AlertCircle, Trash2 } from "lucide-react"
import Link from "next/link"

type Order = {
  order_id: number
  pickup_address: string
  dropoff_address: string
  order_status: string
  payment: string
  price: number
  driver_username: string | null
  driver_phone: string | null
}

type DashboardStats = {
  activeOrders: Order[]
  completedOrdersCount: number
}

export default function UserDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/user/dashboard-stats")
      if (!response.ok) {
        throw new Error("Failed to fetch dashboard statistics")
      }
      const data = await response.json()
      setStats(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const handlePayment = async (orderId: number) => {
    setIsProcessing(true)
    try {
      const response = await fetch("/api/orders/payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ orderId }),
      })

      if (!response.ok) {
        throw new Error("Failed to process payment")
      }

      // Refresh the dashboard stats
      await fetchStats()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to process payment")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleCancelOrder = async (orderId: number) => {
    if (!confirm("Are you sure you want to cancel this order?")) {
      return
    }

    try {
      const response = await fetch("/api/orders/cancel", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ orderId }),
      })

      if (!response.ok) {
        throw new Error("Failed to cancel order")
      }

      await fetchStats()
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "on route":
        return "bg-yellow-500"
      case "package collected":
        return "bg-blue-500"
      case "delivered":
        return "bg-green-500"
      case "cancelled":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="flex gap-4">
            <Button asChild className="bg-red-500 text-white">
              <Link href="/user/orders/new">Create New Order</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Completed Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {stats?.activeOrders?.filter((order) => order.order_status === "delivered" && order.payment === "paid")
                .length || 0}
            </p>
            <Button asChild className="mt-4 bg-red-500 text-white w-full">
              <Link href="/user/orders/history">View History</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {stats?.activeOrders &&
        stats.activeOrders.filter((order) => !(order.order_status === "delivered" && order.payment === "paid")).length >
          0 && (
          <Card>
            <CardHeader>
              <CardTitle>Active Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.activeOrders
                  .filter((order) => !(order.order_status === "delivered" && order.payment === "paid"))
                  .map((order) => (
                    <div
                      key={order.order_id}
                      className="border rounded-lg p-4 space-y-2 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold">Order #{order.order_id}</p>
                          <p className="text-sm text-gray-600">From: {order.pickup_address}</p>
                          <p className="text-sm text-gray-600">To: {order.dropoff_address}</p>
                          {order.driver_username && (
                            <p className="text-sm text-gray-600">
                              Driver: {order.driver_username} ({order.driver_phone})
                            </p>
                          )}
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <Badge className={getStatusColor(order.order_status)}>{order.order_status}</Badge>
                          <p className="font-semibold">${order.price}</p>
                          {order.order_status === "delivered" && order.payment !== "paid" && (
                            <Button
                              className="mt-2 bg-green-500 hover:bg-green-600"
                              size="sm"
                              onClick={() => handlePayment(order.order_id)}
                              disabled={isProcessing}
                            >
                              {isProcessing ? "Processing..." : "Pay Now"}
                            </Button>
                          )}
                          {(order.order_status === "pending" || order.order_status === "on route") && (
                            <Button
                              variant="destructive"
                              size="sm"
                              className="mt-2"
                              onClick={() => handleCancelOrder(order.order_id)}
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              Cancel
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        )}
    </div>
  )
}

