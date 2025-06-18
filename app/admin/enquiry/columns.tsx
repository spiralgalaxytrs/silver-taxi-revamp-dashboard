'use client'

import React, { useState, useCallback } from "react"
import { ColumnDef } from "@tanstack/react-table"
import { Button } from "components/ui/button"
import { Edit, MoreHorizontal, Trash, Eye, Loader2 } from 'lucide-react'
import { Badge } from "components/ui/badge"
import { Checkbox } from "components/ui/checkbox";
import { EnquiryPopup } from "components/EnquiryPopup"
import { toast } from "sonner"
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "components/ui/dropdown-menu"
import { useRouter } from "next/navigation"
import { Enquiry, useEnquiryStore } from "stores/enquiryStore"


export const columns: ColumnDef<Enquiry, unknown>[] = [
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
    accessorKey: "enquiryId",
    header: "Enquiry ID",
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
    }
  },
  {
    accessorKey: "dropDate",
    header: "Drop Date",
    cell: ({ row }) => {
      const dropDate: string = row.getValue("dropDate")
      if (dropDate == null) {
        return <div>-</div>
      }
      const date = new Date(dropDate);
      const convertedDate = date.toLocaleDateString();
      return <div>{convertedDate}</div>
    },
  },
  {
    accessorKey: "serviceName",
    header: "Service Name",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const id = row.original.enquiryId;
      const { toggleChanges, fetchEnquiries, enquiries } = useEnquiryStore();

      // Get fresh status from store instead of row data
      const currentEnquiry = enquiries.find(e => e.enquiryId === id);
      const status = currentEnquiry?.status || row.getValue("status");

      const handleToggleStatus = async (newStatus: string) => {
        await toggleChanges(id, newStatus);
        const statusCode = useEnquiryStore.getState().statusCode;
        const message = useEnquiryStore.getState().message;
        if (statusCode === 200 || statusCode === 201) {
          toast.success("Enquiry type updated successfully", {
            style: {
              backgroundColor: "#009F7F",
              color: "#fff",
            },
          });
        } else {
          toast.error(message || "Failed to update type", {
            style: {
              backgroundColor: "#FF0000",
              color: "#fff",
            },
          });
        }
        await fetchEnquiries();
      };

      const getStatusColor = (status: string) => {
        switch (status) {
          case "Current":
            return "bg-[#009F7F] text-white";
          case "Fake":
            return "bg-[#e31e1e] text-white";
          case "Future":
            return "bg-[#327bf0] text-white";
          case "Booked":
            return "bg-[#D89216] text-white";
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
                className={`h-8 hover:bg-transparent active:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 ${status === "Booked" ? "cursor-default" : ""}`}
              >
                <Badge variant="outline" className={getStatusColor(status || "")}>{status}</Badge>
              </Button>
            </DropdownMenuTrigger>
            {status !== "Booked" && <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={async () => {
                await handleToggleStatus("Fake");
                // await fetchEnquiries();
              }}>
                Fake
              </DropdownMenuItem>
              <DropdownMenuItem onClick={async () => {
                await handleToggleStatus("Current");
                // await fetchEnquiries();
              }}>
                Current
              </DropdownMenuItem>
              <DropdownMenuItem onClick={async () => {
                await handleToggleStatus("Future");
                // await fetchEnquiries();
              }}>
                Future
              </DropdownMenuItem>
            </DropdownMenuContent>}
          </DropdownMenu>
        </div>
      );
    },
  },
  {
    accessorKey: "type",
    header: "Source",
  },
  {
    accessorKey: "createdBy",
    header: "Created By",
  },
  {
    accessorKey: "createdAt",
    header: "Created At",
    cell: ({ row }) => {
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
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const enquiry = row.original
      const [showConvertDialog, setShowConvertDialog] = useState(false);
      const [isDialogOpen, setIsDialogOpen] = useState(false);
      const router = useRouter();

      const handleEditEnquiry = useCallback(async (id: string | undefined) => {
        if (id) {
          await router.push(`/admin/enquiry/edit/${id}`)
        }
      }, [router])

      const { deleteEnquiry, fetchEnquiries } = useEnquiryStore();
      const handleDelete = async () => {
        try {
          await deleteEnquiry(enquiry.enquiryId || "");
          await fetchEnquiries(); // Use the fetched enquiries from store directly

          toast.success("Enquiry deleted successfully");
        } catch (error) {
          toast.error("An unexpected error occurred", {
            style: {
              backgroundColor: "#FF0000",
              color: "#fff",
            },
          });
          // console.error("Delete Error:", error);
        }
      };

      return (
        <>
          <div className="flex items-center gap-3">
            <EnquiryPopup
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
              id={enquiry.enquiryId || ""}
            />
            <Button
              variant="ghost"
              size="icon"
              className="text-green-600 hover:text-green-800 tool-tip"
              data-tooltip="Edit Enquiry"
              onClick={() => handleEditEnquiry(enquiry.enquiryId)}
            >
              <Edit className="h-5 w-5" />
            </Button>

            <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-red-600 hover:text-red-800 tool-tip"
                  data-tooltip="Delete Enquiry"
                  onClick={() => setIsDialogOpen(true)}
                >
                  <Trash className="h-5 w-5" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete this Enquiry?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel onClick={() => setIsDialogOpen(false)}>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => { handleDelete(); setIsDialogOpen(false); }}>Delete</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            {/*Convert to booking*/}
            {enquiry.status !== "Booked" && <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push(`/admin/bookings/create?enquiryId=${enquiry.enquiryId}`)}>
                  Convert To Booking
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>}
          </div>
        </>
      )
    },
  },
]


