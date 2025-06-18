"use client"

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "components/ui/button";
import { Checkbox } from "components/ui/checkbox"
import { Eye, Edit, Trash, Copy } from "lucide-react"
import { useRouter } from "next/navigation";
import { toast } from 'sonner';
import { useState } from "react"
import { Badge } from "components/ui/badge";
import { DetailsPopup } from "../../../../components/DetailsPopup";
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
// import { usePaymentStore } from "stores/paymentStore";

export type CustomerPayment = {
  transactionId: string;
  refId: string;
  bookingId: string;
  invoiceId: string;
  date: string;
  driverId: string;
  driverName: string;
  totalAmount: number;
  status: 'completed' | 'pending' | 'cancelled'
};

export const columns: ColumnDef<CustomerPayment>[] = [
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
    cell: ({ row }) => row.index + 1, // Assigns Serial Number dynamically
  },
  {
    accessorKey: "transactionId",
    header: "Transaction ID",
  },
  {
    accessorKey: "refId",
    header: "Reference ID",
  },
  {
    accessorKey: "bookingId",
    header: "Booking ID",
  },
  {
    accessorKey: "invoiceId",
    header: "Invoice ID",
  },
  {
    accessorKey: "date",
    header: "Date",
  },
  {
    accessorKey: "driverId",
    header: "Driver ID",
  },
  {
    accessorKey: "driverName",
    header: "Driver Name",
  },
  {
    accessorKey: "totalAmount",
    header: "Total Amount",
    cell: ({ row }) => {
      const amount = row.getValue("totalAmount");
      return `Rs ${amount}`; // Format as currency
    },
  },
  {
    accessorKey: "status",
    header: "Payment Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      //const { toggleBooking, fetchBookings, isLoading } = useBookingStore(); 
      const id = row.original.transactionId;

      const handleToggleStatus = async (newStatus: string) => {
        // await toggleBooking(id, newStatus); 
        // await fetchBookings(); 
      };

      return (
        <>
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
                  onClick={() => handleToggleStatus("completed")}
                //disabled={isLoading}
                >
                  Completed
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleToggleStatus("pending")}
                //disabled={isLoading}
                >
                  Pending
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleToggleStatus("cancelled")}
                //disabled={isLoading}
                >
                  Cancelled
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </>
      );
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const payment = row.original;
      const [showDetails, setShowDetails] = useState(false)
      const router = useRouter();
      const [isDialogOpen, setIsDialogOpen] = useState(false);
      //const { deletePayment } = usePaymentStore();

      const handleCopy = (id: string) => {
        navigator.clipboard.writeText(id)
          .then(() => {
            toast.success("Offer ID copied!", {
              style: {
                  backgroundColor: "#009F7F",
                  color: "#fff",
              },
          });
          })
          .catch((err) => {
            console.error("Failed to copy ID", err);
            toast.error("Failed to copy ID", {
              style: {
                backgroundColor: "#FF0000",
                color: "#fff",
              },
            });
          });
      }

      const handleEditPayment = async (id: string) => {
        router.push(`/admin/customer-payments/edit/${payment.transactionId}`);
      };

      const cancelDelete = () => {
        setIsDialogOpen(false);
      }

      const confirmDelete = async (id: string) => {
        //await deletePayment(id);
        setIsDialogOpen(false);
        toast.success("Payment deleted successfully");
      }

      return (
        <>
          <div className="flex items-center gap-3 justify-center">
            <div className="flex items-center gap-3">
              <DetailsPopup
                trigger={
                  <Button variant="ghost" size="icon" className="text-blue-600 hover:text-blue-800"
                    data-tooltip="View Details"
                  >
                    <Eye className="h-5 w-5" />
                  </Button>
                }
                data={payment}
                title="Payment Details"
              />
              {/* <Button
              variant="ghost"
              size="icon"
              className="text-green-600 hover:text-green-800"
              data-tooltip="Edit Payment"
              onClick={() => handleEditPayment(payment.transactionId)}
            >
              <Edit className="h-5 w-5" />
            </Button> */}

              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-red-600 hover:text-red-800"
                  onClick={() => setIsDialogOpen(true)}
                >
                  <Trash className="h-5 w-5" />
                </Button>

                <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete this Payment?
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel onClick={cancelDelete}>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => confirmDelete(payment.transactionId ?? '')}>Delete</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </>

              <Button
                variant="ghost"
                size="icon"
                className="text-gray-500 hover:text-gray-700"
                data-tooltip="Copy Transaction ID"
                onClick={() => handleCopy(payment.transactionId)}
              >
                <Copy className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </>
      );
    },
  },
];