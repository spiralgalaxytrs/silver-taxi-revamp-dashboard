"use client"

import Link from "next/link"
import { VehicleCard } from "components/VehicleCard"
import { Button } from "components/ui/button"
import { useVehicleStore } from "stores/vehicleStore"
import { useEffect, useMemo } from "react"
import { Loader2 } from "lucide-react"

export default function Page() {
  const { vehicles, isLoading, error, fetchVehicles } = useVehicleStore()

  useEffect(() => {
    fetchVehicles()
  }, [fetchVehicles])

  // Sort vehicles by createdAt in descending order
  const sortedVehicles = useMemo(() => {
    if (!vehicles || vehicles.length === 0) return [];

    // Create a copy of the vehicles array to avoid mutating the original array
    return [...vehicles].sort((a, b) => {
      const aCreatedAt = new Date(a.createdAt).getTime();
      const bCreatedAt = new Date(b.createdAt).getTime();
      return bCreatedAt - aCreatedAt; // Descending order
    });
  }, [vehicles]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <>
      <div className="container mx-auto p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Vehicle Management</h1>
          <Link href="/admin/vehicles/create">
            <Button>Create Vehicle</Button>
          </Link>
        </div>
        {sortedVehicles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedVehicles.map((vehicle, index) => (
              <VehicleCard key={index} {...vehicle} createdBy="Admin"/>
            ))}
          </div>
        ) : (
          <div className="bg-white h-[60vh] flex justify-center items-center">
            <h1 className="text-2xl font-bold">No vehicles found</h1>
          </div>
        )}
      </div>
    </>
  );
}