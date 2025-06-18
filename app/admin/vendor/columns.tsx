'use client'

import React from "react"
import { useState, useCallback } from "react"
import { toast } from "sonner";
import { ColumnDef } from "@tanstack/react-table"
import { Checkbox } from "components/ui/checkbox";
import { Edit, Copy, Trash, Eye } from 'lucide-react';
import { Button } from "components/ui/button"
import { Badge } from "components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "components/ui/dropdown-menu"
import { useRouter } from "next/navigation"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogFooter, AlertDialogDescription, AlertDialogTitle, AlertDialogHeader, AlertDialogContent } from "components/ui/alert-dialog";
import { useVendorStore } from "stores/vendorStore"


export const columns: ColumnDef<any, unknown>[] = [
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
  // {
  //   accessorKey: "vendorId",
  //   header: "Vendor ID",
  // },
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "phone",
    header: "Phone No",
  },
  {
    accessorKey: "createdAt",
    header: "Created At",
    cell: ({ row }) => {
      const createdAt: string = row.getValue("createdAt")
      const date = new Date(createdAt);
      const convertedDate = date.toLocaleDateString();
      const options: Intl.DateTimeFormatOptions = { hour: 'numeric', minute: 'numeric', hour12: true };
      const amPmTime = date.toLocaleTimeString('en-IN', options);

      return (  
        <>
        <div>
          <div>{convertedDate}</div>
          <div>{amPmTime}</div>
        </div>
        </>
      )
    },
  },
  {
    accessorKey: "isLogin",
    header: "Status",
    cell: ({ row }) => {
      const isActive = row.getValue("isLogin");
      const { toggleVendorStatus, fetchVendors, isLoading } = useVendorStore();
      const id = row.original.vendorId;

      const handleToggleStatus = async (newStatus: boolean) => {
        try {
          await toggleVendorStatus(id, newStatus);
          const status = useVendorStore.getState().statusCode;
          const message = useVendorStore.getState().message;
          if (status === 200 || status === 201) {
            toast.success("Vendor status updated successfully", {
              style: {
                  backgroundColor: "#009F7F",
                  color: "#fff",
              },
          });
          } else {
            toast.error(message || "Failed to update vendor status", {
              style: {
                  backgroundColor: "#FF0000",
                  color: "#fff",
              },
          });
          }
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
        <div className="flex items-center justify-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="h-8 hover:bg-transparent active:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
                onClick={() => handleToggleStatus(!isActive)}
                disabled={isLoading}
              >
                <Badge variant={isActive ? 'default' : 'destructive'}>
                  {isActive ? 'Active' : 'Inactive'}
                </Badge>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => handleToggleStatus(true)} disabled={isLoading}>
                Active
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleToggleStatus(false)} disabled={isLoading}>
                Inactive
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const vendor = row.original
      const [showConvertDialog, setShowConvertDialog] = useState(false);
      const router = useRouter();
      const [isDialogOpen, setIsDialogOpen] = useState(false);
      const { deleteVendor } = useVendorStore();

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
        await deleteVendor(id);
        setIsDialogOpen(false);
        toast.success("Vendor deleted successfully");
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
              onClick={() => handleViewVendor(vendor.vendorId)}
            >
              <Eye className="h-5 w-5" />
            </Button>


            {/* Edit Icon */}
            <Button
              variant="ghost"
              size="icon"
              className="text-green-600 hover:text-green-800 tool-tip"
              data-tooltip="Edit Offer"
              onClick={() => handleEditVendor(vendor.vendorId)}
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
                      Are you sure you want to delete this Vendor? <br/>
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
  },
]



