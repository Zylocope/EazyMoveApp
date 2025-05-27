"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"

type Location = {
  location_id: string
  name: string
  latitude: number
  longitude: number
}

const vehicleTypes = [
  { id: "van", name: "Van", basePrice: 30 },
  { id: "suv", name: "SUV", basePrice: 25 },
  { id: "motorcycle", name: "Motorcycle", basePrice: 20 },
]

export default function OrderCreationPage() {
  const router = useRouter()
  const [locations, setLocations] = useState<Location[]>([])
  const [pickup, setPickup] = useState("")
  const [dropoff, setDropoff] = useState("")
  const [selectedVehicle, setSelectedVehicle] = useState(vehicleTypes[1]) // Default to SUV
  const [distance, setDistance] = useState<number | null>(null)
  const [price, setPrice] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const response = await fetch("/api/locations/all")
        if (!response.ok) throw new Error("Failed to fetch locations")
        const data = await response.json()
        setLocations(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load locations")
      } finally {
        setIsLoading(false)
      }
    }

    fetchLocations()
  }, [])

  const calculateDistance = useCallback((loc1: Location, loc2: Location) => {
    const R = 6371 // Earth's radius in km
    const dLat = ((loc2.latitude - loc1.latitude) * Math.PI) / 180
    const dLon = ((loc2.longitude - loc1.longitude) * Math.PI) / 180
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((loc1.latitude * Math.PI) / 180) *
        Math.cos((loc2.latitude * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }, [])

  useEffect(() => {
    if (pickup && dropoff) {
      const pickupLocation = locations.find((loc) => loc.location_id === pickup)
      const dropoffLocation = locations.find((loc) => loc.location_id === dropoff)
      if (pickupLocation && dropoffLocation) {
        const calculatedDistance = calculateDistance(pickupLocation, dropoffLocation)
        setDistance(Number(calculatedDistance.toFixed(2)))
      }
    } else {
      setDistance(null)
    }
  }, [pickup, dropoff, locations, calculateDistance])

  useEffect(() => {
    if (distance !== null && selectedVehicle) {
      const basePrice = selectedVehicle.basePrice * distance
      setPrice(Number(basePrice.toFixed(2)))
    } else {
      setPrice(null)
    }
  }, [distance, selectedVehicle])

  const handleOrderNow = async () => {
    try {
      setIsSubmitting(true)
      setError("")

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          pickup_location: pickup,
          dropoff_location: dropoff,
          vehicle_type: selectedVehicle.name,
          price: price,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to create order")
      }

      // Redirect to dashboard after successful order
      router.push("/user/dashboard")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create order")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="container max-w-2xl mx-auto py-10">
      <Card className="border-0 shadow-none">
        <CardHeader>
          <CardTitle className="text-2xl">Order Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <div className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm font-medium">From (Pickup Location)</p>
              <Select value={pickup} onValueChange={setPickup}>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Select pickup location" />
                </SelectTrigger>
                <SelectContent>
                  {locations.map((location) => (
                    <SelectItem key={location.location_id} value={location.location_id}>
                      {location.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">To (Drop-off Location)</p>
              <Select value={dropoff} onValueChange={setDropoff}>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Select drop-off location" />
                </SelectTrigger>
                <SelectContent>
                  {locations.map((location) => (
                    <SelectItem key={location.location_id} value={location.location_id}>
                      {location.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Vehicle Type</p>
              <Select
                value={selectedVehicle.id}
                onValueChange={(value) =>
                  setSelectedVehicle(vehicleTypes.find((v) => v.id === value) || vehicleTypes[0])
                }
              >
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Select vehicle type" />
                </SelectTrigger>
                <SelectContent>
                  {vehicleTypes.map((vehicle) => (
                    <SelectItem key={vehicle.id} value={vehicle.id}>
                      {vehicle.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {pickup && dropoff && selectedVehicle && (
              <div className="space-y-4 pt-4">
                {distance !== null && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-medium">Estimated Distance:</span>
                    <span>{distance} km</span>
                  </div>
                )}
                {price !== null && (
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Estimated Price:</span>
                    <span className="text-lg font-semibold">${price}</span>
                  </div>
                )}
              </div>
            )}

            <Button
              onClick={handleOrderNow}
              className="w-full h-12 mt-4 bg-black hover:bg-black/90 text-white"
              disabled={!pickup || !dropoff || !selectedVehicle || isSubmitting}
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating Order...
                </div>
              ) : (
                "Order Now"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

