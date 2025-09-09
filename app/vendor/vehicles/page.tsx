"use client"

import Link from "next/link"
import { VehicleCard } from "components/vehicle/VehicleCard"
import { Button } from "components/ui/button"
import { useMemo } from "react"
import { Loader2 } from "lucide-react"
import {
  useVehiclesAdmin
} from 'hooks/react-query/useVehicle';

export default function Page() {

  const {
    data: vehicles = [],
    isLoading,
  } = useVehiclesAdmin()

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

  return (
    <>
      <div className="container mx-auto p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Vehicle Management</h1>
          {/* <Link href="/admin/vehicles/create">
            <Button>Create Vehicle</Button>
          </Link> */}
        </div>
        {sortedVehicles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedVehicles.map((vehicle, index) => (
              <VehicleCard
                key={index}
                vehicleId={vehicle.vehicleId || ""}
                name={vehicle.name}
                fuelType={vehicle.fuelType as 'Petrol' | 'Diesel' | 'Electric' | 'Hybrid'}
                isActive={vehicle.isActive}
                type={vehicle.type}
                seats={vehicle.seats ?? 0}
                bags={vehicle.bags ?? 0}
                permitCharge={vehicle.permitCharge ?? 0}
                driverBeta={vehicle.driverBeta ?? 0}
                imageUrl={vehicle.imageUrl as string}
                createdBy={"Vendor"}
                order={vehicle.order || 0}
              />
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