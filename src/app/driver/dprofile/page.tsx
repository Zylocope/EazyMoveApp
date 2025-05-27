"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2 } from "lucide-react"

type DriverProfile = {
  driver_username: string
  email: string
  phone_number: string
  driver_license: string
  vehicle_type: string
  license_plate: string
}

export default function DriverProfilePage() {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [updateError, setUpdateError] = useState("")
  const [updateSuccess, setUpdateSuccess] = useState("")
  const [isUpdating, setIsUpdating] = useState(false)
  const [profile, setProfile] = useState<DriverProfile | null>(null)

  const [passwordInfo, setPasswordInfo] = useState({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  })

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch("/api/driver/profile")
        if (!response.ok) throw new Error("Failed to fetch profile")

        const data = await response.json()
        setProfile(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load profile")
      } finally {
        setIsLoading(false)
      }
    }

    fetchProfile()
  }, [])

  const handlePersonalInfoSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setUpdateError("")
    setUpdateSuccess("")
    setIsUpdating(true)

    try {
      const response = await fetch("/api/driver/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          personalInfo: {
            driver_username: profile?.driver_username,
            phone_number: profile?.phone_number,
            driver_license: profile?.driver_license,
          },
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to update profile")
      }

      setUpdateSuccess("Personal information updated successfully")
      setProfile(data.driver)
    } catch (err) {
      setUpdateError(err instanceof Error ? err.message : "Failed to update profile")
    } finally {
      setIsUpdating(false)
    }
  }

  const handleVehicleInfoSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setUpdateError("")
    setUpdateSuccess("")
    setIsUpdating(true)

    try {
      const response = await fetch("/api/driver/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          vehicleInfo: {
            vehicle_type: profile?.vehicle_type,
            license_plate: profile?.license_plate,
          },
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to update vehicle information")
      }

      setUpdateSuccess("Vehicle information updated successfully")
      setProfile(data.driver)
    } catch (err) {
      setUpdateError(err instanceof Error ? err.message : "Failed to update vehicle information")
    } finally {
      setIsUpdating(false)
    }
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setUpdateError("")
    setUpdateSuccess("")
    setIsUpdating(true)

    if (passwordInfo.newPassword !== passwordInfo.confirmNewPassword) {
      setUpdateError("New passwords do not match")
      setIsUpdating(false)
      return
    }

    try {
      const response = await fetch("/api/driver/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPassword: passwordInfo.currentPassword,
          newPassword: passwordInfo.newPassword,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to update password")
      }

      setUpdateSuccess("Password updated successfully")
      setPasswordInfo({
        currentPassword: "",
        newPassword: "",
        confirmNewPassword: "",
      })
    } catch (err) {
      setUpdateError(err instanceof Error ? err.message : "Failed to update password")
    } finally {
      setIsUpdating(false)
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
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Driver Profile</h1>
      <Tabs defaultValue="personal-info">
        <TabsList>
          <TabsTrigger value="personal-info">Personal Information</TabsTrigger>
          <TabsTrigger value="vehicle-info">Vehicle Information</TabsTrigger>
          <TabsTrigger value="change-password">Change Password</TabsTrigger>
        </TabsList>

        <TabsContent value="personal-info">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent>
              {updateError && (
                <Alert variant="destructive" className="mb-4">
                  <AlertDescription>{updateError}</AlertDescription>
                </Alert>
              )}
              {updateSuccess && (
                <Alert className="mb-4">
                  <AlertDescription>{updateSuccess}</AlertDescription>
                </Alert>
              )}
              <form onSubmit={handlePersonalInfoSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={profile?.driver_username || ""}
                    onChange={(e) => setProfile((prev) => (prev ? { ...prev, driver_username: e.target.value } : null))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" value={profile?.email || ""} readOnly className="bg-muted" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={profile?.phone_number || ""}
                    onChange={(e) => setProfile((prev) => (prev ? { ...prev, phone_number: e.target.value } : null))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="license">Driver's License</Label>
                  <Input
                    id="license"
                    value={profile?.driver_license || ""}
                    onChange={(e) => setProfile((prev) => (prev ? { ...prev, driver_license: e.target.value } : null))}
                    required
                  />
                </div>
                <Button type="submit" className="bg-red-500 text-white" disabled={isUpdating}>
                  {isUpdating ? "Updating..." : "Update Information"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vehicle-info">
          <Card>
            <CardHeader>
              <CardTitle>Vehicle Information</CardTitle>
            </CardHeader>
            <CardContent>
              {updateError && (
                <Alert variant="destructive" className="mb-4">
                  <AlertDescription>{updateError}</AlertDescription>
                </Alert>
              )}
              {updateSuccess && (
                <Alert className="mb-4">
                  <AlertDescription>{updateSuccess}</AlertDescription>
                </Alert>
              )}
              <form onSubmit={handleVehicleInfoSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="vehicleType">Vehicle Type</Label>
                  <Select
                    value={profile?.vehicle_type}
                    onValueChange={(value) => setProfile((prev) => (prev ? { ...prev, vehicle_type: value } : null))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select vehicle type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Motorcycle">Motorcycle</SelectItem>
                      <SelectItem value="SUV">SUV</SelectItem>
                      <SelectItem value="Van">Van</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="licensePlate">License Plate</Label>
                  <Input
                    id="licensePlate"
                    value={profile?.license_plate || ""}
                    onChange={(e) => setProfile((prev) => (prev ? { ...prev, license_plate: e.target.value } : null))}
                    required
                  />
                </div>
                <Button type="submit" className="bg-red-500 text-white" disabled={isUpdating}>
                  {isUpdating ? "Updating..." : "Update Vehicle Information"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="change-password">
          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
            </CardHeader>
            <CardContent>
              {updateError && (
                <Alert variant="destructive" className="mb-4">
                  <AlertDescription>{updateError}</AlertDescription>
                </Alert>
              )}
              {updateSuccess && (
                <Alert className="mb-4">
                  <AlertDescription>{updateSuccess}</AlertDescription>
                </Alert>
              )}
              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    value={passwordInfo.currentPassword}
                    onChange={(e) => setPasswordInfo((prev) => ({ ...prev, currentPassword: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={passwordInfo.newPassword}
                    onChange={(e) => setPasswordInfo((prev) => ({ ...prev, newPassword: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmNewPassword">Confirm New Password</Label>
                  <Input
                    id="confirmNewPassword"
                    type="password"
                    value={passwordInfo.confirmNewPassword}
                    onChange={(e) => setPasswordInfo((prev) => ({ ...prev, confirmNewPassword: e.target.value }))}
                    required
                  />
                </div>
                <Button type="submit" className="bg-red-500 text-white" disabled={isUpdating}>
                  {isUpdating ? "Updating..." : "Change Password"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

