"use client"

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Label } from 'components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle
} from "components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Button } from 'components/ui/button';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "components/ui/alert-dialog";
import {
  useAssignDriver,
  useAssignAllDriver,
  useTogglePaymentMethod,
  useToggleTripStatus,
  useTogglePaymentStatus,
  useDeleteBooking,
  useFetchBookings,
  useToggleContactStatus
} from "hooks/react-query/useBooking";
import {
  useDrivers
} from 'hooks/react-query/useDriver';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "components/ui/dropdown-menu";
import { Eye, Pencil, Trash, CheckCircle, HelpCircle } from 'lucide-react';
import ActionDropdown from 'components/others/ActionComponent';
import { DriverSelectionPopup } from "components/driver/SelectDriver";
import TooltipComponent from "components/others/TooltipComponent";
import { isLocalDateTime } from 'lib/dateFunctions';
interface BookingPopupProps {
  trigger: React.ReactNode;
  booking: Record<string, any> | null;
  title?: string;
  width?: string;
  size?: string;
}


export function BookingPopup({
  trigger,
  booking,
  title = "Booking Details",
}: BookingPopupProps) {
  const [open, setOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const router = useRouter();

  const {
    mutate: toggleContactStatus,
  } = useToggleContactStatus();

  // Driver assignment functionality
  const { data: drivers = [], isPending: isLoading, isError } = useDrivers({ enabled: open });
  const { mutate: assignDriver } = useAssignDriver();
  const { mutate: assignAllDriver } = useAssignAllDriver();

  const handleDriverAssignment = async (driverId: string) => {
    try {
      if (!booking?.bookingId) return;

      assignDriver({ bookingId: booking.bookingId, driverId }, {
        onSuccess: (data: any) => {
          toast.success(data?.message || 'Driver assigned successfully', {
            style: {
              backgroundColor: "#009F7F",
              color: "#fff",
            },
          });
        },
        onError: (error: any) => {
          toast.error(error?.response?.data?.message || 'Assignment failed', {
            style: {
              backgroundColor: "#FF0000",
              color: "#fff",
            },
          });
        }
      });

    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Assignment failed', {
        style: {
          backgroundColor: "#FF0000",
          color: "#fff",
        },
      });
    }
  };

  const handleAllDriverAssign = async () => {
    try {
      if (!booking?.bookingId) return;

      assignAllDriver({ id: booking.bookingId }, {
        onSuccess: (data: any) => {
          toast.success(data?.message || 'Notification sent to eligible drivers successfully', {
            style: {
              backgroundColor: "#009F7F",
              color: "#fff",
            },
          });
        },
        onError: (error: any) => {
          toast.error(error?.response?.data?.message || 'Assign All drivers failed', {
            style: {
              backgroundColor: "#FF0000",
              color: "#fff",
            },
          });
        }
      });
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Assign All drivers failed', {
        style: {
          backgroundColor: "#FF0000",
          color: "#fff",
        },
      });
    }
  };

  // Auto-set contact status to "Contacted" when popup opens
  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);

    // When popup opens and booking is not contacted, automatically set to contacted
    if (newOpen && booking && !booking.isContacted) {
      toggleContactStatus({
        id: booking.bookingId,
        status: true
      }, {
        onSuccess: (data: any) => {
          // Silently update the contact status without showing toast
          // The table will automatically refresh and show the updated status
        },
        onError: (error: any) => {
          // Silently handle error without showing toast
          console.error('Failed to update contact status:', error);
        }
      });
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
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

  const bookingDetails = useMemo(() => {
    if (!booking || !open) return null;

    return {
      "Booking Id": booking.bookingId || "-",
      "Name": booking.name || "-",
      "Phone Number": booking.phone || "-",
      "Email": booking.email || "-",
      "Pick Up": booking.pickup || "-",
      "Drop": booking.drop || "-",
      "Stops": Array.isArray(booking.stops) && booking.stops.length
        ? booking.stops.map(s => s.location || s).join(", ")
        : "-",

      "Pickup Date & Time": isLocalDateTime({ dateTime: booking.pickupDateTime || "" }) || "-",
      // "Pickup Date": isLocalDateTime({ date: booking.pickupDateTime || "" }) || "-",
      // "Pickup Time": isLocalDateTime({ time: booking.pickupDateTime || "" }) || "-",
      "Drop Date": booking.dropDate ? formatDate(booking.dropDate) : "-",
      "Service Type": booking.serviceType || "-",
      "Vehicle Name": booking.vehicles?.name || "-",
      "Vehicle Type": booking.vehicles?.type || "-",
      "Distance": booking.distance || 0,
      "Duration": booking.duration || 0,
      "Price Per Km": booking.pricePerKm || 0,
      "Estimated Amount": booking.estimatedAmount || 0,
      "Driver Assigned": booking.driver?.name || "-",
      "Driver Beta": booking.driverBeta || "-",
      "Toll": booking.toll || 0,
      "Hill": booking.hill || 0,
      "Permit Charge": booking.permitCharge || 0,
      "Tax Percentage": booking.taxPercentage || 0,
      "Offer Name": booking.offers?.offerName || "-",
      "DiscountAmount": booking.discountAmount || 0,
      "Advance Amount": booking.advanceAmount || 0,
      "FinalAmount": booking.finalAmount || 0,
      "Payment Method": booking.paymentMethod || "-",
      "Payment Status": booking.paymentStatus || "-",
      "Type": booking.type || "-",
      "Status": booking.status || "-",
      "CreatedBy": booking.createdBy || "-",
      "Booking Date": formatDate(booking.createdAt || "") || "-",
    };
  }, [booking, open]);



  const {
    mutate: deleteBooking,
  } = useDeleteBooking();

  const handleDelete = async (id: string) => {
    try {
      deleteBooking(id, {
        onSuccess: () => {
          toast.success("Booking deleted successfully");
          // router.push("/admin/bookings");
          setOpen(false);
        },
        onError: () => {
          toast.error("Failed to delete booking");
        },
      }); // Wait for deletion to complete
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to booking driver", {
        style: {
          backgroundColor: "#FF0000",
          color: "#fff",
        },
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
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

          {bookingDetails && (
            <div className="grid gap-4">
              {/* Driver Assignment Button - Top Left */}
              <div className="flex items-center gap-3 mb-4">
                <Label className="text-sm font-medium">Assign Driver:</Label>
                {(() => {
                  const currentBooking = booking;
                  const bookedDriverId = currentBooking?.driverId;
                  const assignedDriver = drivers.find((driver: any) => String(driver.driverId) === String(bookedDriverId));

                  return (
                    <DriverSelectionPopup
                      trigger={
                        <Button variant="outline" size="sm" disabled={false}>
                          {assignedDriver ?
                            <p className="flex items-center gap-2 text-sm font-medium">
                              {assignedDriver.name}
                              <TooltipComponent name={booking?.driverId ? booking?.driverAccepted || "" : "Assign Driver"}>
                                {currentBooking?.driverAccepted === "accepted" ?
                                  <span className="text-xs text-green-500">
                                    <CheckCircle className="h-4 w-4" />
                                  </span>
                                  : <span className="text-xs text-red-500">
                                    <HelpCircle className="h-4 w-4" />
                                  </span>
                                }
                              </TooltipComponent>
                            </p>
                            : "Assign Driver"}
                        </Button>
                      }
                      onSelectDriver={handleDriverAssignment}
                      assignAllDriver={handleAllDriverAssign}
                      assignedDriver={assignedDriver}
                      bookedDriverId={bookedDriverId || ""}
                      status={booking?.status || ""}
                      drivers={drivers}
                      isLoading={isLoading}
                      isError={isError}
                    />
                  );
                })()}
              </div>

              <ActionDropdown
                id={booking?.bookingId}
                type="booking"
                onDelete={handleDelete}
                viewPath="/admin/bookings/view"
                editPath="/admin/bookings/edit"
                className="absolute top-20 right-4"
                disableEdit={booking?.status === "Completed"}

              />





              {Object.entries(bookingDetails)
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
                    (typeof value === "string" && (value.trim() === "" || value === "-"))
                ) && (
                  <div className="text-center text-muted-foreground">
                    No relevant booking details available.
                  </div>
                )}
            </div>
          )}

          {bookingDetails === null && (
            <div className="text-center text-muted-foreground">
              No booking details found.
            </div>
          )}

        </div>
      </DialogContent>
    </Dialog >
  );
}
