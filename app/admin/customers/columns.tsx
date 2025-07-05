"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Button } from "components/ui/button"
import { Edit, Copy, Trash, Eye } from 'lucide-react';
import { toast } from "sonner";
import { Checkbox } from "components/ui/checkbox";
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
import { useRouter } from "next/navigation"
import { useState } from "react";
import { useCustomerStore } from "stores/-customerStore";

export type Customer = {
  customerId?: string;
  name: string;
  email: string;
  phone: string;
  bookingCount: number;
  totalAmount: number;
  createdBy: "Admin" | "Vendor";
}

export const columns: ColumnDef<Customer>[] = [
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
  // {
  //   accessorKey: "customerId",
  //   header: "Customer Id",
  // },
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "phone",
    header: "Phone",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "bookingCount",
    header: "Booking Count",
  },
  {
    accessorKey: "totalAmount",
    header: "Total Amount",
    cell: ({ row }) => {
      const amount = row.getValue("totalAmount");
  
      // Validate the amount
        if (typeof amount !== "number") {
          console.error("Invalid totalAmount:", amount);
        return <div>Invalid Amount</div>;
      }
  
      // Format the amount with INR currency symbol
      const formatted = new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
      }).format(amount);
  
      return <div>{formatted}</div>;
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const customer = row.original
      const router = useRouter()
      const [isDialogOpen, setIsDialogOpen] = useState(false);
      const { deleteCustomer } = useCustomerStore();

      // const handleCopy = (id: string) => {
      //   navigator.clipboard.writeText(id)
      //     .then(() => {
      //       toast.success("Offer ID copied!"); 
      //     })
      //     .catch((err) => {
      //       console.error("Failed to copy ID", err);
      //       toast.error("Failed to copy ID");
      //     });
      // };

      const handleViewCustomer = async (id: string) => {
        router.push(`/admin/customers/view/${customer.customerId}`)
      }

      const cancelDelete = () => {
        setIsDialogOpen(false);
      }

      const confirmDelete = async (id: string) => {
        await deleteCustomer(id);
        setIsDialogOpen(false);
        toast.success("Customer deleted successfully");
      }

      return (
        <>
        <div className="flex items-center gap-3 justify-center">
          <div className="flex items-center gap-3">
            {/* Edit Icon */}
            {/* <Button
            variant="ghost"
            size="icon"
            className="text-green-600 hover:text-green-800 tool-tip"
            data-tooltip="Edit Offer"
            onClick={() => handleEditOffer(offer.id)}
          >
            <Edit className="h-5 w-5" />
          </Button> */}

            {/* View Icon */}
            <Button
              variant="ghost"
              size="icon"
              className="text-blue-600 hover:text-blue-800 tool-tip"
              data-tooltip="View Details"
              onClick={() => handleViewCustomer(customer.customerId ?? '')}
            >
              <Eye className="h-5 w-5" />
            </Button>

            {/* Delete Icon */}
            <>
              <Button
                variant="ghost"
                size="icon"
                className="text-red-600 hover:text-red-800 tool-tip"
                data-tooltip="Delete Offer"
                onClick={() => setIsDialogOpen(true)}
              >
                <Trash className="h-5 w-5" />
              </Button>

              <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete this customer?
                      </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel onClick={cancelDelete}>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => confirmDelete(customer.customerId ?? '')}>Delete</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </>

            {/* Copy Icon */}
            {/* <Button
              variant="ghost"
              size="icon"
              className="text-gray-500 hover:text-gray-700 tool-tip"
              data-tooltip="Copy"
              onClick={() => handleCopy(customer.customerId ?? '')}
            >
              <Copy className="h-5 w-5" />
            </Button> */}
          </div>
        </div>
        </>
      )
    },
  },
]
