"use client";
import { useEffect, useState } from "react";
import { Edit, Loader2, CircleX } from "lucide-react";
import { useServiceStore } from "stores/-serviceStore";
import { useVehicleStore } from "stores/-vehicleStore";
import { ServiceSection } from "../../../../components/serives/outstation/ServiceSection";
import { TariffSection } from "../../../../components/serives/outstation/TariffSection";
import { Tabs, TabsTrigger, TabsList } from "components/ui/tabs";

export default function OneWayPage() {
  const [isEditing, setIsEditing] = useState(false);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>("");
  const [id, setId] = useState<string>("");
  const { fetchServices ,services} = useServiceStore();
  const { vehicles, fetchVehicles ,isLoading } = useVehicleStore();

  useEffect(()=>{
    fetchVehicles();
    fetchServices();
    const filtered = services.filter(service => service.name === "Round trip");
    setId(filtered[0]?.serviceId || "");
  },[])

  useEffect(() => {
    if (vehicles.length > 0) {
      setSelectedVehicleId(vehicles[0].vehicleId);
    }
  }, [vehicles]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <>
    <div className="min-h-screen bg-white">
      <div className="p-8">
        <div className="mb-3 flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Outstation</h1>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="text-green-600 hover:text-green-800 h-6 w-6"
          >
            {isEditing ? <CircleX className="h-8 w-8 text-red-600" /> : <Edit className="h-6 w-6" />}
          </button>
        </div>

        <ServiceSection isEditing={false} serviceId={id} title="Round Trip" />
        
        <div className="border-b border-black" />

        <Tabs defaultValue={vehicles[0]?.name} className="py-3">
          <TabsList className="mb-8 py-3">
            {vehicles.map((vehicle) => (
              <TabsTrigger
                key={vehicle.vehicleId}
                value={vehicle.name}
                onClick={() => setSelectedVehicleId(vehicle.vehicleId)}
              >
                {vehicle.name}
              </TabsTrigger>
            ))}
          </TabsList>   
          <TariffSection 
            isEditing={isEditing} 
            serviceId={id}
            vehicleId={selectedVehicleId}
            createdBy="Vendor"
          />
        </Tabs>
      </div>
    </div>
    </>
  );
}