"use client";

import { useEffect, useState, useMemo } from "react";
import { Button } from "components/ui/button";
import { CircleX, Edit, Loader2 } from "lucide-react";
import PackageServiceSection from "../../../../../components/services/packages/PackageServiceSection";
import { Tabs, TabsTrigger, TabsList } from "components/ui/tabs";
import { PackageTariffSection } from "../../../../../components/services/packages/PackageTariffSection";
import {
  useServices
} from 'hooks/react-query/useServices';
import {
  useVehiclesAdmin
} from 'hooks/react-query/useVehicle';

export default function HourlyPage() {
  const [isEditing, setIsEditing] = useState(false);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>("");


  const {
    data: services = [],
    isLoading,
    refetch: fetchServices
  } = useServices();
  const {
    data: vehicles = [],
    isLoading: isLoadingVehicles,
    refetch: fetchVehicles
  } = useVehiclesAdmin();

  const id = useMemo(() => {
    return services.find(service => service.name === "Hourly Packages")?.serviceId
  }, [services])

  useEffect(() => {
    if (vehicles.length > 0) {
      setSelectedVehicleId(vehicles[0].vehicleId || "");
    }
  }, [vehicles]);

  return (
    <>
      <div className="min-h-screen bg-white">
        <div className="p-8">
          <div className="mb-3 flex items-center justify-between">
            <h1 className="text-2xl font-semibold">Packages - Hourly Packages</h1>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="text-green-600 hover:text-green-800 h-6 w-6"
            >
              {isEditing ? <CircleX className="h-8 w-8 text-red-600" /> : <Edit className="h-6 w-6" />}
            </button>
          </div>

          <PackageServiceSection
            isEditing={isEditing}
            serviceId={id || ""}
            title="Hourly Packages"
          />
          <div className="border-b border-black" />

          <h1 className="text-2xl font-semibold mb-3 mt-3">Hourly Packages Vehicles</h1>

          <Tabs defaultValue={vehicles[0]?.name} className="py-3">
            <TabsList className="mb-8 py-3">
              {vehicles.map((vehicle: any) => (
                <TabsTrigger
                  key={vehicle.vehicleId}
                  value={vehicle.name}
                  onClick={() => setSelectedVehicleId(vehicle.vehicleId)}
                  className={selectedVehicleId === vehicle.vehicleId ? "bg-black text-white" : ""}
                >
                  {vehicle.name}
                </TabsTrigger>
              ))}
            </TabsList>

            {id && selectedVehicleId && (
              <PackageTariffSection
                isEditing={isEditing}
                createdBy="Admin"
                serviceId={id}
                vehicleId={selectedVehicleId}
                type="hourly"
              />
            )}
          </Tabs>
        </div>
      </div>
    </>
  );
}