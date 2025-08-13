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
    todayBookings: false,
    todayPickups: false,
    notStarted: false,
    started: false,
    completed: false,
    cancelled: false,
    contact: false,
    notContact: false,
  });
  const [isFilterApplied, setIsFilterApplied] = useState(false);

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


    if (filters.todayBookings) {
      filteredData = filteredData.filter(booking => dayjs(booking.createdAt).isSame(dayjs(), 'day'));
    }
    if (filters.todayPickups) {
      filteredData = filteredData.filter(booking => booking.pickupDate && dayjs(booking.pickupDate).isSame(dayjs(), 'day'));
    }
    if (filters.notStarted) {
      filteredData = filteredData.filter(booking => booking.status === "Not-Started");
    }
    if (filters.started) {
      filteredData = filteredData.filter(booking => booking.status === "Started");
    }
    if (filters.completed) {
      filteredData = filteredData.filter(booking => booking.status === "Completed");
    }
    if (filters.cancelled) {
      filteredData = filteredData.filter(booking => booking.status === "Cancelled");
    }
    if (filters.contact) {
      filteredData = filteredData.filter(booking => booking.isContacted === true);
    }
    if (filters.notContact) {
      filteredData = filteredData.filter(booking => booking.isContacted === false);
    }

    return filteredData;
  };

  const filteredData = applyFilters();


  const stats = useMemo(() => {
    return filteredData.reduce(
      (acc, booking) => {
        // Check if booking.createdAt is today
        if (dayjs(booking.createdAt).isSame(dayjs(), 'day')) {
          acc.todayBookings += 1;
        }

        // Check if booking.pickupDate is today (make sure pickupDate exists)
        if (booking.pickupDate && dayjs(booking.pickupDate).isSame(dayjs(), 'day')) {
          acc.todayPickups += 1;
        }

        if (booking.contacted) {
          acc.contact += 1;
        } else {
          acc.notContact += 1;
        }

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
          case "Cancelled":
            acc.cancelled += 1;
            break;
        }

        return acc;
      },
      {
        todayBookings: 0,
        todayPickups: 0,
        notStarted: 0,
        started: 0,
        completed: 0,
        cancelled: 0,
        contact: 0,
        notContact: 0,
      }
    );
  }, [filteredData]);




  const handleFilterChange = (key: keyof typeof filters, value: boolean) => {
    setFilters(prev => {
      const bookingStatusKeys: Array<keyof typeof filters> = [
        "notStarted",
        "started",
        "completed",
        "cancelled",
      ];
      const contactStatusKeys: Array<keyof typeof filters> = [
        "contact",
        "notContact",
      ];

      // Handle booking status filters (mutually exclusive)
      if (bookingStatusKeys.includes(key)) {
        const next = {
          ...prev,
          notStarted: false,
          started: false,
          completed: false,
          cancelled: false,
        };
        if (value) next[key] = true;
        return next;
      }

      // Handle contact status filters (mutually exclusive)
      if (contactStatusKeys.includes(key)) {
        const next = {
          ...prev,
          contact: false,
          notContact: false,
        };
        if (value) next[key] = true;
        return next;
      }

      // Default: toggle any other filter normally
      return { ...prev, [key]: value };
    });

    setIsFilterApplied(true);
  };


  const handleClear = async () => {
    try {
      setFilters({
        todayBookings: false,
        todayPickups: false,
        notStarted: false,
        started: false,
        completed: false,
        cancelled: false,
        contact: false,
        notContact: false,
      });
      setIsFilterApplied(false);
    } catch (error) {
      console.error('Error refreshing data:', error);
    }
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

                {isFilterApplied && <Button
                  variant={"primary"}
                  className='py-6'
                  onClick={handleClear}
                >
                  Clear Filters
                </Button>}

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
            <div className="grid ml-10 gap-5 md:grid-cols-3 lg:grid-cols-4">
              <button onClick={() => handleFilterChange('todayBookings', !filters.todayBookings)}>
                <Card className="border-none bg-gradient-to-br from-emerald-50 to-teal-50 shadow-md w-[230px] h-[120px] transform transition duration-300 ease-in-out hover:scale-105 ">
                  {filters.todayBookings && <div className='absolute top-[-6] right-0 '>
                    <span className='text-[5px] text-red-500'>
                      <Filter className='w-5 h-5' />
                    </span>
                  </div>}
                  <div className="h-full w-full flex flex-col justify-between bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded ">
                    <CounterCard
                      color="bg-emerald-100"
                      icon={Activity}
                      count={stats.todayBookings.toLocaleString()}
                      label="Today's Bookings"
                      className="rounded"
                      cardSize="w-[180px] h-[90px]"
                    />
                    <div className="h-1 w-full bg-gradient-to-r from-emerald-500 to-teal-500" />
                  </div>
                </Card>
              </button>
              {/* Today's Pickups */}
              <button onClick={() => handleFilterChange('todayPickups', !filters.todayPickups)}>
                <Card className="border-none bg-gradient-to-br from-blue-50 to-indigo-50 shadow-md w-[230px] h-[120px] transform transition duration-300 ease-in-out hover:scale-105">
                  {filters.todayPickups && <div className='absolute top-[-6] right-0 '>
                    <span className='text-[5px] text-red-500'>
                      <Filter className='w-5 h-5' />
                    </span>
                  </div>}
                  <div className="h-full w-full flex flex-col justify-between bg-gradient-to-r from-blue-500/10 to-indigo-500/10 rounded">
                    <CounterCard
                      color="bg-blue-100"
                      icon={Activity}
                      count={stats.todayPickups.toLocaleString()}
                      label="Today's Pickups"
                      className="rounded"
                      cardSize="w-[180px] h-[90px]"
                    />
                    <div className="h-1 w-full bg-gradient-to-r from-blue-500 to-indigo-500" />
                  </div>
                </Card>
              </button>
              {/* Non Started Bookings */}
              <button onClick={() => handleFilterChange('notStarted', !filters.notStarted)}>
                <Card className="border-none bg-gradient-to-br from-purple-50 to-pink-50 shadow-md w-[230px] h-[120px] transform transition duration-300 ease-in-out hover:scale-105">
                  {filters.notStarted && <div className='absolute top-[-6] right-0 '>
                    <span className='text-[5px] text-red-500'>
                      <Filter className='w-5 h-5' />
                    </span>
                  </div>}
                  <div className="h-full w-full flex flex-col justify-between bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded">
                    <CounterCard
                      color="bg-purple-100"
                      icon={Activity}
                      count={stats.notStarted.toLocaleString()}
                      label="Non Started Bookings"
                    />
                    <div className="h-1 w-full bg-gradient-to-r from-purple-500 to-pink-500" />
                  </div>
                </Card>
              </button>
              {/* Started Bookings */}
              <button onClick={() => handleFilterChange('started', !filters.started)}>
                <Card className="border-none bg-gradient-to-br from-emerald-50 to-teal-50 shadow-md w-[230px] h-[120px] transform transition duration-300 ease-in-out hover:scale-105">
                  {filters.started && <div className='absolute top-[-6] right-0 '>
                    <span className='text-[5px] text-red-500'>
                      <Filter className='w-5 h-5' />
                    </span>
                  </div>}
                  <div className="h-full w-full flex flex-col justify-between bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded">
                    <CounterCard
                      color="bg-emerald-100"
                      icon={Activity}
                      count={stats.started.toLocaleString()}
                      label="Started Bookings"
                      className="rounded"
                    />
                    <div className="h-1 w-full bg-gradient-to-r from-emerald-500 to-teal-500" />
                  </div>
                </Card>
              </button>
              {/* Completed Bookings */}
              <button onClick={() => handleFilterChange('completed', !filters.completed)}>
                <Card className="border-none bg-gradient-to-br from-blue-50 to-indigo-50 shadow-md w-[230px] h-[120px] transform transition duration-300 ease-in-out hover:scale-105">
                  {filters.completed && <div className='absolute top-[-6] right-0 '>
                    <span className='text-[5px] text-red-500'>
                      <Filter className='w-5 h-5' />
                    </span>
                  </div>}
                  <div className="h-full w-full flex flex-col justify-between bg-gradient-to-r from-blue-500/10 to-indigo-500/10 rounded">
                    <CounterCard
                      color="bg-blue-100"
                      icon={Activity}
                      count={stats.completed.toLocaleString()}
                      label="Completed Bookings"
                    />
                    <div className="h-1 w-full bg-gradient-to-r from-blue-500 to-indigo-500" />
                  </div>
                </Card>
              </button>
              {/* Cancelled Bookings */}
              <button onClick={() => handleFilterChange('cancelled', !filters.cancelled)}>
                <Card className="border-none bg-gradient-to-br from-purple-50 to-pink-50 shadow-md w-[230px] h-[120px] transform transition duration-300 ease-in-out hover:scale-105">
                  {filters.cancelled && <div className='absolute top-[-6] right-0 '>
                    <span className='text-[5px] text-red-500'>
                      <Filter className='w-5 h-5' />
                    </span>
                  </div>}
                  <div className="h-full w-full flex flex-col justify-between bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded">
                    <CounterCard
                      color="bg-purple-100"
                      icon={Activity}
                      count={stats.cancelled.toLocaleString()}
                      label="Cancelled Bookings"
                    />
                    <div className="h-1 w-full bg-gradient-to-r from-purple-500 to-pink-500" />
                  </div>
                </Card>
              </button>
              {/* Contacted Bookings */}
              <button onClick={() => handleFilterChange('contact', !filters.contact)}>
                <Card className="border-none bg-gradient-to-br from-blue-50 to-indigo-50 shadow-md w-[230px] h-[120px] transform transition duration-300 ease-in-out hover:scale-105">
                  {filters.contact && <div className='absolute top-[-6] right-0 '>
                    <span className='text-[5px] text-red-500'>
                      <Filter className='w-5 h-5' />
                    </span>
                  </div>}
                  <div className="h-full w-full flex flex-col justify-between bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded">
                    <CounterCard
                      color="bg-blue-100"
                      icon={Activity}
                      count={stats.contact.toLocaleString()}
                      label="Contacted Bookings"
                    />
                    <div className="h-1 w-full bg-gradient-to-r from-blue-500 to-indigo-500" />
                  </div>
                </Card>
              </button>
              {/* Not Contacted Bookings */}
              <button onClick={() => handleFilterChange('notContact', !filters.notContact)}>
                <Card className="border-none bg-gradient-to-br from-purple-50 to-pink-50 shadow-md w-[230px] h-[120px] transform transition duration-300 ease-in-out hover:scale-105">
                  {filters.notContact && <div className='absolute top-[-6] right-0 '>
                    <span className='text-[5px] text-red-500'>
                      <Filter className='w-5 h-5' />
                    </span>
                  </div>}
                  <div className="h-full w-full flex flex-col justify-between bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded">
                    <CounterCard
                      color="bg-purple-100"
                      icon={Activity}
                      count={stats.notContact.toLocaleString()}
                      label="Not Contacted Bookings"
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