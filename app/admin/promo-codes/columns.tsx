"use client";

import { useCallback, useState } from "react";
import { toast } from "sonner";
import { OfferPopup } from "components/offers/OfferPopup";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "components/ui/button";
import { Checkbox } from "components/ui/checkbox";
import { Edit, Copy, Trash, Eye } from 'lucide-react';
import { Badge } from "components/ui/badge";
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
import { useOfferStore } from "stores/offerStore";
import { useRouter } from "next/navigation";

type Offers = {
  offerId?: string;
  offerName: string;
  category: string;
  //bannerImage?: string;
  description?: string;
  keywords?: string;
  type: "Percentage" | "Flat";
  value: number;
  status: boolean;
  startDate: Date;
  endDate: Date;
  claimedCount: number;
}

export const columns: ColumnDef<Offers>[] = [
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
      return <div>{row.index + 1}</div>;
    },
  },
  // {
  //   accessorKey: "offerId",
  //   header: "Offer ID",
  // },
  {
    accessorKey: "offerName",
    header: "Offer Name",
  },
  {
    accessorKey: "category",
    header: "Category",
  },
  {
    accessorKey: "type",
    header: "Type",
  },
  {
    accessorKey: "value",
    header: "Value",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as boolean;
      const { toggleChanges, fetchOffers } = useOfferStore();
      const id = row.original.offerId;

      const handleToggleStatus = async (newStatus: boolean) => {
        try {
          await toggleChanges(id, newStatus);
          const statusCode = useOfferStore.getState().statusCode;
          const message = useOfferStore.getState().message;
          if (statusCode === 200 || statusCode === 201) {
            toast.success("Offer status updated successfully", {
              style: {
                backgroundColor: "#009F7F",
                color: "#fff",
              },
            });
          } else {
            toast.error(message || "Failed to update status", {
              style: {
                backgroundColor: "#FF0000",
                color: "#fff",
              },
            });
          }
          await fetchOffers();
        } catch (error) {
          toast.error("Failed to update status", {
            style: {
              backgroundColor: "#FF0000",
              color: "#fff",
            },
          });
        }
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
                  <Badge variant={status ? "default" : "destructive"}>
                    {status ? "Active" : "Inactive"}
                  </Badge>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleToggleStatus(!status)}>
                  {status ? "Inactive" : "Active"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </>
      );
    },
  },
  // {
  //   accessorKey: "createdAt",
  //   header: "Created At",
  //   cell: ({ row }) => {
  //     const createdDate: string = row.getValue("createdAt");
  //     const convertedDate = new Date(createdDate).toLocaleDateString();
  //     const date = new Date(createdDate);
  //     const options: Intl.DateTimeFormatOptions = { hour: 'numeric', minute: 'numeric', hour12: true };
  //     const amPmTime = date.toLocaleTimeString('en-US', options);

  //     return (
  //       <div>
  //         <div>{convertedDate}</div>
  //         <div>{amPmTime}</div>
  //       </div>
  //     );
  //   },
  // },
  {
    accessorKey: "startDate",
    header: "Start Date",
    cell: ({ row }) => {
      const startDate: string = row.getValue("startDate");
      if (!startDate) {
        return <div>-</div>;
      }

      // Parse the stored UTC date
      const utcDate = new Date(startDate);

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
    accessorKey: "endDate",
    header: "End Date",
    cell: ({ row }) => {
      const endDate: string = row.getValue("endDate");
      if (!endDate) {
        return <div>-</div>;
      }

      // Parse the stored UTC date
      const utcDate = new Date(endDate);

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
      const offer = row.original;
      const router = useRouter()
      const [isDialogOpen, setIsDialogOpen] = useState(false);
      const { deleteOffer } = useOfferStore();

      const handleCopy = (id: string | undefined) => {
        if (!id) return;
        navigator.clipboard.writeText(id)
          .then(() => {
            toast.success("Offer ID copied!");
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

      const cancelDelete = () => {
        setIsDialogOpen(false);
      }

      const confirmDelete = async (id: string) => {
        await deleteOffer(id);
        setIsDialogOpen(false);
        toast.success("Offer deleted successfully");
      }

      return (
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
            <OfferPopup
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
              id={offer.offerId ?? ''}
              title="Offer Details"
            />
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
                      Are you sure you want to delete this Offer?
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel onClick={cancelDelete}>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => confirmDelete(offer.offerId ?? '')}>Delete</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </>

            {/* Copy Icon */}
            <Button
              variant="ghost"
              size="icon"
              className="text-gray-500 hover:text-gray-700 tool-tip"
              data-tooltip="Copy"
              onClick={() => handleCopy(offer.offerId)}
            >
              <Copy className="h-5 w-5" />
            </Button>
          </div>
        </div>
      );
    },
  },
];