"use client";

import React, { useState, useEffect, useMemo } from "react";
import { columns } from "./columns";
import { Button } from "components/ui/button";
import { Card } from "components/ui/card";
import CounterCard from "components/cards/CounterCard";
import { Loader2, Activity, Trash, RefreshCcw } from "lucide-react";
import { toast } from "sonner"
import { useRouter } from "next/navigation";
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
import {
  useCustomers,
  useBulkDeleteCustomers
} from "hooks/react-query/useCustomer";
import CreateCustomerForm from "components/customer/CreateCustomerForm";
import {
  MRT_ColumnDef,
  MaterialReactTable
} from 'material-react-table'
import {
  useTableColumnVisibility,
  useUpdateTableColumnVisibility
} from 'hooks/react-query/useImageUpload';

interface Customer {
  customerId?: string;
  name: string;
  email: string;
  phone: string;
  bookingCount: number;
  finalAmount: number;
  totalAmount: number;
  createdBy: "Admin" | "Vendor";
  createdAt: string;
}

// customerId

export default function CustomersPage() {
  const router = useRouter()

  // Pagination state
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  // Search and filter state
  const [search, setSearch] = useState('');
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

  const {
    data: customersData = { customers: [], customersCount: { totalTripCompleted: 0, totalAmount: 0 }, pagination: { currentPage: 1, totalPages: 1, totalCount: 0, hasNext: false, hasPrev: false, limit: 10 } },
    isLoading,
    isError,
    refetch
  } = useCustomers({
    page,
    limit,
    search: search || undefined
  });

  const customers = customersData.customers || [];
  const paginationInfo = customersData.pagination;

  const customerData = useMemo(() => {
    return customers.map(customer => ({
      ...customer,
      id: customer.customerId,
      totalAmount: customer.totalAmount,
    }));
  }, [customers]);

  const [sorting, setSorting] = useState<{ id: string; desc: boolean }[]>([])
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({})
  const [localColumnVisibility, setLocalColumnVisibility] = useState<Record<string, boolean>>({})
  const [isColumnVisibilityUpdated, setIsColumnVisibilityUpdated] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const {
    mutate: multiDeleteCustomers
  } = useBulkDeleteCustomers();

  const {
    data: tableColumnVisibility = {},
  } = useTableColumnVisibility("customers");

  const {
    mutate: updateTableColumnVisibility
  } = useUpdateTableColumnVisibility("customers");

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


  // Calculate totals from current page data (or use server-side counts if available)
  const totalBookings = customersData.customersCount?.totalTripCompleted || 0;
  const totalAmount = customersData.customersCount?.totalAmount || 0;

  // Handle bulk deletion from the table
  const handleBulkDelete = () => {
    const selectedIndices = Object.keys(rowSelection)
    const selectedIds = selectedIndices.map(index => {
      const customerId = customerData[parseInt(index)]?.customerId
      return customerId !== undefined ? customerId : null
    }).filter(id => id !== null)
    if (selectedIds.length === 0) return;
    setIsDialogOpen(true);
  };

  const confirmBulkDelete = async () => {
    const selectedIds = Object.keys(rowSelection);
    multiDeleteCustomers(selectedIds, {
      onSuccess: () => {
        toast.success("Customers deleted successfully!", {
          style: {
            backgroundColor: "#009F7F",
            color: "#fff",
          },
        });
        setIsDialogOpen(false);
        router.push("/admin/customers");
      },
      onError: (error: any) => {
        setIsDialogOpen(false);
        toast.error(error?.response?.data?.message || "Error deleting Customers!", {
          style: {
            backgroundColor: "#FF0000",
            color: "#fff",
          },
        });
      }
    });
  }

  const cancelBulkDelete = () => {
    setIsDialogOpen(false);
  }

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
    <>
      <div className="space-y-6">
        <div className="rounded bg-white p-5 shadow">
          <div className="flex flex-col">
            <div className="flex justify-between items-center mb-5">
              <h1 className="text-3xl font-bold tracking-tight">Customers</h1>
              <div className="flex items-center gap-2">
                <CreateCustomerForm onSuccess={refetch} />
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
                              Are you sure you want to delete {Object.keys(rowSelection).length} selected customers?
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
            {/* Counter Cards */}
            <div className="flex justify-center gap-20 mt-4">
              {/* <Card className="w-[250px]">
              <CounterCard
                color="bg-[#D0DDD0]"
                icon={Activity}
                count={totalCustomers}
                label="Total Customers"
                cardSize="w-[180px] h-[90px]"
              />
            </Card> */}
              <Card className="relative overflow-hidden border-none bg-gradient-to-br from-emerald-50 to-teal-50 shadow-md w-[230px] h-[120px] transform transition duration-300 ease-in-out hover:scale-105">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 opacity-0 w-full" />
                <div className="h-[150PX] w-full">
                  <CounterCard
                    color="bg-emerald-100"
                    icon={Activity}
                    count={totalBookings.toLocaleString()}
                    label="Total Trip Completed"
                    cardSize="w-[200px] h-[90px]"
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
                    count={totalAmount.toLocaleString()}
                    label="Total Amount"
                    cardSize="w-[200px] h-[90px]"
                  />
                </div>
                <div className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-blue-500 to-indigo-500 transform scale-x-100" />
              </Card>
            </div>
          </div>
        </div>
        {/* Data Table */}
        <div className="rounded bg-white shadow">
          <MaterialReactTable
            columns={columns as MRT_ColumnDef<any>[]}
            data={customerData}
            enableRowSelection
            positionGlobalFilter="left"
            onRowSelectionChange={setRowSelection}
            onColumnVisibilityChange={(newVisibility) => {
              setIsColumnVisibilityUpdated(true);
              setLocalColumnVisibility(newVisibility);
            }}
            state={{
              rowSelection,
              sorting,
              columnVisibility,
              pagination,
              globalFilter,
            }}
            onGlobalFilterChange={setGlobalFilter}
            manualFiltering={true} // Enable server-side filtering
            onSortingChange={setSorting}
            enableSorting
            enableColumnPinning={false}
            // Server-side pagination
            manualPagination={true}
            onPaginationChange={(updater) => {
              const newPagination = typeof updater === 'function' 
                ? updater(pagination) 
                : updater;
              
              // Prevent going to next page if hasNext is false
              if (newPagination.pageIndex > pagination.pageIndex && !paginationInfo?.hasNext) {
                return; // Don't update pagination
              }
              
              // Prevent going to previous page if hasPrev is false
              if (newPagination.pageIndex < pagination.pageIndex && !paginationInfo?.hasPrev) {
                return; // Don't update pagination
              }
              
              setPagination(newPagination);
            }}
            rowCount={paginationInfo?.totalCount || 0}
            initialState={{
              density: 'compact',
              pagination: { pageIndex: 0, pageSize: 10 },
              columnPinning: { right: ["actions"] },
              showGlobalFilter: true,
            }}
            muiSearchTextFieldProps={{
              placeholder: 'Search ...',
              variant: 'outlined',
              sx: {
                minWidth: '600px',
              },
            }}
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
    </>
  );
}