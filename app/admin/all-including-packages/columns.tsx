"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Button } from "components/ui/button"
import { Edit, Trash, Eye } from "lucide-react"
import { useRouter } from "next/navigation"
import { Checkbox } from "components/ui/checkbox"
import { AIPPopup } from "components/all includes/AIPPopup"
import { useCallback, useState } from "react"
import { AllIncludes } from 'stores/-allIncludesStore'
import { useAllIncludesStore } from "stores/-allIncludesStore"
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
} from 'components/ui/alert-dialog';
import { useVehicleStore } from "stores/-vehicleStore";

const capitalize = (str: string) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export const columns: ColumnDef<AllIncludes>[] = [
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
    cell: ({ row }) => <div>{row.index + 1}</div>,
  },
  // {
  //   accessorKey: "includeId",
  //   header: "Package ID",
  // },
  {
    accessorKey: "origin",
    header: "Origin District",
    cell: ({ getValue }) => capitalize(getValue<string>()),
  },
  {
    accessorKey: "destination",
    header: "Destination District",
    cell: ({ getValue }) => capitalize(getValue<string>()),
  },
  {
    accessorKey: "tollPrice",
    header: "Toll Price",
    cell: ({ getValue }) => {
      const value = getValue<number>();
      return value != null && value !== null ? `Rs ${value}` : 'Rs 0';
    },
  },
  {
    accessorKey: "hillPrice",
    header: "Hill Charges",
    cell: ({ getValue }) => {
      const value = getValue<number>();
      return value != null && value !== null ? `Rs ${value}` : 'Rs 0';
    },
  },
  {
    accessorKey: "Km",
    header: "Distance (Km)",
    cell: ({ getValue }) => `${getValue<number>()} km`,
  },
  ...Array.from(new Set(useVehicleStore.getState().vehicles
    .filter(vehicle => vehicle.isActive)
    .map(vehicle => vehicle.type)))
    .map(vehicleType => ({
      id: `${vehicleType.toLowerCase()}_price`,
      accessorFn: (row: any) => {
        const vehicles = row.vehicles || [];
        const vehiclePrice = Array.isArray(vehicles)
          ? vehicles.find(v => v.type === vehicleType)
          : null;
        return vehiclePrice?.price || null;
      },
      header: `${vehicleType} Charges`,
      cell: ({ getValue }: any) => {
        const value = getValue();
        return value ? `Rs ${value}` : 0;
      },
    })),
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

      const amPmTime = new Intl.DateTimeFormat("en-IN", options).format(istDate);

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
      const pkg = row.original
      const router = useRouter()
      const { deleteInclude, fetchAllIncludes } = useAllIncludesStore()
      const [isDialogOpen, setIsDialogOpen] = useState(false);

      const handleEdit = useCallback(async (id: string) => {
        router.push(`/admin/all-including-packages/edit/${id}`)
      }, [router])

      const handleDelete = async (id: string) => {
        await deleteInclude(id);
        await fetchAllIncludes();
        setIsDialogOpen(false);
        toast.success("Package deleted successfully");
      }

      const cancelDelete = () => {
        setIsDialogOpen(false);
      }

      return (
        <div className="flex items-center gap-3">
          <AIPPopup
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
            id={pkg.includeId}
            title="Package Details"
          />
          <Button
            variant="ghost"
            size="icon"
            className="text-green-600 hover:text-green-800 tool-tip"
            data-tooltip="Edit Package"
            onClick={() => handleEdit(pkg.includeId)}
          >
            <Edit className="h-5 w-5" />
          </Button>

          <>
            <Button
              variant="ghost"
              size="icon"
              className="text-red-600 hover:text-red-800 tool-tip"
              data-tooltip="Delete Package"
              onClick={() => setIsDialogOpen(true)}
            >
              <Trash className="h-5 w-5" />
            </Button>

            <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete this Package?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel onClick={cancelDelete}>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => handleDelete(pkg.includeId ?? '')}>Delete</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </>
        </div>
      )
    },
  },
]