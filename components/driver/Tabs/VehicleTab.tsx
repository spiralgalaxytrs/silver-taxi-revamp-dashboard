"use client";

import React from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "components/ui/accordion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "components/ui/dialog";
import { Button } from "components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "components/ui/tooltip";
import { Badge } from "components/ui/badge";
import { Layout, Eye, ZoomIn, ZoomOut } from "lucide-react";
import Image from "next/image";
import VerificationActionGroup, { VerificationField } from "components/driver/VerificationActionGroup";
import { Driver } from "types/react-query/driver";

interface VehicleTabProps {
  editedDriver: Driver | null;
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

export default function VehicleTab({
  editedDriver,
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
}: VehicleTabProps) {
  return (
    <div className="space-y-6 p-6">
      <div className="space-y-4">
        <h2 className="text-lg font-bold">Vehicle(s) Information</h2>
        {editedDriver?.vehicle && editedDriver.vehicle.length > 0 ? (
          <Accordion type="single" collapsible className="space-y-4" defaultValue="vehicle-0">
            {editedDriver.vehicle.map((vehicle, index) => {
              return (
                <AccordionItem
                  key={index}
                  value={`vehicle-${index}`}
                  className="border rounded-lg"
                >
                  <AccordionTrigger
                    className="px-6 py-4 text-left no-underline hover:no-underline hover:bg-slate-100">
                    <div className="flex justify-between items-center w-full">
                      <span className="font-semibold">
                        {vehicle.name || `Vehicle ${index + 1}`}
                      </span>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="inline-flex items-center justify-center w-auto h-5 m-0 p-0 rounded-full">
                              <span
                                className={`text-xs px-2 py-0.5 rounded-full ${typeof vehicle.adminVerified === "string" &&


                                  vehicle.adminVerified === "Approved"
                                  ? "bg-green-100 text-green-800 border border-green-400"
                                  : "bg-red-100 text-red-800 border border-red-400"
                                  }`}
                              >
                                {typeof vehicle.adminVerified === "string" &&


                                  vehicle.adminVerified === "Approved"
                                  ? "Accepted"
                                  : "Rejected / Not Approved"}
                              </span>
                            </span>
                          </TooltipTrigger>
                          <TooltipContent
                            side="top"
                            align="center"
                            className="bg-gray-800 text-white p-2 rounded text-sm"
                          >
                            {typeof vehicle.adminVerified === "string" &&

                              vehicle.adminVerified === "Approved"

                              ? "Vehicle Verified"
                              : "Vehicle not verified"}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-6">
                    <div className="bg-white p-6 rounded-lg border">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-md font-semibold">Vehicle Details</h3>
                        <div className="flex gap-2 items-center">
                          {typeof vehicle.profileVerified === "string" &&
                            vehicle.profileVerified === "accepted" ? (
                            <span className="inline-flex items-center px-3 py-1 text-sm font-medium text-green-800 bg-green-100 rounded-full">
                              Vehicle Profile Verified
                            </span>
                          ) : (
                            <>
                              {typeof vehicle.profileVerified === "string" &&
                                vehicle.profileVerified === "rejected" && (
                                  <span className="inline-flex items-center px-3 py-1 text-sm font-medium text-red-800 bg-red-100 rounded-full">
                                    Vehicle Profile Rejected
                                  </span>
                                )}
                              <VerificationActionGroup
                                label="Vehicle Profile"
                                fieldType="vehicleProfileVerified"
                                driverId={id as string}
                                previousRemark={vehicle?.remark}
                                editedDriver={editedDriver}
                                vehicleId={vehicle?.vehicleId}
                              />
                            </>
                          )}
                        </div>
                      </div>

                      <div className="space-y-3 text-gray-700">
                        {/* <div className="flex items-center gap-3">
                          <span className="font-semibold w-32">Vehicle Name:</span>
                          <p className="text-gray-900">{vehicle.name || "-"}</p>
                        </div> */}
                        <div className="flex items-center gap-3">
                          <span className="font-semibold w-32">Vehicle Type:</span>
                          <p className="text-gray-900">{vehicle.type || "-"}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-semibold w-32">Vehicle Number:</span>
                          <p className="text-gray-900">{vehicle.vehicleNumber || "-"}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-semibold w-32">Fuel Type:</span>
                          <p className="text-gray-900">{vehicle.fuelType || "-"}</p>
                        </div>
                        {/* <div className="flex items-center gap-3">
                          <span className="font-semibold w-32">Vehicle Year:</span>
                          <p className="text-gray-900">{vehicle.vehicleYear || "-"}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-semibold w-32">RC Expiry:</span>
                          <div className="flex items-center gap-2">
                            <p className="text-gray-900">
                              {vehicle.rcExpiryDate
                                  ? new Date(vehicle.rcExpiryDate).toLocaleDateString()
                                  : "-"}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-semibold w-32">Insurance Expiry:</span>
                          <div className="flex items-center gap-2">
                            <p className="text-gray-900">
                              {vehicle.insuranceExpiryDate
                                  ? new Date(vehicle.insuranceExpiryDate).toLocaleDateString()
                                  : "-"}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-semibold w-32">Pollution Expiry:</span>
                          <div className="flex items-center gap-2">
                            <p className="text-gray-900">
                              {vehicle.pollutionExpiryDate
                                  ? new Date(vehicle.pollutionExpiryDate).toLocaleDateString()
                                  : "-"}
                            </p>
                          </div>
                        </div> */}
                        <div className="flex items-center gap-3">
                          <span className="font-semibold w-32">Verification Status:</span>
                          <p className="text-gray-900 capitalize">
                            {vehicle.adminVerified || "Pending"}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-4 mt-6">
                        <div className="flex justify-between items-center">
                          <h3 className="text-lg font-bold">Vehicle Documents</h3>
                        </div>

                        {(vehicle.rcBookImageFront ||
                          vehicle.rcBookImageBack ||
                          vehicle.insuranceImage ||
                          vehicle.pollutionImage) ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {[
                              {
                                type: "rcFront" as VerificationField,
                                url: vehicle.rcBookImageFront,
                                label: "RC Book Front",
                                expiry: vehicle.rcExpiryDate,
                                isExpired: vehicle.rcExpiryDate ? new Date(vehicle.rcExpiryDate) < new Date() : false,
                                status: vehicle.rcFrontVerified as "accepted" | "rejected" | "pending" | undefined,
                                remark: vehicle.rcFrontRemark,
                              },
                              {
                                type: "rcBack" as VerificationField,
                                url: vehicle.rcBookImageBack,
                                label: "RC Book Back",
                                expiry: vehicle.rcExpiryDate,
                                isExpired: vehicle.rcExpiryDate ? new Date(vehicle.rcExpiryDate) < new Date() : false,
                                status: vehicle.rcBackVerified as "accepted" | "rejected" | "pending" | undefined,
                                remark: vehicle.rcBackRemark,
                              },
                              {
                                type: "insurance" as VerificationField,
                                url: vehicle.insuranceImage,
                                label: "Insurance",
                                expiry: vehicle.insuranceExpiryDate,
                                isExpired: vehicle.insuranceExpiryDate ? new Date(vehicle.insuranceExpiryDate) < new Date() : false,
                                status: vehicle.insuranceVerified as "accepted" | "rejected" | "pending" | undefined,
                                remark: vehicle.insuranceRemark,
                              },
                              /* {
                                type: "pollution" as VerificationField,
                                url: vehicle.pollutionImage,
                                label: "Pollution Certificate",
                                expiry: vehicle.pollutionExpiryDate,
                                isExpired: vehicle.pollutionExpiryDate ? new Date(vehicle.pollutionExpiryDate) < new Date() : false,
                                status: vehicle.pollutionImageVerified as "accepted" | "rejected" | "pending" | undefined,
                                remark: vehicle.pollutionImageRemark,
                              }, */
                            ]
                              .filter((doc) => doc?.url)
                              .map((doc) => (
                                <div key={doc.type} className="border rounded-lg p-4">
                                  <div className="flex justify-between items-center mb-3">
                                    <span className="font-medium capitalize">{doc.label}</span>
                                    <div className="flex items-center gap-2">

                                      {doc.status === "accepted" ? (
                                        <Badge variant="default" className="text-xs">
                                          Document Verified
                                        </Badge>
                                      ) : (
                                        <>
                                          {doc.status === "rejected" && (
                                            <Badge variant="destructive" >
                                              Document Rejected
                                            </Badge>
                                          )}
                                          <VerificationActionGroup
                                            label={doc.label}
                                            fieldType={doc.type}
                                            driverId={id as string}
                                            previousRemark={doc.remark}
                                            editedDriver={editedDriver}
                                            vehicleId={vehicle.vehicleId}
                                          />
                                        </>
                                      )}
                                    </div>
                                  </div>
                                  {/* {doc.expiry && (
                                    <div className="mt-2">
                                      <p className="text-sm text-black mr-2">
                                        Expiry Status:
                                        <TooltipProvider>
                                          <Tooltip>
                                            <TooltipTrigger>
                                              <Badge
                                                variant={doc.isExpired ? "destructive" : "default"}
                                                className="text-xs ml-2"
                                              >
                                                {doc.isExpired ? "Expired" : "Valid"}
                                              </Badge>
                                            </TooltipTrigger>
                                            <TooltipContent
                                              side="top"
                                              align="center"
                                              className="bg-gray-800 text-white p-2 rounded text-sm"
                                            >
                                              <p>Expiry Date: {new Date(doc.expiry).toLocaleDateString()}</p>
                                              <p>{doc.isExpired ? "Document has expired" : "Document is valid"}</p>
                                            </TooltipContent>
                                          </Tooltip>
                                        </TooltipProvider>
                                      </p>
                                    </div>
                                  )} */}
                                  <Dialog
                                    onOpenChange={(open) => {
                                      if (!open) {
                                        handleZoomOut();
                                        handleImageClick("", "");
                                      }
                                    }}
                                  >
                                    <DialogTrigger asChild>
                                      <div
                                        className="relative h-48 w-full rounded-md overflow-hidden border cursor-pointer group"
                                        onClick={() =>
                                          handleImageClick(doc?.url || "/placeholder.png", doc.label)
                                        }
                                      >
                                        <Image
                                          src={doc?.url || "/placeholder.png"}
                                          alt={doc?.label}
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
                                        <TooltipProvider>
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
                                        </TooltipProvider>
                                      </div>
                                    </DialogContent>
                                  </Dialog>

                                </div>
                              ))}
                          </div>
                        ) : (
                          <div className="text-center py-12 border rounded-lg">
                            <Layout className="mx-auto h-12 w-12 text-gray-400" />
                            <h3 className="text-lg font-medium text-gray-900">
                              No vehicle documents
                            </h3>
                            <p className="text-sm text-gray-500">
                              No vehicle documents have been uploaded.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 border rounded-lg">
            <div className="text-center space-y-4">
              <Layout className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="text-lg font-medium text-gray-900">No Vehicle Information</h3>
              <p className="text-sm text-gray-500">
                This driver hasn't added any vehicle details yet.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}