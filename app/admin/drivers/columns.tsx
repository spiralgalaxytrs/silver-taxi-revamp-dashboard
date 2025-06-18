"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Button } from "components/ui/button"
import { Edit, Eye, Trash } from 'lucide-react'
import { MdContentCopy } from "react-icons/md";
import { DetailsPopup } from '../../../components/DetailsPopup'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "components/ui/dropdown-menu"
import { useRouter } from "next/navigation"
import { Checkbox } from "components/ui/checkbox";
import { toast } from 'sonner';
import { Badge } from "components/ui/badge"
import { useCallback, useEffect, useState } from "react"
import { useDriverStore } from "stores/driverStore"
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


export const columns: ColumnDef<Driver>[] = [
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
    cell: ({ row }) => row.index + 1, // Assigns Serial Number dynamically
  },
  // {
  //   accessorKey: "driverId",
  //   header: "Driver ID",
  // },
  {
    accessorKey: "name",
    header: "Driver Name",
  },
  {
    accessorKey: "phone",
    header: "Phone Number",
  },
  {
    accessorKey: "license",
    header: "License Number",
  },
  {
    accessorKey: "walletAmount",
    header: "Wallet Balance",
  },
  {
    accessorKey: "isActive",
    header: "Status",
    cell: ({ row }) => {
      const isActive = row.getValue("isActive")
      const { toggleDriverStatus, fetchDrivers, isLoading } = useDriverStore();
      const id = row.original.id;

      const handleToggleStatus = async (newStatus: boolean) => {
        await toggleDriverStatus(id || '', newStatus);
        const statusCode = useDriverStore.getState().statusCode;
        const message = useDriverStore.getState().message;
        if (statusCode === 200 || statusCode === 201) {
          toast.success("Driver status updated successfully", {
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
        await fetchDrivers();
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
      const driver = row.original
      const router = useRouter()

      const handleViewDriver = useCallback(async (id: string) => {
        await router.push(`/admin/drivers/view/${id}`)
      }, [router])

      const handleEditDriver = useCallback(async (id: string) => {
        await router.push(`/admin/drivers/edit/${id}`)
      }, [router])

      const { deleteDriver } = useDriverStore();
      const handleDelete = async () => {
        try {
          await deleteDriver(driver.driverId || ''); // Wait for deletion to complete

          // Refetch drivers after deletion
          await useDriverStore.getState().fetchDrivers();

          toast.success("Driver deleted successfully");
        } catch (error) {
          toast.error("Failed to delete driver", {
            style: {
              backgroundColor: "#FF0000",
              color: "#fff",
            },
          });
          // console.error("Delete Error:", error);
        }
      };

      // const handleCopy = (id: string) => {

      //   navigator.clipboard.writeText(id)
      //     .then(() => {
      //       toast.success("Driver ID copied!");
      //     })
      //     .catch((err) => {
      //       console.error("Failed to copy ID", err);
      //       toast.error("Failed to copy ID");
      //     });
      // };

      // State to manage AlertDialog open state
      const [isDialogOpen, setIsDialogOpen] = useState(false);

      const updatedDriver = {
        ...driver,
        wallet: null,
        walletAmount: `Rs ${driver.wallet?.balance || 0}`
      };

      return (
        <div className="flex items-center gap-3 justify-center">
          <div className="flex items-center gap-3">
            {/* Convert to Booking Icon */}

            {/* View button*/}
            {/* <Button
              variant="ghost"
              size="icon"
              className="text-blue-600 hover:text-blue-800 tool-tip"
              data-tooltip="View Details"
              onClick={() => handleViewDriver(driver.driverId || '')}
            >
              <Eye className="h-5 w-5" />
            </Button> */}

            <Button
              variant="ghost"
              size="icon"
              className="text-blue-600 hover:text-blue-800 tool-tip"
              data-tooltip="View Details"
              onClick={() => handleViewDriver(driver.driverId || '')}
            >
              <Eye className="h-5 w-5" />
            </Button>

            {/* Edit Icon */}
            <Button
              variant="ghost"
              size="icon"
              className="text-green-500 hover:text-green-800 tool-tip"
              data-tooltip="Edit Driver"
              onClick={() => handleEditDriver(driver.driverId || '')}
            >
              <Edit className="h-5 w-5" />
            </Button>

            {/* Delete Driver with AlertDialog */}
            <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-red-600 hover:text-red-800 tool-tip"
                  data-tooltip="Delete Driver"
                  onClick={() => setIsDialogOpen(true)}
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
                  <AlertDialogAction onClick={() => { handleDelete(); setIsDialogOpen(false); }}>Delete</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

          </div>
        </div>
      )
    },
  },
]

