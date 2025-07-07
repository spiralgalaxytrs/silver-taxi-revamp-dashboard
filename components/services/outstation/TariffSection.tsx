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
    isLoading?: boolean;
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
    const [localTariffs, setLocalTariffs] = useState<Record<string, Tariff>>({});
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [lastEditedVehicleId, setLastEditedVehicleId] = useState<string | null>(null);

    const { data: tariffs = [], isLoading: isTariffsLoading } = useTariffs();
    const { data: vehicle = null, isLoading: isVehicleLoading } = useVehicleById(vehicleId);
    const { mutate: createTariff } = useCreateTariff();
    const { mutate: updateTariff } = useUpdateTariff();

    // Initialize or update local tariff state when relevant data changes
    useEffect(() => {
        if (isTariffsLoading || isVehicleLoading || !vehicleId || !serviceId) return;

        let initialTariff: Tariff;

        // Find matching tariff
        const matchingTariff = tariffs.find(
            (t: Tariff) =>
                t.vehicleId === vehicleId &&
                t.serviceId === serviceId &&
                t.createdBy === createdBy
        );

        // Find admin tariff as fallback
        const matchingTariffAdmin = tariffs.find(
            (t: Tariff) =>
                t.vehicleId === vehicleId &&
                t.serviceId === serviceId &&
                t.createdBy === "Admin"
        );

        if (matchingTariff) {
            initialTariff = { ...matchingTariff };
        } else if (matchingTariffAdmin) {
            initialTariff = {
                ...matchingTariffAdmin,
                createdBy: createdBy // Keep the original createdBy
            };
        } else {
            // Default tariff
            initialTariff = {
                price: 0,
                extraPrice: 0,
                status: true,
                serviceId,
                vehicleId,
                createdBy
            };
        }

        setLocalTariffs(prev => ({
            ...prev,
            [vehicleId]: initialTariff
        }));

        setHasUnsavedChanges(false);
    }, [vehicleId, serviceId, createdBy, tariffs, isTariffsLoading, isVehicleLoading]);

    // Handle cleanup for unsaved changes
    useEffect(() => {
        return () => {
            if (hasUnsavedChanges && isEditing && lastEditedVehicleId && lastEditedVehicleId !== vehicleId) {
                handleTariffUpdate(lastEditedVehicleId, localTariffs[lastEditedVehicleId], true);
            }
        };
    }, [vehicleId, hasUnsavedChanges, isEditing, lastEditedVehicleId, localTariffs]);

    const handleTariffChange = (key: keyof Tariff, value: any) => {
        const updatedValue =
            key === "price" || key === "extraPrice" ?
                String(value).replace(/[^0-9.]/g, "") :
                value;

        setLocalTariffs(prev => ({
            ...prev,
            [vehicleId]: {
                ...(prev[vehicleId] || {
                    price: 0,
                    extraPrice: 0,
                    status: true,
                    serviceId,
                    vehicleId,
                    createdBy
                }),
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
                serviceId,
                createdBy
            };

            const existingTariff = tariffs?.find(
                (t: Tariff) =>
                    t.vehicleId === targetVehicleId &&
                    t.serviceId === serviceId &&
                    t.createdBy === createdBy
            );

            if (existingTariff?.tariffId) {
                updateTariff({
                    id: existingTariff.tariffId,
                    data: updatedTariffData
                }, {
                    onSuccess: (data: any) => {
                        if (!silent) {
                            toast.success(data?.message || "Tariff updated successfully!", {
                                style: {
                                    backgroundColor: "#009F7F",
                                    color: "#fff",
                                },
                            });
                            setTimeout(() => {
                                window.location.reload();
                            }, 1000);
                        }
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
                        if (!silent) {
                            toast.success("New tariff created successfully!", {
                                style: {
                                    backgroundColor: "#009F7F",
                                    color: "#fff",
                                },
                            });
                            setTimeout(() => {
                                window.location.reload();
                            }, 1000);
                        }
                    },
                    onError: (error: any) => {
                        if (!silent) {
                            toast.error(error?.response?.data?.message || "Failed to create tariff", {
                                style: {
                                    backgroundColor: "#FF0000",
                                    color: "#fff",
                                },
                            });
                        }
                    }
                });
            }
        } catch (error: any) {
            if (!silent) {
                toast.error(error?.response?.data?.message || "Failed to save tariff", {
                    style: {
                        backgroundColor: "#FF0000",
                        color: "#fff",
                    },
                });
            }
        } finally {
            setHasUnsavedChanges(false);
            if (!silent) setLastEditedVehicleId(null);
        }
    };

    const currentTariff = localTariffs[vehicleId] || {
        price: 0,
        extraPrice: 0,
        status: true,
        serviceId,
        vehicleId,
        createdBy,
    };

    if (isLoading || isTariffsLoading || isVehicleLoading) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-50">
                <Loader2 className="w-12 h-12 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <Card className="p-6">
            <div className="grid grid-cols-2 gap-8">
                <div className="space-y-6">
                    <div>
                        <Label>Vehicle Type</Label>
                        {isEditing ? (
                            <Input 
                                value={vehicle?.type || ''} 
                                readOnly 
                                className="mt-3" 
                            />
                        ) : (
                            <p className="mt-3">{vehicle?.type || 'N/A'}</p>
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
                                    type="text"
                                    value={currentTariff.price.toString()}
                                    className="mt-3"
                                    onChange={(e) => handleTariffChange("price", e.target.value)}
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
                                    type="text"
                                    value={currentTariff.extraPrice.toString()}
                                    className="mt-3"
                                    onChange={(e) => handleTariffChange("extraPrice", e.target.value)}
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
                        disabled={isTariffsLoading || isVehicleLoading}
                    >
                        Save
                    </Button>
                </div>
            )}
        </Card>
    );
}