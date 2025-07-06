"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DataTable } from 'components/others/DataTable';
import { columns, CustomerPayment } from './columns';
import { Button } from 'components/ui/button';
import { Card } from 'components/ui/card';
import CounterCard from 'components/cards/CounterCard';
import { Activity, ArrowDown, ArrowUp, Trash, RefreshCcw } from 'lucide-react';
import { Input } from 'components/ui/input';
import { Label } from 'components/ui/label';
import DateRangeAccordion from 'components/others/DateRangeAccordion';
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
import {
  MRT_ColumnDef,
  MaterialReactTable
} from 'material-react-table';
import { useBackNavigation } from 'hooks/navigation/useBackNavigation'

function getData(): CustomerPayment[] {
  // Fetch data from your API here
  return [
    {
      transactionId: 'C001',
      refId: 'R001',
      bookingId: 'B001',
      invoiceId: 'I001',
      date: '2025-01-02',
      driverId: 'D001',
      driverName: 'Alice Johnson',
      totalAmount: 150.00,
      status: 'completed',
    },
    {
      transactionId: 'C002',
      refId: 'R002',
      bookingId: 'B002',
      invoiceId: 'I002',
      date: '2025-01-03',
      driverId: 'D002',
      driverName: 'Bob Brown',
      totalAmount: 200.00,
      status: 'pending',
    },
    {
      transactionId: 'C003',
      refId: 'R003',
      bookingId: 'B003',
      invoiceId: 'I003',
      date: '2025-01-04',
      driverId: 'D003',
      driverName: 'Charlie Davis',
      totalAmount: 250.00,
      status: 'cancelled',

    },
    {
      transactionId: 'C004',
      refId: 'R004',
      bookingId: 'B004',
      invoiceId: 'I004',
      date: '2025-02-04',
      driverId: 'D004',
      driverName: 'David Smith',
      totalAmount: 300.00,
      status: 'completed',
    },
    {
      transactionId: 'C005',
      refId: 'R005',
      bookingId: 'B005',
      invoiceId: 'I005',
      date: '2023-10-05',
      driverId: 'D005',
      driverName: 'Eve White',
      totalAmount: 350.00,
      status: 'pending',
    },
    {
      transactionId: 'C006',
      refId: 'R006',
      bookingId: 'B006',
      invoiceId: 'I006',
      date: '2023-10-06',
      driverId: 'D006',
      driverName: 'Frank Black',
      totalAmount: 400.00,
      status: 'completed',
    },
    {
      transactionId: 'C007',
      refId: 'R007',
      bookingId: 'B007',
      invoiceId: 'I007',
      date: '2023-10-07',
      driverId: 'D007',
      driverName: 'Grace Green',
      totalAmount: 450.00,
      status: 'pending',
    },
    {
      transactionId: 'C008',
      refId: 'R008',
      bookingId: 'B008',
      invoiceId: 'I008',
      date: '2023-10-08',
      driverId: 'D008',
      driverName: 'Hank Yellow',
      totalAmount: 500.00,
      status: 'completed',
    },
  ]
}

