"use client";

import React, { useState, useEffect } from 'react';
import { Label } from 'components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogTrigger,
    DialogTitle,
    DialogFooter,
} from "components/ui/dialog";
import { Button } from "components/ui/button";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Check, Loader2, Search, SquareChevronRight } from 'lucide-react';
import { Input } from 'components/ui/input';

interface DriverSelectionPopupProps {
    trigger: React.ReactNode;
    onSelectDriver: (driverId: string) => void; // Callback to handle selected driver
    assignAllDriver: () => void;
    title?: string;
    assignedDriver?: any; // Currently assigned driver (if any)
    bookedDriverId?: string; // ID of the driver already booked (if any)
    status: string; // Status of the booking
    drivers: any[];
    isLoading: boolean;
    isError: boolean;
}

export function DriverSelectionPopup({
    trigger,
    onSelectDriver,
    assignAllDriver,
    title = 'Select Driver',
    assignedDriver,
    bookedDriverId,
    status,
    drivers = [],
    isLoading,
    isError
}: DriverSelectionPopupProps) {
    const [open, setOpen] = useState(false);
    const [selectedDriverId, setSelectedDriverId] = useState<string>('');
    const [searchQuery, setSearchQuery] = useState('');

    const handleSelectDriver = (driverId: string) => {
        setSelectedDriverId(driverId);
    };

    const handleConfirm = () => {
        if (selectedDriverId) {
            onSelectDriver(selectedDriverId);
            setOpen(false);
        }
    };

    // Remove already booked and assigned drivers
    const activeDrivers = drivers.filter(
        (driver: any) =>
            String(driver.driverId) !== String(bookedDriverId) &&
            driver.isActive === true
    );

    const filteredDrivers = activeDrivers.filter((driver: any) =>
        driver.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        driver.phone.toLowerCase().includes(searchQuery.toLowerCase())
    );
    return (
        <Dialog open={open} onOpenChange={status === "Not-Started" ? setOpen : undefined}>
            <DialogTrigger asChild className={status === "Not-Started" ? "" : "pointer-events-none"}>
                {trigger}
            </DialogTrigger>
            <DialogContent
                className="w-full max-w-[600px] max-h-[90vh] overflow-y-auto rounded-xl p-6 shadow-lg border-0"
                onInteractOutside={(e) => e.preventDefault()}
            >
                <VisuallyHidden>
                    <DialogTitle>{title}</DialogTitle>
                </VisuallyHidden>

                <div className="grid gap-6">
                    <h4 className="text-2xl font-semibold text-center mb-2">{title}</h4>

                    {/* Search Input */}
                    <div className="relative mb-4">
                        <Input
                            type="text"
                            placeholder="Search by name or phone..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10"
                        />
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                    </div>

                    {isLoading && (
                        <div className="flex justify-center items-center py-8">
                            <Loader2 className="h-6 w-6 animate-spin" />
                        </div>
                    )}

                    {!isLoading && !isError && status !== "Completed" && (
                        <div className="grid gap-3">
                            {activeDrivers.length > 0 ? (
                                <React.Fragment>
                                    <div>
                                        <div
                                            className={`p-4 border rounded-xl cursor-pointer transition-all duration-200 hover:border-primary/50`}
                                            onClick={assignAllDriver}>
                                            <div>
                                                <div className="flex items-center justify-between ">
                                                    <Label className="font-medium text-base flex items-center gap-2">
                                                        Assign All Drivers
                                                    </Label>
                                                    <SquareChevronRight className="text-muted-foreground" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    {/* Show assigned driver (if any) */}
                                    {assignedDriver && (
                                        <div
                                            key={assignedDriver.driverId}
                                            className={`p-4 border rounded-xl cursor-pointer transition-all duration-200 hover:border-primary/50 ${selectedDriverId === assignedDriver.driverId
                                                ? 'bg-green-50 border-primary shadow-sm'
                                                : 'bg-card border-border hover:bg-accent/50'
                                                }`}
                                            onClick={() => handleSelectDriver(assignedDriver.driverId)}
                                        >
                                            <div className="flex items-center justify-between ">
                                                <div>
                                                    <Label className="font-medium text-base flex items-center gap-2">
                                                        {assignedDriver.name}
                                                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                            Assigned
                                                        </span>
                                                    </Label>
                                                    <p className="text-sm text-muted-foreground mt-1">
                                                        {assignedDriver.phone}
                                                    </p>
                                                </div>
                                                {selectedDriverId === assignedDriver.driverId && (
                                                    <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
                                                        <Check className="h-4 w-4" />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Show other active drivers */}
                                    {filteredDrivers.map((driver: any, index: number) => (
                                        <React.Fragment key={index}>
                                            <div
                                                className={`p-4 border rounded-xl cursor-pointer transition-all duration-200 hover:border-primary/50
                                                ${selectedDriverId === driver.driverId
                                                        ? 'bg-green-50 border-primary shadow-sm'
                                                        : 'bg-card border-border hover:bg-accent/50'
                                                    }`}
                                                onClick={() => handleSelectDriver(driver.driverId)}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <Label className="font-medium text-base">
                                                            {driver.name}
                                                        </Label>
                                                        <p className="text-sm text-muted-foreground mt-1">
                                                            {driver.phone}
                                                        </p>
                                                    </div>
                                                    {selectedDriverId === driver.driverId && (
                                                        <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
                                                            <Check className="h-4 w-4" />
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </React.Fragment>
                                    ))}
                                </React.Fragment>
                            ) : (
                                <div className="text-center text-muted-foreground py-8 bg-muted/50 rounded-lg">
                                    No drivers available.
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <DialogFooter className="mt-6 gap-2 sm:gap-0">
                    <Button
                        variant="outline"
                        onClick={() => setOpen(false)}
                        className="w-full sm:w-auto"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleConfirm}
                        disabled={!selectedDriverId}
                        className="w-full sm:w-auto"
                        variant={'primary'}
                    >
                        Confirm
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}