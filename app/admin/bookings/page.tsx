"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { DataTable } from 'components/others/DataTable';
import { useRouter, usePathname } from 'next/navigation';
import { columns } from './columns';
import { Button } from 'components/ui/button';
import { Card } from 'components/ui/card';
import CounterCard from 'components/cards/CounterCard';
import { Input } from 'components/ui/input';
import { ArrowDown, ArrowUp, Activity, Trash, RefreshCcw, Filter } from 'lucide-react';
import { Loader2 } from 'lucide-react';
import { Label } from 'components/ui/label';
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
import DateRangeAccordion from 'components/others/DateRangeAccordion';
import {
  useBackNavigation
} from 'hooks/navigation/useBackNavigation'
import { useNavigationStore } from 'stores/navigationStore';
import {
  useFetchBookings,
  useBulkDeleteBookings
} from 'hooks/react-query/useBooking'
import {
  MaterialReactTable,
  type MRT_ColumnDef
} from 'material-react-table'
import {
  useTableColumnVisibility,
  useUpdateTableColumnVisibility
} from 'hooks/react-query/useImageUpload';
import dayjs from 'dayjs';

export default function BookingsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { previousPath } = useNavigationStore()

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
    mutate: bulkDeleteBookings
  } = useBulkDeleteBookings()

  const {
    data: tableColumnVisibility = {},
  } = useTableColumnVisibility("bookings");

  const {
    mutate: updateTableColumnVisibility
  } = useUpdateTableColumnVisibility("bookings");


  const [sorting, setSorting] = useState<{ id: string; desc: boolean }[]>([])
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({})
  const [isSpinning, setIsSpinning] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [localColumnVisibility, setLocalColumnVisibility] = useState<Record<string, boolean>>({})
  const [isColumnVisibilityUpdated, setIsColumnVisibilityUpdated] = useState(false);
  const [filters, setFilters] = useState({
    bookingConfirmed: false, // Default filter
    notStarted: false,
    started: false,
    completed: false,
    cancelled: false,
    notContacted: true,
    contacted: false,
    vendor: false
  });
  const [isFilterApplied, setIsFilterApplied] = useState(true);

  // Map filter state to actual booking status for backend
  // notContacted, contacted, and vendor are client-side only filters
  const getStatusForBackend = useMemo(() => {
    if (filters.notStarted) return 'Not-Started';
    if (filters.started) return 'Started';
    if (filters.completed) return 'Completed';
    if (filters.cancelled) return 'Cancelled';
    if (filters.bookingConfirmed) return 'Booking Confirmed';
    // notContacted, contacted, and vendor are client-side only - don't send status
    return undefined;
  }, [filters.notStarted, filters.started, filters.completed, filters.cancelled, filters.bookingConfirmed]);

  // Reset pagination when status filters change
  useEffect(() => {
    setPagination(prev => ({ ...prev, pageIndex: 0 }));
  }, [filters.notStarted, filters.started, filters.completed, filters.cancelled, filters.bookingConfirmed]);

  const {
    data: bookingsData = {
      bookings: [],
      bookingsCount: {
        bookingConfirmed: 0,
        cancelled: 0,
        completed: 0,
        contacted: 0,
        notContacted: 0,
        notStarted: 0,
        started: 0,
        vendor: 0,
      },
      pagination: { currentPage: 0, totalPages: 0, totalCount: 0, hasNext: false, hasPrev: false, limit: 0 }
    },
    isLoading,
    refetch
  } = useFetchBookings({
    enabled: true,
    page,
    limit,
    search: search || undefined,
    status: getStatusForBackend,
    sortBy,
    sortOrder,
  });

  // Extract bookings and pagination from response
  const bookings = bookingsData.bookings;
  const bookingsCount = bookingsData.bookingsCount;
  const paginationInfo = bookingsData.pagination;

  const columnVisibility = useMemo(() => {
    const serverVisibility = tableColumnVisibility.preferences || {};
    return { ...serverVisibility, ...localColumnVisibility };
  }, [tableColumnVisibility, localColumnVisibility]);

  useEffect(() => {
    const serverVisibility = tableColumnVisibility.preferences || {};
    const finalVisibility = { ...serverVisibility, ...localColumnVisibility };
    if (isColumnVisibilityUpdated) {
      updateTableColumnVisibility(finalVisibility);
      setIsColumnVisibilityUpdated(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localColumnVisibility, isColumnVisibilityUpdated]);

  // Ensure at least one status filter is always selected
  useEffect(() => {
    const hasActiveStatusFilter = filters.bookingConfirmed || filters.notStarted || filters.started || filters.completed || filters.cancelled || filters.notContacted || filters.contacted;
    if (!hasActiveStatusFilter) {
      setFilters(prev => ({
        ...prev,
        bookingConfirmed: false,
        notStarted: false,
        started: false,
        completed: false,
        cancelled: false,
        notContacted: true,
        contacted: false,
      }));
    }
  }, [filters.bookingConfirmed, filters.notStarted, filters.started, filters.completed, filters.cancelled, filters.notContacted, filters.contacted]);


  const bookingData = useMemo(() => {
    return bookings && bookings.length > 0 ? bookings.map((booking: any) => {

      if (booking.status === "Reassign") {
        booking.status = "Booking Confirmed"
      }

      return {
        ...booking,
        id: booking.bookingId,
        pickupDate: booking.pickupDate,
        dropDate: booking.dropDate ? booking.dropDate : null,
      }
    }) : []
  }, [bookings])

// console.log("bookings >> ", bookings);

  const handleFilterChange = (key: keyof typeof filters, value: boolean) => {
    setFilters(prev => {
      let newFilters = { ...prev };

      // Special handling for bookingConfirmed and contacted
      if (key === 'bookingConfirmed') {
        // When clicking bookingConfirmed, keep contacted if it was selected, remove all others
        newFilters = {
          bookingConfirmed: value,
          notStarted: false,
          started: false,
          completed: false,
          cancelled: false,
          notContacted: false,
          vendor: false,
          contacted: prev.contacted, // Keep contacted as is
        };

        // If both are false, default to bookingConfirmed
        if (!newFilters.bookingConfirmed && !newFilters.contacted) {
          newFilters.bookingConfirmed = true;
        }
      } else if (key === 'contacted') {
        // When clicking contacted, keep bookingConfirmed if it was selected, remove all others
        newFilters = {
          bookingConfirmed: prev.bookingConfirmed, // Keep bookingConfirmed as is
          notStarted: false,
          started: false,
          completed: false,
          cancelled: false,
          notContacted: false,
          vendor: false,
          contacted: value,
        };

        // If both are false, default to bookingConfirmed
        if (!newFilters.bookingConfirmed && !newFilters.contacted) {
          newFilters.bookingConfirmed = true;
        }
      } else if (key === 'vendor') {
        // When clicking contacted, keep bookingConfirmed if it was selected, remove all others
        newFilters = {
          bookingConfirmed: false, // Keep bookingConfirmed as is
          notStarted: false,
          started: false,
          completed: false,
          cancelled: false,
          notContacted: false,
          vendor: value,
          contacted: false,
        };
      } else {
        // For all other filters, reset ALL filters (including bookingConfirmed and contacted) and set only the selected one
        newFilters = {
          bookingConfirmed: false,
          notStarted: false,
          started: false,
          completed: false,
          cancelled: false,
          notContacted: false,
          contacted: false,
          vendor: false,
          [key]: value,
        };

        // If no filter is selected, default to bookingConfirmed
        if (!value) {
          newFilters.bookingConfirmed = true;
        }
      }

      // Log the filter change for debugging
      // console.log(`Filter changed: ${key} = ${value}`, newFilters);

      return newFilters;
    });

    setIsFilterApplied(true);
  };





  const handleCreateBooking = () => {
    router.push('/admin/bookings/create');
  };


  const handleBulkDelete = () => {
    const selectedIds = Object.keys(rowSelection);
    if (selectedIds.length === 0) return;
    setIsDialogOpen(true);
  };

  const confirmBulkDelete = async () => {
    const selectedIndices = Object.keys(rowSelection)
    const selectedIds = selectedIndices.map(index => {
      const bookingId = bookings[parseInt(index)]?.bookingId
      return bookingId !== undefined ? bookingId : null
    }).filter(id => id !== null)
    bulkDeleteBookings(selectedIds, {
      onSuccess: (data: any) => {
        setIsDialogOpen(false);
        toast.success(data?.message || "Bookings deleted successfully!", {
          style: {
            backgroundColor: "#009F7F",
            color: "#fff",
          },
        });
        setRowSelection({});
        setTimeout(() => router.push("/admin/bookings"), 500);
      },
      onError: (error: any) => {
        toast.error(error?.response?.data?.message || "Error deleting Bookings!", {
          style: {
            backgroundColor: "#FF0000",
            color: "#fff",
          },
        })
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


  // console.log("columnVisibility >", columnVisibility)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <React.Fragment>
      <div className="p-6 space-y-6">
        <div className="rounded bg-white p-5 shadow">
          <div className="flex flex-col">
            <div className="flex items-center justify-between border-b-1 mb-5">
              <h1 className="text-2xl font-bold tracking-tight">Booking Page</h1>
              <div className="flex items-center gap-2">

                <Button
                  variant={"primary"}
                  className='py-6'
                  onClick={handleCreateBooking}
                >
                  Create Booking
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
                        {Object.keys(rowSelection).length}
                      </Button>

                      <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete {Object.keys(rowSelection).length} selected bookings?
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
            <div className="grid ml-10 gap-5 md:grid-cols-2 lg:grid-cols-4">
              {/* Booking Confirmed (Default) */}
              {/* <button 
                onClick={() => handleFilterChange('bookingConfirmed', !filters.bookingConfirmed)}
                className={`transition-all duration-200 ${filters.bookingConfirmed ? 'scale-105' : 'hover:scale-102'}`}
              >
                <Card className="border-none bg-gradient-to-br from-emerald-50 to-teal-50 shadow-md w-[230px] h-[120px] transform transition duration-300 ease-in-out hover:scale-105">
                  {filters.bookingConfirmed && <div className='absolute top-[-6] right-0'>
                    <span className='text-[5px] text-red-500'>
                      <Filter className='w-5 h-5' />
                    </span>
                  </div>}
                  <div className="h-full w-full flex flex-col justify-between bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded">
                    <CounterCard
                      color="bg-emerald-100"
                      icon={Activity}
                      count={dynamicStats.bookingConfirmed.toLocaleString()}
                      label="Booking Confirmed"
                      className="rounded"
                      cardSize="w-[180px] h-[90px]"
                    />
                    <div className="h-1 w-full bg-gradient-to-r from-emerald-500 to-teal-500" />
                  </div>
                </Card>
              </button> */}
              {/* Not Contacted */}
              <button
                onClick={() => handleFilterChange('notContacted', true)}
                className={`transition-all duration-200 ${filters.notContacted ? 'scale-105' : 'hover:scale-102'}`}
              >
                <Card className="border-none bg-gradient-to-br from-orange-50 to-amber-50 shadow-md w-[230px] h-[120px] transform transition duration-300 ease-in-out hover:scale-105">
                  {filters.notContacted && <div className='absolute top-[-6] right-0'>
                    <span className='text-[5px] text-red-500'>
                      <Filter className='w-5 h-5' />
                    </span>
                  </div>}
                  <div className="h-full w-full flex flex-col justify-between bg-gradient-to-r from-orange-500/10 to-amber-500/10 rounded">
                    <CounterCard
                      color="bg-orange-100"
                      icon={Activity}
                      count={bookingsCount.bookingConfirmed.toLocaleString()}
                      label="Booking Confirmed"
                      subLabel="Not Contacted"
                      cardSize="w-[180px] h-[90px]"
                    />
                    <div className="h-1 w-full bg-gradient-to-r from-orange-500 to-amber-500" />
                  </div>
                </Card>
              </button>
              <button
                onClick={() => handleFilterChange('contacted', true)}
                className={`transition-all duration-200 ${filters.contacted ? 'scale-105' : 'hover:scale-102'}`}
              >
                <Card className="border-none bg-gradient-to-br from-orange-50 to-amber-50 shadow-md w-[230px] h-[130px] transform transition duration-300 ease-in-out hover:scale-105">
                  {filters.contacted && <div className='absolute top-[-6] right-0'>
                    <span className='text-[5px] text-red-500'>
                      <Filter className='w-5 h-5' />
                    </span>
                  </div>}
                  <div className="h-full w-full flex flex-col justify-between bg-gradient-to-r from-orange-500/10 to-amber-500/10 rounded">
                    <CounterCard
                      color="bg-orange-100"
                      icon={Activity}
                      count={bookingsCount.contacted.toLocaleString()}
                      label="Booking Confirmed"
                      subLabel="Contacted"
                      cardSize="w-[180px] h-[90px]"
                    />
                    <div className="h-1 w-full bg-gradient-to-r from-orange-500 to-amber-500" />
                  </div>
                </Card>
              </button>
              {/* Non Started */}
              <button
                onClick={() => handleFilterChange('notStarted', true)}
                className={`transition-all duration-200 ${filters.notStarted ? 'scale-105' : 'hover:scale-102'}`}
              >
                <Card className="border-none bg-gradient-to-br from-purple-50 to-pink-50 shadow-md w-[230px] h-[120px] transform transition duration-300 ease-in-out hover:scale-105">
                  {filters.notStarted && <div className='absolute top-[-6] right-0'>
                    <span className='text-[5px] text-red-500'>
                      <Filter className='w-5 h-5' />
                    </span>
                  </div>}
                  <div className="h-full w-full flex flex-col justify-between bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded">
                    <CounterCard
                      color="bg-purple-100"
                      icon={Activity}
                      count={bookingsCount.notStarted.toLocaleString()}
                      label="Non Started"
                      cardSize="w-[180px] h-[90px]"
                    />
                    <div className="h-1 w-full bg-gradient-to-r from-purple-500 to-pink-500" />
                  </div>
                </Card>
              </button>
              {/* Started */}
              <button
                onClick={() => handleFilterChange('started', true)}
                className={`transition-all duration-200 ${filters.started ? 'scale-105' : 'hover:scale-102'}`}
              >
                <Card className="border-none bg-gradient-to-br from-blue-50 to-indigo-50 shadow-md w-[230px] h-[120px] transform transition duration-300 ease-in-out hover:scale-105">
                  {filters.started && <div className='absolute top-[-6] right-0'>
                    <span className='text-[5px] text-red-500'>
                      <Filter className='w-5 h-5' />
                    </span>
                  </div>}
                  <div className="h-full w-full flex flex-col justify-between bg-gradient-to-r from-blue-500/10 to-indigo-500/10 rounded">
                    <CounterCard
                      color="bg-blue-100"
                      icon={Activity}
                      count={bookingsCount.started.toLocaleString()}
                      label="Started"
                      className="rounded"
                      cardSize="w-[180px] h-[90px]"
                    />
                    <div className="h-1 w-full bg-gradient-to-r from-blue-500 to-indigo-500" />
                  </div>
                </Card>
              </button>
              {/* Completed */}
              <button
                onClick={() => handleFilterChange('completed', true)}
                className={`transition-all duration-200 ${filters.completed ? 'scale-105' : 'hover:scale-102'}`}
              >
                <Card className="border-none bg-gradient-to-br from-green-50 to-emerald-50 shadow-md w-[230px] h-[120px] transform transition duration-300 ease-in-out hover:scale-105">
                  {filters.completed && <div className='absolute top-[-6] right-0'>
                    <span className='text-[5px] text-red-500'>
                      <Filter className='w-5 h-5' />
                    </span>
                  </div>}
                  <div className="h-full w-full flex flex-col justify-between bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded">
                    <CounterCard
                      color="bg-green-100"
                      icon={Activity}
                      count={bookingsCount.completed.toLocaleString()}
                      label="Completed"
                      className="rounded"
                      cardSize="w-[180px] h-[90px]"
                    />
                    <div className="h-1 w-full bg-gradient-to-r from-green-500 to-emerald-500" />
                  </div>
                </Card>
              </button>
              {/* Cancelled */}
              <button
                onClick={() => handleFilterChange('cancelled', true)}
                className={`transition-all duration-200 ${filters.cancelled ? 'scale-105' : 'hover:scale-102'}`}
              >
                <Card className="border-none bg-gradient-to-br from-red-50 to-pink-50 shadow-md w-[230px] h-[120px] transform transition duration-300 ease-in-out hover:scale-105">
                  {filters.cancelled && <div className='absolute top-[-6] right-0'>
                    <span className='text-[5px] text-red-500'>
                      <Filter className='w-5 h-5' />
                    </span>
                  </div>}
                  <div className="h-full w-full flex flex-col justify-between bg-gradient-to-r from-red-500/10 to-pink-500/10 rounded">
                    <CounterCard
                      color="bg-red-100"
                      icon={Activity}
                      count={bookingsCount.cancelled.toLocaleString()}
                      label="Cancelled"
                      cardSize="w-[180px] h-[90px]"
                    />
                    <div className="h-1 w-full bg-gradient-to-r from-red-500 to-pink-500" />
                  </div>
                </Card>
              </button>
              {/* Vendor */}
              <button
                onClick={() => handleFilterChange('vendor', true)}
                className={`transition-all duration-200 ${filters.vendor ? 'scale-105' : 'hover:scale-102'}`}
              >
                <Card className="border-none bg-gradient-to-br from-red-50 to-pink-50 shadow-md w-[230px] h-[120px] transform transition duration-300 ease-in-out hover:scale-105">
                  {filters.vendor && <div className='absolute top-[-6] right-0'>
                    <span className='text-[5px] text-red-500'>
                      <Filter className='w-5 h-5' />
                    </span>
                  </div>}
                  <div className="h-full w-full flex flex-col justify-between bg-gradient-to-r from-red-500/10 to-pink-500/10 rounded">
                    <CounterCard
                      color="bg-red-100"
                      icon={Activity}
                      count={bookingsCount.vendor.toLocaleString()}
                      label="Vendor-Bookings"
                      cardSize="w-[180px] h-[90px]"
                    />
                    <div className="h-1 w-full bg-gradient-to-r from-purple-500 to-pink-500" />
                  </div>
                </Card>
              </button>
            </div>
          </div>
        </div>
        <div className="rounded bg-white shadow">
          <MaterialReactTable
            columns={columns as MRT_ColumnDef<any>[]}
            data={bookings}
            enableRowSelection
            positionGlobalFilter="left"
            enableColumnResizing
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
              
                console.log(newPagination);
                console.log(pagination);
                console.log(paginationInfo?.hasNext);
                console.log(paginationInfo?.hasPrev);
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
    </React.Fragment>
  );
}