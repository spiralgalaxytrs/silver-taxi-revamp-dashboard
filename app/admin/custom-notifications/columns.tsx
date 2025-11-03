"use client";

import React from "react";
import { MaterialReactTable, type MRT_ColumnDef } from "material-react-table";
import { Badge } from "components/ui/badge";
import { Button } from "components/ui/button";
import TooltipComponent from "components/others/TooltipComponent";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "components/ui/alert-dialog";
import { Eye, Pencil, Send, Trash2, Users } from "lucide-react";
import { format } from "date-fns";
import CustomNotificationView from "components/notification/CustomNotificationView";
import type { CustomNotification } from "types/react-query/customNotification";
import { useCustomNotifications, useDeleteCustomNotification, useSendCustomNotification } from "hooks/react-query/useCustomNotification";
import { toast } from "sonner";

interface ColumnsProps {
  onEdit: (templateId: string) => void;
}

export const useColumns = ({ onEdit }: ColumnsProps) => {
  const deleteMutation = useDeleteCustomNotification();
  const { mutate: sendMutation, isPending } = useSendCustomNotification();

  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [sendDialogOpen, setSendDialogOpen] = React.useState(false);
  const [selectedNotification, setSelectedNotification] = React.useState<CustomNotification | null>(null);

  const handleDelete = async () => {
    if (selectedNotification) {
      try {
        await deleteMutation.mutateAsync(selectedNotification.templateId || '');
        toast.success("Notification deleted successfully!", {
          style: {
            backgroundColor: "#009F7F",
            color: "#fff",
          },
        });
        setDeleteDialogOpen(false);
        setSelectedNotification(null);
      } catch (error) {
        toast.error("Failed to delete notification", {
          style: {
            backgroundColor: "#FF0000",
            color: "#fff",
          },
        });
      }
    }
  };

  const handleSend = async () => {
    console.log("handleSend called with selectedNotification:", selectedNotification);

    if (selectedNotification) {
      try {
        console.log("Sending notification with templateId:", selectedNotification.templateId);
        sendMutation({ templateId: selectedNotification.templateId || '' }, {
          onSuccess: () => {
            setSendDialogOpen(false);
            setSelectedNotification(null);
            toast.success("Notification sent successfully", {
              style: {
                backgroundColor: "#009F7F",
                color: "#fff",
              },
            });
          },
          onError: (error: any) => {
            toast.error(error?.response?.data?.message || "Failed to send notification", {
              style: {
                backgroundColor: "#FF0000",
                color: "#fff",
              },
            });
          }
        });
      } catch (error: any) {
        console.error("Send notification error:", error);
        console.error("Error response:", error?.response?.data);
        toast.error(error?.response?.data?.message || "Failed to send notification", {
          style: {
            backgroundColor: "#FF0000",
            color: "#fff",
          },
        });
      }
    } else {
      console.error("No notification selected for sending");
      toast.error("No notification selected", {
        style: {
          backgroundColor: "#FF0000",
          color: "#fff",
        },
      });
    }
  };

  const columns: MRT_ColumnDef<CustomNotification>[] = [
    {
      accessorKey: "sno",
      header: "S.No",
      Cell: ({ row }) => <div className="text-sm font-medium">{row.index + 1}</div>,
    },
    {
      accessorKey: "title",
      header: "Title",
      Cell: ({ row }) => (
        <div className="max-w-[250px] truncate font-medium">
          {row.original.title}
        </div>
      ),
    },
    {
      accessorKey: "message",
      header: "Message",
      Cell: ({ row }) => {
      const message= row.original.message as string;
      if (!message) return <div>-</div>;
      return (
        <TooltipComponent name={message}>
          <div>{message.slice(0, 15)}...</div>
        </TooltipComponent>
      )
    },
      
     
    },
    {
      accessorKey: "target",
      header: "Target",
      Cell: ({ row }) => getTargetBadge(row.original.target || 'none'),
    },
    {
      accessorKey: "actions",
      header: "Actions",
      enableSorting: false,
      Cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <CustomNotificationView notification={row.original}>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
            >
              <Eye className="w-4 h-4" />
            </Button>
          </CustomNotificationView>

          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => onEdit(row.original.templateId || '')}
          >
            <Pencil className="w-4 h-4" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-green-600 hover:text-green-700"
            onClick={() => {
              console.log("Send button clicked for notification:", row.original);
              setSelectedNotification(row.original);
              setSendDialogOpen(true);
            }}
            disabled={isPending}
          >
            <Send className="w-4 h-4" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
            onClick={() => {
              setSelectedNotification(row.original);
              setDeleteDialogOpen(true);
            }}
            disabled={deleteMutation.isPending}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ];

  return {
    columns,
    deleteDialogOpen,
    setDeleteDialogOpen,
    sendDialogOpen,
    setSendDialogOpen,
    selectedNotification,
    setSelectedNotification,
    handleDelete,
    handleSend,
    deleteLoading: deleteMutation.isPending,
    sendLoading: isPending,
  };
};

const getTargetBadge = (target: string) => {
  const variants = {
    customer: "default",
    driver: "secondary",
    vendor: "outline",
    none: "destructive",
  } as const;

  return (
    <Badge variant={variants[target as keyof typeof variants] || "default"}>
      <Users className="w-3 h-3 mr-1" />
      {target.charAt(0).toUpperCase() + target.slice(1)}
    </Badge>
  );
};

// Delete Dialog Component
const DeleteDialog = ({
  open,
  onOpenChange,
  onConfirm,
  loading,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  loading: boolean;
}) => {
  const handleConfirm = () => {
    console.log("Delete dialog confirm clicked");
    onConfirm();
  };

  const handleCancel = () => {
    console.log("Delete dialog cancel clicked");
    onOpenChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Notification</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete this notification? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleCancel} disabled={loading}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirm} disabled={loading}>
            {loading ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

// Send Dialog Component
const SendDialog = ({
  open,
  onOpenChange,
  onConfirm,
  loading,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  loading: boolean;
}) => {
  const handleConfirm = () => {
    console.log("Send dialog confirm clicked");
    onConfirm();
  };

  const handleCancel = () => {
    console.log("Send dialog cancel clicked");
    onOpenChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Send Notification</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to send this notifications This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleCancel} disabled={loading}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirm} disabled={loading}>
            {loading ? "Sending..." : "Send"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export { DeleteDialog, SendDialog };
