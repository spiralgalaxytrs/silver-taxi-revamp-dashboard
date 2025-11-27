"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { columns } from "./columns";
import { Button } from "components/ui/button";
import { toast } from "sonner"
import { Card } from "components/ui/card";
import { Input } from "components/ui/input";
import { Label } from "components/ui/label";
import { Textarea } from "components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "components/ui/select";
import CounterCard from "components/cards/CounterCard";
import { Activity, Trash, ArrowDown, ArrowUp, Loader2, RefreshCcw } from "lucide-react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogFooter
} from 'components/ui/alert-dialog';
import {
  useDrivers,
  useBulkDeleteDrivers,
  useDriverWalletBulkRequest
} from 'hooks/react-query/useDriver';
import {
  MaterialReactTable,
  type MRT_ColumnDef
} from 'material-react-table'
import {
  useTableColumnVisibility,
  useUpdateTableColumnVisibility
} from 'hooks/react-query/useImageUpload';

type BulkWalletFormState = {
  amount: string;
  reason: string;
  adjustmentType: 'add' | 'minus';
  status: 'all' | 'active' | 'inactive';
  days: string;
};


export default function DriversPage(): JSX.Element {
  const router = useRouter();

  // Pagination state
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  // Search and filter state
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('createdAt');
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('DESC');
  const [globalFilter, setGlobalFilter] = useState('');

  // Calculate page number (MaterialReactTable uses 0-based, backend uses 1-based)
  const page = pagination.pageIndex + 1;
  const limit = pagination.pageSize;

  // Sync globalFilter with search state for server-side search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setSearch(globalFilter);
      // Reset to first page when search changes
      setPagination(prev => ({ ...prev, pageIndex: 0 }));
    }, 500); // Debounce search by 500ms

    return () => clearTimeout(timeoutId);
  }, [globalFilter]);

  // adminId will be extracted from token by backend if not provided
  // You can pass it explicitly if available from your auth system
  const {
    data: driversData,
    isLoading,
    refetch
  } = useDrivers({
    enabled: true,
    page,
    limit,
    search: search || undefined,
    status: status || undefined,
    sortBy,
    sortOrder,
    // adminId is optional - backend extracts from token if not provided
  });

  // Extract drivers and pagination from response
  const drivers = driversData?.drivers || [];
  const paginationInfo = driversData?.pagination;

  const driversCount = useMemo(() => {
    return driversData?.driversCount || { total: 0, active: 0, inactive: 0 };
  }, [driversData]);

  const {
    mutate: bulkDeleteDrivers
  } = useBulkDeleteDrivers();

  const {
    data: tableColumnVisibility = {},
  } = useTableColumnVisibility("drivers");

  const {
    mutate: updateTableColumnVisibility
  } = useUpdateTableColumnVisibility("drivers");


  const [sorting, setSorting] = useState<{ id: string; desc: boolean }[]>([])
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({})
  const [isSpinning, setIsSpinning] = useState(false)
  const [showBulkWalletForm, setShowBulkWalletForm] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [localColumnVisibility, setLocalColumnVisibility] = useState<Record<string, boolean>>({})
  const [isColumnVisibilityUpdated, setIsColumnVisibilityUpdated] = useState(false);
  const [bulkWalletForm, setBulkWalletForm] = useState<BulkWalletFormState>({
    amount: '',
    reason: '',
    adjustmentType: 'minus',
    status: 'all',
    days: '0',
  });
  const [bulkWalletError, setBulkWalletError] = useState<string | null>(null);

  const {
    mutate: submitBulkWalletRequest,
    isPending: isSubmittingBulkRequest
  } = useDriverWalletBulkRequest();

  const driverData = useMemo(() => {
    return drivers.map(driver => ({
      ...driver,
      id: driver?.driverId ?? '',
      walletAmount: driver.wallet?.balance ?? 0
    }))
  }, [drivers]);

  const resetBulkWalletForm = () => {
    setBulkWalletForm({
      amount: '',
      reason: '',
      adjustmentType: 'minus',
      status: 'all',
      days: '0',
    });
    setBulkWalletError(null);
  };

  const handleBulkWalletSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBulkWalletError(null);

    const parsedAmount = Number(bulkWalletForm.amount);
    if (!Number.isFinite(parsedAmount) || parsedAmount < 1) {
      setBulkWalletError("Amount must be at least 1");
      return;
    }

    const trimmedReason = bulkWalletForm.reason.trim();
    if (!trimmedReason) {
      setBulkWalletError("Reason is required");
      return;
    }

    if (trimmedReason.length > 500) {
      setBulkWalletError("Reason must be less than 500 characters");
      return;
    }

    const parsedDays = Number(bulkWalletForm.days) || 0;
    if (parsedDays < 0) {
      setBulkWalletError("Days cannot be negative");
      return;
    }

    const statusFilter =
      bulkWalletForm.status === "all"
        ? null
        : bulkWalletForm.status === "active"
          ? true
          : false;

    submitBulkWalletRequest(
      {
        amount: parsedAmount,
        reason: trimmedReason,
        days: parsedDays,
        adjustmentType: bulkWalletForm.adjustmentType,
        status: statusFilter,
      },
      {
        onSuccess: (response) => {
          toast.success(
            response?.message ?? "Wallet bulk request sent to queue",
            {
              style: {
                backgroundColor: "#009F7F",
                color: "#fff",
              },
            }
          );
          resetBulkWalletForm();
          setShowBulkWalletForm(false);
        },
        onError: (error: any) => {
          toast.error(
            error?.response?.data?.message || "Failed to submit wallet bulk request",
            {
              style: {
                backgroundColor: "#FF0000",
                color: "#fff",
              },
            }
          );
        }
      }
    );
  };

  // 🌟 Fix: Avoid calling updateTableColumnVisibility inside useMemo (side effect in render)
  const columnVisibility = useMemo(() => {
    const serverVisibility = tableColumnVisibility.preferences || {};
    return { ...serverVisibility, ...localColumnVisibility };
  }, [tableColumnVisibility, localColumnVisibility]);

  useEffect(() => {
    // 🌟 Only update server when local or server visibility changes
    const serverVisibility = tableColumnVisibility.preferences || {};
    const finalVisibility = { ...serverVisibility, ...localColumnVisibility };
    if (isColumnVisibilityUpdated) {
      updateTableColumnVisibility(finalVisibility);
      setIsColumnVisibilityUpdated(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localColumnVisibility, isColumnVisibilityUpdated]);


  // Apply client-side date filters only (search and status are server-side)
  const finalDrivers = useMemo(() => {
    let filtered = [...driverData];
    return filtered;
  }, [driverData]);

  const handleBulkDelete = () => {
    const selectedIds = Object.keys(rowSelection);
    if (selectedIds.length === 0) return;
    setIsDialogOpen(true);
  };

  const confirmBulkDelete = async () => {
    const selectedIndices = Object.keys(rowSelection)
    const selectedIds = selectedIndices.map(index => {
      const driverId = finalDrivers[parseInt(index)]?.driverId
      return driverId !== undefined ? driverId : null
    }).filter(id => id !== null)
    try {
      bulkDeleteDrivers(selectedIds, {
        onSuccess: () => {
          toast.success("Drivers deleted successfully!", {
            style: {
              backgroundColor: "#009F7F",
              color: "#fff",
            },
          });
          setIsDialogOpen(false);
          router.push("/admin/drivers");
        },
        onError: (error: any) => {
          setIsDialogOpen(false);
          toast.error(error?.response?.data?.message || "Error deleting drivers!", {
            style: {
              backgroundColor: "#FF0000",
              color: "#fff",
            },
          });
        }
      });
    } catch (error: any) {
      setIsDialogOpen(false);
      toast.error(error?.response?.data?.message || "Error deleting drivers!", {
        style: {
          backgroundColor: "#FF0000",
          color: "#fff",
        },
      });
    }
  };

  const cancelBulkDelete = () => {
    setIsDialogOpen(false);
  };

  const handleRefetch = async () => {
    setIsSpinning(true);
    try {
      await refetch(); // wait for the refetch to complete
    } finally {
      // stop spinning after short delay to allow animation to play out
      setTimeout(() => setIsSpinning(false), 500);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    )
  }
  return (
    <React.Fragment>
      <div className="space-y-6">
        <div className="rounded bg-white p-5 shadow ">
          <div className="flex flex-col">
            <div className="flex justify-between items-center mb-5">
              <h1 className="text-3xl font-bold tracking-tight">Drivers</h1>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-3">
                  {/* <DriverWalletRequest /> */}
                  <Button
                    variant="none"
                    className="text-[#009F7F] hover:bg-[#009F7F] hover:text-white"
                    onClick={() => setShowBulkWalletForm(!showBulkWalletForm)}
                  >
                    {showBulkWalletForm ? 'Hide Bulk Wallet Tool' : 'Bulk Wallet Deduction'}
                    {showBulkWalletForm ? <ArrowDown className="ml-2" /> : <ArrowUp className="ml-2" />}
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  {Object.keys(rowSelection).length > 0 && (
                    <>
                      <Button
                        variant="destructive"
                        onClick={handleBulkDelete}
                        className="flex items-center gap-2"
                      >
                        <Trash className="h-4 w-4" />
                        ({Object.keys(rowSelection).length})
                      </Button>

                      <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete {Object.keys(rowSelection).length} selected drivers?
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel onClick={cancelBulkDelete}>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={confirmBulkDelete}>Delete</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </>
                  )}
                </div>
              </div>
            </div>
            {/* Counter Cards and Bulk Wallet Controls */}
            {showBulkWalletForm && (
              <div className="rounded bg-white p-5 shadow space-y-6">
                <div>
                  <h2 className="text-xl font-semibold">Bulk Wallet Deduction / Credit</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Target drivers by status or inactivity days and send a queued wallet adjustment request.
                  </p>
                </div>

                {bulkWalletError && (
                  <p className="text-sm text-red-600">{bulkWalletError}</p>
                )}

                <form onSubmit={handleBulkWalletSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="bulk-amount">Amount</Label>
                      <Input
                        id="bulk-amount"
                        type="number"
                        min={1}
                        step="0.01"
                        placeholder="Enter amount"
                        value={bulkWalletForm.amount}
                        onChange={(event) =>
                          setBulkWalletForm((prev) => ({
                            ...prev,
                            amount: event.target.value,
                          }))
                        }
                      />
                      <p className="text-xs text-muted-foreground">
                        Minimum amount is 1. Values are applied per driver.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bulk-type">Adjustment Type</Label>
                      <Select
                        value={bulkWalletForm.adjustmentType}
                        onValueChange={(value) =>
                          setBulkWalletForm((prev) => ({
                            ...prev,
                            adjustmentType: value as "add" | "minus",
                          }))
                        }
                      >
                        <SelectTrigger id="bulk-type">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="minus">Deduct (minus)</SelectItem>
                          <SelectItem value="add">Credit (add)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bulk-status">Driver Status</Label>
                      <Select
                        value={bulkWalletForm.status}
                        onValueChange={(value) =>
                          setBulkWalletForm((prev) => ({
                            ...prev,
                            status: value as "all" | "active" | "inactive",
                          }))
                        }
                      >
                        <SelectTrigger id="bulk-status">
                          <SelectValue placeholder="All drivers" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Drivers</SelectItem>
                          <SelectItem value="active">Active Drivers</SelectItem>
                          <SelectItem value="inactive">Inactive Drivers</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">
                        Matches the backend `status` flag. Leave as &quot;All&quot; to ignore.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bulk-days">Inactive Days</Label>
                      <Input
                        id="bulk-days"
                        type="number"
                        min={0}
                        placeholder="0"
                        value={bulkWalletForm.days}
                        onChange={(event) =>
                          setBulkWalletForm((prev) => ({
                            ...prev,
                            days: event.target.value,
                          }))
                        }
                      />
                      <p className="text-xs text-muted-foreground">
                        Drivers inactive for at least this many days (last active date comparison).
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bulk-reason">Reason</Label>
                    <Textarea
                      id="bulk-reason"
                      placeholder="Explain why this adjustment is required..."
                      rows={4}
                      maxLength={500}
                      value={bulkWalletForm.reason}
                      onChange={(event) =>
                        setBulkWalletForm((prev) => ({
                          ...prev,
                          reason: event.target.value,
                        }))
                      }
                    />
                    <p className="text-xs text-muted-foreground">
                      {bulkWalletForm.reason.length}/500 characters
                    </p>
                  </div>

                  <div className="flex justify-end gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={resetBulkWalletForm}
                      disabled={isSubmittingBulkRequest}
                    >
                      Reset
                    </Button>
                    <Button
                      type="submit"
                      disabled={isSubmittingBulkRequest}
                      className="flex items-center gap-2"
                    >
                      {isSubmittingBulkRequest && (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      )}
                      Send Bulk Request
                    </Button>
                  </div>
                </form>
              </div>
            )}
            <div className="flex justify-center gap-5 mb-5">

              <Card className="relative overflow-hidden border-none bg-gradient-to-br from-emerald-50 to-teal-50 shadow-md w-[230px] h-[120px] transform transition duration-300 ease-in-out hover:scale-105">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 opacity-0 w-full" />
                <div className="h-[150PX] w-full">
                  <CounterCard
                    color="bg-emerald-100"
                    icon={Activity}
                    count={paginationInfo?.totalCount}
                    label="Total Drivers"
                    className="relative z-10 p-6"
                    cardSize="w-[180px] h-[90px]"
                  />
                </div>
                <div className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-emerald-500 to-teal-500 transform scale-x-100" />
              </Card>
              <Card className="relative overflow-hidden border-none bg-gradient-to-br from-blue-50 to-indigo-50 shadow-md w-[230px] h-[120px] transform transition duration-300 ease-in-out hover:scale-105">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 opacity-0 w-full" />
                <div className="h-[150PX] w-full">
                  <CounterCard
                    color="bg-blue-100"
                    icon={Activity}
                    count={driversCount.active.toLocaleString()}
                    label="Active Drivers"
                    cardSize="w-[180px] h-[90px]"
                  />
                </div>
                <div className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-blue-500 to-indigo-500 transform scale-x-100" />
              </Card>
              <Card className="relative overflow-hidden border-none bg-gradient-to-br from-purple-50 to-pink-50 shadow-md w-[230px] h-[120px] transform transition duration-300 ease-in-out hover:scale-105">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 opacity-100 w-full" />
                <div className="h-[150px] w-full">
                  <CounterCard
                    color="bg-purple-100"
                    icon={Activity}
                    count={driversCount.inactive.toLocaleString()}
                    label="Inactive Drivers"
                    cardSize="w-[180px] h-[90px]"
                  />
                </div>
                <div className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-purple-500 to-pink-500 transform scale-x-100" />
              </Card>
            </div>
          </div>
        </div>
        {/* Data Table */}
        <div className="rounded bg-white shadow">
          <MaterialReactTable
            columns={columns as MRT_ColumnDef<any>[]}
            data={finalDrivers}
            enableRowSelection
            onRowSelectionChange={setRowSelection}
            state={{
              rowSelection,
              sorting,
              columnVisibility,
              pagination,
              globalFilter,
            }}
            onGlobalFilterChange={setGlobalFilter}
            manualFiltering={true} // Enable server-side filtering
            onColumnVisibilityChange={(newVisibility) => {
              setIsColumnVisibilityUpdated(true);
              setLocalColumnVisibility(newVisibility);
            }}
            // onSortingChange={handleSortingChange}
            enableSorting
            enableColumnPinning={false}
            // Server-side pagination
            manualPagination={true}
            onPaginationChange={setPagination}
            rowCount={paginationInfo?.totalCount || 0}
            initialState={{
              density: 'compact',
              pagination: { pageIndex: 0, pageSize: 10 },
              columnPinning: { right: ["actions"] },
              showGlobalFilter: true, // Enable global search
            }}
            muiSearchTextFieldProps={{
              placeholder: 'Search ...',
              variant: 'outlined',
              sx: {
                minWidth: '600px',
              },
            }}
            positionGlobalFilter="left"
            renderTopToolbarCustomActions={() => (
              <div className="flex flex-1 justify-end items-center">
                {/* 🔁 Refresh Button */}
                <Button
                  variant={"ghost"}
                  onClick={handleRefetch}
                  className="text-gray-600 hover:text-primary transition p-0 m-0 hover:bg-transparent hover:shadow-none"
                  title="Refresh Data"
                >
                  <RefreshCcw className={`w-5 h-5 ${isSpinning ? 'animate-spin-smooth ' : ''}`} />
                </Button>
              </div>
            )}
          />
        </div>
      </div>
    </React.Fragment>
  );
}
