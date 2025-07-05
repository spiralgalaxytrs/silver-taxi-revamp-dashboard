"use client";

import { useState, useEffect } from 'react';
import { DataTable } from 'components/others/DataTable';
import { useRouter, usePathname } from 'next/navigation';
import { columns } from './columns';
import { Button } from 'components/ui/button';
import { Card } from 'components/ui/card';
import CounterCard from 'components/cards/CounterCard';
import { Input } from 'components/ui/input';
import { Booking, useBookingStore } from 'stores/bookingStore';
import { ArrowDown, ArrowUp, Activity, Trash } from 'lucide-react';
import { Loader2 } from 'lucide-react';
import { Label } from 'components/ui/label';
import { toast } from "sonner"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from 'components/ui/select';
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

export default function BookingsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { previousPath } = useNavigationStore()
  const { bookings, fetchBookings, isLoading, error, bulkDeleteBookings } = useBookingStore();
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});
  const [totalBookings, setTotalBookings] = useState(0);
  const [totalBookingValue, setTotalBookingValue] = useState(0);
  const [yearlyBookings, setYearlyBookings] = useState(0);
  const [completedBookings, setCompletedBookings] = useState(0);
  const [manualBookings, setManualBookings] = useState(0);
  const [vendorBookings, setVendorBookings] = useState(0);
  const [todayBookings, setTodayBookings] = useState(0);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    vehicleType: '',
    pickupStartDate: '',
    pickupEndDate: '',
    dropStartDate: '',
    dropEndDate: '',
    bookingStartDate: '',
    bookingEndDate: '',
    distance: '',
    amount: '',
    serviceType: ''
  });
  const [showFilters, setShowFilters] = useState(false);

  const [sortConfig, setSortConfig] = useState<{
    columnId: string | null;
    direction: 'asc' | 'desc' | null;
  }>({ columnId: null, direction: null });

  const [bookingData, setBookingData] = useState(
    bookings.map(booking => ({
      ...booking,
      id: booking.bookingId,
      pickupDate: booking.pickupDate,
      dropDate: booking.dropDate ? new Date(booking.dropDate).toLocaleDateString() : null,
    }))
  );

  useEffect(() => {
    console.log("pathname >> ", pathname);
    console.log("previousPath >> ", previousPath);
  }, [pathname, previousPath]);

  useEffect(() => {
    setBookingData(
      bookings.map(booking => ({
        ...booking,
        id: booking.bookingId,
        pickupDate: booking.pickupDate,
        dropDate: booking.dropDate ? new Date(booking.dropDate).toLocaleDateString() : null,
      }))
    );
  }, [bookings])

  const unFilteredData = [...bookingData].sort((a, b) => {
    const abookingDate = new Date(a.bookingDate || "").getTime();
    const bbookingDate = new Date(b.bookingDate || "").getTime();
    return bbookingDate - abookingDate; // Descending order
  });

  const applyFilters = () => {

    let filteredData = [...unFilteredData];

    if (filters.search) {
      filteredData = filteredData.filter(booking =>
        booking.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        booking.bookingId?.toLowerCase().includes(filters.search.toLowerCase()) ||
        booking.phone.toLowerCase().includes(filters.search.toLowerCase()) ||
        booking.pickup.toLowerCase().includes(filters.search.toLowerCase()) ||
        booking.drop.toLowerCase().includes(filters.search.toLowerCase()) ||
        booking.serviceType.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    if (filters.status && filters.status !== "all") {
      filteredData = filteredData.filter(booking => booking.status === filters.status);
    }

    if (filters.serviceType && filters.serviceType !== "all") {
      filteredData = filteredData.filter(booking =>
        booking.serviceType?.toLowerCase() === filters.serviceType.toLowerCase()
      );
    }

    if (filters.vehicleType) {
      filteredData = filteredData.filter(booking => booking.vehicleType === filters.vehicleType);
    }

    if (filters.bookingStartDate || filters.bookingEndDate) {
      filteredData = filteredData.filter(booking => {
        const bookingDate = new Date(booking.bookingDate).setHours(0, 0, 0, 0);
        const startDate = filters.bookingStartDate ? new Date(filters.bookingStartDate).setHours(0, 0, 0, 0) : null;
        const endDate = filters.bookingEndDate ? new Date(filters.bookingEndDate).setHours(0, 0, 0, 0) : null;

        return (!startDate || bookingDate >= startDate) && (!endDate || bookingDate <= endDate);
      });
    }

    if (filters.pickupStartDate || filters.pickupEndDate) {
      filteredData = filteredData.filter(booking => {
        const pickupDate = new Date(booking.pickupDate).setHours(0, 0, 0, 0);
        const startDate = filters.pickupStartDate ? new Date(filters.pickupStartDate).setHours(0, 0, 0, 0) : null;
        const endDate = filters.pickupEndDate ? new Date(filters.pickupEndDate).setHours(0, 0, 0, 0) : null;

        return (!startDate || pickupDate >= startDate) && (!endDate || pickupDate <= endDate);
      });
    }

    if (filters.dropStartDate || filters.dropEndDate) {
      filteredData = filteredData.filter(booking => {
        const dropDate = booking.dropDate ? new Date(booking.dropDate).setHours(0, 0, 0, 0) : null;
        const startDate = filters.dropStartDate ? new Date(filters.dropStartDate).setHours(0, 0, 0, 0) : null;
        const endDate = filters.dropEndDate ? new Date(filters.dropEndDate).setHours(0, 0, 0, 0) : null;

        return (!startDate || (dropDate && dropDate >= startDate)) && (!endDate || (dropDate && dropDate <= endDate));
      });
    }

    if (filters.distance) {
      const distanceFilter = Number(filters.distance);
      filteredData = filteredData.filter(booking =>
        booking.distance === distanceFilter
      );
    }

    if (filters.amount) {
      const amountFilter = Number(filters.amount);
      filteredData = filteredData.filter(booking =>
        booking.amount === amountFilter
      );
    }

    // Global sorting logic
    if (sortConfig.columnId && sortConfig.direction) {
      filteredData.sort((a, b) => {
        const columnKey = sortConfig.columnId as keyof typeof a;
        const aValue = a[columnKey];
        const bValue = b[columnKey];

        // Handle null/undefined cases
        if (aValue == null) return sortConfig.direction === 'asc' ? 1 : -1;
        if (bValue == null) return sortConfig.direction === 'asc' ? -1 : 1;

        // Date comparison for date fields
        if (['startDate', 'endDate', 'createdAt'].includes(columnKey)) {
          const dateA = new Date(aValue as string).getTime();
          const dateB = new Date(bValue as string).getTime();
          return sortConfig.direction === 'asc' ? dateA - dateB : dateB - dateA;
        }

        // Numeric comparison for numeric fields
        if (typeof aValue === 'number' && typeof bValue === 'number') {
          return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
        }

        // Boolean comparison for status
        if (typeof aValue === 'boolean' && typeof bValue === 'boolean') {
          return sortConfig.direction === 'asc'
            ? (aValue === bValue ? 0 : aValue ? -1 : 1)
            : (aValue === bValue ? 0 : aValue ? 1 : -1);
        }

        // String comparison for other fields
        const strA = String(aValue).toLowerCase();
        const strB = String(bValue).toLowerCase();
        return sortConfig.direction === 'asc'
          ? strA.localeCompare(strB)
          : strB.localeCompare(strA);
      });
    }

    return filteredData;
  };

  const filteredData: Booking[] = applyFilters();


  useEffect(() => {
    const calculateBookingStats = () => {

      const currentYear = new Date().getFullYear();

      return filteredData.reduce((acc, booking) => {
        // Total bookings count
        acc.total++;

        // Total booking value
        acc.totalValue += Number(booking.finalAmount) || 0;

        // This year's bookings
        const bookingYear = new Date(booking.bookingDate).getFullYear();
        if (bookingYear === currentYear) {
          acc.yearly++;
        }

        // Completed bookings
        if (booking.status === 'Completed') {
          acc.completed++;
        }

        // Manual bookings
        if (booking.type === 'Manual') {
          acc.manual++;
        }

        // Vendor bookings
        if (booking.createdBy === 'Vendor') {
          acc.vendor++;
        }

        return acc;
      }, { total: 0, totalValue: 0, yearly: 0, completed: 0, manual: 0, vendor: 0 });
    };

    const stats = calculateBookingStats();
    setTotalBookings(stats.total);
    setTotalBookingValue(stats.totalValue);
    setYearlyBookings(stats.yearly);
    setCompletedBookings(stats.completed);
    setManualBookings(stats.manual);
    setVendorBookings(stats.vendor);
  }, [filteredData]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleClear = async () => {
    try {
      setFilters({
        search: '',
        status: '',
        vehicleType: '',
        pickupStartDate: '',
        pickupEndDate: '',
        dropStartDate: '',
        dropEndDate: '',
        bookingStartDate: '',
        bookingEndDate: '',
        distance: '',
        amount: '',
        serviceType: ''
      });
      setSortConfig({ columnId: null, direction: null }); // Reset sorting
    } catch (error) {
      console.error('Error refreshing data:', error);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const handleSort = (columnId: string) => {
    setSortConfig(prev => ({
      columnId,
      direction: prev.columnId === columnId && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  useEffect(() => {
    fetchBookings();

    const intervalId = setInterval(() => {
      applyFilters();
    }, 180000);

    return () => clearInterval(intervalId);
  }, [fetchBookings]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    )
  }

  // if (error) {
  //   return <div>Error: {error}</div>;
  // }

  const handleCreateBooking = () => {
    router.push('/admin/bookings/create');
  };

  // const handleRefresh = async () => {
  //   await handleClear();
  //   await fetchBookings();
  // };

  const getFormattedBookingDateRange = () => {
    const start = filters.bookingStartDate ? new Date(filters.bookingStartDate).toLocaleDateString() : '';
    const end = filters.bookingEndDate ? new Date(filters.bookingEndDate).toLocaleDateString() : '';
    return start && end ? `${start} - ${end}` : 'Pick a range';
  };

  const getFormattedDateRange = () => {
    const start = filters.pickupStartDate ? new Date(filters.pickupStartDate).toLocaleDateString() : '';
    const end = filters.pickupEndDate ? new Date(filters.pickupEndDate).toLocaleDateString() : '';
    return start && end ? `${start} - ${end}` : 'Pick a range';
  };

  const getFormattedDropDateRange = () => {
    const start = filters.dropStartDate ? new Date(filters.dropStartDate).toLocaleDateString() : '';
    const end = filters.dropEndDate ? new Date(filters.dropEndDate).toLocaleDateString() : '';
    return start && end ? `${start} - ${end}` : 'Pick a range';
  };

  const handleBulkDelete = () => {
    const selectedIds = Object.keys(rowSelection);
    if (selectedIds.length === 0) return;
    setIsDialogOpen(true);
  };

  const confirmBulkDelete = async () => {
    const selectedIds = Object.keys(rowSelection);
    await bulkDeleteBookings(selectedIds);
    const newData = filteredData
      .filter(booking => !selectedIds.includes(booking.bookingId || ''))
      .map(booking => ({ ...booking, id: booking.bookingId }));
    setBookingData(newData);
    setRowSelection({});
    const status = useBookingStore.getState().statusCode
    if (status !== 200 && status !== 201) {
      toast.error("Error deleting Bookings!");
    } else {
      toast.success("Bookings deleted successfully!");
      router.push("/admin/bookings");
    }
    setIsDialogOpen(false);
  };

  const cancelBulkDelete = () => {
    setIsDialogOpen(false);
  };

  return (
    <>
      <div className="p-6 space-y-6">
        <div className="rounded bg-white p-5 shadow">
          <div className="flex flex-col">
            <div className="flex items-center justify-between border-b-1 mb-5">
              <h1 className="text-2xl font-bold tracking-tight">Booking Page</h1>
              <div className="flex items-center gap-2">
                <Button
                  className='bg-[rgb(0,159,127)] inline-flex items-center justify-center flex-shrink-0 font-medium leading-none rounded-full outline-none transition duration-300 ease-in-out focus:outline-none focus:shadow text-white border border-solid border-accent hover:bg-[rgb(0,159,135)] hover:text-white hover:border-transparent px-5 py-0 h-12 text-[15px] lg:text-bas w-full md:w-auto md:ms-6'
                  onClick={handleCreateBooking}
                >
                  Create Booking
                </Button>
                {/* {showFilters && <Button
                  className='border-none hover:underline-offset-1 hover:bg-none'
                  variant="outline"
                  onClick={handleClear}
                  disabled={isLoading}
                >
                  {isLoading ? "Refreshing..." : "Clear"}
                </Button>} */}
                {/* <Button
                variant="outline"
                onClick={handleRefresh}
                disabled={isLoading}
              >
                {isLoading ? (<RotateCcw />) : (<ListRestart />)}
              </Button> */}
                <Button
                  variant="none"
                  className="text-[#009F7F] hover:bg-[#009F7F] hover:text-white"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  {showFilters ? 'Hide Filters' : 'Show Filters'}
                  {showFilters ? <ArrowDown className="ml-2" /> : <ArrowUp className="ml-2" />}
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
            <div className="grid ml-10 gap-5 md:grid-cols-3 lg:grid-cols-3">
              <Card className="relative overflow-hidden border-none bg-gradient-to-br from-emerald-50 to-teal-50 shadow-md w-[230px] h-[120px] transform transition duration-300 ease-in-out hover:scale-105">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 opacity-0 w-full" />
                <div className="h-[150PX] w-full">
                  <CounterCard
                    color="bg-emerald-100"
                    icon={Activity}
                    count={totalBookings.toLocaleString()}
                    label="Total Bookings"
                    className="relative z-10 p-6"
                  //cardSize="w-[200px] h-[100px]"
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
                    count={totalBookingValue.toLocaleString()}
                    label="Total Booking Value"
                    //cardSize="w-[200px] h-[100px]"
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
                    count={yearlyBookings.toLocaleString()}
                    label="This Year's Bookings"
                  //cardSize="w-[200px] h-[100px]"
                  />
                </div>
                <div className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-purple-500 to-pink-500 transform scale-x-100" />
              </Card>
              <Card className="relative overflow-hidden border-none bg-gradient-to-br from-emerald-50 to-teal-50 shadow-md w-[230px] h-[120px] transform transition duration-300 ease-in-out hover:scale-105">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 opacity-0 w-full" />
                <div className="h-[150PX] w-full">
                  <CounterCard
                    color="bg-emerald-100"
                    icon={Activity}
                    count={completedBookings.toLocaleString()}
                    label="Completed Bookings"
                  //cardSize="w-[200px] h-[100px]"
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
                    count={manualBookings.toLocaleString()}
                    label="Manual Bookings"
                  //cardSize="w-[200px] h-[100px]"
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
                    count={vendorBookings.toLocaleString()}
                    label="Vendor Bookings"
                  />
                </div>
                <div className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-purple-500 to-pink-500 transform scale-x-100" />
              </Card>
            </div>
          </div>
          {showFilters && (
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
          )}
        </div>
        <div className="rounded bg-white shadow">
          <DataTable
            columns={columns}
            data={filteredData as any}
            onSort={handleSort}
            sortConfig={sortConfig}
            rowSelection={rowSelection}
            onRowSelectionChange={setRowSelection}
          />
        </div>
      </div>
    </>
  );
}