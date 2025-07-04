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
import { useBookingStore } from 'stores/bookingStore';
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Book } from 'lucide-react';

interface BookingPopupProps {
  trigger: React.ReactNode;
  id: string;
  title?: string;
  width?: string;
  size?: string;
}

interface BookingDetails {
  [key: string]: any;
}

export function BookingPopup({ trigger, id, title = 'Booking Details', width, size = 'max-h-[80vh]' }: BookingPopupProps) {
  const { bookings, booking, fetchBookings, fetchBookingById } = useBookingStore();
  const [open, setOpen] = useState(false);
  const [bookingDetails, setBookingDetails] = useState<BookingDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
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
      fetchBookingDetails(id);
    }
  }, [open, id]);

    const fetchBookingDetails = async (id: string) => {
        setLoading(true);
        setError(null);
        try {
            const booking = bookings.find((booking) => booking.bookingId === id);
            if (booking) {
                const formattedBooking = {
                    "Booking Id": booking.bookingId || '-',
                    "Name": booking.name || '-',
                    "Phone Number": booking.phone || '-',
                    "Email": booking.email || '-',
                    "Pick Up": booking.pickup || '-',
                    "Drop": booking.drop || '-',
                    "Pickup Date": formatDate(booking.pickupDate || '') || '-',
                    "Pickup Time": formattedTime(booking.pickupDate || '') || '-',
                    "Drop Date": booking.dropDate ? formatDate(booking.dropDate) : '-',
                    "Service Type": booking.serviceType || '-',
                    "Vehicle Name": booking.vehicles?.name || '-',
                    "Vehicle Type": booking.vehicles?.type || '-',
                    "Distance": booking.distance || '-',
                    "Duration": booking.duration || '-',
                    "Price Per Km": booking.pricePerKm || 0,
                    "Estimated Amount": booking.estimatedAmount || 0,
                    "Driver Assigned": booking.driver?.name || '-',
                    "Driver Beta": booking.driverBeta || '-',
                    "Toll": booking.toll || 0,
                    "Hill": booking.hill || 0,
                    "Permit Charge": booking.permitCharge || 0,
                    "Tax Percentage": booking.taxPercentage || 0,
                    // "Offer Id": booking.offerId || '-',
                    "Offer Name": booking.offers?.offerName || '-',
                    "DiscountAmount": booking.discountAmount || 0,
                    "Advance Amount": booking.advanceAmount || 0,
                    "FinalAmount": booking.finalAmount || 0,
                    "Payment Method": booking.paymentMethod || '-',
                    "Payment Status": booking.paymentStatus || '-',
                    "Type": booking.type || '-',
                    "Status": booking.status || '-',
                    "CreatedBy": booking.createdBy || '-',
                    "Booking Date": formatDate(booking.createdAt || '') || '-',
                };
                setBookingDetails(formattedBooking);
            } else {
                setError("Booking not found");
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

          {bookingDetails && (
            <div className="grid gap-4">
              {Object.entries(bookingDetails)
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
                      {typeof value === "number" ? value.toLocaleString() : value}
                    </div>
                  </div>
                ))}
              {Object.keys(bookingDetails).length > 0 &&
                Object.entries(bookingDetails).every(
                  ([_, value]) =>
                    value === null ||
                    value === undefined ||
                    (typeof value === "number" && value <= 0) ||
                    (typeof value === "string" && (value.trim() === '' || value === '-'))
                ) && (
                  <div className="text-center text-muted-foreground">
                    No relevant booking details available.
                  </div>
                )}
            </div>
          )}
          {!bookingDetails && !loading && !error && (
            <div className="text-center text-muted-foreground">
              No booking details found.
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}