export default function CustomerPaymentPage() {
  const router = useRouter();
  const [data, setData] = useState(getData().map((payment) => ({ ...payment, id: payment.transactionId })));


  const [lockBack, setLockBack] = useState(false);
  useBackNavigation(lockBack);
  const [sorting, setSorting] = useState<{ id: string; desc: boolean }[]>([])
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({})
  const [isSpinning, setIsSpinning] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [totalPayments, setTotalPayments] = useState(0);
  const [todayPayments, setTodayPayments] = useState(0);

  const [sortConfig, setSortConfig] = useState<{
    columnId: string | null;
    direction: 'asc' | 'desc' | null;
  }>({ columnId: null, direction: null });

  // New state for filtering
  const [filters, setFilters] = useState({
    search: '',
    dateStart: '',
    dateEnd: '',
    status: ''
  });

  const handleSort = (columnId: string) => {
    setSortConfig(prev => ({
      columnId,
      direction: prev.columnId === columnId && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  // Handler for input filters
  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  // Handler to clear filters and sort
  const handleClear = () => {
    setFilters({
      search: '',
      dateStart: '',
      dateEnd: '',
      status: ''
    });
    setSortConfig({ columnId: null, direction: null });
  };

  // Apply filters to the data
  const applyFilters = () => {
    let filtered = data;
    if (filters.search) {
      filtered = filtered.filter(
        (payment) =>
          payment.transactionId.toLowerCase().includes(filters.search.toLowerCase()) ||
          payment.driverName.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    if (filters.status) {
      filtered = filtered.filter(payment => payment.status === filters.status);
    }

    if (filters.dateStart || filters.dateEnd) {
      filtered = filtered.filter((payment) => {
        const paymentDate = new Date(payment.date).setHours(0, 0, 0, 0);

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

    // Global sorting logic
    if (sortConfig.columnId && sortConfig.direction) {
      filtered.sort((a, b) => {
        const aValue = a[sortConfig.columnId as keyof typeof a];
        const bValue = b[sortConfig.columnId as keyof typeof b];

        if (aValue === null || bValue === null) return 0;

        if (aValue === bValue) return 0;

        if (sortConfig.direction === 'asc') {
          return aValue > bValue ? 1 : -1;
        } else {
          return aValue < bValue ? 1 : -1;
        }
      });
    }

    return filtered;
  };

  const filteredData = applyFilters();

  // Updated counter update using filtered data
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const total = filteredData.length;
    const todayCount = filteredData.filter(payment => payment.date === today).length;
    setTotalPayments(total);
    setTodayPayments(todayCount);
  }, [filteredData]);


  // Bulk delete action for selected rows.
  const handleBulkDelete = () => {
    const selectedIds = Object.keys(rowSelection);
    if (selectedIds.length === 0) return;
    setIsDialogOpen(true);
  };

  const confirmBulkDelete = async () => {
    const selectedIds = Object.keys(rowSelection);
    //await deletePaymentsAPI(selectedIds);
    const newData = filteredData.filter(payment => !selectedIds.includes(payment.transactionId || ""));
    setData(newData);
    setRowSelection({});
    setIsDialogOpen(false);
  };

  const cancelBulkDelete = () => {
    setIsDialogOpen(false);
  };

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
        <div className="rounded bg-white p-5 shadow ">
          <div className="flex flex-col ">
            <div className="flex justify-between items-center mb-5">
              <h1 className="text-2xl font-bold tracking-tight">Customer Payment</h1>
              <div className="flex items-center gap-2">

                {/* {showFilters && <Button variant="outline" onClick={handleClear}>
                Clear
              </Button>} */}
                <Button
                  variant="none"
                  className='text-[#009F7F] hover:bg-[#009F7F] hover:text-white'
                  onClick={() => setShowFilters(!showFilters)}
                >
                  {showFilters ? 'Hide Filters' : `Show Filters `}
                  {showFilters ? <ArrowDown className="ml-2" /> : <ArrowUp className="ml-2" />}
                </Button>
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
                            Are you sure you want to delete {Object.keys(rowSelection).length} selected Payments?
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
            <div className="flex gap-8 items-center mt-4 flex-wrap ">
              <div className="flex flex-col w-[230px]">
                <Label htmlFor="search">Search</Label>
                <Input
                  id="search"
                  placeholder="Search payments"
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                />
              </div>
              <div className="flex flex-col w-[230px]">
                <Label htmlFor="status" >Status</Label>
                <div className='mt-1'>
                  <Select onValueChange={(value) => handleFilterChange('status', value)}>
                    <SelectTrigger id="status">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex flex-col w-[230px]">
                <Label className="text-sm font-medium leading-none">
                  Date Range
                </Label>
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
        <MaterialReactTable
          columns={columns as MRT_ColumnDef<any>[]}
          data={filteredData}
          enableRowSelection
          positionGlobalFilter="left"
          onRowSelectionChange={setRowSelection}
          state={{ rowSelection, sorting }}
          onSortingChange={setSorting}
          enableSorting
          initialState={{
            density: 'compact',
            pagination: { pageIndex: 0, pageSize: 10 },
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
    </React.Fragment>
  );
}
