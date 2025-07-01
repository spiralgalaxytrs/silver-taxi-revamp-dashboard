"use client";

import { useState } from "react";
import { Button } from "components/ui/button";
import { Driver, useDriverStore } from "stores/driverStore";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose
} from "components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "components/ui/tooltip";
import { Check, X } from "lucide-react";
import { toast } from "sonner";

export type VerificationField =
  | "profileVerified"
  | "documentVerified"
  | "vehicleProfileVerified"
  | "vehicleDocumentVerified"
  | "vehicleDocumentVerified_rc_book_front"
  | "vehicleDocumentVerified_rc_book_back"
  | "vehicleDocumentVerified_insurance"
  | "vehicleDocumentVerified_pollution"
  | "panCard"
  | "aadharFront"
  | "aadharBack"
  | "licenseFront"
  | "licenseBack"
  | "rcFront"
  | "rcBack"
  | "insurance"
  | "pollution";

interface VerificationActionGroupProps {
  label: string;
  fieldType: VerificationField;
  driverId: string;
  previousRemark?: string;
  editedDriver?: Driver;
  vehicleId?: string;
}

export default function VerificationActionGroup({
  label,
  fieldType,
  driverId,
  previousRemark,
  editedDriver,
  vehicleId,
}: VerificationActionGroupProps) {
  const [remarks, setRemarks] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);

  const { verificationStatus, fetchDriverById } = useDriverStore((state) => state);

  const updateVerificationStatus = async (
    status: "verified" | "rejected",
    fieldType: VerificationField,
    remarks?: string
  ) => {
    const payload: Record<string, any> = { 
      status, // Include status field as required by verificationStatus
      vehicleId 
    };

    const verifiedValue = status === "verified" ? "accepted" : "rejected";
    const remarkValue = status === "rejected" ? remarks || "" : null;

    const fieldMap: Record<VerificationField, { verified: string; remark: string }> = {
      profileVerified: { verified: "profileVerified", remark: "remark" },
      documentVerified: { verified: "documentVerified", remark: "documentRemark" },
      vehicleProfileVerified: { verified: "vehicleProfileVerified", remark: "vehicleRemark" },
      vehicleDocumentVerified: { verified: "vehicleDocumentVerified", remark: "vehicleDocumentRemark" },
      vehicleDocumentVerified_rc_book_front: { verified: "rcFrontVerified", remark: "rcFrontRemark" },
      vehicleDocumentVerified_rc_book_back: { verified: "rcBackVerified", remark: "rcBackRemark" },
      vehicleDocumentVerified_insurance: { verified: "insuranceVerified", remark: "insuranceRemark" },
      vehicleDocumentVerified_pollution: { verified: "pollutionImageVerified", remark: "pollutionImageRemark" },
      panCard: { verified: "panCardVerified", remark: "panCardRemark" },
      aadharFront: { verified: "aadharImageFrontVerified", remark: "aadharImageFrontRemark" },
      aadharBack: { verified: "aadharBackVerified", remark: "aadharBackRemark" },
      licenseFront: { verified: "licenseImageFrontVerified", remark: "licenseImageFrontRemark" },
      licenseBack: { verified: "licenseImageBackVerified", remark: "licenseImageBackRemark" },
      rcFront: { verified: "rcFrontVerified", remark: "rcFrontRemark" },
      rcBack: { verified: "rcBackVerified", remark: "rcBackRemark" },
      insurance: { verified: "insuranceVerified", remark: "insuranceRemark" },
      pollution: { verified: "pollutionImageVerified", remark: "pollutionImageRemark" },
    };

    const fields = fieldMap[fieldType];
    if (!fields) {
      toast.error("Invalid document type");
      return;
    }

    payload[fields.verified] = verifiedValue;
    if (remarkValue) {
      payload[fields.remark] = remarkValue;
    }

    try {
      const message = await verificationStatus(driverId, payload);
      toast.success(message);
      await fetchDriverById(driverId);
    } catch (error: any) {
      toast.error(error.message || "Something went wrong");
    }
  };

  return (
    <div className="flex gap-2 items-center">
      {/* Approve Dialog */}
      <Dialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
        <DialogTrigger asChild>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setApproveDialogOpen(true)}
                  className="p-2"
                >
                  <Check className="h-4 w-4 text-green-600" />
                </Button>
              </TooltipTrigger>
              <TooltipContent
                side="top"
                align="center"
                className="bg-gray-800 text-white p-2 rounded text-sm"
              >
                Approve {label}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </DialogTrigger>
        <DialogContent className="w-[90vw] max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Approve {label}</DialogTitle>
            <br />
            <DialogDescription>
              <strong className="text-lg">Are you sure you want to approve this?</strong><br />
              <strong className="text-red-600">This action cannot be undone.</strong>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button
              onClick={() => {
                updateVerificationStatus("verified", fieldType);
                setApproveDialogOpen(false);
              }}
            >
              Confirm Approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogTrigger asChild>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setDialogOpen(true)}
                  className="p-2"
                >
                  <X className="h-4 w-4 text-red-600" />
                </Button>
              </TooltipTrigger>
              <TooltipContent
                side="top"
                align="center"
                className="bg-gray-800 text-white p-2 rounded text-sm"
              >
                Reject {label}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </DialogTrigger>
        <DialogContent className="w-[90vw] max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Reject {label}</DialogTitle>
            <DialogDescription>
              Enter a reason for rejecting {label.toLowerCase()}.
            </DialogDescription>
          </DialogHeader>
          {previousRemark && (
            <div className="text-sm text-gray-600 bg-gray-100 p-2 rounded mb-4 border border-gray-300">
              <strong>Previous Remark:</strong>
              <p className="whitespace-pre-wrap">{previousRemark}</p>
            </div>
          )}
          <div className="grid gap-4 py-4">
            <input
              placeholder="Enter remarks..."
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="border rounded-md p-2"
            />
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button
              onClick={() => {
                updateVerificationStatus("rejected", fieldType, remarks);
                setDialogOpen(false);
                setRemarks('');
              }}
            >
              Confirm Reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}