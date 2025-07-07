'use client'
import Image from "next/image"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "components/ui/card"
import { Switch } from "components/ui/switch"
import Link from "next/link"
import { Button } from "components/ui/button"
import { useState } from "react"
import { useVehicleStore } from "stores/-vehicleStore"
import { toast } from "sonner"
import { Trash } from "lucide-react"

interface VehicleCardProps {
    vehicleId: string
    name: string
    fuelType: 'Petrol' | 'Diesel' | 'Electric' | 'Hybrid'
    isActive: boolean
    type: string
    seats: number
    bags: number
    permitCharge: number
    driverBeta: number
    imageUrl: string
    createdBy: "Admin" | "Vendor"
}

export function VehicleCard({ vehicleId, name, fuelType, isActive, type, seats, bags, permitCharge, driverBeta, imageUrl, createdBy }: VehicleCardProps) {

    const { vehicleToggleChange, deleteVehicle, message, statusCode } = useVehicleStore()


    const [status, setStatus] = useState<boolean>(isActive)

    const handleSwitchChange = async (currentStatus: boolean) => {
        try {
            await vehicleToggleChange(vehicleId, currentStatus);
            const { statusCode, message } = useVehicleStore.getState();
            if (statusCode === 200 || statusCode === 201) {
                toast.success(message, {
                    style: {
                        backgroundColor: "#009F7F",
                        color: "#fff",
                    },
                });
                setStatus(!currentStatus);
                setTimeout(() => {
                    window.location.reload();
                }, 1000);
            } else {
                toast.error(message, {
                    style: {
                        backgroundColor: "#FF0000",
                        color: "#fff",
                    },
                });
            }
        } catch (error) {
            toast.error("Failed to toggle vehicle status", {
                style: {
                    backgroundColor: "#FF0000",
                    color: "#fff",
                },
            });
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await deleteVehicle(id);
            const { statusCode, message } = useVehicleStore.getState();
            if (statusCode === 200 || statusCode === 201) {
                toast.success('Vehicle deleted successfully');
            } else {
                toast.error(message), {
                    style: {
                        backgroundColor: "#FF0000",
                        color: "#fff",
                    },
                };
            }
        } catch (error) {
            toast.error("Failed to delete vehicle", {
                style: {
                    backgroundColor: "#FF0000",
                    color: "#fff",
                },
            });
        }
    };

    return (
        <Card className="w-full max-w-sm bg-white">
            <CardHeader>
                <CardTitle className="flex justify-between items-center">
                    {name}
                    {createdBy !== "Vendor" && (
                        <Switch
                            checked={status}
                            onCheckedChange={(newStatus) => handleSwitchChange(newStatus)}
                        />
                    )}

                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="aspect-video relative mb-4">
                    <Image src={imageUrl || "/placeholder.svg"} alt={name} fill className="object-cover rounded-md" />
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm ms-4 justify-between">
                    <div>Fuel Type:</div>
                    <div>{fuelType}</div>
                    <div>Type:</div>
                    <div>{type}</div>
                    <div>Seats:</div>
                    <div>{seats}</div>
                    <div>Luggage:</div>
                    <div>{bags}</div>
                    <div>Permit Charge:</div>
                    <div>{permitCharge}</div>
                    <div>Driver Beta:</div>
                    <div>{driverBeta}</div>
                </div>
            </CardContent>
            <CardFooter>
                {createdBy !== "Vendor" && (
                    <div className="flex justify-between gap-x-48">
                        <div>
                            <Link href={`/admin/vehicles/edit/${vehicleId}`}>
                                <Button variant="primary">Edit</Button>
                            </Link>
                        </div>
                        <div>
                            <Button
                                variant="destructive"
                                size="icon"
                                className="gap-2 px-3 py-2 hover:bg-red-400"
                                onClick={() => handleDelete(vehicleId)}
                            >
                                <Trash className="h-7 w-8" />
                            </Button>
                        </div>
                    </div>
                )
                }
            </CardFooter>
        </Card>
    )
}

