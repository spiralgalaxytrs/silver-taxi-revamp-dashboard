"use client";

import React, { useState, useEffect } from "react";
import { Label } from "components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogTrigger,
    DialogTitle,
    DialogFooter,
} from "components/ui/dialog";
import { Button } from "components/ui/button";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Check, Loader2, Search, MapPin } from "lucide-react";
import { Input } from "components/ui/input";
import { GoogleMap, Marker } from "@react-google-maps/api";

interface DriverSelectionPopupProps {
    trigger: React.ReactNode;
    onSelectDriver: (driverId: string) => void;
    assignAllDriver: () => void;
    title?: string;
    assignedDriver?: any;
    bookedDriverId?: string;
    status: string;
    drivers: any[];
    isLoading: boolean;
    isError: boolean;
}

export function DriverSelectionPopup({
    trigger,
    onSelectDriver,
    assignAllDriver,
    title = "Select Driver",
    assignedDriver,
    bookedDriverId,
    status,
    drivers = [],
    isLoading,
    isError,
}: DriverSelectionPopupProps) {
    const [open, setOpen] = useState(false);
    const [selectedDriverId, setSelectedDriverId] = useState<string>("");
    const [searchQuery, setSearchQuery] = useState("");
    const [isAssignAll, setIsAssignAll] = useState(false);
    const [showDriverList, setShowDriverList] = useState(false);
    const [selectedDriverGeoLocation, setSelectedDriverGeoLocation] = useState<any>(null);
    const [lastViewWasDriverList, setLastViewWasDriverList] = useState(false);
    const [zoom, setZoom] = useState(7);

    const GOOGLE_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";

    const activeDrivers = drivers.filter(
        (driver: any) =>
            String(driver.driverId) !== String(bookedDriverId) &&
            driver.isActive === true
    );

    const filteredDrivers = activeDrivers.filter((driver: any) =>
        driver.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        driver.phone.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleSelectDriver = ({ driverId, geoLocation }: { driverId: string, geoLocation: any }) => {
        setSelectedDriverId(driverId);
        if (geoLocation?.latitude && geoLocation?.longitude) {
            setSelectedDriverGeoLocation(geoLocation);
            setZoom(12);
        }
        else {
            setSelectedDriverGeoLocation(null);
            setZoom(7);
        }
        setIsAssignAll(false);
    };

    useEffect(() => {
        if (assignedDriver) {
            setSelectedDriverGeoLocation(assignedDriver.geoLocation);
            setZoom(12);
        }
    }, [assignedDriver]);

    const handleAssignAll = () => {
        setIsAssignAll(true);
        setSelectedDriverId("");
        setSelectedDriverGeoLocation(null);
        setZoom(7);
        setShowDriverList(false);
        setLastViewWasDriverList(false);
    };

    const handleShowDriverList = () => {
        setShowDriverList(true);
        setIsAssignAll(false);
        setSelectedDriverGeoLocation(null);
        setZoom(7);
        setLastViewWasDriverList(true);
    };

    const handleConfirm = () => {
        if (isAssignAll) {
            assignAllDriver();
            setOpen(false);
            setSelectedDriverGeoLocation(null);
            setZoom(7);
            setLastViewWasDriverList(false);
        } else if (selectedDriverId) {
            onSelectDriver(selectedDriverId);
            setOpen(false);
            setSelectedDriverGeoLocation(null);
            setZoom(7);
            setLastViewWasDriverList(true);
        }
    };

    // Center map on first driver's location or default
    const defaultCenter = selectedDriverGeoLocation?.latitude && selectedDriverGeoLocation?.longitude
        ? {
            lat: selectedDriverGeoLocation?.latitude || 0,
            lng: selectedDriverGeoLocation?.longitude || 0,
        }
        : { lat: 11.1271, lng: 78.6569 };

    return (
        <Dialog open={open} onOpenChange={status === "Not-Started" ? setOpen : undefined}>
            <DialogTrigger asChild className={status === "Not-Started" ? "" : "pointer-events-none"}>
                {trigger}
            </DialogTrigger>
            <DialogContent
                className="w-full max-w-[900px] max-h-[90vh] overflow-hidden rounded-xl p-0 shadow-lg border-0 flex flex-row"
                onInteractOutside={(e) => e.preventDefault()}
            >
                <VisuallyHidden>
                    <DialogTitle>{title}</DialogTitle>
                </VisuallyHidden>

                {/* Left: Map */}
                <div className="w-1/2 h-[90vh]">
                    <GoogleMap
                        mapContainerStyle={{ width: "100%", height: "100%" }}
                        center={defaultCenter}
                        zoom={zoom}
                        options={{
                            restriction: {
                                latLngBounds: {
                                    north: 37.084107,
                                    south: 6.4626999,
                                    west: 68.1097,
                                    east: 97.39535869999999
                                },
                                strictBounds: true
                            },
                            streetViewControl: false,
                            mapTypeControl: false
                        }}
                    >
                        {activeDrivers.map((driver, idx) => {
                            console.log("driver geoLocation >> ", driver.geoLocation, "driverId >> ", driver.driverId);
                            return (
                                <Marker
                                    key={idx}
                                    position={{
                                        lat: driver.geoLocation?.latitude || 0,
                                        lng: driver.geoLocation?.longitude || 0,
                                    }}
                                    onClick={() => handleSelectDriver(driver.driverId)}
                                />
                            );
                        })}
                    </GoogleMap>
                </div>

                {/* Right: Selection UI */}
                <div className="w-1/2 flex flex-col p-6 overflow-y-auto">
                    <h4 className="text-2xl font-semibold text-center mb-4">{title}</h4>

                    {!showDriverList ? (
                        <div className="grid gap-3">
                            <Button onClick={handleAssignAll}>
                                Assign All Drivers
                                {isAssignAll && <Check className="h-4 w-4 ml-2" />}
                            </Button>
                            <Button className="w-full" onClick={handleShowDriverList} variant="outline">
                                Select Single Driver
                            </Button>
                        </div>
                    ) : (
                        <>
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

                                <div className="grid gap-3 pb-20">
                                    {assignedDriver && (
                                        <div
                                            key={assignedDriver.driverId}
                                            className={`p-4 border rounded-xl cursor-pointer transition-all duration-200 hover:border-primary/50 ${selectedDriverId === assignedDriver.driverId
                                                ? 'bg-green-50 border-primary shadow-sm'
                                                : 'bg-card border-border hover:bg-accent/50'
                                                }`}
                                            onClick={() => handleSelectDriver({driverId: assignedDriver.driverId, geoLocation: assignedDriver.geoLocation})}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <Label className="font-medium text-base flex items-center gap-2">
                                                        {assignedDriver.name}
                                                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                            Assigned
                                                        </span>
                                                    </Label>
                                                    <p className="text-sm text-muted-foreground mt-1">
                                                        {assignedDriver.phone}
                                                        {assignedDriver.geoLocation?.latitude && assignedDriver.geoLocation?.longitude && (
                                                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                                <MapPin className="w-4 h-4" />
                                                                {assignedDriver.geoLocation?.timestamp
                                                                    ? new Date(assignedDriver.geoLocation.timestamp).toLocaleString("en-IN", {
                                                                        year: "numeric",
                                                                        month: "2-digit",
                                                                        day: "2-digit",
                                                                        hour: "2-digit",
                                                                        minute: "2-digit",
                                                                        hour12: true,
                                                                    })
                                                                    : null}
                                                            </span>
                                                        )}
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


                                    {filteredDrivers.map((driver, index) => (
                                        <div
                                            key={index}
                                            className={`p-4 border rounded-xl cursor-pointer transition-all duration-200 hover:border-primary/50 ${selectedDriverId === driver.driverId
                                                ? "bg-green-50 border-primary shadow-sm"
                                                : "bg-card border-border hover:bg-accent/50"
                                                }`}
                                            onClick={() => handleSelectDriver({ driverId: driver.driverId, geoLocation: driver.geoLocation })}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <Label className="font-medium text-base">
                                                        {driver.name}
                                                    </Label>
                                                    <p className="text-sm text-muted-foreground mt-1">
                                                        {driver.phone}
                                                        {driver.geoLocation?.latitude && driver.geoLocation?.longitude && (
                                                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                                <MapPin className="w-4 h-4" />
                                                                {driver.geoLocation?.timestamp
                                                                    ? new Date(driver.geoLocation.timestamp).toLocaleString("en-IN", {
                                                                        year: "numeric",
                                                                        month: "2-digit",
                                                                        day: "2-digit",
                                                                        hour: "2-digit",
                                                                        minute: "2-digit",
                                                                        hour12: true,
                                                                    })
                                                                    : null}
                                                            </span>
                                                        )}
                                                    </p>
                                                </div>
                                                {selectedDriverId === driver.driverId && (
                                                    <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
                                                        <Check className="h-4 w-4" />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                    {/* Footer */}
                    <DialogFooter className="mt-auto gap-2 sm:gap-0 sticky bottom-[-5] bg-white py-4">
                        <Button
                            variant="outline"
                            onClick={() => {
                                if (showDriverList) {
                                    setShowDriverList(false);
                                    setSelectedDriverId("");
                                    setLastViewWasDriverList(false);
                                } else {
                                    setOpen(false);
                                }
                            }}
                            className="w-full sm:w-auto"
                        >
                            {showDriverList ? "Back" : "Cancel"}
                        </Button>
                        <Button
                            onClick={handleConfirm}
                            disabled={!selectedDriverId && !isAssignAll}
                            className="w-full sm:w-auto"
                            variant="primary"
                        >
                            Confirm
                        </Button>
                    </DialogFooter>
                </div>
            </DialogContent>
        </Dialog>
    );
}
