"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "components/ui/button";
import { ArrowUpDown, MoreHorizontal, Download } from "lucide-react";
import { toast } from "sonner"
import { Checkbox } from "components/ui/checkbox";
import { Edit, Copy, Trash, Eye } from 'lucide-react';
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
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { useInvoiceStore } from "stores/invoiceStore";

export type Invoice = {
  // id: string ;
  invoiceId: string | "";
  totalAmount: number;
  status: string;
  email: string;
  createdAt: string;
};

export const columns: ColumnDef<Invoice>[] = [
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
    accessorKey: "invoiceId",
    header: "Invoice ID",
  },
  {
    accessorKey: "email",
    header: "Email"
  },
  {
    accessorKey: "totalAmount",
    header: () => <div className="text-right">Amount</div>,
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("totalAmount"));
      const formatted = new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
      }).format(amount);
      
      return <div className="text-right font-medium">{formatted}</div>;
    },
  },
  {
    accessorKey: "status",
    header: "Status",
  },
  {
    accessorKey: "createdAt",
    header: "Created At",
    cell: ({ row }) => {
      const createdAt: string = row.getValue("createdAt")
      const date = new Date(createdAt);
      const convertedDate = date.toLocaleDateString();
      const options: Intl.DateTimeFormatOptions = { hour: 'numeric', minute: 'numeric', hour12: true };
      const amPmTime = date.toLocaleTimeString('en-US', options);

      return (
        <div>
          <div>{convertedDate}</div>
          <div>{amPmTime}</div>
        </div>
      )
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const invoice = row.original;
      const router = useRouter()
      const [isDialogOpen, setIsDialogOpen] = useState(false);
      const { deleteInvoice, fetchInvoices } = useInvoiceStore()

      const handleCopy = (id: string) => {
        navigator.clipboard.writeText(id)
          .then(() => {
            toast.success("IP id copied!");
          })
          .catch((err) => {
            console.error("Failed to copy ID", err);
            toast.error("Failed to copy ID");
          });
      };

      const handleEditInvoice = useCallback(async (id: string | undefined) => {
        await router.push(`/vendor/invoices/edit/${id}`)
      }, [router])

      const cancelDelete = () => {
        setIsDialogOpen(false);
      }

      const confirmDelete = async (id: string) => {
        await deleteInvoice(id);
        setIsDialogOpen(false);
        toast.success("Invoice deleted successfully");
      };

      return (
        <>
          <div className="flex items-center gap-3 justify-center">
            <div className="flex iems-center gap-3">

              {/* View Icon */}
              <Button
                variant="ghost"
                size="icon"
                className="text-blue-600 hover:text-blue-800 tool-tip"
                data-tooltip="View Details"
                onClick={() => router.push(`/vendor/invoices/view/${invoice.invoiceId}`)}
              >
                <Eye className="h-5 w-5" />
              </Button>

              {/* Edit Icon */}
              <Button
                variant="ghost"
                size="icon"
                className="text-green-600 hover:text-green-800 tool-tip"
                data-tooltip="Edit Booking"
                onClick={() => handleEditInvoice(invoice.invoiceId)}
              >
                <Edit className="h-5 w-5" />
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
                        Are you sure you want to delete this invoice?
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel onClick={cancelDelete}>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => confirmDelete(invoice.invoiceId ?? '')}>Delete</AlertDialogAction>
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
              onClick={() => handleCopy(invoice.invoiceId)}
            >
              <Download className="h-5 w-5" />
            </Button> */}

            </div>
          </div>
        </>
      );
    },
  },
];