"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2 } from "lucide-react"
import { useEffect } from "react"

type Order = {
  order_id: number
  customer_name: string
  customer_phone: string
  driver_username: string | null
  driver_phone: string | null
  pickup_address: string
  dropoff_address: string
  vehicle_type: string
  order_status: string
  payment: string
  price: number
  order_date: string
}

export default function AdminOrderHistory() {
  const [orders, setOrders] = useState<Order[]>([])
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [filterStatus, setFilterStatus] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch("/api/admin/orders")
        if (!response.ok) throw new Error("Failed to fetch orders")
        const data = await response.json()
        setOrders(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load orders")
      } finally {
        setIsLoading(false)
      }
    }

    fetchOrders()
  }, [])

  const filteredOrders = orders.filter(
    (order) =>
      (filterStatus === "all" || order.order_status.toLowerCase() === filterStatus.toLowerCase()) &&
      (order.order_id.toString().includes(searchTerm) ||
        order.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.driver_username?.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  const getStatusBadgeColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "delivered":
        return "bg-green-500"
      case "on route":
        return "bg-yellow-500"
      case "package collected":
        return "bg-blue-500"
      case "cancelled":
        return "bg-red-500"
      default:
        return "bg-gray-500"
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
      <Alert variant="destructive" className="m-4">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Order History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="on route">On Route</SelectItem>
                  <SelectItem value="package collected">Package Collected</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <Input
                placeholder="Search by Order ID, Customer, or Driver"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Driver</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order) => (
                  <TableRow key={order.order_id}>
                    <TableCell className="font-medium">#{order.order_id}</TableCell>
                    <TableCell>{new Date(order.order_date).toLocaleDateString()}</TableCell>
                    <TableCell>{order.customer_name}</TableCell>
                    <TableCell>{order.driver_username || "Not Assigned"}</TableCell>
                    <TableCell>
                      <Badge className={getStatusBadgeColor(order.order_status)}>{order.order_status}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={order.payment === "paid" ? "default" : "secondary"}>{order.payment}</Badge>
                    </TableCell>
                    <TableCell className="text-right">${order.price}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" onClick={() => setSelectedOrder(order)}>
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredOrders.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-4 text-muted-foreground">
                      No orders found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="grid gap-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Order Information</h3>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <p className="text-muted-foreground">Order ID:</p>
                      <p>#{selectedOrder.order_id}</p>
                      <p className="text-muted-foreground">Date:</p>
                      <p>{new Date(selectedOrder.order_date).toLocaleString()}</p>
                      <p className="text-muted-foreground">Vehicle Type:</p>
                      <p>{selectedOrder.vehicle_type}</p>
                      <p className="text-muted-foreground">Status:</p>
                      <Badge className={getStatusBadgeColor(selectedOrder.order_status)}>
                        {selectedOrder.order_status}
                      </Badge>
                      <p className="text-muted-foreground">Payment:</p>
                      <Badge variant={selectedOrder.payment === "paid" ? "default" : "secondary"}>
                        {selectedOrder.payment}
                      </Badge>
                      <p className="text-muted-foreground">Price:</p>
                      <p className="font-semibold">${selectedOrder.price}</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">Customer Information</h3>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <p className="text-muted-foreground">Name:</p>
                      <p>{selectedOrder.customer_name}</p>
                      <p className="text-muted-foreground">Phone:</p>
                      <p>{selectedOrder.customer_phone}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Driver Information</h3>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <p className="text-muted-foreground">Name:</p>
                      <p>{selectedOrder.driver_username || "Not Assigned"}</p>
                      <p className="text-muted-foreground">Phone:</p>
                      <p>{selectedOrder.driver_phone || "N/A"}</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">Location Details</h3>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <p className="text-muted-foreground">Pickup:</p>
                      <p>{selectedOrder.pickup_address}</p>
                      <p className="text-muted-foreground">Dropoff:</p>
                      <p>{selectedOrder.dropoff_address}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

