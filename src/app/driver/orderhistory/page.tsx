"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Loader2 } from "lucide-react"

type Order = {
  order_id: number
  pickup_address: string
  dropoff_address: string
  customer_name: string
  customer_phone: string
  order_status: string
  payment: string
  price: number
  order_date: string
  vehicle_type: string
}

export default function DriverOrderHistory() {
  const [orders, setOrders] = useState<Order[]>([])
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch("/api/driver/order-history")
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
    <div className="container mx-auto py-10 space-y-8">
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Total Completed Deliveries</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{orders.length}</p>
          </CardContent>
        </Card>

        
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Delivery History</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.order_id}>
                  <TableCell className="font-medium">#{order.order_id}</TableCell>
                  <TableCell>{new Date(order.order_date).toLocaleDateString()}</TableCell>
                  <TableCell>{order.customer_name}</TableCell>
                  <TableCell>
                    <Badge variant="default" className="bg-green-500">
                      {order.order_status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={order.payment === "paid" ? "default" : "secondary"}>{order.payment}</Badge>
                  </TableCell>
                  <TableCell className="text-right font-medium">${order.price}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm" onClick={() => setSelectedOrder(order)}>
                      View Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {orders.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-4 text-muted-foreground">
                    No completed deliveries found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="grid gap-4">
              <div className="grid gap-2">
                <h3 className="font-semibold">Order Information</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <p className="text-muted-foreground">Order ID:</p>
                  <p>#{selectedOrder.order_id}</p>
                  <p className="text-muted-foreground">Date:</p>
                  <p>{new Date(selectedOrder.order_date).toLocaleString()}</p>
                  <p className="text-muted-foreground">Vehicle Type:</p>
                  <p>{selectedOrder.vehicle_type}</p>
                  <p className="text-muted-foreground">Price:</p>
                  <p className="font-semibold">${selectedOrder.price}</p>
                </div>
              </div>

              <div className="grid gap-2">
                <h3 className="font-semibold">Customer Information</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <p className="text-muted-foreground">Name:</p>
                  <p>{selectedOrder.customer_name}</p>
                  <p className="text-muted-foreground">Phone:</p>
                  <p>{selectedOrder.customer_phone}</p>
                </div>
              </div>

              <div className="grid gap-2">
                <h3 className="font-semibold">Location Details</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <p className="text-muted-foreground">Pickup:</p>
                  <p>{selectedOrder.pickup_address}</p>
                  <p className="text-muted-foreground">Dropoff:</p>
                  <p>{selectedOrder.dropoff_address}</p>
                </div>
              </div>

              <div className="grid gap-2">
                <h3 className="font-semibold">Status</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <p className="text-muted-foreground">Delivery Status:</p>
                  <Badge variant="default" className="w-fit bg-green-500">
                    {selectedOrder.order_status}
                  </Badge>
                  <p className="text-muted-foreground">Payment Status:</p>
                  <Badge variant={selectedOrder.payment === "paid" ? "default" : "secondary"} className="w-fit">
                    {selectedOrder.payment}
                  </Badge>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

