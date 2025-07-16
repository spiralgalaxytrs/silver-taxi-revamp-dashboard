"use client"

import { Button } from "components/ui/button"
import { Trash, Eye } from 'lucide-react';
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
import React, { useState } from "react";
import {
  MRT_ColumnDef
} from 'material-react-table'
import {
  useDeleteCustomer
} from 'hooks/react-query/useCustomer';


export type Customer = {
  customerId?: string;
  name: string;
  email: string;
  phone: string;
  bookingCount: number;
  totalAmount: number;
  createdBy: "Admin" | "Vendor";
}

export const columns: MRT_ColumnDef<Customer>[] = [
  // {
  //   id: "select",
  //   header: "Select",
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
  // ),
  //   muiTableHeadCellProps: { align: 'center' },
  // muiTableBodyCellProps: { align: 'center' },
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
    accessorKey: "name",
    header: "Name",
    muiTableHeadCellProps: { align: 'center' },
    muiTableBodyCellProps: { align: 'center' },
  },
  {
    accessorKey: "phone",
    header: "Phone",
    muiTableHeadCellProps: { align: 'center' },
    muiTableBodyCellProps: { align: 'center' },
  },
  {
    accessorKey: "email",
    header: "Email",
    muiTableHeadCellProps: { align: 'center' },
    muiTableBodyCellProps: { align: 'center' },
  },
  {
    accessorKey: "bookingCount",
    header: "Booking Count",
    muiTableHeadCellProps: { align: 'center' },
    muiTableBodyCellProps: { align: 'center' },
  },
  {
    accessorKey: "totalAmount",
    header: "Total Amount",
    Cell: ({ row }) => {
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
    muiTableHeadCellProps: { align: 'center' },
    muiTableBodyCellProps: { align: 'center' },
  },
  {
    id: "actions",
    header: "Actions",
    Cell: ({ row }) => {
      const customer = row.original
      const router = useRouter()
      const [isDialogOpen, setIsDialogOpen] = useState(false);
      const {
        mutate: deleteCustomer
      } = useDeleteCustomer();

      const handleViewCustomer = async (id: string) => {
        router.push(`/vendor/customers/view/${customer.customerId}`)
      }

      const cancelDelete = () => {
        setIsDialogOpen(false);
      }

      const confirmDelete = async (id: string) => {
        deleteCustomer(id, {
          onSuccess: () => {
            setIsDialogOpen(false);
            toast.success("Customer deleted successfully", {
              style: {
                backgroundColor: "#009F7F",
                color: "#fff",
              },
            });
          },
          onError: (error: any) => {
            setIsDialogOpen(false);
            toast.error(error?.response?.data?.message || "Error deleting Customer!", {
              style: {
                backgroundColor: "#FF0000",
                color: "#fff",
              },
            });
          }
        });
      }

      return (
        <React.Fragment>
          <div className="flex items-center gap-3 justify-center">
            <div className="flex items-center gap-3">

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
            </div>
          </div>
        </React.Fragment>
      )
    },
    muiTableHeadCellProps: { align: 'center' },
    muiTableBodyCellProps: { align: 'center' },
  },
]
