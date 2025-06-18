"use client";

import { useCallback, useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { DetailsPopup } from '../../../../components/DetailsPopup'
import { Button } from "components/ui/button";
import { Edit, Copy, Trash, Eye } from 'lucide-react';
import { Checkbox } from "components/ui/checkbox";
import { toast } from 'sonner';
import { Badge } from "components/ui/badge";
import { useRouter } from "next/navigation";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "components/ui/dropdown-menu";
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

export type ServicePayment = {
  transactionId: string;
  refId: string;
  driverId: string;
  date: string;
  amount: number;
  status: 'completed' | 'pending' | 'cancelled';
};

export const columns: ColumnDef<ServicePayment>[] = [
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
    accessorKey: "driverId",
    header: "Driver ID",
  },
  {
    accessorKey: "date",
    header: "Date",
  },
  {
    accessorKey: "amount",
    header: "Amount",
    cell: ({ row }) => {
      const amount = row.getValue("amount");
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
      const router = useRouter();
      const [showDetails, setShowDetails] = useState(false);
      const [isDialogOpen, setIsDialogOpen] = useState(false);
      //const { deletePayment } = usePaymentStore();


      // const handleEditInvoice = () => {
      //   router.push(`/admin/invoices/edit/${payment.transactionId}`);
      // };

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
            toast.error("Failed to copy ID", {
              style: {
                backgroundColor: "#FF0000",
                color: "#fff",
              },
            });
          });
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
        <div className="flex items-center gap-3 justify-center">
          <div className="flex items-center gap-3">
            {/* View Icon */}
            <DetailsPopup
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
              data={payment}
              title="Offer Details"
            />
            <Button
              variant="ghost"
              size="icon"
              className="text-blue-500 hover:text-green-800"
            //onClick={handleEditPayment}
            >
              <Edit className="h-5 w-5" />
            </Button>

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
          </div>
        </div>
      );
    },
  },
];


