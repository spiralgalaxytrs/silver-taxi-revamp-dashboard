"use client";
import { useState, useEffect } from "react";
import { Card } from "components/ui/card";
import { Input } from "components/ui/input";
import { Label } from "components/ui/label";
import { Switch } from "components/ui/switch";
import { Button } from "components/ui/button";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import {
    useTariffs,
    useCreateTariff,
    useUpdateTariff
} from 'hooks/react-query/useTariff';
import {
    useVehicleById
} from 'hooks/react-query/useVehicle';

interface TariffSectionProps {
    isEditing: boolean;
    serviceId: string;
    vehicleId: string;
    createdBy: "Admin" | "Vendor";
    isLoading: boolean;
}

type Tariff = {
    tariffId?: string;
    price: number;
    extraPrice: number;
    status: boolean;
    serviceId?: string;
    vehicleId?: string;
    createdBy: "Admin" | "Vendor";
}

export function TariffSection({ isEditing, serviceId, vehicleId, createdBy, isLoading }: TariffSectionProps) {
    const [localTariffs, setLocalTariffs] = useState<Record<string, Tariff>>({}); // Store tariffs locally by vehicleId
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [lastEditedVehicleId, setLastEditedVehicleId] = useState<string | null>(null);
    // const { vehicles } = useVehicleStore();
    // const { fetchTariffs, updateTariff, createTariff, tariffs } = useTariffStore();

    const { data: tariffs = [] } = useTariffs();
    const { data: vehicle = null } = useVehicleById(vehicleId);
    const { mutate: createTariff } = useCreateTariff();
    const { mutate: updateTariff } = useUpdateTariff();


    // Update local state based on fetched tariff and current type
    useEffect(() => {
        let initialTariff: Tariff;
        if (tariffs && tariffs.length > 0) {
            const matchingTariff = tariffs.find(
                (t: Tariff) =>
                    t.vehicleId === vehicleId && t.serviceId === serviceId && t.createdBy === createdBy
            );

            const matchingTariffAdmin = tariffs.find(
                (t: Tariff) =>
                    t.vehicleId === vehicleId && t.serviceId === serviceId && t.createdBy === "Admin"
            );
            if (matchingTariff) {
                initialTariff = { ...matchingTariff };
            } else if (matchingTariffAdmin) {
                initialTariff = { ...matchingTariffAdmin, createdBy: "Vendor" };
            } else {
                initialTariff = {
                    price: 0,
                    extraPrice: 0,
                    status: true,
                    serviceId,
                    vehicleId,
                    createdBy: createdBy
                };
            }
        } else {
            // No tariff exists, reset to default
            initialTariff = {
                price: 0,
                extraPrice: 0,
                status: true,
                serviceId,
                vehicleId,
                createdBy: createdBy
            };
        }

        setLocalTariffs((prev) => ({
            ...prev,
            [vehicleId]: prev[vehicleId] || initialTariff,
        }));

        setHasUnsavedChanges(false);
    }, [vehicleId, serviceId]);

    useEffect(() => {
        return () => {
            if (hasUnsavedChanges && isEditing && lastEditedVehicleId && lastEditedVehicleId !== vehicleId) {
                handleTariffUpdate(lastEditedVehicleId, localTariffs[lastEditedVehicleId], true); // Save silently
            }
        };
    }, [vehicleId, hasUnsavedChanges, isEditing, lastEditedVehicleId]);

    const handleTariffChange = (key: keyof Tariff, value: any) => {
        const updatedValue =
            key === "price" || key === "extraPrice" ? String(value).replace(/[^0-9.]/g, "") : value;

        setLocalTariffs((prev) => ({
            ...prev,
            [vehicleId]: {
                ...prev[vehicleId],
                [key]: updatedValue,
            },
        }));
        setHasUnsavedChanges(true);
        setLastEditedVehicleId(vehicleId);
    };

    const handleTariffUpdate = async (targetVehicleId: string, tariffData: Tariff, silent = false) => {
        try {
            if (!tariffData.price || !tariffData.extraPrice) {
                if (!silent) toast.error("Price and Extra Price are required", {
                    style: {
                        backgroundColor: "#FF0000",
                        color: "#fff",
                    },
                });
                return;
            }

            const updatedTariffData: Tariff = {
                ...tariffData,
                price: Number(tariffData.price),
                extraPrice: Number(tariffData.extraPrice),
                vehicleId: targetVehicleId,
            };

            const existingTariff = tariffs?.find(
                (t: Tariff) =>
                    t.vehicleId === targetVehicleId &&
                    t.serviceId === serviceId &&
                    t.createdBy === createdBy
            );

            try {
                if (existingTariff?.tariffId) {
                    updateTariff({ id: existingTariff.tariffId, data: updatedTariffData }, {
                        onSuccess: (data: any) => {
                            if (!silent) toast.success(data?.message || "Tariff updated successfully!", {
                                style: {
                                    backgroundColor: "#009F7F",
                                    color: "#fff",
                                },
                            });
                            setTimeout(() => {
                                window.location.reload();
                            }, 1000);
                        },
                        onError: (error: any) => {
                            toast.error(error?.response?.data?.message || "Failed to update tariff", {
                                style: {
                                    backgroundColor: "#FF0000",
                                    color: "#fff",
                                },
                            });
                        }
                    });
                } else {
                    createTariff(updatedTariffData, {
                        onSuccess: () => {
                            if (!silent) toast.success("New tariff created successfully!", {
                                style: {
                                    backgroundColor: "#009F7F",
                                    color: "#fff",
                                },
                            });
                            setTimeout(() => {
                                window.location.reload();
                            }, 1000);
                        },
                        onError: (error: any) => {
                            if (!silent) toast.error(error?.response?.data?.message || "Failed to create tariff", {
                                style: {
                                    backgroundColor: "#FF0000",
                                    color: "#fff",
                                },
                            });
                        }
                    });
                }
            } catch (error: any) {
                // console.error("Save error:", error);
                if (!silent) toast.error(error?.response?.data?.message || "Failed to save tariff", {
                    style: {
                        backgroundColor: "#FF0000",
                        color: "#fff",
                    },
                });
            } finally {
                // Refetch tariffs after save
                // fetchTariffs();
                setHasUnsavedChanges(false);
                if (!silent) setLastEditedVehicleId(null);
            }
        } catch (error) {
            console.error('Update error:', error);
            if (!silent) toast.error("Failed to save tariff", {
                style: {
                    backgroundColor: "#FF0000",
                    color: "#fff",
                },
            });
        } finally {
            if (!silent) {
                setHasUnsavedChanges(false);
                setLastEditedVehicleId(null);
            }
        }
    };

    const selectedVehicle = vehicle;
    const currentTariff = localTariffs[vehicleId] || {
        price: 0,
        extraPrice: 0,
        status: true,
        serviceId,
        vehicleId,
        createdBy,
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-50">
                <Loader2 className="w-12 h-12 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <Card className="p-6">
            <div className="grid grid-cols-2 gap-8">
                <div className="space-y-6">
                    <div>
                        <Label>Vehicle Type</Label>
                        {isEditing ? (
                            <Input value={selectedVehicle?.type} readOnly className="mt-3" />
                        ) : (
                            <p className="mt-3">{selectedVehicle?.type}</p>
                        )}
                    </div>

                    <div>
                        {isEditing ? (
                            <>
                                <Label>
                                    Price (Per Km) <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="price"
                                    type="text" // Use type="text" to allow multi-digit input
                                    value={currentTariff.price}
                                    className="mt-3"
                                    onChange={(e) => handleTariffChange("price", e.target.value)} // Pass the string value
                                />
                            </>
                        ) : (
                            <>
                                <h2 className="text-base mb-1">Price (Per Km)</h2>
                                <p className="mt-3">₹{currentTariff.price} per Km</p>
                            </>
                        )}
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="flex items-center justify-between mt-7">
                        <Label>Vehicle in this Service Off | On</Label>
                        <Switch
                            disabled={!isEditing}
                            className="mt-4"
                            checked={currentTariff.status}
                            onCheckedChange={(value) => handleTariffChange("status", value)}
                        />
                    </div>

                    <div>
                        {isEditing ? (
                            <>
                                <Label>
                                    Extra KM Price
                                </Label>
                                <Input
                                    id="extraPrice"
                                    type="text" // Use type="text" to allow multi-digit input
                                    value={currentTariff.extraPrice}
                                    className="mt-3"
                                    onChange={(e) => handleTariffChange("extraPrice", e.target.value)} // Pass the string value
                                />
                            </>
                        ) : (
                            <>
                                <h2 className="text-base mb-1">Extra KM Price</h2>
                                <p className="mt-3">₹{currentTariff.extraPrice} per Km</p>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {isEditing && (
                <div className="flex justify-center">
                    <Button
                        variant="primary"
                        className="mt-8"
                        onClick={() => handleTariffUpdate(vehicleId, currentTariff, false)}
                    >
                        Save
                    </Button>
                </div>
            )}
        </Card>
    );
}