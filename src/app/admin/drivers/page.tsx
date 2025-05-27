"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Loader2 } from "lucide-react"

type Driver = {
  driver_id: number
  driver_username: string
  email: string
  status: "pending" | "approved" | "rejected"
  phone_number: string
  vehicle_type: string
  license_plate: string
  experience: string
}

export default function DriverManagementPage() {
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean
    type: "delete" | "reject" | null
    driverId: number | null
  }>({
    isOpen: false,
    type: null,
    driverId: null,
  })

  const fetchDrivers = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/drivers")
      if (!response.ok) throw new Error("Failed to fetch drivers")
      const data = await response.json()
      setDrivers(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load drivers")
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchDrivers()
  }, [fetchDrivers])

  const handleApprove = async (driverId: number) => {
    setIsProcessing(true)
    try {
      const response = await fetch("/api/admin/drivers/approve", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ driverId }),
      })

      if (!response.ok) throw new Error("Failed to approve driver")

      setDrivers(drivers.map((driver) => (driver.driver_id === driverId ? { ...driver, status: "approved" } : driver)))
      setSelectedDriver(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to approve driver")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleReject = async (driverId: number) => {
    setIsProcessing(true)
    try {
      const response = await fetch("/api/admin/drivers/reject", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ driverId }),
      })

      if (!response.ok) throw new Error("Failed to reject driver")

      setDrivers(drivers.map((driver) => (driver.driver_id === driverId ? { ...driver, status: "rejected" } : driver)))
      setConfirmDialog({ isOpen: false, type: null, driverId: null })
      setSelectedDriver(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reject driver")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDelete = async (driverId: number) => {
    setIsProcessing(true)
    try {
      const response = await fetch("/api/admin/drivers/delete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ driverId }),
      })

      if (!response.ok) throw new Error("Failed to delete driver")

      setDrivers(drivers.filter((driver) => driver.driver_id !== driverId))
      setConfirmDialog({ isOpen: false, type: null, driverId: null })
      setSelectedDriver(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete driver")
    } finally {
      setIsProcessing(false)
    }
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "approved":
        return "default"
      case "pending":
        return "secondary"
      case "rejected":
        return "destructive"
      default:
        return "secondary"
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="container mx-auto py-10">
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Driver Management</h1>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">Total: {drivers.length}</Badge>
            <Badge variant="default">Approved: {drivers.filter((d) => d.status === "approved").length}</Badge>
            <Badge variant="destructive">Pending: {drivers.filter((d) => d.status === "pending").length}</Badge>
          </div>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Vehicle Type</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {drivers.map((driver) => (
                <TableRow key={driver.driver_id}>
                  <TableCell className="font-medium">{driver.driver_username}</TableCell>
                  <TableCell>{driver.email}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(driver.status)}>{driver.status}</Badge>
                  </TableCell>
                  <TableCell>{driver.vehicle_type}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => setSelectedDriver(driver)}>
                        View Details
                      </Button>
                      {driver.status === "pending" && (
                        <>
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => handleApprove(driver.driver_id)}
                            disabled={isProcessing}
                          >
                            {isProcessing ? "Processing..." : "Approve"}
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() =>
                              setConfirmDialog({
                                isOpen: true,
                                type: "reject",
                                driverId: driver.driver_id,
                              })
                            }
                            disabled={isProcessing}
                          >
                            Reject
                          </Button>
                        </>
                      )}
                      {driver.status === "approved" && (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() =>
                            setConfirmDialog({
                              isOpen: true,
                              type: "delete",
                              driverId: driver.driver_id,
                            })
                          }
                          disabled={isProcessing}
                        >
                          Delete
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Driver Details Dialog */}
      <Dialog open={!!selectedDriver} onOpenChange={() => setSelectedDriver(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Driver Details</DialogTitle>
            <DialogDescription>Review the driver's application information below.</DialogDescription>
          </DialogHeader>
          {selectedDriver && (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold">Name</h3>
                <p>{selectedDriver.driver_username}</p>
              </div>
              <div>
                <h3 className="font-semibold">Email</h3>
                <p>{selectedDriver.email}</p>
              </div>
              <div>
                <h3 className="font-semibold">Phone</h3>
                <p>{selectedDriver.phone_number}</p>
              </div>
              <div>
                <h3 className="font-semibold">License Number</h3>
                <p>{selectedDriver.license_plate}</p>
              </div>
              <div>
                <h3 className="font-semibold">Vehicle Type</h3>
                <p>{selectedDriver.vehicle_type}</p>
              </div>
              <div>
                <h3 className="font-semibold">Experience</h3>
                <p>{selectedDriver.experience}</p>
              </div>
              <div>
                <h3 className="font-semibold">Status</h3>
                <Badge variant={getStatusBadgeVariant(selectedDriver.status)}>{selectedDriver.status}</Badge>
              </div>
            </div>
          )}
          <DialogFooter>
            {selectedDriver?.status === "pending" && (
              <>
                <Button
                  onClick={() => handleApprove(selectedDriver.driver_id)}
                  disabled={isProcessing}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isProcessing ? "Processing..." : "Approve Driver"}
                </Button>
                <Button
                  variant="destructive"
                  onClick={() =>
                    setConfirmDialog({
                      isOpen: true,
                      type: "reject",
                      driverId: selectedDriver.driver_id,
                    })
                  }
                  disabled={isProcessing}
                >
                  Reject Driver
                </Button>
              </>
            )}
            {selectedDriver?.status === "approved" && (
              <Button
                variant="destructive"
                onClick={() =>
                  setConfirmDialog({
                    isOpen: true,
                    type: "delete",
                    driverId: selectedDriver.driver_id,
                  })
                }
                disabled={isProcessing}
              >
                Delete Driver
              </Button>
            )}
            <Button variant="outline" onClick={() => setSelectedDriver(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmDialog.isOpen}
        onOpenChange={(open) => !open && setConfirmDialog({ isOpen: false, type: null, driverId: null })}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{confirmDialog.type === "delete" ? "Delete Driver" : "Reject Application"}</DialogTitle>
            <DialogDescription>
              {confirmDialog.type === "delete"
                ? "Are you sure you want to delete this driver? This action cannot be undone."
                : "Are you sure you want to reject this driver's application? This action cannot be undone."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmDialog({ isOpen: false, type: null, driverId: null })}
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (confirmDialog.driverId) {
                  if (confirmDialog.type === "delete") {
                    handleDelete(confirmDialog.driverId)
                  } else {
                    handleReject(confirmDialog.driverId)
                  }
                }
              }}
              disabled={isProcessing}
            >
              {isProcessing ? "Processing..." : confirmDialog.type === "delete" ? "Delete" : "Reject"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

