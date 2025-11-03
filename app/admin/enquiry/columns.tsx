'use client'

import React, { useState, useCallback } from "react"
import { MRT_ColumnDef } from "material-react-table"
import { Button } from "components/ui/button"
import { Edit, MoreHorizontal, Trash, Eye, Loader2 } from 'lucide-react'
import { Badge } from "components/ui/badge"
import { EnquiryPopup } from "components/enquiry/EnquiryPopup"
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
import TooltipComponent from "components/others/TooltipComponent"
import { Enquiry } from "types/react-query/enquiry"
import {
  useToggleStatus,
  useDeleteEnquiry
} from 'hooks/react-query/useEnquiry';
import { dateRangeFilter } from "lib/dateFunctions"

export const columns: MRT_ColumnDef<Enquiry>[] = [
  // {
  //   id: "select",
  //   header: 'Select',
  //   Header: ({ table }: { table: any }) => (
  //     <Checkbox
  //       checked={table.getIsAllRowsSelected()}
  //       onCheckedChange={(value) => table.toggleAllRowsSelected(!!value)}
  //     />
  //   ) as React.ReactNode,
  //   Cell: ({ row }) => (
  //     <Checkbox
  //       checked={row.getIsSelected()}
  //       onCheckedChange={(value) => row.toggleSelected(!!value)}
  //     />
  //   ),
  //   enableSorting: false,
  //   enableColumnFilter: false,
  //   muiTableHeadCellProps: { align: 'center' },
  //   muiTableBodyCellProps: { align: 'center' },
  // },
  {
    header: "S.No",
    Cell: ({ row }) => (
      <div>{row.index + 1}</div>
    ),
    enableSorting: false,
    enableColumnFilter: false,
    muiTableHeadCellProps: { align: 'left', sx: {
      '& .MuiBox-root': {
        gap: 0, // ✅ Removes space between filter & menu icons
      },
      '& .MuiButtonBase-root': {
        padding: '2px',
        margin: 0,
      },
    }, },
    muiTableBodyCellProps: { align: 'left' },
    size: 20,
  },
  {
    accessorKey: "enquiryId",
    header: "Enquiry ID",
    Header: () => (
      <div style={{ textAlign: 'left', lineHeight: 1.2 }}>
        Enquiry<br />ID
      </div>
    ),
    muiTableHeadCellProps: { align: 'left', sx: {
      '& .MuiBox-root': {
        gap: 0, // ✅ Removes space between filter & menu icons
      },
      '& .MuiButtonBase-root': {
        padding: '2px',
        margin: 0,
      },
    }, },
    muiTableBodyCellProps: { align: 'left' },
    size: 30,
    Cell: ({ row }) => {
      const enquiry = row.original;
       return(
        <EnquiryPopup
        trigger = {
          <span
          style={{  color: 'blue',
                textDecoration: 'underline',
                cursor: 'pointer',}}>
                  {enquiry.enquiryId}
          </span>
        }
        enquiry={enquiry}
        />

       )
    }
  },
  

  {
    accessorKey: "name",
    header: "Customer Name",
    Header: () => (
      <div style={{ textAlign: 'left', lineHeight: 1.2 }}>
        Customer<br />Name
      </div>
    ),
    muiTableHeadCellProps: { align: 'left', sx: {
      '& .MuiBox-root': {
        gap: 0, // ✅ Removes space between filter & menu icons
      },
      '& .MuiButtonBase-root': {
        padding: '2px',
        margin: 0,
      },
    }, },
    muiTableBodyCellProps: { align: 'left' },
    size: 30,
    Cell: ({ row }) => {
      const name: string = row.original.name;
      if (!name) {
        return <div>-</div>;
      }
      return <div>{name}</div>;
    }
  },
  {
    accessorKey: "phone",
    header: "Phone Number",
    Header: () => (
      <div style={{ textAlign: 'left', lineHeight: 1.2 }}>
        Phone<br />Number
      </div>
    ),
    muiTableHeadCellProps: { align: 'left', sx: {
      '& .MuiBox-root': {
        gap: 0, // ✅ Removes space between filter & menu icons
      },
      '& .MuiButtonBase-root': {
        padding: '2px',
        margin: 0,
      },
    }, },
    muiTableBodyCellProps: { align: 'left' },
    size: 30,
    Cell: ({ row }) => {
      const phone: string = row.original.phone;
      if (!phone) {
        return <div>-</div>;
      }
      return <div>+{phone}</div>;
    }
  },
  {
    accessorKey: "pickup",
    header: "From",
    Cell: ({ row }) => {
      const pickup = row.getValue("pickup") as string
      if (!pickup) return <div>-</div>
      return (
        <TooltipComponent name={pickup}>
          <div>{pickup.slice(0, 15)}...</div>
        </TooltipComponent>
      )
    },
    muiTableHeadCellProps: { align: 'left', sx: {
      '& .MuiBox-root': {
        gap: 0, // ✅ Removes space between filter & menu icons
      },
      '& .MuiButtonBase-root': {
        padding: '2px',
        margin: 0,
      },
    }, },
    muiTableBodyCellProps: { align: 'left' },
    size: 30,
  },
  {
    accessorKey: "drop",
    header: "To",
    Cell: ({ row }) => {
      const drop = row.getValue("drop") as string
      if (!drop) return <div>-</div>
      return (
        <TooltipComponent name={drop}>
          <div>{drop.slice(0, 15)}...</div>
        </TooltipComponent>
      )
    },
    muiTableHeadCellProps: { align: 'left', sx: {
      '& .MuiBox-root': {
        gap: 0, // ✅ Removes space between filter & menu icons
      },
      '& .MuiButtonBase-root': {
        padding: '2px',
        margin: 0,
      },
    }, },
    muiTableBodyCellProps: { align: 'left' },
    size: 30,
  },
  {
    id: "pickupDate",
    header: "PickUp Date",
    Header: () => (
      <div style={{ textAlign: 'left', lineHeight: 1.2 }}>
        PickUp<br />Date
      </div>
    ),
    Cell: ({ row }) => {
      const pickupDate: string = row.original.pickupDateTime;
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
    accessorFn: (row) => new Date(row.pickupDateTime || ""),
    filterFn: dateRangeFilter,
    filterVariant: "date-range",
    sortingFn: "datetime",
    muiTableHeadCellProps: { align: 'left', sx: {
      '& .MuiBox-root': {
        gap: 0, // ✅ Removes space between filter & menu icons
      },
      '& .MuiButtonBase-root': {
        padding: '2px',
        margin: 0,
      },
    }, },
    muiTableBodyCellProps: { align: 'left' },
    size: 30,
  },
  {
    accessorKey: "pickupTime",
    header: "PickUp Time",
    Header: () => (
      <div style={{ textAlign: 'left', lineHeight: 1.2 }}>
        PickUp<br />Time
      </div>
    ),
    Cell: ({ row }) => {
      const pickupTime: string = row.original.pickupDateTime;
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
    },
    muiTableHeadCellProps: { align: 'left', sx: {
      '& .MuiBox-root': {
        gap: 0, // ✅ Removes space between filter & menu icons
      },
      '& .MuiButtonBase-root': {
        padding: '2px',
        margin: 0,
      },
    }, },
    muiTableBodyCellProps: { align: 'left' },
    size: 30,
  },
  {
    id: "dropDate",
    header: "Drop Date",
    Header: () => (
      <div style={{ textAlign: 'left', lineHeight: 1.2 }}>
        Drop<br />Date
      </div>
    ),
    Cell: ({ row }) => {
      const dropDate: string = row.getValue("dropDate");
      if (!dropDate) {
        return <div>-</div>;
      }

      // Parse the stored UTC date
      const utcDate = new Date(dropDate);

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
    accessorFn: (row) => new Date(row.dropDate || ""),
    filterFn: dateRangeFilter,
    filterVariant: "date-range",
    sortingFn: "datetime",
    muiTableHeadCellProps: { align: 'left', sx: {
      '& .MuiBox-root': {
        gap: 0, // ✅ Removes space between filter & menu icons
      },
      '& .MuiButtonBase-root': {
        padding: '2px',
        margin: 0,
      },
    }, },
    muiTableBodyCellProps: { align: 'left' },
    size: 30,
  },

  {
    accessorKey: "serviceType",
    header: "Service Name",
    Header: () => (
      <div style={{ textAlign: 'left', lineHeight: 1.2 }}>
        Service<br />Name
      </div>
    ),
    muiTableHeadCellProps: { align: 'left', sx: {
      '& .MuiBox-root': {
        gap: 0, // ✅ Removes space between filter & menu icons
      },
      '& .MuiButtonBase-root': {
        padding: '2px',
        margin: 0,
      },
    }, },
    muiTableBodyCellProps: { align: 'left' },
    size: 30,
  },
  {
    accessorKey: "status",
    header: "Status",
    Cell: ({ row }) => {
      const id = row.original.enquiryId as string || "";
      const status = row.original.status as string || "";
      const { mutate: toggleChanges } = useToggleStatus();

      const handleToggleStatus = async (newStatus: "Current" | "Fake" | "Future" | "Booked") => {
        toggleChanges({ id, status: newStatus }, {
          onSuccess: () => {
            toast.success("Enquiry type updated successfully", {
              style: {
                backgroundColor: "#009F7F",
                color: "#fff",
              },
            });
          },
          onError: (error: any) => {
            toast.error(error?.response?.data?.message || "Failed to update type", {
              style: {
                backgroundColor: "#FF0000",
                color: "#fff",
              },
            });
          },
        });
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
            {status !== "Booked" && (
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleToggleStatus("Fake")}>
                  Fake
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleToggleStatus("Current")}>
                  Current
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleToggleStatus("Future")}>
                  Future
                </DropdownMenuItem>
              </DropdownMenuContent>
            )}
          </DropdownMenu>
        </div>
      );
    },
    muiTableHeadCellProps: { align: 'left', sx: {
      '& .MuiBox-root': {
        gap: 0, // ✅ Removes space between filter & menu icons
      },
      '& .MuiButtonBase-root': {
        padding: '2px',
        margin: 0,
      },
    }, },
    muiTableBodyCellProps: { align: 'left' },
    size: 30,
  },
  {
    accessorKey: "type",
    header: "Source",
    muiTableHeadCellProps: { align: 'left', sx: {
      '& .MuiBox-root': {
        gap: 0, // ✅ Removes space between filter & menu icons
      },
      '& .MuiButtonBase-root': {
        padding: '2px',
        margin: 0,
      },
    }, },
    muiTableBodyCellProps: { align: 'left' },
    size: 30,
  },
  {
    accessorKey: "createdBy",
    header: "Created By",
    Header: () => (
      <div style={{ textAlign: 'left', lineHeight: 1.2 }}>
        Created<br />By
      </div>
    ),
    muiTableHeadCellProps: { align: 'left', sx: {
      '& .MuiBox-root': {
        gap: 0, // ✅ Removes space between filter & menu icons
      },
      '& .MuiButtonBase-root': {
        padding: '2px',
        margin: 0,
      },
    }, },
    muiTableBodyCellProps: { align: 'left' },
    size: 30,
  },
  {
    id: "createdAt",
    header: "Created At",
    Header: () => (
      <div style={{ textAlign: 'left', lineHeight: 1.2 }}>
        Created<br />At
      </div>
    ),
    Cell: ({ row }) => {
      const createdAt: string = row.original.createdAt;
      if (!createdAt) {
        return <div>-</div>;
      }

      // Parse the stored UTC date
      const utcDate = new Date(createdAt);

      // Adjust back to IST (Subtract 5.5 hours)
      const istDate = new Date(utcDate.getTime());

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

      const amPmTime = new Intl.DateTimeFormat("en-IN", options).format(istDate);

      return (
        <div>
          <div>{formattedDate}</div>
          <div>{amPmTime}</div>
        </div>
      );
    },
    accessorFn: (row) => new Date(row.createdAt || ""),
    filterFn: dateRangeFilter,
    filterVariant: "date-range",
    sortingFn: "datetime",
    muiTableHeadCellProps: { align: 'left', sx: {
      '& .MuiBox-root': {
        gap: 0, // ✅ Removes space between filter & menu icons
      },
      '& .MuiButtonBase-root': {
        padding: '2px',
        margin: 0,
      },
    }, },
    muiTableBodyCellProps: { align: 'left' },
    size: 30,
  },
  {
    id: "actions",
    header: "Actions",
    Header: () => (
      <div style={{ textAlign: 'left', lineHeight: 1.2 }}>
        Actions
      </div>
    ),
    Cell: ({ row }) => {
      const enquiry = row.original;
      const [showConvertDialog, setShowConvertDialog] = useState(false);
      const [isDialogOpen, setIsDialogOpen] = useState(false);
      const router = useRouter();

      const handleEditEnquiry = useCallback(async (id: string | undefined) => {
        if (id) {
          router.push(`/admin/enquiry/edit/${id}`);
        }
      }, [router]);

      const { mutate: deleteEnquiry } = useDeleteEnquiry();
      const handleDelete = async () => {
        try {
          deleteEnquiry(enquiry.enquiryId || "", {
            onSuccess: () => {
              toast.success("Enquiry deleted successfully");
            },
            onError: () => {
              toast.error("An unexpected error occurred", {
                style: {
                  backgroundColor: "#FF0000",
                  color: "#fff",
                },
              });
            }
          });
        } catch (error) {
          toast.error("An unexpected error occurred", {
            style: {
              backgroundColor: "#FF0000",
              color: "#fff",
            },
          });
        }
      };

      return (
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
            enquiry={enquiry || null}
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
          {enquiry.status !== "Booked" && (
            <DropdownMenu>
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
            </DropdownMenu>
          )}
        </div>
      );
    },
    muiTableHeadCellProps: { align: 'left', sx: {
      '& .MuiBox-root': {
        gap: 0, // ✅ Removes space between filter & menu icons
      },
      '& .MuiButtonBase-root': {
        padding: '2px',
        margin: 0,
      },
    }, },
    size: 70,
    muiTableBodyCellProps: { align: 'left' },
    enableSorting: false,
    enableColumnFilter: false,
  },
];