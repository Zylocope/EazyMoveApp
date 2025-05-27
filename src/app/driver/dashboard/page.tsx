"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { EyeIcon, EyeOffIcon, Loader2 } from "lucide-react"

export default function DriverDashboard() {
  const [showEarnings, setShowEarnings] = useState(false)
  const [currentOrder, setCurrentOrder] = useState<any | null>(null)
  const [orderStatus, setOrderStatus] = useState<"accepted" | "package_collected" | null>(null)
  const [showAvailableOrders, setShowAvailableOrders] = useState(false)
  const [completedOrders, setCompletedOrders] = useState<any[]>([])
  const [isLoadingAvailable, setIsLoadingAvailable] = useState(false)
  const [isLoadingCurrent, setIsLoadingCurrent] = useState(true)
  const [isLoadingEarnings, setIsLoadingEarnings] = useState(true)
  const [availableOrders, setAvailableOrders] = useState<any[]>([])
  const [totalEarnings, setTotalEarnings] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)

  // Fetch current order and earnings on initial load
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // Fetch current order
        const orderResponse = await fetch("/api/driver/current-order")
        if (!orderResponse.ok) {
          throw new Error("Failed to fetch current order")
        }
        const orderData = await orderResponse.json()

        if (orderData.order) {
          setCurrentOrder(orderData.order)
          setOrderStatus(orderData.order.order_status === "package collected" ? "package_collected" : "accepted")
        }

        // Fetch earnings
        const earningsResponse = await fetch("/api/driver/earnings")
        if (!earningsResponse.ok) {
          throw new Error("Failed to fetch earnings")
        }
        const earningsData = await earningsResponse.json()
        setTotalEarnings(earningsData.earnings)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load data")
      } finally {
        setIsLoadingCurrent(false)
        setIsLoadingEarnings(false)
      }
    }

    fetchInitialData()
  }, [])

  const fetchAvailableOrders = async () => {
    setIsLoadingAvailable(true)
    try {
      const response = await fetch("/api/driver/available-orders")
      if (!response.ok) {
        throw new Error("Failed to fetch available orders")
      }
      const data = await response.json()
      setAvailableOrders(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load available orders")
    } finally {
      setIsLoadingAvailable(false)
    }
  }

  const handleAccept = async (order: any) => {
    try {
      const response = await fetch("/api/driver/accept-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ orderId: order.order_id }),
      })

      if (!response.ok) {
        throw new Error("Failed to accept order")
      }

      const data = await response.json()
      setCurrentOrder(data.order)
      setOrderStatus("accepted")
      setShowAvailableOrders(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to accept order")
    }
  }

  const handlePackageCollected = async () => {
    setIsUpdating(true)
    try {
      const response = await fetch("/api/driver/update-order-status", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderId: currentOrder.order_id,
          status: "package collected",
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to update order status")
      }

      setOrderStatus("package_collected")
      setCurrentOrder({ ...currentOrder, order_status: "package collected" })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update order status")
    } finally {
      setIsUpdating(false)
    }
  }

  const handleCompleteDelivery = async () => {
    setIsUpdating(true)
    try {
      const response = await fetch("/api/driver/update-order-status", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderId: currentOrder.order_id,
          status: "delivered",
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to complete delivery")
      }

      const newCompletedOrder = { ...currentOrder, earning: currentOrder.price }
      setCompletedOrders([newCompletedOrder, ...completedOrders])
      setCurrentOrder(null)
      setOrderStatus(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to complete delivery")
    } finally {
      setIsUpdating(false)
    }
  }

  if (isLoadingCurrent) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold mb-6">Driver Dashboard</h1>

      <div className="grid gap-6 md:grid-cols-2">
        {currentOrder ? (
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle>Current Order</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p>
                  <strong>Order ID:</strong> #{currentOrder.order_id}
                </p>
                <p>
                  <strong>From:</strong> {currentOrder.pickup_address}
                </p>
                <p>
                  <strong>To:</strong> {currentOrder.dropoff_address}
                </p>
                <p>
                  <strong>Price:</strong> ${currentOrder.price}
                </p>
                <div className="flex items-center gap-2">
                  <strong>Status:</strong>
                  <Badge
                    className={
                      orderStatus === "package_collected"
                        ? "bg-blue-500"
                        : currentOrder.order_status === "cancelled"
                          ? "bg-red-500"
                          : "bg-yellow-500"
                    }
                  >
                    {orderStatus === "package_collected"
                      ? "Package Collected"
                      : currentOrder.order_status === "cancelled"
                        ? "Cancelled by User"
                        : "On Route"}
                  </Badge>
                </div>
              </div>
              {orderStatus === "accepted" && currentOrder.order_status !== "cancelled" && (
                <Button className="mt-4 bg-blue-500 text-white" onClick={handlePackageCollected} disabled={isUpdating}>
                  {isUpdating ? "Updating..." : "Package Collected"}
                </Button>
              )}
              {orderStatus === "package_collected" && currentOrder.order_status !== "cancelled" && (
                <Button className="mt-4 bg-green-500 text-white" onClick={handleCompleteDelivery} disabled={isUpdating}>
                  {isUpdating ? "Completing..." : "Complete Delivery"}
                </Button>
              )}
              {currentOrder.order_status === "cancelled" && (
                <div className="mt-4">
                  <p className="text-red-500 mb-2">This order has been cancelled by the user</p>
                  <Button
                    className="bg-blue-500 text-white"
                    onClick={() => {
                      setCurrentOrder(null)
                      setOrderStatus(null)
                      setShowAvailableOrders(true)
                      fetchAvailableOrders()
                    }}
                  >
                    Find New Orders
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle>No Current Order</CardTitle>
            </CardHeader>
            <CardContent>
              <p>You have no order in progress.</p>
              <Button
                className="mt-4 bg-blue-500 text-white"
                onClick={() => {
                  setShowAvailableOrders(true)
                  fetchAvailableOrders()
                }}
              >
                Find Orders
              </Button>
            </CardContent>
          </Card>
        )}

        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              Total Earnings
              <Button variant="ghost" size="sm" onClick={() => setShowEarnings(!showEarnings)}>
                {showEarnings ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingEarnings ? (
              <div className="flex justify-center">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            ) : (
              <p className="text-3xl font-bold">{showEarnings ? `$${totalEarnings.toFixed(2)}` : "••••••"}</p>
            )}
          </CardContent>
        </Card>
      </div>

      {completedOrders.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Last Completed Order</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>From</TableHead>
                  <TableHead>To</TableHead>
                  <TableHead>Distance</TableHead>
                  <TableHead>Earning</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>#{completedOrders[0].id}</TableCell>
                  <TableCell>{completedOrders[0].from}</TableCell>
                  <TableCell>{completedOrders[0].to}</TableCell>
                  <TableCell>{completedOrders[0].distance}</TableCell>
                  <TableCell>{completedOrders[0].earning}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {showAvailableOrders && !currentOrder && (
        <Card>
          <CardHeader>
            <CardTitle>Available Orders</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingAvailable ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : availableOrders.length === 0 ? (
              <p className="text-center py-4 text-muted-foreground">No available orders found for your vehicle type</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>From</TableHead>
                    <TableHead>To</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {availableOrders.map((order) => (
                    <TableRow key={order.order_id}>
                      <TableCell>#{order.order_id}</TableCell>
                      <TableCell>{order.pickup_address}</TableCell>
                      <TableCell>{order.dropoff_address}</TableCell>
                      <TableCell>${order.price}</TableCell>
                      <TableCell>
                        <Button size="sm" onClick={() => handleAccept(order)}>
                          Accept
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

