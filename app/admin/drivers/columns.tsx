"use client"

import React, { useCallback, useState } from "react"
import { Button } from "components/ui/button"
import { Edit, Eye, Trash, ChevronDown } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "components/ui/dropdown-menu"
import { useRouter } from "next/navigation"
import { toast } from 'sonner';
import { Badge } from "components/ui/badge"
import TooltipProvider from "components/others/TooltipComponent"
import TooltipComponent from "components/others/TooltipComponent";
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
import Image from 'next/image'
import Link from "next/link"
import {
  useDeleteDriver,
  useToggleDriverStatus
} from 'hooks/react-query/useDriver';
import {
  MRT_ColumnDef
} from 'material-react-table'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "components/ui/dialog"
import { Input } from "components/ui/input"

export type WalletAttributes = {
  balance: number;
}

export type Driver = {
  id: string | undefined;
  driverId?: string;
  name: string;
  phone: string;
  isOnline: boolean;
  license: string;
  licenseImage?: File | null;
  createdAt: string;
  isActive: boolean | null;
  wallet?: WalletAttributes;
  inActiveReason?: string;
}


export const columns: MRT_ColumnDef<Driver>[] = [
  // {
  //   id: "select",
  //   header: "Select",
  //   Header: ({ table }) => (
  //     <Checkbox
  //       checked={table.getIsAllPageRowsSelected()}
  //       onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
  //     />
  //   ),
  //   cell: ({ row }) => (
  //     <Checkbox
  //       checked={row.getIsSelected()}
  //       onCheckedChange={(value) => row.toggleSelected(!!value)}
  //     />
  //   ),
  // },
  {
    header: "S.No",
    Cell: ({ row }) => row.index + 1,
    enableSorting: false,
    enableColumnFilter: false,
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
    accessorKey: "driverId",
    header: "Driver ID",
    Header: () => (
      <div style={{ textAlign: 'left', lineHeight: 1.2 }}>
        Driver<br />ID
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
    Cell: ({ row }) => {
      const driver = row.original;

      return (
        <Link
          href={`/admin/drivers/view/${driver.driverId}`}
          className="text-blue-600 hover:underline"
        >
          {driver.driverId}
        </Link>
      );
    },
  },
  {
    accessorKey: "name",
    header: "Driver Name",
    Header: () => (
      <div style={{ textAlign: 'left', lineHeight: 1.2 }}>
        Driver<br />Name
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
    accessorKey: "isOnline",
    header: "Online Status",
    Header: () => (
      <div style={{ textAlign: 'left', lineHeight: 1.2 }}>
        Online<br />Status
      </div>
    ),
    Cell: ({ row }) => {
      const status = row.getValue("isOnline") as boolean
      console.log("status >> ", status)

      return (
        <div className="flex justify-center">
          {status ? (
            <TooltipProvider name={"Online"}>
              <Image
                src="/img/gif/online.gif"
                alt="Online"
                className="cursor-pointer"
                width={50}
                height={50}
              />
            </TooltipProvider>
          ) : (
            <TooltipProvider name={"Offline"}>
              <Image
                src="/img/gif/offline.gif"
                alt="Offline"
                className="cursor-pointer"
                width={50}
                height={50}
              />
            </TooltipProvider>
          )}
        </div>
      )
    },
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
    size: 10,
  },
  {
    accessorKey: "phone",
    header: "Phone Number",
    Header: () => (
      <div style={{ textAlign: 'left', lineHeight: 1.2 }}>
        Phone<br />Number
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
    size: 15,
  },
  {
    accessorKey: "walletAmount",
    header: "Wallet Balance",
    Header: () => (
      <div style={{ textAlign: 'left', lineHeight: 1.2 }}>
        Wallet<br />Balance
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
    accessorKey: "isActive",
    header: "Status",
    Cell: ({ row }) => {
      const isActive = row.getValue("isActive")
      const inActiveReason = row.original.inActiveReason || "";

      const { mutate: toggleDriverStatus } = useToggleDriverStatus();
      const id = row.original.id;
      const [isDialogOpen, setIsDialogOpen] = useState(false);
      const [reason, setReason] = useState("");
      const [status, setStatus] = useState(isActive);
      const handleToggleStatus = (newStatus: boolean) => {
        toggleDriverStatus(
          { id: id || "", status: newStatus, reason: reason },
          {
            onSuccess: () => {
              toast.success("Driver status updated successfully", {
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
          }
        );
      };

      return (
        <React.Fragment>
          <div className="flex items-center justify-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="h-8 hover:bg-transparent active:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
                ><Badge variant={isActive === true ? 'default' : 'destructive'}>
                    {isActive === true ? 'Active' : 'Inactive'}
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Badge>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {/* Dropdown options for updating the status */}
                <DropdownMenuItem
                  onClick={() => {
                    setIsDialogOpen(true);
                    setStatus(true);
                  }}
                >
                  Active
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    setIsDialogOpen(true);
                    setStatus(false);
                  }}
                >
                  Inactive
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="flex items-center justify-center">
            <Dialog
              open={isDialogOpen}
              onOpenChange={setIsDialogOpen}
            >
              <DialogContent className="max-w-[400px]">
                <DialogHeader>
                  <DialogTitle>Are you sure you want to change the status?</DialogTitle>
                  <div>
                    <div className="flex flex-col gap-2">
                      {/* <h4 className="text-sm font-semibold">Reason</h4> */}
                      {inActiveReason && <p className="text-sm"><span className="font-semibold">Old Reason:</span> {inActiveReason}</p>}
                      <Input
                        type="text"
                        placeholder="Enter Reason"
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                      />
                      <div className="flex items-center gap-2">
                        <p className="text-sm">Status change to :</p>
                        <Badge variant={status === true ? 'default' : 'destructive'}>
                          {status === true ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </DialogHeader>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>No</Button>
                  <Button onClick={() => {
                    handleToggleStatus(status as boolean);
                    setIsDialogOpen(false);
                  }}>Yes</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </React.Fragment>
      )
    },
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
    size: 25,
  },
  {
    accessorKey: "inActiveReason",
    header: "Reason",
    Header: () => (
      <div style={{ textAlign: 'left', lineHeight: 1.2 }}>
        Reason
      </div>
    ),
    Cell: ({ row }) => {
      const reason: string = row.original.inActiveReason || '';
      if (!reason) {
        return <div>-</div>;
      }
      return (
        <TooltipComponent name={reason}>
          <div>{reason.length > 15 ? `${reason.slice(0, 15)}...` : reason}</div>
        </TooltipComponent>
      );
    },
    muiTableHeadCellProps: {
      align: 'left',
      sx: {
        '& .MuiBox-root': {
          gap: 0,
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
    id: "actions",
    header: "Actions",
    Cell: ({ row }) => {
      const driver = row.original;
      const router = useRouter();

      const [isDialogOpen, setIsDialogOpen] = useState(false);

      // ✅ React Query delete hook
      const {
        mutate: deleteDriver,
        isPending: isDeleting
      } = useDeleteDriver();

      const handleViewDriver = useCallback((id: string) => {
        router.push(`/admin/drivers/view/${id}`);
      }, [router]);

      const handleEditDriver = useCallback((id: string) => {
        router.push(`/admin/drivers/edit/${id}`);
      }, [router]);

      const handleDelete = () => {
        if (!driver.driverId) return;

        deleteDriver(driver.driverId, {
          onSuccess: () => {
            toast.success("Driver deleted successfully!", {
              style: {
                backgroundColor: "#009F7F",
                color: "#fff",
              },
            });
          },
          onError: () => {
            toast.error("Failed to delete driver", {
              style: {
                backgroundColor: "#FF0000",
                color: "#fff",
              },
            });
          },
        });
      };

      return (
        <React.Fragment>
          <div className="flex items-center gap-3 justify-center">
            <div className="flex items-center gap-3">
              {/* View Button */}
              <Button
                variant="ghost"
                size="icon"
                className="text-blue-600 hover:text-blue-800 tool-tip"
                data-tooltip="View Details"
                onClick={() => handleViewDriver(driver.driverId || '')}
              >
                <Eye className="h-5 w-5" />
              </Button>

              {/* Edit Button */}
              {/* <Button
                variant="ghost"
                size="icon"
                className="text-green-500 hover:text-green-800 tool-tip"
                data-tooltip="Edit Driver"
                onClick={() => handleEditDriver(driver.driverId || '')}
              >
                <Edit className="h-5 w-5" />
              </Button> */}

              {/* Delete Button with Dialog */}
              <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-red-600 hover:text-red-800 tool-tip"
                    data-tooltip="Delete Driver"
                    onClick={() => setIsDialogOpen(true)}
                    disabled={isDeleting}
                  >
                    <Trash className="h-5 w-5" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete this driver? <br />
                      <span className="text-red-500">This action cannot be undone.</span>
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => setIsDialogOpen(false)}>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => {
                        handleDelete();
                        setIsDialogOpen(false);
                      }}
                      disabled={isDeleting}
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </React.Fragment>
      );
    },
    muiTableHeadCellProps: { align: 'left' },
    muiTableBodyCellProps: { align: 'left' },
    size: 30,
  },
];
