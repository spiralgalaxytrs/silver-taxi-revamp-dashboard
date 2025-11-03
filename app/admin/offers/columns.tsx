"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { OfferPopup } from "components/offers/OfferPopup";
import { Button } from "components/ui/button";
import { Copy, Trash, Eye } from 'lucide-react';
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
import { useOfferStore } from "stores/-offerStore";
import { useRouter } from "next/navigation";
import {
  MRT_ColumnDef,
} from 'material-react-table'
import { dateRangeFilter } from "lib/dateFunctions";
import { useDeleteOffer, useToggleOfferStatus } from "hooks/react-query/useOffers";

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

export const columns: MRT_ColumnDef<Offers>[] = [
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
      return <div>{row.index + 1}</div>;
    },
    size: 10,
  },
  {
    accessorKey: "offerName",
    header: "Offer Name",
    muiTableHeadCellProps: { align: 'left',
      sx: {
        '& .MuiBox-root': {
          gap: 0, // ✅ Removes space between filter & menu icons
        },
        '& .MuiButtonBase-root': {
          padding: '2px',
          margin: 0,
        },
      },
     },
    muiTableBodyCellProps: { align: 'left' },
    size: 30,
  },
  {
    accessorKey: "category",
    header: "Category",
    Header: () => (
      <div style={{ textAlign: 'left', lineHeight: 1.2 }}>
        Category
      </div>
    ),
    muiTableHeadCellProps: { align: 'left',
      sx: {
        '& .MuiBox-root': {
          gap: 0, // ✅ Removes space between filter & menu icons
        },
        '& .MuiButtonBase-root': {
          padding: '2px',
          margin: 0,
        },
      },
     },
    muiTableBodyCellProps: { align: 'left' },
    size: 20,
  },
  {
    accessorKey: "type",
    header: "Type",
    Header: () => (
      <div style={{ textAlign: 'left', lineHeight: 1.2 }}>
        Type
      </div>
    ),
    muiTableHeadCellProps: { align: 'left',
      sx: {
        '& .MuiBox-root': {
          gap: 0, // ✅ Removes space between filter & menu icons
        },
        '& .MuiButtonBase-root': {
          padding: '2px',
          margin: 0,
        },
      },
     },
    muiTableBodyCellProps: { align: 'left' },
    size: 20,
  },
  {
    accessorKey: "value",
    header: "Value",
    Header: () => (
      <div style={{ textAlign: 'left', lineHeight: 1.2 }}>
        Value
      </div>
    ),
    muiTableHeadCellProps: { align: 'left',
      sx: {
        '& .MuiBox-root': {
          gap: 0, // ✅ Removes space between filter & menu icons
        },
        '& .MuiButtonBase-root': {
          padding: '2px',
          margin: 0,
        },
      },
     },
    muiTableBodyCellProps: { align: 'left' },
    size: 20,
  },
  {
    accessorKey: "status",
    header: "Status",
    Cell: ({ row }) => {
      const status = row.getValue("status") as boolean;
      const { mutate: toggleChanges } = useToggleOfferStatus();
      const id = row.original.offerId;

      const handleToggleStatus = async (newStatus: boolean) => {
        try {
          toggleChanges({ id: id || "", status: newStatus }, {

            onSuccess: () => {
              toast.success("Offer status updated successfully", {
                style: {
                  backgroundColor: "#009F7F",
                  color: "#fff",
                },
              });
            },
            onError: (error: any) => {
              toast.error(error?.response?.data?.message || "Failed to update status", {
                style: {
                  backgroundColor: "#FF0000",
                  color: "#fff",
                },
              });
            },

          });
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
        <React.Fragment>
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
        </React.Fragment>
      );
    },
    muiTableHeadCellProps: { align: 'left' },
    muiTableBodyCellProps: { align: 'left' },
    size: 20,
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
  // muiTableHeadCellProps: { align: 'center' },
  // muiTableBodyCellProps: { align: 'center' },
  // },
  {
    id: "startDate",
    header: "Start Date",
    Header: () => (
      <div style={{ textAlign: 'left', lineHeight: 1.2 }}>
        Start<br />Date
      </div>
    ),
    Cell: ({ row }) => {
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
    accessorFn: (row) => new Date(row.startDate || ""),
    filterFn: dateRangeFilter,
    filterVariant: "date-range",
    sortingFn: "datetime",
    muiTableHeadCellProps: { align: 'left' ,
      sx: {
        '& .MuiBox-root': {
          gap: 0, // ✅ Removes space between filter & menu icons
        },
        '& .MuiButtonBase-root': {
          padding: '2px',
          margin: 0,
        },
      },
     },
    muiTableBodyCellProps: { align: 'left' },
    size: 20,
  },
  {
    id: "endDate",
    header: "End Date",
    Header: () => (
      <div style={{ textAlign: 'left', lineHeight: 1.2 }}>
        End<br />Date
      </div>
    ),
    Cell: ({ row }) => {
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
    accessorFn: (row) => new Date(row.endDate || ""),
    filterFn: dateRangeFilter,
    filterVariant: "date-range",
    sortingFn: "datetime",
    muiTableHeadCellProps: { align: 'left' ,
      sx: {
        '& .MuiBox-root': {
          gap: 0, // ✅ Removes space between filter & menu icons
        },
        '& .MuiButtonBase-root': {
          padding: '2px',
          margin: 0,
        },
      },
     },
    muiTableBodyCellProps: { align: 'left' },
    size: 20,
  },
  {
    id: "actions",
    header: "Actions",
    Cell: ({ row }) => {
      const offer = row.original;
      console.log("offer:", offer);
      const router = useRouter()
      const [isDialogOpen, setIsDialogOpen] = useState(false);
      const { mutate: deleteOffer } = useDeleteOffer();

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
        deleteOffer(id, {
          onSuccess: () => {
            setIsDialogOpen(false);
            toast.success("Offers deleted successfully", {
              style: {
                backgroundColor: "#009F7F",
                color: "#fff",
              },
            });
          },
          onError: (error: any) => {
            toast.error(error?.response?.data?.message || "Failed to delete offers", {
              style: {
                backgroundColor: "#FF0000",
                color: "#fff",
              },
            });
          },

        });
      }

      return (
        <div className="flex items-center gap-3 justify-center" >
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
      onClick={(e) => {
        e.stopPropagation(); // Prevent row click event
      }}
    >
      <Eye className="h-5 w-5" />
    </Button>
  }
  id={row.original.offerId || ''}
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
        </div >
      );
    },
    muiTableHeadCellProps: { align: 'left' ,
      sx: {
        '& .MuiBox-root': {
          gap: 0, // ✅ Removes space between filter & menu icons
        },
        '& .MuiButtonBase-root': {
          padding: '2px',
          margin: 0,
        },
      },
     },
    muiTableBodyCellProps: { align: 'left' },
    size: 20,
  },
];