"use client";

import React, { useState, useMemo } from "react";
import { Label } from "components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
} from "components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import ActionDropdown from "components/others/ActionComponent";
import { useEnquiryById, useDeleteEnquiry } from "hooks/react-query/useEnquiry";
import { toast } from 'sonner';

interface EnquiryPopupProps {
  trigger: React.ReactNode;
  enquiry: Record<string, any> | null;
  title?: string;
  width?: string;
  size?: string;
}

export function EnquiryPopup({
  trigger,
  enquiry,
  title = "Enquiry Details",
}: EnquiryPopupProps) {
  const [open, setOpen] = useState(false);


  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const year = date?.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${day}-${month}-${year}`;
  };

  const formattedTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      timeZone: "Asia/Kolkata",
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    });
  };

  const enquiryDetails = useMemo(() => {
    if (!enquiry) return null;

    return {
      "Enquiry Id": enquiry.enquiryId || "-",
      Name: enquiry.name || "-",
      "Phone Number": enquiry.phone || "-",
      Email: enquiry.email || "-",
      "Pick Up": enquiry.pickup || "-",
      Drop: enquiry.drop || "-",
      Type: enquiry.type || "-",
      "Pickup Date": formatDate(enquiry.pickupDateTime) || "-",
      "Pickup Time": formattedTime(enquiry.pickupDateTime) || "-",
      dropDate: enquiry.dropDate ? formatDate(enquiry.dropDate.toString()) : "-",
      "Service Type": enquiry.serviceType || "-",
      CreatedBy: enquiry.createdBy || "-",
      Status: enquiry.status || "-",
      "Enquiry Date": formatDate(enquiry.createdAt) || "-",
    };
  }, [enquiry]);


  const { mutate: deleteEnquiry } = useDeleteEnquiry();
  const handleDelete = async () => {
    try {
      deleteEnquiry(enquiry?.enquiryId || "", {
        onSuccess: () => {
          toast.success("Enquiry deleted successfully", {
            style: {
              backgroundColor: "#009F7F", // Tailwind green-500
              color: "#fff",
            },
          });
          setOpen(false);
        },
        onError: () => {
          toast.error("An unexpected error occurred", {
            style: {
              backgroundColor: "#FF0000",
              color: "#fff",
            },
          });
        }
      });
    } catch (error) {
      toast.error("An unexpected error occurred", {
        style: {
          backgroundColor: "#FF0000",
          color: "#fff",
        },
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent
        className="w-[800px] max-h-[90vh] overflow-y-auto rounded-lg p-8"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <VisuallyHidden>
          <DialogTitle>{title}</DialogTitle>
        </VisuallyHidden>

        <div className="grid gap-4">
          <h4 className="text-2xl font-semibold text-center mb-4">{title}</h4>




          {enquiryDetails && (
            <div className="grid gap-4">

              <ActionDropdown
                id={enquiry?.enquiryId}
                type="booking"
                onDelete={handleDelete}
                // viewPath="/admin/enquiries/view"
                editPath="/admin/enquiry/edit"
                className="absolute top-20 right-4"
                disableView
              />
              {Object.entries(enquiryDetails)
                .filter(([_, value]) => {
                  if (value === null || value === undefined) return false;
                  if (typeof value === "number") return value > 0;
                  if (typeof value === "string") return value.trim() !== "" && value !== "-";
                  return true;
                })
                .map(([key, value]) => (
                  <div key={key} className="grid grid-cols-3 items-center gap-4">
                    <Label className="capitalize font-medium text-base">{key}</Label>
                    <div className="col-span-2 text-base text-muted-foreground">
                      {value}
                    </div>
                  </div>
                ))}

              {Object.entries(enquiryDetails).every(
                ([_, value]) =>
                  value === null ||
                  value === undefined ||
                  (typeof value === "number" && value <= 0) ||
                  (typeof value === "string" && (value.trim() === "" || value === "-"))
              ) && (
                  <div className="text-center text-muted-foreground">
                    No relevant enquiry details available.
                  </div>
                )}
            </div>
          )}

          {enquiryDetails === null && (
            <div className="text-center text-muted-foreground">
              No enquiry details found.
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
