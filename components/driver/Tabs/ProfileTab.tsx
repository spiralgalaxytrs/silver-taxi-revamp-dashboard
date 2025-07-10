"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent } from "components/ui/card";
import { Layout, Eye, ZoomIn, ZoomOut } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "components/ui/dialog";
import { toast } from "sonner";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "components/ui/dropdown-menu";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "components/ui/tooltip";
import { Badge } from "components/ui/badge";
import { Button } from "components/ui/button";
import Image from "next/image";
import VerificationActionGroup, { VerificationField } from "components/driver/VerificationActionGroup";
import {
    useToggleDriverStatus,
} from 'hooks/react-query/useDriver';
import { Driver, ExpiryStatus } from "types/react-query/driver";


interface ProfileTabProps {
    editedDriver: Driver | null;
    driverDocuments: Array<{
        type: VerificationField;
        url: string | undefined;
        label: string;
        expiry?: string;
        isExpired?: boolean;
        status?: "accepted" | "rejected" | "pending";
        remark?: string;
    }>;
    expiryStatus: ExpiryStatus | null;
    id: string | string[];
    handleImageClick: (url: string, label: string) => void;
    selectedImage: string | null;
    selectedImageLabel: string;
    zoomLevel: number;
    position: { x: number; y: number };
    isDragging: boolean;
    refetch: () => void;
    handleMouseDown: (e: React.MouseEvent<HTMLDivElement>) => void;
    handleMouseMove: (e: React.MouseEvent<HTMLDivElement>) => void;
    handleMouseUp: () => void;
    handleTouchStart: (e: React.TouchEvent<HTMLDivElement>) => void;
    handleTouchMove: (e: React.TouchEvent<HTMLDivElement>) => void;
    handleTouchEnd: () => void;
    handleZoomIn: () => void;
    handleZoomOut: () => void;
    imageContainerRef: React.RefObject<HTMLDivElement>;
}

