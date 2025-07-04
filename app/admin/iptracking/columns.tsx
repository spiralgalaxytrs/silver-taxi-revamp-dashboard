"use client";

import { ColumnDef } from "@tanstack/react-table";
import { DetailsPopup } from '../../../components/others/DetailsPopup'
import { Button } from "components/ui/button";
import { MdContentCopy } from "react-icons/md"
import { toast } from "sonner"
import { Checkbox } from "components/ui/checkbox";
import { Edit, Copy, Trash, Eye } from 'lucide-react';
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
import { useState } from "react";
import { useIpTrackingStore } from "stores/ipTrackingStore";

export type IpTracking = {
  ipAddress: string;
  visitsToday: number;
  totalVisits: number;
  lastLogin: string;
};

export const columns: ColumnDef<IpTracking>[] = [
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
  {
    accessorKey: "ipAddress",
    header: "IP Address",
  },
  {
    accessorKey: "totalVisits",
    header: "Visits"
  },
  {
    accessorKey: "lastLogin",
    header: "Last Login"
  },

  {
    header: "Actions",
    id: "actions",
    cell: ({ row }) => {
      const ipTracking = row.original;
      const [isDialogOpen, setIsDialogOpen] = useState(false);
      const { deleteIp } = useIpTrackingStore();

      const handleCopy = (id: string) => {
        navigator.clipboard.writeText(id)
          .then(() => {
            toast.success("IP id copied!");
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

      const confirmDelete = async (ipAddress: string) => {
        await deleteIp(ipAddress);
        setIsDialogOpen(false);

        toast.success("IP Tracking deleted successfully");
      }

      return (
        <>
          <div className="flex items-center gap-3 justify-center">
            <div className="flex iems-center gap-3">
              {/* Copy Icon */}
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-500 hover:text-gray-700 tool-tip"
                data-tooltip="Copy"
                onClick={() => handleCopy(ipTracking.ipAddress)}
              >
                <Copy className="h-5 w-5" />
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
                        Are you sure you want to delete this IP Address? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel onClick={cancelDelete}>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => confirmDelete(ipTracking.ipAddress)}>Delete</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>

              </>
            </div>
          </div>
        </>
      )
    },
  },
];