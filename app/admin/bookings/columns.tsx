"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Button } from "components/ui/button"
import { useOfferStore } from "stores/offerStore"
import { Edit, SendHorizontal, Copy, Trash, Eye, Link, CheckCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import { Badge } from "components/ui/badge"
import { Checkbox } from "components/ui/checkbox";
import { BookingPopup } from "components/BookingPopup"
import { DriverSelectionPopup } from "components/SelectDriver"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "components/ui/dropdown-menu"
import { useCallback, useEffect, useState } from "react"
import { useBookingStore } from "stores/bookingStore"
import { useDriverStore } from "stores/driverStore"
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogFooter
} from 'components/ui/alert-dialog'
import { toast } from "sonner"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "components/ui/select"
import { useVendorStore } from "stores/vendorStore"

export type Booking = {
  bookingId?: string;
  name: string;
  phone: string;
  email: string;
  pickup: string;
  drop: string;
  driverId: string | null;
  pickupDate: string;
  pickupTime: string;
  vehicleType: string;
  dropDate: string | null;
  discountAmount: number | null;
  tariffId: string;
  estimatedAmount: number | null;
  upPaidAmount: number | null;
  finalAmount: number | null;
  createdBy: "Admin" | "Vendor";
  createdAt?: string | null;
  offerId?: string | null;
  offerName?: string;
  paymentMethod: "UPI" | "Bank" | "Cash" | "Card";
  type: "Website" | "App" | "Manual";
  paymentStatus: "Pending" | "Paid" | "Partially Paid";
  serviceType: "One way" | "Round trip" | "Hourly Package" | "Day Package" | "Airport";
  vehicleName: string;
  distance: number | null;
  amount: number | null;
  bookingDate: string;
  status: "Completed" | "Cancelled" | "Not-Started" | "Started";
  advanceAmount: number | null;
}

