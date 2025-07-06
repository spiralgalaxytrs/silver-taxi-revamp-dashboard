"use client"

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
import React, { useCallback, useState } from "react"
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
  useDeleteDriver,
  useToggleDriverStatus
} from 'hooks/react-query/useDriver';
import {
  MRT_ColumnDef
} from 'material-react-table'

export type WalletAttributes = {
  balance: number;
}

export type Driver = {
  id: string | undefined;
  driverId?: string;
  name: string;
  phone: string;
  license: string;
  licenseImage?: File | null;
  createdAt: string;
  isActive: boolean | null;
  wallet?: WalletAttributes;
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
    muiTableHeadCellProps: { align: 'center' },
    muiTableBodyCellProps: { align: 'center' },
  },
  {
    accessorKey: "name",
    header: "Driver Name",
    muiTableHeadCellProps: { align: 'center' },
    muiTableBodyCellProps: { align: 'center' },
  },
  {
    accessorKey: "phone",
    header: "Phone Number",
    muiTableHeadCellProps: { align: 'center' },
    muiTableBodyCellProps: { align: 'center' },
  },
  {
    accessorKey: "walletAmount",
    header: "Wallet Balance",
    muiTableHeadCellProps: { align: 'center' },
    muiTableBodyCellProps: { align: 'center' },
  },
  {
    accessorKey: "isActive",
    header: "Status",
    Cell: ({ row }) => {
      const isActive = row.getValue("isActive")

      const { mutate: toggleDriverStatus } = useToggleDriverStatus();
      const id = row.original.id;

      const handleToggleStatus = (newStatus: boolean) => {
        toggleDriverStatus(
          { id: id || "", status: newStatus },
          {
            onSuccess: () => {
              toast.success("Driver status updated successfully", {
                style: {
                  backgroundColor: "#009F7F",
                  color: "#fff",
                },
              });
            },
            onError: () => {
              toast.error("Failed to update status", {
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
                onClick={() => handleToggleStatus(true)}
              >
                Active
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleToggleStatus(false)}
              >
                Inactive
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )
    },
    muiTableHeadCellProps: { align: 'center' },
    muiTableBodyCellProps: { align: 'center' },
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
            toast.success("Driver deleted successfully!");
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
              <Button
                variant="ghost"
                size="icon"
                className="text-green-500 hover:text-green-800 tool-tip"
                data-tooltip="Edit Driver"
                onClick={() => handleEditDriver(driver.driverId || '')}
              >
                <Edit className="h-5 w-5" />
              </Button>

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
    muiTableHeadCellProps: { align: 'center' },
    muiTableBodyCellProps: { align: 'center' },
  },
];
