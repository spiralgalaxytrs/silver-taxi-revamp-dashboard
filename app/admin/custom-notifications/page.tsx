"use client";

import React, { useState, useMemo } from "react";
import { useColumns, DeleteDialog, SendDialog } from "./columns";
import { Button } from "components/ui/button";
import { Plus, RefreshCcw } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  useCustomNotifications,
} from "hooks/react-query/useCustomNotification";
import {
  MaterialReactTable
} from 'material-react-table';
import type { CustomNotification } from "types/react-query/customNotification";

export default function AdminCustomNotificationsPage() {
  const router = useRouter();
  const [isSpinning, setIsSpinning] = useState(false);

  const {
    data,
    isLoading,
    refetch,
  } = useCustomNotifications();

  const handleRefresh = async () => {
    setIsSpinning(true);
    await refetch();
    setIsSpinning(false);
  };

  const handleEdit = (templateId: string) => {
    router.push(`/admin/custom-notifications/edit/${templateId}`);
  };

  const {
    columns,
    deleteDialogOpen,
    setDeleteDialogOpen,
    sendDialogOpen,
    setSendDialogOpen,
    selectedNotification,
    setSelectedNotification,
    handleDelete,
    handleSend,
    deleteLoading,
    sendLoading,
  } = useColumns({ onEdit: handleEdit });

  const tableData = useMemo(() => {
    if (!data?.data) return [];
    return data.data || [];
  }, [data]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Custom Notifications</h1>
          <p className="text-muted-foreground">
            Manage and send custom notifications to your users
          </p>
        </div>
        <Button onClick={() => router.push("/admin/custom-notifications/create")}>
          <Plus className="w-4 h-4 mr-2" />
          Create Notification
        </Button>
      </div>

      {/* Table */}
      <div className="rounded bg-white shadow">
        <MaterialReactTable
          columns={columns}
          data={tableData}
          state={{ isLoading }}
          enableColumnFilters={false}
          enableSorting={true}
          enableRowSelection={false}
          enableColumnResizing={true}
          enableStickyHeader={true}
          positionGlobalFilter="left"
          initialState={{
            density: 'compact',
            pagination: { pageIndex: 0, pageSize: 10 },
            columnPinning: { right: ["actions"] },
            showGlobalFilter: true,
          }}
          muiSearchTextFieldProps={{
            placeholder: 'Search notifications...',
            variant: 'outlined',
            fullWidth: true,
            sx: {
              minWidth: '400px',
              marginLeft: '16px',
            },
          }}
          muiToolbarAlertBannerProps={{
            sx: {
              justifyContent: 'flex-start',
            },
          }}
          muiTableContainerProps={{
            sx: { maxHeight: "600px" },
          }}
          muiTableHeadCellProps={{
            sx: {
              backgroundColor: "rgb(249 250 251)",
              fontWeight: "600",
            },
          }}
          renderTopToolbarCustomActions={() => (
            <div className="flex flex-1 justify-end items-center">
              <Button
                variant="ghost"
                onClick={handleRefresh}
                className="text-gray-600 hover:text-primary transition p-0 m-0 hover:bg-transparent hover:shadow-none"
                title="Refresh Data"
                disabled={isSpinning}
              >
                <RefreshCcw className={`w-5 h-5 ${isSpinning ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          )}
        />
      </div>

      {/* Delete Dialog */}
      <DeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDelete}
        loading={deleteLoading}
      />

      {/* Send Dialog */}
      <SendDialog
        open={sendDialogOpen}
        onOpenChange={setSendDialogOpen}
        onConfirm={handleSend}
        loading={sendLoading}
      />
    </div>
  );
}