export const columns: ColumnDef<Booking>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
      />
    ),
  },
  {
    header: "S.No",
    cell: ({ row }) => {
      return <div>{row.index + 1}</div>
    },
  },
  {
    accessorKey: "bookingId",
    header: "Booking ID",
  },

  {
    accessorKey: "name",
    header: "Customer Name",
  },
  {
    accessorKey: "phone",
    header: "Mobile Number",
    cell: ({ row }) => {
      const phone = row.getValue("phone") as string;
      return <div>+{phone}</div>;
    },
  },
  {
    accessorKey: "pickup",
    header: "From",
  },
  {
    accessorKey: "drop",
    header: "To",
  },
  {
    accessorKey: "pickupDate",
    header: "PickUp Date",
    cell: ({ row }) => {
      const pickupDate: string = row.getValue("pickupDate");
      if (!pickupDate) {
        return <div>-</div>;
      }

      // Parse the stored UTC date
      const utcDate = new Date(pickupDate);

      // Adjust back to IST (Subtract 5.5 hours)
      const istDate = new Date(utcDate.getTime() - (5.5 * 60 * 60 * 1000));

      // Format the corrected IST date
      const formattedDate = istDate.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });

      return <div>{formattedDate}</div>;
    },
  },
  {
    accessorKey: "pickupTime",
    header: "PickUp Time",
    cell: ({ row }) => {
      const pickupTime: string = row.getValue("pickupTime");
      if (!pickupTime) {
        return <div>-</div>;
      }

      // Parse the stored UTC date
      const utcDate = new Date(pickupTime);

      // Adjust back to IST (Subtract 5.5 hours)
      const istDate = new Date(utcDate.getTime() - (5.5 * 60 * 60 * 1000));

      // Format the corrected IST time
      const options: Intl.DateTimeFormatOptions = {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      };

      const amPmTime = new Intl.DateTimeFormat("en-IN", options).format(istDate);

      return <div>{amPmTime}</div>;
    },
  },
  {
    accessorKey: "dropDate",
    header: "Drop Date",
    cell: ({ row }) => {
      const dropDate: string = row.getValue("dropDate");
      if (!dropDate) {
        return <div>-</div>;
      }

      // Parse the stored UTC date
      const utcDate = new Date(dropDate);

      // Adjust back to IST (Subtract 5.5 hours)
      const istDate = new Date(utcDate.getTime() - (5.5 * 60 * 60 * 1000));

      // Format the corrected IST date
      const formattedDate = istDate.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });

      return <div>{formattedDate}</div>;
    },
  },

  {
    accessorKey: "serviceType",
    header: "Service Type",
  },
  {
    accessorKey: "distance",
    header: "Distance",
    cell: ({ row }) => {
      const distance = parseFloat(row.getValue("distance"));
      return <div>{`${distance} Km`}</div>;
    },
  },
  {
    accessorKey: "estimatedAmount",
    header: "Estimated Amount",
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("estimatedAmount"))
      const formatted = new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
      }).format(amount)

      return <div>{formatted}</div>
    },
  },
  {
    accessorKey: "discountAmount",
    header: "Discount Amount",
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("discountAmount"))
      const formatted = new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
      }).format(amount)

      return <div>{formatted}</div>
    },
  },
  {
    accessorKey: "offerId",
    header: "Offer Details",
    cell: ({ row }) => {
      const offerId = row.getValue("offerId")
      const { offers } = useOfferStore();
      const offer = offers.find((offer) => offer.offerId === offerId);
      if (!offer) {
        return <div>-</div>
      }
      return (
        <div>
          <p>{offer?.offerName}</p>
          <p>{offer?.value}</p>
        </div>
      )
    },
  },
  {
    accessorKey: "finalAmount",
    header: "Total Amount",
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("finalAmount"))
      const formatted = new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
      }).format(amount)

      return <div>{formatted}</div>
    },
  },
  {
    accessorKey: "advanceAmount",
    header: "Advance Amount",
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("advanceAmount"))
      const formatted = new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
      }).format(amount)

      return <div>{formatted}</div>
    },
  },
  {
    accessorKey: "upPaidAmount",
    header: "Remaining Amount",
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("upPaidAmount"))
      const formatted = new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
      }).format(amount)

      return <div>{formatted}</div>
    },
  },
  {
    accessorKey: 'driverId',
    header: 'Driver Assigned',
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      const { getActiveDrivers, activeDrivers } = useDriverStore();
      const { assignDriver, fetchBookings, bookings } = useBookingStore();
      const bookingId = row.original.bookingId;
      const [isLoading, setIsLoading] = useState(false);
      // const [selectedDriverId, setSelectedDriverId] = useState<string>(''); // Keep this state for UI purposes

      // Fetch active drivers only when the component mounts or when the driver list is empty
      useEffect(() => {
        if (activeDrivers.length === 0) {
          getActiveDrivers();
        }
      }, [activeDrivers.length, getActiveDrivers]);

      const handleDriverAssignment = async (driverId: string) => {
        try {
          if (!bookingId) return;

          // setSelectedDriverId(driverId);
          await assignDriver(bookingId, driverId);

          const { statusCode, message } = useBookingStore.getState();

          if (statusCode === 200 || statusCode === 201) {
            toast.success('Driver assigned successfully', {
              style: {
                backgroundColor: "#009F7F",
                color: "#fff",
              },
            });
            setTimeout(async () => {
              await fetchBookings();
              getActiveDrivers();
            }, 1000);
          } else {
            toast.error(message, {
              style: {
                backgroundColor: "#FF0000",
                color: "#fff",
              },
            });
            // setSelectedDriverId('');
          }
        } catch (error) {
          const { message } = useBookingStore.getState();
          toast.error(message, {
            style: {
              backgroundColor: "#FF0000",
              color: "#fff",
            },
          });
          // setSelectedDriverId('');
        }
      };

      const currentBooking = bookings.find((booking: any) => String(booking.bookingId) === String(bookingId));
      const bookedDriverId = currentBooking?.driverId;
      const assignedDriver = activeDrivers.find((driver: any) => String(driver.driverId) === String(bookedDriverId));

      return (
        <>
          <DriverSelectionPopup
            trigger={
              <Button variant="outline" size="sm" disabled={isLoading}>
                {assignedDriver ? assignedDriver.name : "Assign Driver"}
              </Button>
            }
            onSelectDriver={handleDriverAssignment}
            assignedDriver={assignedDriver}
            bookedDriverId={bookedDriverId || ""}
            status={status}
          />
        </>
      );
    },
  },

  {
    accessorKey: "paymentMethod",
    header: "Payment Type",
    cell: ({ row }) => {
      const status = row.getValue("paymentMethod") as string;
      const { togglePaymentType, fetchBookings, isLoading } = useBookingStore();
      const id = row.original.bookingId;

      const handlePmethodToggleStatus = async (newStatus: string) => {
        await togglePaymentType(id, newStatus);
        const statusCode = useBookingStore.getState().statusCode;
        const message = useBookingStore.getState().message;
        if (statusCode === 200 || statusCode === 201) {
          toast.success("Payment type updated successfully", {
            style: {
              backgroundColor: "#009F7F",
              color: "#fff",
            },
          });
          await fetchBookings();
        } else {
          toast.error(message, {
            style: {
              backgroundColor: "#FF0000",
              color: "#fff",
            },
          });
        }
      };

      return (
        <div className="flex items-center justify-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="h-8 hover:bg-transparent active:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
              >
                <Badge variant="outline">{status}</Badge> {/* Display current status */}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {/* Dropdown options for updating the status */}
              <DropdownMenuItem
                onClick={() => handlePmethodToggleStatus("Cash")}
                disabled={isLoading}
              >
                Cash
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handlePmethodToggleStatus("Card")}
                disabled={isLoading}
              >
                Card
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handlePmethodToggleStatus("UPI")}
                disabled={isLoading}
              >
                UPI
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handlePmethodToggleStatus("Bank")}
                disabled={isLoading}
              >
                Bank
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  },
  {
    accessorKey: "paymentStatus",
    header: "Payment Status",
    cell: ({ row }) => {
      const status = row.getValue("paymentStatus") as string;
      const { togglePaymentStatus, fetchBookings, isLoading } = useBookingStore();
      const id = row.original.bookingId;

      const handlePStatusToggle = async (newStatus: string) => {
        await togglePaymentStatus(id, newStatus);
        const statusCode = useBookingStore.getState().statusCode;
        const message = useBookingStore.getState().message;
        if (statusCode === 200 || statusCode === 201) {
          toast.success("Payment status updated successfully", {
            style: {
              backgroundColor: "#009F7F",
              color: "#fff",
            },
          });
          await fetchBookings();
        } else {
          toast.error(message, {
            style: {
              backgroundColor: "#FF0000",
              color: "#fff",
            },
          });
        }
      };

      const getStatusColor = (status: string) => {
        switch (status) {
          case "Paid":
            return "bg-[#009F7F] text-white";
          case "Pending":
            return "bg-[#D89216] text-white";
          case "Partially Paid":
            return "bg-[#327bf0] text-white";
          default:
            return "bg-gray-100";
        }
      };

      return (
        <div className="flex items-center justify-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="h-8 hover:bg-transparent active:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
              >
                <Badge variant="outline" className={getStatusColor(status)}>{status}</Badge>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {/* Dropdown options for updating the status */}
              <DropdownMenuItem
                onClick={() => handlePStatusToggle("Pending")}
                disabled={isLoading}
              >
                Pending
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handlePStatusToggle("Paid")}
                disabled={isLoading}
              >
                Paid
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handlePStatusToggle("Partially Paid")}
                disabled={isLoading}
              >
                Partially Paid
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  },
  {
    accessorKey: "type",
    header: "Booking Type",
  },

  {
    accessorKey: "bookingDate",
    header: "Bookings At",
    cell: ({ row }) => {
      const bookingDate: string = row.getValue("bookingDate");
      if (!bookingDate) {
        return <div>-</div>;
      }

      // Parse the stored UTC date
      const utcDate = new Date(bookingDate);
      console.log("utcDate ===> ",utcDate.toLocaleTimeString());
      // Adjust back to IST (Subtract 5.5 hours)
      const istDate = new Date(utcDate.getTime() - (5.5 * 60 * 60 * 1000));

      // Format the corrected IST time
      const options: Intl.DateTimeFormatOptions = {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      };

      const formattedDate = istDate.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });

      const amPmTime = new Intl.DateTimeFormat("en-IN", options).format(utcDate);

      return (
        <div>
          <div>{formattedDate}</div>
          <div>{amPmTime}</div>
        </div>
      )
    },
  },
  {
    accessorKey: "status",
    header: "Trip Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      const [isDialogOpen, setIsDialogOpen] = useState(false);
      const { toggleTripStatus, fetchBookings, isLoading } = useBookingStore();
      const id = row.original.bookingId;
      const booking = row.original;

      const getStatusColor = (status: string) => {
        switch (status) {
          case "Completed":
            return "bg-[#009F7F] text-white";
          case "Not-Started":
            return "bg-[#D89216] text-white";
          case "Cancelled":
            return "bg-[#e31e1e] text-white";
          case "Started":
            return "bg-[#327bf0] text-white";
          default:
            return "bg-gray-100";
        }
      };

      const handleToggleTripStatus = async (newStatus: string) => {
        if (newStatus === "Started" || newStatus === "Completed") {
          if (booking.driverId === null) {
            toast.error("Please assign a driver to the booking", {
              style: {
                backgroundColor: "#FF0000",
                color: "#fff",
              },
            });
            return;
          }
        }
        await toggleTripStatus(id, newStatus);
        const statusCode = useBookingStore.getState().statusCode;
        const message = useBookingStore.getState().message;
        if (statusCode === 200 || statusCode === 201) {
          toast.success("Trip status updated successfully", {
            style: {
              backgroundColor: "#009F7F",
              color: "#fff",
            },
          });
          await fetchBookings();
        } else {
          toast.error(message, {
            style: {
              backgroundColor: "#FF0000",
              color: "#fff",
            },
          });
        }
      };

      return (
        <div className="flex items-center justify-center">
          {booking.status !== "Completed" && <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="h-8 hover:bg-transparent active:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
              >
                <Badge variant="outline" className={getStatusColor(status)}>{status}</Badge>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {/* Show "Not Started" only if the booking is currently not started */}
              {booking.status !== "Started" && (
                <DropdownMenuItem
                  onClick={() => handleToggleTripStatus("Not-Started")}
                  disabled={isLoading}
                >
                  Not Started
                </DropdownMenuItem>
              )}

              {/* Show "Started" only if the trip is not already started or completed */}
              {booking.status === "Not-Started" && (
                <DropdownMenuItem
                  onClick={() => handleToggleTripStatus("Started")}
                  disabled={isLoading}
                >
                  Started
                </DropdownMenuItem>
              )}

              {/* Show "Completed" only if the trip is started and a driver is assigned */}
              {booking.status === "Started" && booking.driverId !== null && (
                <>
                  <DropdownMenuItem
                    onClick={() => setIsDialogOpen(true)}
                    disabled={isLoading}
                  >
                    Completed
                  </DropdownMenuItem>
                </>
              )}

              {/* Show "Cancelled" only if the trip is not completed */}
              {booking.status !== "Cancelled" && (
                <DropdownMenuItem
                  onClick={() => handleToggleTripStatus("Cancelled")}
                  disabled={isLoading}
                >
                  Cancelled
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
          }

          {booking.status === "Completed"
            && <Badge variant="outline" className={`${getStatusColor(status)} cursor-default`}>{status}</Badge>}

          {/* Status Completed Confirmation */}
          <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <AlertDialogContent className="max-w-xl w-full">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-3xl">Complete Booking</AlertDialogTitle>
                <AlertDialogDescription className="text-lg">
                  Are you sure you want to mark this booking as completed?<br />
                  <span className="text-red-600 text-center">Note: This action cannot be undone.</span>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setIsDialogOpen(false)}>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => { handleToggleTripStatus("Completed"); setIsDialogOpen(false); }}>Confirm</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

        </div >
      );
    },
  },
  {
    accessorKey: "createdBy",
    header: "Created By",
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const booking = row.original
      const [isDialogOpen, setIsDialogOpen] = useState(false);
      const router = useRouter()

      const handleEditBooking = useCallback(async (id: string | undefined) => {
        await router.push(`/admin/bookings/edit/${id}`)
      }, [router])

      const { deleteBooking } = useBookingStore();
      const handleDelete = async (id: string) => {
        try {
          await deleteBooking(id); // Wait for deletion to complete
          await useBookingStore.getState().fetchBookings();
          toast.success("Booking deleted successfully");
          window.location.reload();
        } catch (error) {
          toast.error("Failed to booking driver", {
            style: {
              backgroundColor: "#FF0000",
              color: "#fff",
            },
          });
        }
      };

      const handleConvertBooking = async (id: string) => {
        try {
          router.push(`/admin/invoices/create?bookingId=${id}`);
        } catch (error) {
          toast.error("Failed to convert booking", {
            style: {
              backgroundColor: "#FF0000",
              color: "#fff",
            },
          });
        }
      }

      return (
        <div className="flex items-center gap-3">
          {/* Convert to Booking Icon */}

          {/*View Icon*/}
          <BookingPopup
            trigger={
              <Button
                variant="ghost"
                size="icon"
                className="text-blue-600 hover:text-blue-800 tool-tip"
                data-tooltip="View Details"
              >
                <Eye className="h-5 w-5" />
              </Button>
            }
            id={booking.bookingId || ""}
          />

          {/* Edit Icon */}
          <Button
            variant="ghost"
            size="icon"
            className="text-green-600 hover:text-green-800 tool-tip"
            data-tooltip="Edit Booking"
            disabled={booking.status === "Completed"}
            onClick={() => handleEditBooking(booking.bookingId)}
          >
            <Edit className="h-5 w-5" />
          </Button>

          {/* Delete Icon */}
          <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="text-red-600 hover:text-red-800 tool-tip"
                data-tooltip="Delete Driver"
                onClick={() => setIsDialogOpen(true)}
              >
                <Trash className="h-5 w-5" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete these bookings?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setIsDialogOpen(false)}>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => { handleDelete(booking.bookingId || ""); setIsDialogOpen(false); }}>Delete</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {/* Convert to booking  */}
          {booking.status === "Completed" && <Button
            variant="ghost"
            size="icon"
            className="text-yellow-600 hover:text-yellow-800 tool-tip"
            data-tooltip="Convert to Booking"
            onClick={() => handleConvertBooking(booking.bookingId || "")}
          >
            <SendHorizontal className="h-6 w-6" />
          </Button>}
        </div>
      )
    },
  },
]
