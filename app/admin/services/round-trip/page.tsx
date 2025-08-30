"use client";
import { useEffect, useState, useMemo } from "react";
import { Edit, Loader2, CircleX } from "lucide-react";
import { ServiceSection } from "../../../../components/services/outstation/ServiceSection";
import { TariffSection } from "../../../../components/services/outstation/TariffSection";
import { Tabs, TabsTrigger, TabsList } from "components/ui/tabs";
import {
  useServices
} from 'hooks/react-query/useServices';
import {
  useVehiclesAdmin
} from 'hooks/react-query/useVehicle';

export default function RoundTripPage() {
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
    return services.find(service => service.name === "Round trip")?.serviceId
  }, [services])

  useEffect(() => {
    if (vehicles.length > 0) {
      setSelectedVehicleId(vehicles[0].vehicleId || "");
    }
  }, [vehicles]);

  return (
    <>
      <div className="min-h-screen bg-white">
        <div>
          <div className="p-8">
            <div className="mb-3 flex items-center justify-between">
              <h1 className="text-2xl font-semibold">Outstation - Round Trip</h1>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="text-green-600 hover:text-green-800 h-6 w-6"
              >
                {isEditing ? <CircleX className="h-8 w-8 text-red-600" /> : <Edit className="h-6 w-6" />}
              </button>
            </div>

              <ServiceSection
                isEditing={isEditing}
                serviceId={id || ""}
                title="Round trip"
                isLoading={isLoading}
              />

            <div className="border-b border-black" />

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
                <TariffSection
                  isEditing={isEditing}
                  serviceId={id}
                  vehicleId={selectedVehicleId}
                  createdBy="Admin"
                  isLoading={isLoading}
                />
              )}
            </Tabs>
          </div>
        </div>
      </div>
    </>
  );
}