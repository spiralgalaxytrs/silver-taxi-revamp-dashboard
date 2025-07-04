"use client"

import React, { useState, useEffect } from 'react';
import { Label } from 'components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle
} from "components/ui/dialog";
import { Button } from "components/ui/button";
import { useEnquiryStore } from 'stores/enquiryStore';
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Book } from 'lucide-react';

interface EnquiryPopupProps {
  trigger: React.ReactNode;
  id: string;
  title?: string;
  width?: string;
  size?: string;
}

interface EnquiryDetails {
  [key: string]: any;
}

export function EnquiryPopup({ trigger, id, title = 'Enquiry Details', width, size = 'max-h-[80vh]' }: EnquiryPopupProps) {
  const { enquiries } = useEnquiryStore();
  const [open, setOpen] = useState(false);
  const [enquiryDetails, setEnquiryDetails] = useState<EnquiryDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const year = date?.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Month is 0-indexed
    const day = String(date.getDate()).padStart(2, '0');
    return `${day}-${month}-${year}`;
  };

  const formattedTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { timeZone: "Asia/Kolkata", hour: 'numeric', minute: 'numeric', hour12: true });
  };

  useEffect(() => {
    if (open && id) {
      fetchEnquiryDetails(id);
    }
  }, [open, id]);

  const fetchEnquiryDetails = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const enquiry = enquiries.find((enquiry) => enquiry.enquiryId === id);
      if (enquiry) {
        const formattedEnquiry = {
          "Enquiry Id": enquiry.enquiryId || '-',
          "Name": enquiry.name || '-',
          "Phone Number": enquiry.phone || '-',
          "Email": enquiry.email || '-',
          "Pick Up": enquiry.pickup || '-',
          "Drop": enquiry.drop || '-',
          "Type": enquiry.type || '-',
          "Pickup Date": formatDate(enquiry.pickupDate) || '-',
          "Pickup Time": formattedTime(enquiry.pickupDate) || '-',
          "dropDate": enquiry.dropDate ? formatDate(enquiry.dropDate.toString()) : '-',
          "Service Type": enquiry.serviceName || '-',
          "CreatedBy": enquiry.createdBy || '-',
          "Status": enquiry.status || '-',
          "Enquiry Date": formatDate(enquiry.createdAt) || '-',
        }
        setEnquiryDetails(formattedEnquiry);
      }

    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent
        className="w-[800px] max-h-[90vh] overflow-y-auto rounded-lg p-8"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <VisuallyHidden>
          <DialogTitle>{title}</DialogTitle>
        </VisuallyHidden>

        <div className="grid gap-4">
          <h4 className="text-2xl font-semibold text-center mb-4">{title}</h4>
          {loading && <div>Loading...</div>}
          {error && <div className="text-red-500">{error}</div>}
          {enquiryDetails && (
            <div className="grid gap-4">
              {Object.entries(enquiryDetails)
                .filter(([key, value]) => {
                  // Skip if value is explicitly null or undefined
                  if (value === null || value === undefined) return false;

                  // For numbers, only show if greater than 0 (keep your logic)
                  if (typeof value === "number") return value > 0;

                  // For strings, only show if not empty or just a dash
                  if (typeof value === "string") return value.trim() !== '' && value !== '-';

                  // Include all other non-null/undefined values (e.g., booleans, objects)
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
              {Object.keys(enquiryDetails).length > 0 &&
                Object.entries(enquiryDetails).every(
                  ([_, value]) =>
                    value === null ||
                    value === undefined ||
                    (typeof value === "number" && value <= 0) ||
                    (typeof value === "string" && (value.trim() === '' || value === '-'))
                ) && (
                  <div className="text-center text-muted-foreground">
                    No relevant offer details available.
                  </div>
                )}
            </div>
          )}
          {!enquiryDetails && !loading && !error && (
            <div className="text-center text-muted-foreground">
              No offer details found.
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}