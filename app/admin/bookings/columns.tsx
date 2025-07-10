"use client"

import React, { useCallback, useEffect, useState } from "react";
import { Button } from "components/ui/button"
import { Edit, SendHorizontal, Trash, Eye, ChevronDown } from "lucide-react"
import { useRouter } from "next/navigation"
import { Badge } from "components/ui/badge"
import { BookingPopup } from "components/booking/BookingPopup"
import { DriverSelectionPopup } from "components/driver/SelectDriver"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "components/ui/dropdown-menu"
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
} from 'components/ui/alert-dialog';
import { toast } from "sonner";
import {
  useAssignDriver,
  useTogglePaymentMethod,
  useToggleTripStatus,
  useTogglePaymentStatus,
  useDeleteBooking,
  useFetchBookings
} from "hooks/react-query/useBooking";
import {
  useActiveDrivers
} from 'hooks/react-query/useDriver';
import {
  useOffers
} from 'hooks/react-query/useOffers';
import {
  MRT_ColumnDef
} from 'material-react-table';
import TooltipComponent from "components/others/TooltipComponent";

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
  paymentStatus: "Unpaid" | "Paid" | "Partial Paid";
  serviceType: "One way" | "Round trip" | "Hourly Package" | "Day Package" | "Airport";
  vehicleName: string;
  distance: number | null;
  amount: number | null;
  bookingDate: string;
  status: "Completed" | "Cancelled" | "Not-Started" | "Started";
  advanceAmount: number | null;
}

