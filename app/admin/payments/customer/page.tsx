"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { columns } from './columns';
import { Button } from 'components/ui/button';
import { Activity, ArrowDown, ArrowUp, RefreshCcw } from 'lucide-react';
import CounterCard from 'components/cards/CounterCard';
import { Card } from 'components/ui/card';
import { Input } from 'components/ui/input';
import { Label } from 'components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from 'components/ui/select';
import DateRangeAccordion from 'components/others/DateRangeAccordion';
import {
  MRT_ColumnDef,
  MaterialReactTable
} from 'material-react-table';
import { useBackNavigation } from 'hooks/navigation/useBackNavigation'
import {
  useFetchBookings
} from "hooks/react-query/useBooking";
import {
  useTableColumnVisibility,
  useUpdateTableColumnVisibility
} from 'hooks/react-query/useImageUpload';

export default function CustomerPaymentPage() {
  const router = useRouter();

  const {
    data: bookings = []
  } = useFetchBookings();

  const {
    data: tableColumnVisibility = {},
  } = useTableColumnVisibility("payments-customer");

  const {
    mutate: updateTableColumnVisibility
  } = useUpdateTableColumnVisibility("payments-customer");

  const [lockBack, setLockBack] = useState(false);
  useBackNavigation(lockBack);
  const [sorting, setSorting] = useState<{ id: string; desc: boolean }[]>([])
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({})
  const [isSpinning, setIsSpinning] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [totalPayments, setTotalPayments] = useState(0);
  const [todayPayments, setTodayPayments] = useState(0);
  const [localColumnVisibility, setLocalColumnVisibility] = useState<Record<string, boolean>>({})
  const [isColumnVisibilityUpdated, setIsColumnVisibilityUpdated] = useState(false);
  const [sortConfig, setSortConfig] = useState<{
    columnId: string | null;
    direction: 'asc' | 'desc' | null;
  }>({ columnId: null, direction: null });

  const [filters, setFilters] = useState({
    search: '',
    status: '',
    dateStart: '',
    dateEnd: '',
  });


  const bookingData = useMemo(() =>
    bookings
      .filter((booking: any) =>
        booking.status === "Completed" || booking.status === "Cancelled"
      )
      .map((booking: any) => ({
        ...booking,
        id: booking.bookingId,
      })),
    [bookings]
  );

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


  const unFiltered = [...bookingData].sort((a, b) => {
    const aCreatedAt = new Date(a.createdAt || "").getTime();
    const bCreatedAt = new Date(b.createdAt || "").getTime();
    return bCreatedAt - aCreatedAt; // Descending order
  });

  // Apply filters to the driver payment data
  const applyFilters = () => {
    let filteredData = [...unFiltered];

    if (filters.search) {
      filteredData = filteredData.filter(
        (payment) =>
          payment.transactionId.toLowerCase().includes(filters.search.toLowerCase()) ||
          payment.vendorId?.toLowerCase().includes(filters.search.toLowerCase()) ||
          payment.initiatedBy.toLowerCase().includes(filters.search.toLowerCase()) ||
          payment.initiatedTo.toLowerCase().includes(filters.search.toLowerCase()) ||
          payment.ownedBy.toLowerCase().includes(filters.search.toLowerCase()) ||
          payment.type.toLowerCase().includes(filters.search.toLowerCase()) ||
          payment.amount.toString().toLowerCase().includes(filters.search.toLowerCase()) ||
          payment.description.toString().toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    if (filters.status) {
      filteredData = filteredData.filter(
        (payment) => payment.status === filters.status
      );
    }

    if (filters.dateStart || filters.dateEnd) {
      filteredData = filteredData.filter((payment) => {
        const paymentDate = new Date(payment.createdAt).setHours(0, 0, 0, 0);
        const filterStart = filters.dateStart
          ? new Date(filters.dateStart).setHours(0, 0, 0, 0)
          : null;
        const filterEnd = filters.dateEnd
          ? new Date(filters.dateEnd).setHours(0, 0, 0, 0)
          : null;
        return (
          (!filterStart || paymentDate >= filterStart) &&
          (!filterEnd || paymentDate <= filterEnd)
        );
      });
    }

    return filteredData;
  };

  const filteredData = applyFilters();

  // Update the counter cards using the filtered data
  useEffect(() => {
    // Get today's date and set time to start of day
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const total = filteredData.length;
    const todayCount = filteredData.filter(payment => {
      // Convert payment date to start of day for comparison
      const paymentDate = new Date(payment.createdAt);
      paymentDate.setHours(0, 0, 0, 0);
      return paymentDate.getTime() === today.getTime();
    }).length;

    setTotalPayments(total);
    setTodayPayments(todayCount);
  }, [filteredData]);

  // Sorting handler
  const handleSort = (columnId: string) => {
    setSortConfig((prev) => ({
      columnId,
      direction: prev.columnId === columnId && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  // Handler for input filters
  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  // Handler to clear filters and reset sorting
  const handleClear = () => {
    setFilters({
      search: '',
      status: '',
      dateStart: '',
      dateEnd: '',
    });
    setSortConfig({ columnId: null, direction: null });
  };

  // Helper function to format the date range for the filter label.
  const getFormattedDateRange = () => {
    const start = filters.dateStart
      ? new Date(filters.dateStart).toLocaleDateString()
      : '';
    const end = filters.dateEnd
      ? new Date(filters.dateEnd).toLocaleDateString()
      : '';
    return start && end ? `${start} - ${end}` : 'Date Range';
  };

  const handleRefetch = async () => {
    setIsSpinning(true);
    try {
      // await refetch(); // wait for the refetch to complete
    } finally {
      // stop spinning after short delay to allow animation to play out
      setTimeout(() => setIsSpinning(false), 500);
    }
  };

  return (
    <React.Fragment>
      <div className="space-y-6">
        <div className="rounded bg-white p-5 shadow">
          <div className="flex flex-col">
            <div className="flex justify-between items-center mb-5">
              <h1 className="text-2xl font-bold tracking-tight">Customer Payment</h1>
              <div className="flex items-center gap-2">
                {/* {showFilters && <Button variant="outline" onClick={handleClear}>
                  Clear
                </Button>} */}
                <Button
                  variant="none"
                  className="text-[#009F7F] hover:bg-[#009F7F] hover:text-white"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  {showFilters ? 'Hide Filters' : 'Show Filters'}
                  {showFilters ? (
                    <ArrowDown className="ml-2" />
                  ) : (
                    <ArrowUp className="ml-2" />
                  )}
                </Button>
              </div>
            </div>
            <div className="flex justify-center gap-20 mt-4">
              <Card className="relative overflow-hidden border-none bg-gradient-to-br from-emerald-50 to-teal-50 shadow-md w-[230px] h-[120px] transform transition duration-300 ease-in-out hover:scale-105">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 opacity-0 w-full" />
                <div className="h-[150PX] w-full">
                  <CounterCard
                    color="bg-emerald-100"
                    icon={Activity}
                    count={totalPayments}
                    label="Total Payments"
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
                    count={todayPayments}
                    label="Today's Payments"
                    cardSize="w-[180px] h-[90px]"
                  />
                </div>
                <div className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-blue-500 to-indigo-500 transform scale-x-100" />
              </Card>
            </div>
          </div>
          {showFilters && (
            <div className="flex gap-8 items-center mt-4">
              <div className="flex flex-col w-[230px]">
                <Label className="text-sm font-medium leading-none">
                  Search
                </Label>
                <Input
                  id="search"
                  placeholder="Transaction ID / Phone"
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                />
              </div>
              <div className="flex flex-col w-[230px]">
                <Label className="text-sm font-medium leading-none">
                  Status
                </Label>
                <Select onValueChange={(value) => handleFilterChange('status', value)}>
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="completed">Paid</SelectItem>
                    <SelectItem value="pending">Refund Pending</SelectItem>
                    <SelectItem value="cancelled">Refund</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col w-[230px]">
                <Label className="text-sm font-medium leading-none">Date Range</Label>
                <DateRangeAccordion
                  label={getFormattedDateRange()}
                  startDate={filters.dateStart}
                  endDate={filters.dateEnd}
                  onStartDateChange={(date: any) =>
                    handleFilterChange('dateStart', date)
                  }
                  onEndDateChange={(date: any) =>
                    handleFilterChange('dateEnd', date)
                  }
                />
              </div>
              <div className='flex justify-start items-center'>
                <Button
                  className='mt-4 p-1 border-none bg-[#009F87] flex justify-center items-center w-28'
                  // variant="outline"
                  onClick={handleClear}
                >
                  Clear
                </Button>
              </div>
            </div>
          )}
        </div>
        <div className="rounded bg-white shadow">
          <MaterialReactTable
            columns={columns as MRT_ColumnDef<any>[]}
            data={filteredData}
            // enableRowSelection
            positionGlobalFilter="left"
            onRowSelectionChange={setRowSelection}
            state={{ rowSelection, sorting, columnVisibility }}
            onColumnVisibilityChange={(newVisibility) => {
              setIsColumnVisibilityUpdated(true);
              setLocalColumnVisibility(newVisibility);
            }}
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
