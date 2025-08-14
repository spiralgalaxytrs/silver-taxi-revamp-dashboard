"use client";

import React, { useState, useCallback } from "react";
import { Button } from "components/ui/button";
import { toast } from "sonner"
import { Edit, Trash, Eye } from 'lucide-react';
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
import Link from "next/link";
import {
  MRT_ColumnDef,
} from 'material-react-table'
import {
  useDeleteInvoice
} from 'hooks/react-query/useInvoice';
import { dateRangeFilter } from "lib/dateFunctions";

export type Invoice = {
  // id: string ;
  invoiceId: string | "";
  invoiceNo: string | "";
  totalAmount: number;
  status: string;
  email: string;
  createdAt: string;
};

export const columns: MRT_ColumnDef<Invoice>[] = [
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
  //   ),
  //   muiTableHeadCellProps: { align: 'center' },
  //   muiTableBodyCellProps: { align: 'center' },
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
    accessorKey: "invoiceNo",
    header: "Invoice ID",
    muiTableHeadCellProps: { align: 'center' },
    muiTableBodyCellProps: { align: 'center' },
    Cell: ({ row }) => {
      const invoice = row.original;

      return (
        <Link
          href={`/admin/invoices/view/${invoice.invoiceId}`}
          className="text-blue-600 hover:underline"
        >
          {invoice.invoiceNo}
        </Link>
      );
    },
  },
  // {
  //   accessorKey: "email",
  //   header: "Email",
  //   muiTableHeadCellProps: { align: 'center' },
  //   muiTableBodyCellProps: { align: 'center' },
  // },
  {
    accessorKey: "totalAmount",
    header: "Amount",
    Cell: ({ row }) => {
      const amount = parseFloat(row.getValue("totalAmount"));
      const formatted = new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
      }).format(amount);

      return <div className="font-medium">{formatted}</div>;
    },
    muiTableHeadCellProps: { align: 'center' },
    muiTableBodyCellProps: { align: 'center' },
  },
  {
    accessorKey: "status",
    header: "Status",
    muiTableHeadCellProps: { align: 'center' },
    muiTableBodyCellProps: { align: 'center' },
  },
  {
    id: "createdAt",
    header: "Created At",
    Cell: ({ row }) => {
      const createdAt: string = row.getValue("createdAt");
      if (!createdAt) {
        return <div>-</div>;
      }

      // Parse the stored UTC date
      const utcDate = new Date(createdAt);

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
    accessorFn: (row) => new Date(row.createdAt || ""),
    filterFn: dateRangeFilter,
    filterVariant: "date-range",
    sortingFn: "datetime",
    muiTableHeadCellProps: { align: 'center' },
    muiTableBodyCellProps: { align: 'center' },
  },
  {
    id: "actions",
    header: "Actions",
    Cell: ({ row }) => {
      const invoice = row.original;
      const router = useRouter()
      const { mutate: deleteInvoice } = useDeleteInvoice()
      const [isDialogOpen, setIsDialogOpen] = useState(false);

      const handleCopy = (id: string) => {
        navigator.clipboard.writeText(id)
          .then(() => {
            toast.success("IP id copied!", {
              style: {
                backgroundColor: "#009F7F",
                color: "#fff",
              },
            });
          })
          .catch((err) => {
            // console.error("Failed to copy ID", err);
            toast.error("Failed to copy ID", {
              style: {
                backgroundColor: "#FF0000",
                color: "#fff",
              },
            });
          });
      };

      const handleEditInvoice = useCallback(async (id: string | undefined) => {
        router.push(`/admin/invoices/edit/${id}`)
      }, [router])

      const cancelDelete = () => {
        setIsDialogOpen(false);
      }

      const confirmDelete = async (id: string) => {
        deleteInvoice(id, {
          onSuccess: () => {
            setIsDialogOpen(false);
            toast.success("Invoice deleted successfully");
          },
          onError: (error: any) => {
            setIsDialogOpen(false);
            toast.error(error?.response?.data?.message || "Error deleting Invoice!", {
              style: {
                backgroundColor: "#FF0000",
                color: "#fff",
              },
            });
          }
        });
      };

      return (
        <React.Fragment>
          <div className="flex items-center gap-3 justify-center">
            <div className="flex iems-center gap-3">

              {/* View Icon */}
              <Button
                variant="ghost"
                size="icon"
                className="text-blue-600 hover:text-blue-800 tool-tip"
                data-tooltip="View Details"
                onClick={() => router.push(`/admin/invoices/view/${invoice.invoiceId}`)}
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
            </div>
          </div>
        </React.Fragment>
      );
    },
    muiTableHeadCellProps: { align: 'center' },
    muiTableBodyCellProps: { align: 'center' },
  },
];