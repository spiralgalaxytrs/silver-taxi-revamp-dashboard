'use client'

import React from "react"
import { useState, useCallback } from "react"
import { toast } from "sonner";
import { Edit, Trash, Eye, ChevronDown } from 'lucide-react';
import { Button } from "components/ui/button"
import { Badge } from "components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "components/ui/dropdown-menu"
import { useRouter } from "next/navigation"
import {
  AlertDialog, AlertDialogAction,
  AlertDialogCancel, AlertDialogFooter,
  AlertDialogDescription, AlertDialogTitle,
  AlertDialogHeader, AlertDialogContent
} from "components/ui/alert-dialog";
import {
  Dialog, DialogContent,
  DialogFooter, DialogHeader,
  DialogTitle
} from "components/ui/dialog"
import {
  MRT_ColumnDef,
} from 'material-react-table'
import Link from "next/link";
import { Vendor } from 'types/react-query/vendor'
import {
  useToggleVendorStatus,
  useDeleteVendor
} from 'hooks/react-query/useVendor'
import { Input } from "components/ui/input";


export const columns: MRT_ColumnDef<Partial<Vendor>>[] = [
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
  //  muiTableHeadCellProps: { align: 'center' },
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
    accessorKey: "vendorId",
    header: "Vendor ID",
    muiTableHeadCellProps: { align: 'center' },
    muiTableBodyCellProps: { align: 'center' },
    Cell: ({ row }) => {
      const vendor = row.original;

      return (
        <Link
          href={`/admin/vendor/view/${vendor?.vendorId}`}
          className="text-blue-600 hover:underline"
        >
          {vendor?.vendorId}
        </Link>
      );
    },
  },
  // {
  //   accessorKey: "vendorId",
  //   header: "Vendor ID",
  // },
  {
    accessorKey: "name",
    header: "Name",
    muiTableHeadCellProps: { align: 'center' },
    muiTableBodyCellProps: { align: 'center' },
  },
  {
    accessorKey: "phone",
    header: "Phone No",
    muiTableHeadCellProps: { align: 'center' },
    muiTableBodyCellProps: { align: 'center' },
  },
  {
    accessorKey: "createdAt",
    header: "Created At",
    Cell: ({ row }) => {
      const createdAt: string = row.getValue("createdAt")
      const date = new Date(createdAt);
      const convertedDate = date.toLocaleDateString();
      const options: Intl.DateTimeFormatOptions = { hour: 'numeric', minute: 'numeric', hour12: true };
      const amPmTime = date.toLocaleTimeString('en-IN', options);

      return (
        <React.Fragment>
          <div>
            <div>{convertedDate}</div>
            <div>{amPmTime}</div>
          </div>
        </React.Fragment>
      )
    },
    muiTableHeadCellProps: { align: 'center' },
    muiTableBodyCellProps: { align: 'center' },
  },
  {
    accessorKey: "isLogin",
    header: "Status",
    Cell: ({ row }) => {
      const isActive = row.getValue("isLogin");
      const inActiveReason = row.original.reason || "";

      const {
        mutate: toggleVendorStatus,
        isPending: isLoading
      } = useToggleVendorStatus();

      const [isDialogOpen, setIsDialogOpen] = useState(false);
      const [reason, setReason] = useState("");
      const [status, setStatus] = useState(isActive);

      const id = row.original.vendorId ?? "";
      const handleToggleStatus = async (newStatus: boolean) => {
        try {
          toggleVendorStatus({ id, status: newStatus, reason }, {
            onSuccess: () => {
              toast.success("Vendor status updated successfully", {
                style: {
                  backgroundColor: "#009F7F",
                  color: "#fff",
                },
              });
            },
            onError: (error: any) => {
              toast.error(error?.response?.data?.message || "Failed to update vendor status", {
                style: {
                  backgroundColor: "#FF0000",
                  color: "#fff",
                },
              });
            },
          });
        } catch (error) {
          toast.error("An unexpected error occurred", {
            style: {
              backgroundColor: "#FF0000",
              color: "#fff",
            },
          });
          // console.error(error);
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
                        <p className="text-sm">Status change to : </p>
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
    muiTableHeadCellProps: { align: 'center' },
    muiTableBodyCellProps: { align: 'center' },
  },
  {
    id: "actions",
    header: "Actions",
    Cell: ({ row }) => {
      const vendor = row.original
      const router = useRouter();


      const {
        mutate: deleteVendor,
      } = useDeleteVendor();

      const [showConvertDialog, setShowConvertDialog] = useState(false);
      const [isDialogOpen, setIsDialogOpen] = useState(false);

      const handleViewVendor = useCallback(async (id: string) => {
        await router.push(`/admin/vendor/view/${id}`)
      }, [router])

      const handleEditVendor = useCallback(async (id: string) => {
        await router.push(`/admin/vendor/edit/${id}`)
      }, [router])

      const handleCopy = (id: string) => {
        navigator.clipboard.writeText(id)
          .then(() => {
            toast.success("Offer ID copied!", {
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


      const cancelDelete = () => {
        setIsDialogOpen(false);
      }

      const confirmDelete = async (id: string) => {
        deleteVendor(id, {
          onSuccess: () => {
            setIsDialogOpen(false);
            toast.success("Vendor deleted successfully", {
              style: {
                backgroundColor: "#009F7F",
                color: "#fff",
              },
            });
          },
          onError: (error: any) => {
            setIsDialogOpen(false);
            toast.error(error?.response?.data?.message || "Error deleting Vendor!", {
              style: {
                backgroundColor: "#FF0000",
                color: "#fff",
              },
            });
          }
        });
      }

      return (
        <div className="flex items-center gap-3 justify-center">
          <div className="flex items-center gap-3">
            {/* View Icon */}

            <Button
              variant="ghost"
              size="icon"
              className="text-blue-600 hover:text-blue-800 tool-tip"
              data-tooltip="View Details"
              onClick={() => handleViewVendor(vendor.vendorId || '')}
            >
              <Eye className="h-5 w-5" />
            </Button>


            {/* Edit Icon */}
            <Button
              variant="ghost"
              size="icon"
              className="text-green-600 hover:text-green-800 tool-tip"
              data-tooltip="Edit Offer"
              onClick={() => handleEditVendor(vendor.vendorId || '')}
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
                      Are you sure you want to delete this Vendor? <br />
                      <span className="text-red-500">This action cannot be undone.</span>
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel onClick={cancelDelete}>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => confirmDelete(vendor.vendorId ?? '')}>Delete</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </>

            {/* Copy Icon
          <Button
            variant="ghost"
            size="icon"
            className="text-gray-500 hover:text-gray-700 tool-tip"
            data-tooltip="Copy"
            onClick={() => handleCopy(vendor.vendorId)}
          >
            <Copy className="h-5 w-5" />
          </Button> */}
          </div>
        </div>
      )
    },
    muiTableHeadCellProps: { align: 'center' },
    muiTableBodyCellProps: { align: 'center' },
  },
]



