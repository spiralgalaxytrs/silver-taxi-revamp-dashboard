"use client";

import React, { useEffect, useState } from "react";
import { Button } from "components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "components/ui/select";
import { Checkbox } from "components/ui/checkbox";
import { useVehicleTypes, useAcceptVehicleTypes } from "hooks/react-query/useVehicle";
import { Cog } from "lucide-react";
import { toast } from "sonner";

export default function VehicleTypeConfig() {
    const [open, setOpen] = useState(false);
    const [selectedType, setSelectedType] = useState<string>("");
    const [checkedTypes, setCheckedTypes] = useState<string[]>([]);

    const { data: vehicleTypes, isLoading } = useVehicleTypes();
    const { mutate: acceptMutation, isPending } = useAcceptVehicleTypes();

    const handleCheckboxChange = (type: string, checked: boolean) => {
        setCheckedTypes((prev) => {
            if (checked) {
                return prev.includes(type) ? prev : [...prev, type];
            } else {
                return prev.filter((id) => id !== type);
            }
        });
    };

    useEffect(() => {
        if (vehicleTypes) {
            const selectedTypeData = vehicleTypes.find((type: any) => type.name === selectedType);
            if (selectedTypeData) {
                setCheckedTypes(selectedTypeData.acceptedVehicleTypes || []);
            }
        }
    }, [selectedType]);

    const handleSave = () => {

        if (selectedType === "") {
            toast.error("Please select a vehicle type", {
                style: {
                    backgroundColor: "#FF0000",
                    color: "#fff",
                },
            });
            return;
        }
        acceptMutation({ name: selectedType, acceptedVehicleTypes: checkedTypes }, {
            onSuccess: () => {
                toast.success("Vehicle types accepted successfully", {
                    style: {
                        backgroundColor: "#009F7F",
                        color: "#fff",
                    },
                });
                setTimeout(() => {
                    handleDialogClose();
                }, 1000);
            },
            onError: (error: any) => {
                toast.error(error?.response?.data?.message || "Failed to accept vehicle types", {
                    style: {
                        backgroundColor: "#FF0000",
                        color: "#fff",
                    },
                });
            },
        });
    };

    const handleDialogClose = () => {
        setOpen(false);
        setSelectedType("");
        setCheckedTypes([]);
    };

    return (
        <>
            {/* Cog Button */}
            <Button variant="outline" size="icon" onClick={() => setOpen(true)}>
                <Cog className="w-5 h-5" />
            </Button>

            {/* Config Dialog */}
            <Dialog open={open} onOpenChange={handleDialogClose}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Vehicle Types Config</DialogTitle>
                    </DialogHeader>

                    {/* Dropdown */}
                    <div className="space-y-4">
                        <Select value={selectedType} onValueChange={setSelectedType}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select vehicle type" />
                            </SelectTrigger>
                            <SelectContent>
                                {vehicleTypes?.map((type: any, index: number) => (
                                    <SelectItem key={index} value={type.name}>
                                        {type.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        {/* Checkboxes List */}
                        <div className="max-h-[500px] overflow-y-auto space-y-2 border rounded p-2">
                            {isLoading ? (
                                <p className="text-sm text-gray-500">Loading vehicle types...</p>
                            ) : (
                                vehicleTypes?.map((type: any, index: number) => (
                                    <label
                                        key={index}
                                        className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded"
                                    >
                                        <Checkbox
                                            checked={checkedTypes.includes(type.name)}
                                            onCheckedChange={(checked) =>
                                                handleCheckboxChange(type.name, checked as boolean)
                                            }
                                        />
                                        <span className="text-sm">{type.name}</span>
                                    </label>
                                ))
                            )}
                        </div>

                        {/* Selected Count Display */}
                        {checkedTypes.length > 0 && (
                            <div className="text-sm text-gray-600">
                                Selected: {checkedTypes.length} vehicle type(s)
                            </div>
                        )}
                    </div>

                    {/* Save Button */}
                    <DialogFooter>
                        <Button
                            onClick={handleSave}
                            disabled={isPending || checkedTypes.length === 0}
                        >
                            {isPending ? "Saving..." : "Save"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
