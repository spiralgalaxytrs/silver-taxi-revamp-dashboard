"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Eye, Pencil, Trash, MenuIcon, Forward } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "components/ui/alert-dialog";
import { Button } from "components/ui/button";

interface ActionDropdownProps {
  id: string;
  type: "booking" | "driver" | "vehicle" | "user" | string;
  onDelete: (id: string) => void;
  className?: string;
  viewPath?: string;
  editPath: string;
  disableEdit?: boolean;
  disableView?: boolean;
  disableDelete?: boolean;
  convertToBooking?: string;
}

const ActionDropdown = ({
  id,
  type,
  onDelete,
  className = "",
  viewPath,
  editPath,
  disableEdit = false,
  disableView = false,
  disableDelete = false,
  convertToBooking
}: ActionDropdownProps) => {
  const router = useRouter();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  if (!id) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={`font-medium text-sm transition-colors duration-200 p-4 ${className}`}
        >
          <MenuIcon className="w-16 h-16 text-black" strokeWidth={3} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-50">
        {!disableView && (
          <DropdownMenuItem onClick={() => router.push(`${viewPath}/${id}`)}>
            <Eye className="w-4 h-4 mr-2" /> View
          </DropdownMenuItem>
        )}

        {convertToBooking && (
          <DropdownMenuItem onClick={() => router.push(`${convertToBooking}`)}>
            <Forward className="w-4 h-4 mr-2" /> Convert to Booking
          </DropdownMenuItem>
        )}

        {!disableEdit && (
          <AlertDialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <AlertDialogTrigger asChild>
              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                <Pencil className="w-4 h-4 mr-2" /> Edit
              </DropdownMenuItem>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Confirm Edit</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to edit this {type}?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setIsEditDialogOpen(false)}>
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => {
                    router.push(`${editPath}/${id}`);
                    setIsEditDialogOpen(false);
                  }}
                >
                  Proceed
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}

        {!disableDelete && (
          <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <AlertDialogTrigger asChild>
              <DropdownMenuItem
                onSelect={(e) => e.preventDefault()}
                className="text-red-600"
              >
                <Trash className="w-4 h-4 mr-2" /> Delete
              </DropdownMenuItem>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete this {type}?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setIsDeleteDialogOpen(false)}>
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => {
                    onDelete(id);
                    setIsDeleteDialogOpen(false);
                  }}
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ActionDropdown;
