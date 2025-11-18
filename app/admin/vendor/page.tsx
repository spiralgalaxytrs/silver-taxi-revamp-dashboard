"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { columns } from "./columns";
import { Card } from 'components/ui/card'
import CounterCard from 'components/cards/CounterCard'
import { Button } from "components/ui/button";
import { Activity, Trash, Loader2, RefreshCcw } from "lucide-react";
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
  useVendors,
  useBulkDeleteVendors
} from 'hooks/react-query/useVendor';
import { toast } from "sonner";
import {
  MRT_ColumnDef,
  MaterialReactTable
} from 'material-react-table'
import { useBackNavigation } from "hooks/navigation/useBackNavigation";

export default function VendorPage() {
  const router = useRouter();

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
    data: vendorsResponse = { vendors: [], vendorsCount: { total: 0, active: 0, inactive: 0 }, pagination: { currentPage: 1, totalPages: 1, totalCount: 0, hasNext: false, hasPrev: false, limit: 10 } },
    isLoading,
    refetch
  } = useVendors({
    page,
    limit,
    search: search || undefined,
    sortBy,
    sortOrder,
  })
  
  const vendors = vendorsResponse?.vendors || [];
  const paginationInfo = vendorsResponse?.pagination;
  const vendorsCount = vendorsResponse?.vendorsCount || { total: 0, active: 0, inactive: 0 };

  const {
    mutate: bulkDeleteVendors
  } = useBulkDeleteVendors()

  const totalVendors = vendorsCount.total;
  const activeVendors = vendorsCount.active;
  const inactiveVendors = vendorsCount.inactive;

  const [lockBack, setLockBack] = useState(false);
  useBackNavigation(lockBack);
  const [sorting, setSorting] = useState<{ id: string; desc: boolean }[]>([])
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({})
  const [isSpinning, setIsSpinning] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Map vendors to include id field for MaterialReactTable
  const vendorData = useMemo(() => {
    return vendors.map(vendor => ({
      ...vendor,
      id: vendor.vendorId,
    }));
  }, [vendors]);

  // Sync sorting state with backend
  useEffect(() => {
    if (sorting.length > 0) {
      const sort = sorting[0];
      setSortBy(sort.id);
      setSortOrder(sort.desc ? 'DESC' : 'ASC');
      // Reset to first page when sorting changes
      setPagination(prev => ({ ...prev, pageIndex: 0 }));
    }
  }, [sorting]);

  const handleBulkDelete = () => {
    const selectedIndices = Object.keys(rowSelection)
    if (selectedIndices.length === 0) return
    setIsDialogOpen(true);
  };

  const confirmBulkDelete = async () => {
    const selectedIndices = Object.keys(rowSelection)
    const selectedIds = selectedIndices.map(index => {
      const vendorId = vendorData[parseInt(index)]?.vendorId
      return vendorId !== undefined ? vendorId : null
    }).filter(id => id !== null)
    bulkDeleteVendors(selectedIds, {
      onSuccess: (data: any) => {
        toast.success(data?.message || "Vendors deleted successfully!", {
          style: {
            backgroundColor: "#009F7F",
            color: "#fff",
          },
        });
        setIsDialogOpen(false);
        setTimeout(() => router.push("/admin/vendor"), 500);
      },
      onError: (error: any) => {
        setIsDialogOpen(false);
        toast.error(error?.response?.data?.message || "Error deleting Vendors!", {
          style: {
            backgroundColor: "#FF0000",
            color: "#fff",
          },
        });
      }
    });
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
    <>
      <div className="space-y-6">
        <div className="rounded bg-white p-5 shadow ">
          <div className="flex flex-col ">
            <div className="flex justify-between items-center mb-5">
              <h1 className="text-2xl font-bold tracking-tight">Vendor Page</h1>
              <div className="flex items-center gap-2">
                <Button
                  className='bg-[rgb(0,159,127)]'
                  onClick={() => router.push('/admin/vendor/create')}
                >
                  Create Vendor
                </Button>
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
                              Are you sure you want to delete {Object.keys(rowSelection).length} selected vendors?
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
            {/* Add counter cards here */}
            <div className="flex justify-center gap-5 mb-5">
              <Card className="relative overflow-hidden border-none bg-gradient-to-br from-emerald-50 to-teal-50 shadow-md w-[230px] h-[120px] transform transition duration-300 ease-in-out hover:scale-105">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 opacity-0 w-full" />
                <div className="h-[150PX] w-full">
                  <CounterCard
                    color="bg-emerald-100"
                    icon={Activity}
                    count={totalVendors}
                    label="Total Vendors"
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
                    count={activeVendors}
                    label="Active Vendors"
                    cardSize="w-[180px] h-[90px]"
                    format="currency"
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
                    count={inactiveVendors}
                    label="Inactive Vendors"
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
            data={vendorData}
            enableRowSelection
            positionGlobalFilter="left"
            onRowSelectionChange={setRowSelection}
            state={{
              rowSelection,
              sorting,
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
              showGlobalFilter: true,
              columnPinning: { right: ["actions"] },
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