export const columns: MRT_ColumnDef<Booking>[] = [
  // {
  //   id: "select",
  //   header:'select',
  //   Header: ({ table }) => (
  //     <Checkbox
  //       checked={table.getIsAllPageRowsSelected()}
  //       onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
  //     />
  //   ),
  //   Cell: ({ row }) => (
  //     <Checkbox
  //       checked={row.getIsSelected()}
  //       onCheckedChange={(value) => row.toggleSelected(!!value)}
  //     />
  //   ),
  // },
  {
    header: "S.No",
    Cell: ({ row }) => {
      return <div>{row.index + 1}</div>
    },
    muiTableHeadCellProps: { align: 'center' },
    muiTableBodyCellProps: { align: 'center' },
  },
  {
    accessorKey: "bookingId",
    header: "Booking ID",
    muiTableHeadCellProps: { align: 'center' },
    muiTableBodyCellProps: { align: 'center' },
  },


  {
    accessorKey: "name",
    header: "Customer Name",
    Cell: ({ row }) => {
      const name = row.getValue("name");
      return <div>{!name || name === "null" ? "-" : String(name)}</div>;
    },
    muiTableHeadCellProps: { align: 'center' },
    muiTableBodyCellProps: { align: 'center' },
  },
  {
    accessorKey: "phone",
    header: "Mobile Number",
    Cell: ({ row }) => {
      const phone = row.original.phone
      return <div>+{phone}</div>;
    },
    muiTableHeadCellProps: { align: 'center' },
    muiTableBodyCellProps: { align: 'center' },
  },
  {
    accessorKey: "pickup",
    header: "From",
    Cell: ({ row }) => {
      const pickup = row.getValue("pickup") as string;
      if (!pickup) return <div>-</div>;
      return (
        <TooltipComponent name={pickup}>
          <div>{pickup.slice(0, 15)}...</div>
        </TooltipComponent>
      )
    },
    muiTableHeadCellProps: { align: 'center' },
    muiTableBodyCellProps: { align: 'center' },
  },
  {
    accessorKey: "drop",
    header: "To",
    Cell: ({ row }) => {
      const drop = row.getValue("drop") as string;
      if (!drop) return <div>-</div>;
      return (
        <TooltipComponent name={drop}>
          <div>{drop.slice(0, 15)}...</div>
        </TooltipComponent>
      )
    },
    muiTableHeadCellProps: { align: 'center' },
    muiTableBodyCellProps: { align: 'center' },
  },
  {
    accessorKey: "pickupDateTime",
    id: "pickupDate",
    header: "PickUp Date",
    Cell: ({ row }) => {
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
    muiTableHeadCellProps: { align: 'center' },
    muiTableBodyCellProps: { align: 'center' },
  },
  {
    accessorKey: "pickupDateTime",
    id: "pickupTime",
    header: "PickUp Time",
    Cell: ({ row }) => {
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
    muiTableHeadCellProps: { align: 'center' },
    muiTableBodyCellProps: { align: 'center' },
  },
  {
    accessorKey: "dropDate",
    header: "Drop Date",
    Cell: ({ row }) => {
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
    muiTableHeadCellProps: { align: 'center' },
    muiTableBodyCellProps: { align: 'center' },
  },

  {
    accessorKey: "serviceType",
    header: "Service Type",
    muiTableHeadCellProps: { align: 'center' },
    muiTableBodyCellProps: { align: 'center' },
  },
  {
    accessorKey: "distance",
    header: "Distance",
    Cell: ({ row }) => {
      const distance = parseFloat(row.getValue("distance"));
      return <div>{`${distance} Km`}</div>;
    },
    muiTableHeadCellProps: { align: 'center' },
    muiTableBodyCellProps: { align: 'center' },
  },
  {
    accessorKey: "estimatedAmount",
    header: "Estimated Amount",
    Cell: ({ row }) => {
      const amount = parseFloat(row.getValue("estimatedAmount"))
      const formatted = new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
      }).format(amount)

      return <div>{formatted}</div>
    },
    muiTableHeadCellProps: { align: 'center' },
    muiTableBodyCellProps: { align: 'center' },
  },
  {
    accessorKey: "discountAmount",
    header: "Discount Amount",
    Cell: ({ row }) => {
      const amount = parseFloat(row.getValue("discountAmount"))
      const formatted = new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
      }).format(amount)

      return <div>{formatted}</div>
    },
    muiTableHeadCellProps: { align: 'center' },
    muiTableBodyCellProps: { align: 'center' },
  },
  {
    accessorKey: "offerId",
    header: "Offer Details",
    Cell: ({ row }) => {
      const offerId = row.getValue("offerId")
      const { data: offers = [] } = useOffers();
      const offer = offers.find((offer: any) => offer.offerId === offerId);
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
    muiTableHeadCellProps: { align: 'center' },
    muiTableBodyCellProps: { align: 'center' },
  },
  {
    accessorKey: "finalAmount",
    header: "Total Amount",
    Cell: ({ row }) => {
      const amount = parseFloat(row.getValue("finalAmount"))
      const formatted = new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
      }).format(amount)

      return <div>{formatted}</div>
    },
    muiTableHeadCellProps: { align: 'center' },
    muiTableBodyCellProps: { align: 'center' },
  },
  {
    accessorKey: "advanceAmount",
    header: "Advance Amount",
    Cell: ({ row }) => {
      const amount = parseFloat(row.getValue("advanceAmount"))
      const formatted = new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
      }).format(amount)

      return <div>{formatted}</div>
    },
    muiTableHeadCellProps: { align: 'center' },
    muiTableBodyCellProps: { align: 'center' },
  },
  {
    accessorKey: "upPaidAmount",
    header: "Remaining Amount",
    Cell: ({ row }) => {
      const amount = parseFloat(row.getValue("upPaidAmount"))
      const formatted = new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
      }).format(amount)

      return <div>{formatted}</div>
    },
    muiTableHeadCellProps: { align: 'center' },
    muiTableBodyCellProps: { align: 'center' },
  },
  {
    accessorKey: 'driverId',
    header: 'Driver Assigned',
    Cell: ({ row }) => {
      const status = row.getValue("status") as string;
      const { data: activeDrivers = [] } = useActiveDrivers();
      const { data: bookings = [] } = useFetchBookings();
      const {
        mutate: assignDriver,
      } = useAssignDriver();
      const bookingId = row.original?.bookingId as string ?? "";
      const [isLoading, setIsLoading] = useState(false);
      // const [selectedDriverId, setSelectedDriverId] = useState<string>(''); // Keep this state for UI purposes

      const handleDriverAssignment = async (driverId: string) => {
        try {
          if (!bookingId) return;

          // setSelectedDriverId(driverId);
          assignDriver({ bookingId, driverId }, {
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
              // setSelectedDriverId('');
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

      const currentBooking = bookings.find((booking: any) => String(booking.bookingId) === String(bookingId));
      const bookedDriverId = currentBooking?.driverId;
      const assignedDriver = activeDrivers.find((driver: any) => String(driver.driverId) === String(bookedDriverId));

      return (
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
      );
    },
    muiTableHeadCellProps: { align: 'center' },
    muiTableBodyCellProps: { align: 'center' },
  },

  {
    accessorKey: "paymentMethod",
    header: "Payment Type",
    Cell: ({ row }) => {
      const status = row.getValue("paymentMethod") as string;
      const {
        mutate: togglePaymentType,
        isPending: isLoading
      } = useTogglePaymentMethod();
      const id = row.original?.bookingId as string ?? "";

      const handlePmethodToggleStatus = async (newStatus: string) => {
        togglePaymentType({ id, method: newStatus }, {
          onSuccess: (data: any) => {
            toast.success(data?.message || 'Payment type updated successfully', {
              style: {
                backgroundColor: "#009F7F",
                color: "#fff",
              },
            });
          },
          onError: (error: any) => {
            toast.error(error?.response?.data?.message || 'Payment type update failed', {
              style: {
                backgroundColor: "#FF0000",
                color: "#fff",
              },
            });
          }
        });
      };

      return (
        <div className="flex items-center justify-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="h-8 hover:bg-transparent active:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
              >
                <Badge variant="outline">
                  {status}
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Badge> {/* Display current status */}
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
    muiTableHeadCellProps: { align: 'center' },
    muiTableBodyCellProps: { align: 'center' },
  },
  {
    accessorKey: "paymentStatus",
    header: "Payment Status",
    Cell: ({ row }) => {
      const status = row.getValue("paymentStatus") as string;
      const {
        mutate: togglePaymentStatus,
        isPending: isLoading
      } = useTogglePaymentStatus();
      const id = row.original?.bookingId as string ?? "";

      const handlePStatusToggle = async (newStatus: string) => {
        togglePaymentStatus({ id, status: newStatus }, {
          onSuccess: (data: any) => {
            toast.success(data?.message || 'Payment status updated successfully', {
              style: {
                backgroundColor: "#009F7F",
                color: "#fff",
              },
            });
          },
          onError: (error: any) => {
            toast.error(error?.response?.data?.message || 'Payment status update failed', {
              style: {
                backgroundColor: "#FF0000",
                color: "#fff",
              },
            });
          }
        });
      };

      const getStatusColor = (status: string) => {
        switch (status) {
          case "Paid":
            return "bg-[#009F7F] text-white";
          case "Unpaid":
            return "bg-[#D89216] text-white";
          case "Partial Paid":
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
                <Badge variant="outline" className={getStatusColor(status)}>
                  {status}
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Badge>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {/* Dropdown options for updating the status */}
              <DropdownMenuItem
                onClick={() => handlePStatusToggle("Unpaid")}
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
                onClick={() => handlePStatusToggle("Partial Paid")}
                disabled={isLoading}
              >
                Partially Paid
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
    muiTableHeadCellProps: { align: 'center' },
    muiTableBodyCellProps: { align: 'center' },
  },
  {
    accessorKey: "type",
    header: "Booking Type",
    muiTableHeadCellProps: { align: 'center' },
    muiTableBodyCellProps: { align: 'center' },
  },
  {
    accessorKey: "status",
    header: "Trip Status",
    Cell: ({ row }) => {
      const status = row.getValue("status") as string;
      const [isDialogOpen, setIsDialogOpen] = useState(false);
      const {
        mutate: toggleTripStatus,
        isPending: isLoading
      } = useToggleTripStatus();
      const id = row.original?.bookingId as string ?? "";
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
        toggleTripStatus({ id, status: newStatus }, {
          onSuccess: (data: any) => {
            toast.success(data?.message || 'Trip status updated successfully', {
              style: {
                backgroundColor: "#009F7F",
                color: "#fff",
              },
            });
          },
          onError: (error: any) => {
            toast.error(error?.response?.data?.message || 'Trip status update failed', {
              style: {
                backgroundColor: "#FF0000",
                color: "#fff",
              },
            });
          }
        });
      };

      return (
        <div className="flex items-center justify-center">
          {booking.status !== "Completed" && <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="h-8 hover:bg-transparent active:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
              >
                <Badge variant="outline" className={getStatusColor(status)}>
                  {status}
                  {status !== "Completed" && <ChevronDown className="ml-2 h-4 w-4" aria-hidden="true" />}
                </Badge>
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
    muiTableHeadCellProps: { align: 'center' },
    muiTableBodyCellProps: { align: 'center' },
  },
  {
    accessorKey: "createdBy",
    header: "Created By",
    muiTableHeadCellProps: { align: 'center' },
    muiTableBodyCellProps: { align: 'center' },
  },

  {
    accessorKey: "createdAt",
    header: "Bookings At",
    Cell: ({ row }) => {
      const bookingDate: string = row.getValue("createdAt");
      if (!bookingDate) {
        return <div>-</div>;
      }

      // Parse the stored UTC date
      const utcDate = new Date(bookingDate);
      console.log("utcDate ===> ", utcDate.toLocaleTimeString());
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
    muiTableHeadCellProps: { align: 'center' },
    muiTableBodyCellProps: { align: 'center' },
  },
  {
    id: "actions",
    header: "Actions",
    Cell: ({ row }) => {
      const booking = row.original
      const [isDialogOpen, setIsDialogOpen] = useState(false);
      const router = useRouter()

      const handleEditBooking = useCallback(async (id: string | undefined) => {
        router.push(`/admin/bookings/edit/${id}`)
      }, [router])

      const {
        mutate: deleteBooking,
      } = useDeleteBooking();
      const handleDelete = async (id: string) => {
        try {
          deleteBooking(id, {
            onSuccess: () => {
              toast.success("Booking deleted successfully");
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
        <React.Fragment>
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
        </React.Fragment>
      )
    },
    muiTableHeadCellProps: { align: 'center' },
    muiTableBodyCellProps: { align: 'center' },
  },
]
