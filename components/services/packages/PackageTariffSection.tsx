"use client";

import { useState, useEffect } from "react";
import { Card } from "components/ui/card";
import { Input } from "components/ui/input";
import { Label } from "components/ui/label";
import { Switch } from "components/ui/switch";
import { Button } from "components/ui/button";
import { X } from "lucide-react";
import { toast } from "sonner";
import { useVehicleStore } from "stores/-vehicleStore";
import { useTariffStore } from "stores/-tariffStore";

interface PackageVehicleSectionProps {
    isEditing: boolean;
    serviceId: string;
    vehicleId: string;
    type: "day" | "hourly";
    createdBy: "Admin" | "Vendor";
}

type PackageVehicleTariff = {
    id?: string;
    dayOrHour: string;
    distanceLimit?: number;
    price: number;
    extraPrice: number;
    status: boolean;
    createdBy: "Admin" | "Vendor";
    serviceId: string;
    vehicleId: string;
    type: "day" | "hourly";
    packageId?: string;
};

export function PackageTariffSection({
    isEditing,
    serviceId,
    vehicleId,
    type,
    createdBy
}: PackageVehicleSectionProps) {
    const [localTariffs, setLocalTariffs] = useState<Record<string, PackageVehicleTariff[]>>({});
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [lastEditedVehicleId, setLastEditedVehicleId] = useState<string | null>(null);
    const [dayInput, setDayInput] = useState("");
    const [distanceLimit, setDistanceLimit] = useState("");
    const [priceInput, setPriceInput] = useState("");
    const [status, setStatus] = useState(true);

    const { vehicles } = useVehicleStore();
    const { fetchPackageTariffs, createPackageTariff, fetchPackageTariffByVehicleId, updatePackageTariff, packageTariffs } = useTariffStore();

    useEffect(() => {
        if (vehicleId && serviceId) {
            fetchPackageTariffByVehicleId(vehicleId, serviceId, type);
        }
    }, [vehicleId, serviceId, type, fetchPackageTariffByVehicleId]);

    useEffect(() => {
        const packageTariffs = useTariffStore.getState().packageTariffs;
        if (packageTariffs && packageTariffs.length > 0) {
            const filteredTariffs = packageTariffs
                .filter((t: PackageVehicleTariff) => t.type === type && t.createdBy === createdBy)
                .map((t: PackageVehicleTariff) => ({
                    id: t.id,
                    dayOrHour: t.dayOrHour.toString(),
                    price: Number(t.price),
                    extraPrice: Number(t.extraPrice),
                    status: t.status !== undefined ? t.status : true,
                    distanceLimit: Number(t.distanceLimit),
                    createdBy: t.createdBy,
                    serviceId: t.serviceId,
                    vehicleId: t.vehicleId,
                    type: t.type,
                    packageId: t.packageId,
                }));

            const filteredAdminTariffs = packageTariffs
                .filter((t: PackageVehicleTariff) => t.type === type && t.createdBy === "Admin")
                .map((t: PackageVehicleTariff) => ({
                    id: t.id,
                    dayOrHour: t.dayOrHour.toString(),
                    price: Number(t.price),
                    extraPrice: Number(t.extraPrice),
                    status: t.status !== undefined ? t.status : true,
                    distanceLimit: Number(t.distanceLimit),
                    createdBy: t.createdBy,
                    serviceId: t.serviceId,
                    vehicleId: t.vehicleId,
                    type: t.type,
                    packageId: t.packageId,
                }));

            setLocalTariffs((prev) => ({
                ...prev,
                [vehicleId]: filteredTariffs.length > 0 ? filteredTariffs : filteredAdminTariffs,
            }));
        } else {
            setLocalTariffs((prev) => ({
                ...prev,
                [vehicleId]: [],
            }));
        }
    }, [packageTariffs, type, createdBy, vehicleId]);

    useEffect(() => {
        useTariffStore.getState().packageTariffs;
        return () => {
            if (hasUnsavedChanges && isEditing && lastEditedVehicleId && lastEditedVehicleId !== vehicleId) {
                handleTariffUpdate(lastEditedVehicleId, localTariffs[lastEditedVehicleId], true);
                setHasUnsavedChanges(false);
            }
        };
    }, [vehicleId, hasUnsavedChanges, lastEditedVehicleId, packageTariffs]);

    const handleExtraPriceChange = (value: string) => {
        const cleaned = String(value).replace(/[^0-9.]/g, '');
        setLocalTariffs((prev) => ({
            ...prev,
            [vehicleId]: prev[vehicleId].map((t) => ({
                ...t,
                extraPrice: Number(cleaned),
            })),
        }));
        setHasUnsavedChanges(true);
        setLastEditedVehicleId(vehicleId);
    };

    const addDayPrice = () => {
        if (dayInput.trim() === "" || priceInput.trim() === "" || distanceLimit.trim() === "") {
            toast.error("Days/Hours, Distance, and Price are required", {
                style: {
                    backgroundColor: "#FF0000",
                    color: "#fff",
                },
            });
            return;
        }
        const extraPrice = localTariffs[vehicleId]?.[0]?.extraPrice || 0;
        const newTariff: PackageVehicleTariff = {
            dayOrHour: dayInput,
            price: Number(priceInput),
            extraPrice: Number(extraPrice),
            status,
            distanceLimit: Number(distanceLimit),
            serviceId,
            vehicleId,
            type,
            createdBy,
        };
        setLocalTariffs((prev) => ({
            ...prev,
            [vehicleId]: [...(prev[vehicleId] || []), newTariff],
        }));
        setDayInput("");
        setPriceInput("");
        setDistanceLimit("");
        setHasUnsavedChanges(true);
        setLastEditedVehicleId(vehicleId);
    };

    const removeDayPrice = (index: number) => {
        setLocalTariffs((prev) => ({
            ...prev,
            [vehicleId]: prev[vehicleId].filter((_, i) => i !== index),
        }));
        setHasUnsavedChanges(true);
        setLastEditedVehicleId(vehicleId);
    };

    const updateDayPrice = (index: number, field: "dayOrHour" | "price" | "distanceLimit", value: string) => {
        const cleanedValue = value.replace(/[^0-9.]/g, "");
        setLocalTariffs((prev) => ({
            ...prev,
            [vehicleId]: prev[vehicleId].map((t, i) =>
                i === index ? { ...t, [field]: field === "price" ? Number(cleanedValue) : cleanedValue } : t
            ),
        }));
        setHasUnsavedChanges(true);
        setLastEditedVehicleId(vehicleId);
    };

    const handleTariffUpdate = async (targetVehicleId: string, tariffData: PackageVehicleTariff[], silent = false) => {
        try {
            if (tariffData.length === 0) {
                if (!silent) toast.error("At least one Day/Hour, Distance, and Price are required", {
                    style: {
                        backgroundColor: "#FF0000",
                        color: "#fff",
                    },
                });
                return;
            }

            const extraPrice = tariffData[0]?.extraPrice || 0;
            const tariffDataToSend = {
                dayOrHour: tariffData.map((t) => t.dayOrHour),
                prices: tariffData.map((t) => t.price),
                extraPrice: Number(extraPrice),
                distanceLimits: tariffData.map((t) => t.distanceLimit),
                serviceId,
                vehicleId: targetVehicleId,
                type,
                createdBy,
            };

            const existingTariff = packageTariffs.find(
                (t: PackageVehicleTariff) =>
                    t.vehicleId === targetVehicleId &&
                    t.serviceId === serviceId &&
                    t.type === type &&
                    t.createdBy === createdBy
            );

            try {
                if (existingTariff && existingTariff.id) {
                    await updatePackageTariff(existingTariff.id, tariffDataToSend);
                } else {
                    await createPackageTariff(tariffDataToSend);
                }

                const status = useTariffStore.getState().statusCode;
                const message = useTariffStore.getState().message;

                if (status === 200 || status === 201) {
                    if (!silent) {
                        toast.success("Tariff updated successfully!", {
                            style: {
                                backgroundColor: "#009F7F",
                                color: "#fff",
                            },
                        });
                        setTimeout(() => {
                            window.location.reload();
                        }, 2000);
                    }
                } else {
                    if (!silent) toast.error(message);
                }

            } catch (error) {
                // console.error("Save error:", error);
                if (!silent) toast.error(useTariffStore.getState().message, {
                    style: {
                        backgroundColor: "#FF0000",
                        color: "#fff",
                    },
                });
            } finally {
                setHasUnsavedChanges(false);
                if (!silent) setLastEditedVehicleId(null);
                await fetchPackageTariffByVehicleId(vehicleId, serviceId, type);
            }
        } catch (error) {
            // console.error("Save error:", error);
            if (!silent) toast.error(useTariffStore.getState().message, {
                style: {
                    backgroundColor: "#FF0000",
                    color: "#fff",
                },
            });
        }
    };

    const selectedVehicle = vehicles.find((v) => v.vehicleId === vehicleId);
    const currentTariffs = localTariffs[vehicleId] || [];
    const currentExtraPrice = currentTariffs[0]?.extraPrice || 0;

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
                            <div>
                                <Label className="block text-sm font-medium">
                                    {type === "day" ? "Days" : "Hours"} & Price{" "}
                                    <span className="text-red-500">*</span>
                                </Label>
                                <div className="flex mt-2 gap-2 items-center">
                                    <Input
                                        type="text"
                                        placeholder={`Enter ${type === "day" ? "Days" : "Hours"}`}
                                        value={dayInput}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            if (/^\d*\.?\d*$/.test(value)) {
                                                setDayInput(value);
                                            }
                                        }}
                                        className="w-28"
                                    />
                                    <Input
                                        type="text"
                                        placeholder={`Enter distance`}
                                        value={distanceLimit}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            if (/^\d*\.?\d*$/.test(value)) {
                                                setDistanceLimit(value);
                                            }
                                        }}
                                        className="w-28"
                                    />
                                    <Input
                                        type="text"
                                        placeholder="Enter Price"
                                        value={priceInput}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            if (/^\d*\.?\d*$/.test(value)) {
                                                setPriceInput(value);
                                            }
                                        }}
                                        className="flex-1"
                                    />
                                    <Button className="rounded-sm py-2" onClick={addDayPrice}>
                                        +
                                    </Button>
                                </div>
                                <div className="mt-3 space-y-2">
                                    {currentTariffs.map((tariff, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center gap-2 bg-gray-100 p-2 rounded"
                                        >
                                            <Input
                                                value={tariff.dayOrHour}
                                                onChange={(e) =>
                                                    updateDayPrice(index, "dayOrHour", e.target.value)
                                                }
                                                className="flex-1"
                                            />
                                            <Input
                                                value={tariff.distanceLimit}
                                                onChange={(e) =>
                                                    updateDayPrice(index, "distanceLimit", e.target.value)
                                                }
                                                className="flex-1"
                                            />
                                            <Input
                                                value={tariff.price}
                                                onChange={(e) =>
                                                    updateDayPrice(index, "price", e.target.value)
                                                }
                                                className="flex-1"
                                            />
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => removeDayPrice(index)}
                                            >
                                                <X size={16} className="text-red-500" />
                                            </Button>
                                        </div>
                                    ))}
                                    {currentTariffs.length === 0 && (
                                        <p className="text-sm text-gray-500">
                                            Ex: {type === "day" ? "1 Day 40 Km - ₹4000" : "4 Hours - ₹2000"}
                                        </p>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div>
                                <h3 className="text-base mb-1">{type === "day" ? "Days" : "Hours"} & Price</h3>
                                <div className="flex flex-wrap gap-2 mt-3">
                                    {currentTariffs.length > 0 ? (
                                        currentTariffs.map((tariff, index) => (
                                            <div
                                                key={index}
                                                className={`bg-gray-200 px-3 py-1 rounded-full ${tariff.status ? "text-black" : "text-gray-500 line-through"}`}
                                            >
                                                <span>
                                                    {tariff.dayOrHour} {type === "day" ? (Number(tariff.dayOrHour) > 1 ? "Days" : "Day") : (Number(tariff.dayOrHour) > 1 ? "Hours" : "Hour")} {tariff.distanceLimit} Km - ₹{tariff.price}
                                                </span>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-sm text-gray-500">
                                            Ex: {type === "day" ? "1 Day 40 Km - ₹4000" : "4 Hours - ₹2000"}
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="flex items-center justify-between mt-7">
                        <Label>Vehicle in this Service Off | On</Label>
                        <Switch
                            disabled={!isEditing}
                            className="mt-4"
                            checked={status}
                            onCheckedChange={(value) => {
                                setStatus(value);
                                setHasUnsavedChanges(true);
                                setLastEditedVehicleId(vehicleId);
                            }}
                        />
                    </div>

                    <div>
                        {isEditing ? (
                            <>
                                <Label>
                                    Extra Price (Per {type === "day" ? "Day" : "Hour"}){" "}
                                    <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    type="number"
                                    value={currentExtraPrice}
                                    className="mt-3"
                                    onChange={(e) => handleExtraPriceChange(e.target.value)}
                                />
                            </>
                        ) : (
                            <>
                                <h2 className="text-base mb-1">
                                    Extra Price (Per {type === "day" ? "Day" : "Hour"})
                                </h2>
                                <p className="mt-3">₹{currentExtraPrice} per {type === "day" ? "Day" : "Hour"}</p>
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
                        onClick={() => handleTariffUpdate(vehicleId, currentTariffs, false)}
                    >
                        Save
                    </Button>
                </div>
            )}
        </Card>
    );
}