"use client"

import { useState, useEffect } from "react"
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
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Loader2 } from "lucide-react"

type User = {
  customer_id: number
  name: string
  email: string
  status: "active" | "suspended"
  phone_number: string
}

export default function UserManagementPage() {
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean
    type: "delete" | "suspend" | "activate" | null
    userId: number | null
  }>({
    isOpen: false,
    type: null,
    userId: null,
  })

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/admin/users")
      if (!response.ok) throw new Error("Failed to fetch users")
      const data = await response.json()
      setUsers(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load users")
    } finally {
      setIsLoading(false)
    }
  }

  const handleStatusChange = async (userId: number, newStatus: "active" | "suspended") => {
    setIsProcessing(true)
    try {
      const response = await fetch("/api/admin/users/suspend", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId, status: newStatus }),
      })

      if (!response.ok) throw new Error(`Failed to ${newStatus === "active" ? "activate" : "suspend"} user`)

      setUsers(users.map((user) => (user.customer_id === userId ? { ...user, status: newStatus } : user)))
      setConfirmDialog({ isOpen: false, type: null, userId: null })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update user status")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDelete = async (userId: number) => {
    setIsProcessing(true)
    try {
      const response = await fetch("/api/admin/users/delete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId }),
      })

      if (!response.ok) throw new Error("Failed to delete user")

      setUsers(users.filter((user) => user.customer_id !== userId))
      setConfirmDialog({ isOpen: false, type: null, userId: null })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete user")
    } finally {
      setIsProcessing(false)
    }
  }

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="container mx-auto py-10">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>User Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-4">
            <div className="space-x-2">
              <Badge variant="secondary">Total Users: {users.length}</Badge>
              <Badge variant="default">Active: {users.filter((u) => u.status === "active").length}</Badge>
              <Badge variant="destructive">Suspended: {users.filter((u) => u.status === "suspended").length}</Badge>
            </div>
            <div className="flex items-center space-x-2">
              <Label htmlFor="search">Search:</Label>
              <Input
                id="search"
                placeholder="Search users..."
                className="w-64"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.customer_id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.phone_number}</TableCell>
                  <TableCell>
                    <Badge variant={user.status === "active" ? "default" : "destructive"}>{user.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {user.status === "active" ? (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() =>
                            setConfirmDialog({
                              isOpen: true,
                              type: "suspend",
                              userId: user.customer_id,
                            })
                          }
                          disabled={isProcessing}
                        >
                          Suspend
                        </Button>
                      ) : (
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() =>
                            setConfirmDialog({
                              isOpen: true,
                              type: "activate",
                              userId: user.customer_id,
                            })
                          }
                          disabled={isProcessing}
                        >
                          Activate
                        </Button>
                      )}
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() =>
                          setConfirmDialog({
                            isOpen: true,
                            type: "delete",
                            userId: user.customer_id,
                          })
                        }
                        disabled={isProcessing}
                      >
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmDialog.isOpen}
        onOpenChange={(open) => !open && setConfirmDialog({ isOpen: false, type: null, userId: null })}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {confirmDialog.type === "delete"
                ? "Delete User"
                : confirmDialog.type === "suspend"
                  ? "Suspend User"
                  : "Activate User"}
            </DialogTitle>
            <DialogDescription>
              {confirmDialog.type === "delete"
                ? "Are you sure you want to delete this user? This action cannot be undone."
                : confirmDialog.type === "suspend"
                  ? "Are you sure you want to suspend this user? They will not be able to access their account."
                  : "Are you sure you want to activate this user? This will restore their account access."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmDialog({ isOpen: false, type: null, userId: null })}
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button
              variant={confirmDialog.type === "activate" ? "default" : "destructive"}
              onClick={() => {
                if (confirmDialog.userId) {
                  if (confirmDialog.type === "delete") {
                    handleDelete(confirmDialog.userId)
                  } else if (confirmDialog.type === "suspend") {
                    handleStatusChange(confirmDialog.userId, "suspended")
                  } else if (confirmDialog.type === "activate") {
                    handleStatusChange(confirmDialog.userId, "active")
                  }
                }
              }}
              disabled={isProcessing}
            >
              {isProcessing
                ? "Processing..."
                : confirmDialog.type === "delete"
                  ? "Delete"
                  : confirmDialog.type === "suspend"
                    ? "Suspend"
                    : "Activate"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

