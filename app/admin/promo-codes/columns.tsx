"use client";

import { useCallback, useState } from "react";
import { toast } from "sonner";
import { OfferPopup } from "components/offers/OfferPopup";
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
import { useTogglePromoCodeStatus, usePromoCodesAll, useDeletePromoCode } from "hooks/react-query/usePromoCodes";
// import { useOfferStore } from "stores/-offerStore";
import { useRouter } from "next/navigation";
import {
  MRT_ColumnDef,
} from 'material-react-table'
import { PromoCodePopup } from "components/offers/PromoCodePopup";
import { dateRangeFilter } from "lib/dateFunctions";

type PromoCodes = {
  codeId?: string;
  promoName?: string;
  category: string;
  code?: string;
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

export const columns: MRT_ColumnDef<PromoCodes>[] = [
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
    size: 10,
  },
  // {
  //   accessorKey: "offerId",
  //   header: "Offer ID",
  // muiTableHeadCellProps: { align: 'center' },
  // muiTableBodyCellProps: { align: 'center' },
  // },
  {
    accessorKey: "promoName",
    header: "Promo Name",
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
  },
  {
    accessorKey: "category",
    header: "Category",
    Header: () => (
      <div style={{ textAlign: 'left', lineHeight: 1.2 }}>
        Category
      </div>
    ),
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
    accessorKey: "type",
    header: "Type",
    Header: () => (
      <div style={{ textAlign: 'left', lineHeight: 1.2 }}>
        Type
      </div>
    ),
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
    accessorKey: "value",
    header: "Value",
    Header: () => (
      <div style={{ textAlign: 'left', lineHeight: 1.2 }}>
        Value
      </div>
    ),
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
    accessorKey: "status",
    header: "Status",
    Cell: ({ row }) => {
      const status = row.getValue("status") as boolean;
      // const { toggleChanges, fetchOffers } = useOfferStore();
      const { data: promoCodes, isPending: isfetchPending } = usePromoCodesAll();
      const { mutate: togglePromoCodeStatus, isPending: isBulkDeleteLoading } = useTogglePromoCodeStatus();

      const id = row.original.codeId;

      // const handleToggleStatus = async (newStatus: boolean) => {
      //   try {
      //     await togglePromoCodeStatus({ id: id!, status: newStatus });
      //     const statusCode = promoCodes.getState().statusCode;
      //     const message = promoCodes.getState().message;
      //     if (statusCode === 200 || statusCode === 201) {
      //       toast.success("Promo code status updated successfully", {
      //         style: {
      //           backgroundColor: "#009F7F",
      //           color: "#fff",
      //         },
      //       });
      //     } else {
      //       toast.error(message || "Failed to update status", {
      //         style: {
      //           backgroundColor: "#FF0000",
      //           color: "#fff",
      //         },
      //       });
      //     }
      //     await promoCodes();
      //   } catch (error) {
      //     toast.error("Failed to update status", {
      //       style: {
      //         backgroundColor: "#FF0000",
      //         color: "#fff",
      //       },
      //     });
      //   }
      // };


      const handleToggleStatus = (newStatus: boolean) => {
        if (!id) return;
        togglePromoCodeStatus({ id, status: newStatus });
      };
      return (
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
      const promoCode = row.original;
      const router = useRouter()
      const [isDialogOpen, setIsDialogOpen] = useState(false);
      // const { deleteOffer } = useOfferStore();
      const { mutate: deletePromoCode, isPending: isDeleteLoading } = useDeletePromoCode();

      const handleCopy = (id: string | undefined) => {
        if (!id) return;
        navigator.clipboard.writeText(id)
          .then(() => {
            toast.success("Promo code copied!");
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
        await deletePromoCode(id);
        setIsDialogOpen(false);
        toast.success("Promo code deleted successfully");
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
            <PromoCodePopup
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
              id={promoCode.codeId ?? ''}
              title="Promo code Details"
            />
            {/* Delete Icon */}
            <>
              <Button
                variant="ghost"
                size="icon"
                className="text-red-600 hover:text-red-800 tool-tip"
                data-tooltip="Delete Promo Code"
                onClick={() => setIsDialogOpen(true)}
              >
                <Trash className="h-5 w-5" />
              </Button>

              <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete this Promo code?
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel onClick={cancelDelete}>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => confirmDelete(promoCode.codeId ?? '')}>Delete</AlertDialogAction>
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
              onClick={() => handleCopy(promoCode.code)}
            >
              <Copy className="h-5 w-5" />
            </Button>
          </div>
        </div>
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