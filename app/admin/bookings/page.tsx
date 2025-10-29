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

  // const { bookings, fetchBookings, isLoading, error, bulkDeleteBookings } = useBookingStore();

  const {
    data: bookings = [],
    isLoading,
    refetch
  } = useFetchBookings();

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
    return bookings.map((booking: any) => ({
      ...booking,
      id: booking.bookingId,
      pickupDate: booking.pickupDate,
      dropDate: booking.dropDate ? booking.dropDate : null,
    }))
  }, [bookings])


  const applyFilters = () => {
    let filteredData = [...bookingData];

    // Debug: Log current filter state
    // console.log('Current filters:', filters);

    // Special case: Both bookingConfirmed and contacted are selected
    if (filters.bookingConfirmed && filters.contacted) {
      console.log('Applying both bookingConfirmed and contacted filters');
      filteredData = filteredData.filter(booking =>
        booking.status === "Booking Confirmed" && booking.isContacted === true && booking.createdBy !== "Vendor"
      );
    }
    // Apply individual status filters
    else if (filters.bookingConfirmed) {
      console.log('Applying bookingConfirmed filter');
      filteredData = filteredData.filter(booking => booking.status === "Booking Confirmed" || booking.status === "Reassign");
    } else if (filters.contacted) {
      console.log('Applying contacted filter');
      // Contacted filter: show ONLY contacted bookings (exclude vendor bookings)
      filteredData = filteredData.filter(booking =>
        booking.isContacted === true && booking.createdBy !== "Vendor" && booking.status === "Booking Confirmed"
      );
    } else if (filters.notStarted) {
      console.log('Applying notStarted filter');
      filteredData = filteredData.filter(booking => booking.status === "Not-Started");
    } else if (filters.started) {
      console.log('Applying started filter');
      filteredData = filteredData.filter(booking => booking.status === "Started");
    } else if (filters.completed) {
      console.log('Applying completed filter');
      filteredData = filteredData.filter(booking => booking.status === "Completed" || booking.status === "Manual Completed");
    } else if (filters.cancelled) {
      console.log('Applying cancelled filter');
      filteredData = filteredData.filter(booking => booking.status === "Cancelled");
    } else if (filters.vendor) {
      console.log('Applying vendor filter');
      filteredData = filteredData.filter(booking =>
        booking.createdBy === "Vendor" && booking.status === "Booking Confirmed" && booking.type === "App"
      );
      console.log(filteredData.length)
    } else if (filters.notContacted) {
      console.log('Applying notContacted filter');
      // Not Contacted filter: show ONLY not contacted bookings (exclude vendor bookings)
      filteredData = filteredData.filter(booking =>
        booking.isContacted === false && booking.createdBy !== "Vendor" && booking.status === "Booking Confirmed"
      );
    }
    return filteredData;
  };

  const filteredData = applyFilters();


  const stats = useMemo(() => {
    interface StatsType {
      bookingConfirmed: number;
      notStarted: number;
      started: number;
      completed: number;
      cancelled: number;
      notContacted: number;
      contacted: number;
      vendor: number;

    }

    return bookingData.reduce(
      (acc: StatsType, booking: any) => {
        // Count by status
        switch (booking.status) {
          case "Not-Started":
            acc.notStarted += 1;
            break;
          case "Started":
            acc.started += 1;
            break;
          case "Completed":
            acc.completed += 1;
            break;
          case "Manual Completed":
            acc.completed += 1; // Include Manual Completed in completed count
            break;
          case "Cancelled":
            acc.cancelled += 1;
            break;
          case "Booking Confirmed":
            acc.bookingConfirmed += 1;
            break;
          case "Reassign":
            acc.bookingConfirmed += 1;
            break;
          case "Contacted":
            acc.bookingConfirmed += 1;
            break;
        }

        // Count contacted status (exclude vendor bookings)
        if (booking.createdBy !== "Vendor") {
          if (booking.isContacted === false) {
            if (booking.createdBy !== "Vendor" && booking.status === "Booking Confirmed" && booking.isContacted === false) acc.notContacted += 1;
          } else if (booking.isContacted === true) {
            if (booking.createdBy !== "Vendor" && booking.status === "Booking Confirmed" && booking.isContacted) acc.contacted += 1;
          }
        } else {
          acc.vendor += 1
        }

        return acc;
      },
      {
        bookingConfirmed: 0,
        notStarted: 0,
        started: 0,
        completed: 0,
        cancelled: 0,
        notContacted: 0,
        contacted: 0,
        vendor: 0
      }
    );
  }, [bookingData]);

  // Calculate dynamic stats based on current filter state
  const dynamicStats = useMemo(() => {
    const baseStats = { ...stats };

    // If both bookingConfirmed and contacted are selected, adjust contacted count
    if (filters.bookingConfirmed && filters.contacted) {
      baseStats.contacted = bookingData.filter((booking: any) =>
        booking.status === "Booking Confirmed" && booking.isContacted === true && booking.createdBy !== "Vendor"
      ).length;
    }

    return baseStats;
  }, [stats, filters.bookingConfirmed, filters.contacted, bookingData]);



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

  // const getFormattedBookingDateRange = () => {
  //   const start = filters.bookingStartDate ? new Date(filters.bookingStartDate).toLocaleDateString() : '';
  //   const end = filters.bookingEndDate ? new Date(filters.bookingEndDate).toLocaleDateString() : '';
  //   return start && end ? `${start} - ${end}` : 'Pick a range';
  // };

  // const getFormattedDateRange = () => {
  //   const start = filters.pickupStartDate ? new Date(filters.pickupStartDate).toLocaleDateString() : '';
  //   const end = filters.pickupEndDate ? new Date(filters.pickupEndDate).toLocaleDateString() : '';
  //   return start && end ? `${start} - ${end}` : 'Pick a range';
  // };

  // const getFormattedDropDateRange = () => {
  //   const start = filters.dropStartDate ? new Date(filters.dropStartDate).toLocaleDateString() : '';
  //   const end = filters.dropEndDate ? new Date(filters.dropEndDate).toLocaleDateString() : '';
  //   return start && end ? `${start} - ${end}` : 'Pick a range';
  // };

  const handleBulkDelete = () => {
    const selectedIds = Object.keys(rowSelection);
    if (selectedIds.length === 0) return;
    setIsDialogOpen(true);
  };

  const confirmBulkDelete = async () => {
    const selectedIndices = Object.keys(rowSelection)
    const selectedIds = selectedIndices.map(index => {
      const bookingId = filteredData[parseInt(index)]?.bookingId
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
                      count={dynamicStats.notContacted.toLocaleString()}
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
                      count={dynamicStats.contacted.toLocaleString()}
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
                      count={dynamicStats.notStarted.toLocaleString()}
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
                      count={dynamicStats.started.toLocaleString()}
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
                      count={dynamicStats.completed.toLocaleString()}
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
                      count={dynamicStats.cancelled.toLocaleString()}
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
                      count={dynamicStats.vendor.toLocaleString()}
                      label="Vendor-Bookings"
                      cardSize="w-[180px] h-[90px]"
                    />
                    <div className="h-1 w-full bg-gradient-to-r from-purple-500 to-pink-500" />
                  </div>
                </Card>
              </button>
            </div>
          </div>
          {/* {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 border-t-2 mt-4 p-3 pt-8">
              <div>
                <label htmlFor="search" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Search
                </label>
                <Input
                  id="search"
                  placeholder="Search in bookings"
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="status" className='text-body-dark font-semibold text-sm leading-none mb-3'>Status</Label>
                <div className='mt-1'>
                  <Select onValueChange={(value) => handleFilterChange('status', value)}>
                    <SelectTrigger id="status">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="Not-Started">Not Started</SelectItem>
                      <SelectItem value="Started">Started</SelectItem>
                      <SelectItem value="Completed">Completed</SelectItem>
                      <SelectItem value="Cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="serviceType">Select ServiceType</Label>
                <Select onValueChange={(value) => handleFilterChange('serviceType', value)}>
                  <SelectTrigger id="serviceType">
                    <SelectValue placeholder="Select servicType" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Services</SelectItem>
                    <SelectItem value="One Way">One way</SelectItem>
                    <SelectItem value="Round Trip">Round Trip</SelectItem>
                    <SelectItem value="Airport">Airport</SelectItem>
                    <SelectItem value="Package">Package</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Bookings At</Label>
                <DateRangeAccordion
                  label={getFormattedBookingDateRange()}
                  startDate={filters.bookingStartDate}
                  endDate={filters.bookingEndDate}
                  onStartDateChange={(date: any) => handleFilterChange('bookingStartDate', date)}
                  onEndDateChange={(date: any) => handleFilterChange('bookingEndDate', date)}
                />
              </div>

              <div>
                <Label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Pickup Date</Label>
                <DateRangeAccordion
                  label={getFormattedDateRange()}
                  startDate={filters.pickupStartDate}
                  endDate={filters.pickupEndDate}
                  onStartDateChange={(date: any) => handleFilterChange('pickupStartDate', date)}
                  onEndDateChange={(date: any) => handleFilterChange('pickupEndDate', date)}
                />
              </div>
              <div>
                <Label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Drop Date</Label>
                <DateRangeAccordion
                  label={getFormattedDropDateRange()}
                  startDate={filters.dropStartDate}
                  endDate={filters.dropEndDate}
                  onStartDateChange={(date: any) => handleFilterChange('dropStartDate', date)}
                  onEndDateChange={(date: any) => handleFilterChange('dropEndDate', date)}
                />
              </div>

              <div className='flex justify-start items-center'>
                <Button
                  className='mt-5 p-1 border-none bg-[#009F87] flex justify-center items-center w-28'
                  // variant="outline"
                  onClick={handleClear}
                  disabled={isLoading}
                >
                  Clear
                </Button>
              </div>
            </div>
          )} */}
        </div>
        <div className="rounded bg-white shadow">
          <MaterialReactTable
            columns={columns as MRT_ColumnDef<any>[]}
            data={filteredData}
            enableRowSelection
            positionGlobalFilter="left"
            onRowSelectionChange={setRowSelection}
            onColumnVisibilityChange={(newVisibility) => {
              setIsColumnVisibilityUpdated(true);
              setLocalColumnVisibility(newVisibility);
            }}
            state={{ rowSelection, sorting, columnVisibility }}
            onSortingChange={setSorting}
            enableSorting
            enableColumnPinning={false}
            initialState={{
              density: 'compact',
              pagination: { pageIndex: 0, pageSize: 10 },
              columnPinning: { right: ["actions"] },
              showGlobalFilter: true,
            }}
            muiSearchTextFieldProps={{
              placeholder: 'Search ...',
              variant: 'outlined',
              fullWidth: true, // 🔥 Makes the search bar take full width
              sx: {
                minWidth: '600px', // Adjust width as needed
                marginLeft: '16px',
              },
            }}
            muiToolbarAlertBannerProps={{
              sx: {
                justifyContent: 'flex-start', // Aligns search left
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