export default function ProfileTab({
    editedDriver,
    driverDocuments,
    expiryStatus,
    id,
    handleImageClick,
    selectedImage,
    selectedImageLabel,
    zoomLevel,
    position,
    isDragging,
    refetch,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    handleZoomIn,
    handleZoomOut,
    imageContainerRef,
}: ProfileTabProps) {

    const { mutate: toggleDriverStatus } = useToggleDriverStatus();

    // extract current editedDriver directly from
    // const editedDriver = drivers.find((d) => d.driverId === id);


    const handleToggleStatus = async (newStatus: boolean) => {
        if (!editedDriver?.driverId) return;

        try {
            toggleDriverStatus({ id: editedDriver?.driverId, status: newStatus }, {
                onSuccess: () => {
                    toast.success("Driver status updated successfully", {
                        style: { backgroundColor: "#009F7F", color: "#fff" },
                    });
                    refetch();
                },
                onError: () => {
                    toast.error("Failed to update status", {
                        style: { backgroundColor: "#FF0000", color: "#fff" },
                    });
                },
            });

        } catch (error) {
            toast.error("Failed to update status", {
                style: { backgroundColor: "#FF0000", color: "#fff" },
            });
        }
    };

    if (!editedDriver) {
        return (
            <div className="flex items-center justify-center h-64 bg-gray-50 p-6">
                <div className="text-center">
                    <Layout className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="text-lg font-medium text-gray-900">No Driver Data</h3>
                    <p className="text-sm text-gray-500">Driver information is not available.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 p-6">
            <div className="flex justify-between items-start">
                <h2 className="text-black text-lg font-bold">Driver Information</h2>
                <div className="flex gap-2 items-center">
                    {typeof editedDriver?.profileVerified === "string" &&
                        editedDriver?.profileVerified === "accepted" ? (
                        <span className="inline-flex items-center px-3 py-1 text-sm font-medium text-green-800 bg-green-100 rounded-full">
                            Profile Verified
                        </span>
                    ) : (
                        <>
                            {typeof editedDriver?.profileVerified === "string" &&
                                editedDriver?.profileVerified === "rejected" && (
                                    <span className="inline-flex items-center px-3 py-1 text-sm font-medium text-red-800 bg-red-100 rounded-full">
                                        Profile Rejected
                                    </span>
                                )}

                            <VerificationActionGroup
                                label="Driver Info"
                                fieldType="profileVerified"
                                driverId={id as string}
                                previousRemark={editedDriver?.remark}
                                editedDriver={editedDriver}
                                vehicleId={
                                    editedDriver?.vehicle && editedDriver?.vehicle?.length > 0
                                        ? editedDriver?.vehicle[editedDriver?.vehicle?.length - 1]?.vehicleId
                                        : undefined
                                }
                            />
                        </>
                    )}
                </div>
            </div>

            <div className="bg-white p-6 rounded-lg border">
                <div className="space-y-3 text-gray-700">
                    <div className="flex items-center gap-3">
                        <span className="font-semibold w-32">Full Name:</span>
                        <p className="text-gray-900">{editedDriver?.name || "-"}</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="font-semibold w-32">Email Address:</span>
                        <p className="text-gray-900 break-all">{editedDriver?.email || "-"}</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="font-semibold w-32">Phone Number:</span>
                        <p className="text-gray-900">{editedDriver?.phone || "-"}</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="font-semibold w-32">Address:</span>
                        <p className="text-gray-900">{editedDriver?.address || "-"}</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="font-semibold w-32">License Validity:</span>
                        <div className="flex items-center gap-2">
                            <p className="text-gray-900">
                                {expiryStatus?.license?.expiry
                                    ? new Date(expiryStatus?.license?.expiry).toLocaleDateString()
                                    : editedDriver?.licenseValidity
                                        ? new Date(editedDriver.licenseValidity).toLocaleDateString()
                                        : "-"}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="font-semibold w-32">Status</span>
                        <div className="mt-1 rounded-md">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        className="h-auto p-0 hover:bg-transparent focus:outline-none"
                                    >
                                        <Badge
                                            className={`text-xs px-2 py-0.5 rounded-full border font-semibold transition-all duration-150 cursor-pointer hover:scale-105 shadow-sm flex items-center gap-1
                                            ${editedDriver?.isActive === true
                                                    ? 'bg-green-500 hover:bg-green-600 border-green-500 text-white'
                                                    : 'bg-red-500 hover:bg-red-600 border-red-500 text-white'
                                                }`}
                                        >
                                            {editedDriver?.isActive === true ? 'Active' : 'Inactive'}
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                className="h-3 w-3 text-white opacity-80"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </Badge>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48">
                                    <DropdownMenuItem onClick={() => handleToggleStatus(true)}>
                                        ✅ Set as Active
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleToggleStatus(false)}>
                                        🚫 Set as Inactive
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="font-semibold w-32">Verification Status:</span>
                        <p className="text-gray-900 capitalize">
                            {editedDriver.adminVerified || "Pending"}
                        </p>
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <h2 className="text-lg font-bold">Document Verification</h2>
                </div>
                {driverDocuments.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {driverDocuments.map((doc) => (

                            <div key={doc.type} className="border rounded-lg p-4">
                                <div className="flex justify-between items-center mb-3">
                                    <span className="font-medium capitalize">{doc.label}</span>
                                    <div className="flex items-center gap-2">


                                        {doc.status === "accepted" ? (
                                            <Badge variant={"default"}>
                                                Document Verified
                                            </Badge>
                                        ) : (
                                            <>
                                                {doc.status === "rejected" && (
                                                    <Badge variant={"destructive"}>
                                                        Document Rejected
                                                    </Badge>
                                                )}
                                                <VerificationActionGroup
                                                    label={doc.label}
                                                    fieldType={doc.type as VerificationField}
                                                    driverId={id as string}
                                                    previousRemark={doc.remark}
                                                    editedDriver={editedDriver}
                                                    vehicleId={
                                                        editedDriver?.vehicle && editedDriver.vehicle.length > 0
                                                            ? editedDriver.vehicle[editedDriver.vehicle.length - 1]?.vehicleId
                                                            : undefined
                                                    }
                                                />
                                            </>
                                        )}
                                    </div>
                                </div>
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <div
                                            className="relative h-48 w-full rounded-md overflow-hidden border cursor-pointer group"
                                            onClick={() =>
                                                handleImageClick(doc.url || "/placeholder.png", doc.label)
                                            }
                                        >
                                            <Image
                                                src={doc.url || "/placeholder.png"}
                                                alt={doc.label}
                                                fill
                                                className="object-contain bg-gray-50"
                                                onError={(e) => {
                                                    e.currentTarget.src = "/placeholder.png";
                                                }}
                                            />
                                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity duration-200 flex items-center justify-center">
                                                <Eye className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                                            </div>
                                        </div>
                                    </DialogTrigger>
                                    <DialogContent className="w-[90vw] max-w-[500px]">
                                        <DialogHeader>
                                            <DialogTitle>{selectedImageLabel}</DialogTitle>
                                        </DialogHeader>
                                        <div
                                            className="relative h-[500px] w-full overflow-hidden"
                                            ref={imageContainerRef}
                                            onMouseDown={handleMouseDown}
                                            onMouseMove={handleMouseMove}
                                            onMouseUp={handleMouseUp}
                                            onMouseLeave={handleMouseUp}
                                            onTouchStart={handleTouchStart}
                                            onTouchMove={handleTouchMove}
                                            onTouchEnd={handleTouchEnd}
                                            style={{ cursor: zoomLevel > 1 ? "move" : "default" }}
                                        >
                                            <div
                                                className="relative w-full h-full"
                                                style={{
                                                    transform: `scale(${zoomLevel}) translate(${position.x}px, ${position.y}px)`,
                                                    transformOrigin: "center center",
                                                    transition: isDragging
                                                        ? "none"
                                                        : "transform 0.2s ease-in-out",
                                                }}
                                            >
                                                <Image
                                                    src={selectedImage || "/placeholder.png"}
                                                    alt={selectedImageLabel}
                                                    fill
                                                    className="object-contain"
                                                    onError={(e) => {
                                                        e.currentTarget.src = "/placeholder.png";
                                                    }}
                                                />
                                            </div>
                                        </div>
                                        <div className="flex justify-center gap-4 mt-4">
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button
                                                        variant="outline"
                                                        size="icon"
                                                        onClick={handleZoomOut}
                                                        disabled={zoomLevel <= 0.5}
                                                        className="p-2"
                                                    >
                                                        <ZoomOut className="w-5 h-5" />
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent
                                                    side="top"
                                                    align="center"
                                                    className="bg-gray-800 text-white p-2 rounded text-sm"
                                                >
                                                    Tap to zoom out
                                                </TooltipContent>
                                            </Tooltip>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button
                                                        variant="outline"
                                                        size="icon"
                                                        onClick={handleZoomIn}
                                                        disabled={zoomLevel >= 3}
                                                        className="p-2"
                                                    >
                                                        <ZoomIn className="w-5 h-5" />
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent
                                                    side="top"
                                                    align="center"
                                                    className="bg-gray-800 text-white p-2 rounded text-sm"
                                                >
                                                    Tap to zoom in
                                                </TooltipContent>
                                            </Tooltip>
                                        </div>
                                    </DialogContent>
                                </Dialog>

                                {doc.expiry && (
                                    <div className="mt-2">
                                        <p className="text-sm text-black-500">Expiry Status:
                                            <Tooltip>
                                                <TooltipTrigger>
                                                    <Badge
                                                        variant={doc.isExpired ? "destructive" : "default"}
                                                        className="text-xs"
                                                    >
                                                        {doc.isExpired ? "Expired" : "Valid"}
                                                    </Badge>
                                                </TooltipTrigger>
                                                <TooltipContent
                                                    side="top"
                                                    align="center"
                                                    className="bg-gray-800 text-white p-2 rounded text-sm"
                                                >
                                                    Document Expiry Status ({new Date(doc.expiry).toLocaleDateString()})
                                                </TooltipContent>
                                            </Tooltip>
                                        </p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 border rounded-lg">
                        <Layout className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="text-lg font-medium text-gray-900">No documents available</h3>
                        <p className="text-sm text-gray-500">
                            This driver hasn't uploaded any documents yet.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}