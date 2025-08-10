"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { columns, VendorTransaction } from './columns';
import { Button } from 'components/ui/button';
import { Activity, ArrowDown, ArrowUp, Trash, RefreshCcw } from 'lucide-react';
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
import { useAllVendorTransactions } from 'hooks/react-query/useWallet';
import {
  MRT_ColumnDef,
  MaterialReactTable
} from 'material-react-table';
import { useBackNavigation } from 'hooks/navigation/useBackNavigation'
import {
  useTableColumnVisibility,
  useUpdateTableColumnVisibility
} from 'hooks/react-query/useImageUpload';

export default function VendorPaymentPage() {
  const router = useRouter();

  const {
    data: vendorTransactions = [],
    isPending: isLoading,
    refetch
  } = useAllVendorTransactions();
  console.log(vendorTransactions)

  const {
    data: tableColumnVisibility = {},
  } = useTableColumnVisibility("payments-vendor");

  const {
    mutate: updateTableColumnVisibility
  } = useUpdateTableColumnVisibility("payments-vendor");

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

  const [lockBack, setLockBack] = useState(false);
  useBackNavigation(lockBack);
  const [sorting, setSorting] = useState<{ id: string; desc: boolean }[]>([])
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({})
  const [showFilters, setShowFilters] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false)
  const [totalPayments, setTotalPayments] = useState(0);
  const [todayPayments, setTodayPayments] = useState(0);
  const [localColumnVisibility, setLocalColumnVisibility] = useState<Record<string, boolean>>({})
  const [isColumnVisibilityUpdated, setIsColumnVisibilityUpdated] = useState(false);

  const transactionData = useMemo(() => {
    return vendorTransactions.map((transaction) => ({
      ...transaction,
      id: transaction.transactionId,
      createdAt: transaction.createdAt
    }));
  }, [vendorTransactions])

  // Apply filters to the data.
  const applyFilters = () => {
    let filteredData = [...transactionData];

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
        (payment) =>
          payment.status.toLowerCase() === filters.status.toLowerCase()
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

    if (sortConfig.columnId && sortConfig.direction) {
      filteredData.sort((a, b) => {
        const columnKey = sortConfig.columnId as keyof typeof a;
        const aValue = a[columnKey];
        const bValue = b[columnKey];

        // Handle null/undefined cases
        if (aValue == null) return sortConfig.direction === 'asc' ? 1 : -1;
        if (bValue == null) return sortConfig.direction === 'asc' ? -1 : 1;

        // Date comparison for date fields
        if (['createdAt'].includes(columnKey)) {
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


  const filteredData = applyFilters();

  useEffect(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const total = filteredData.length;
    const todayCount = filteredData.filter(payment => {
      const paymentDate = new Date(payment.createdAt);
      paymentDate.setHours(0, 0, 0, 0);
      return paymentDate.getTime() === today.getTime();
    }).length;

    setTotalPayments(total);
    setTodayPayments(todayCount);
  }, [filteredData]);

  // Filter change handler.
  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  // Clear filters and sorting.
  const handleClear = () => {
    setFilters({
      search: '',
      status: '',
      dateStart: '',
      dateEnd: '',
    });
    setSortConfig({ columnId: null, direction: null });
  };

  // Sorting handler.
  const handleSort = (columnId: string) => {
    setSortConfig((prev) => ({
      columnId,
      direction: prev.columnId === columnId && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
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
      await refetch(); // wait for the refetch to complete
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
              <h1 className="text-2xl font-bold tracking-tight">Vendor Payment</h1>
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
            <React.Fragment>
              <div className="flex gap-8 items-center mt-4 flex-wrap">
                <div className="flex flex-col w-[230px]">
                  <Label htmlFor="search">Search</Label>
                  <Input
                    id="search"
                    placeholder="Transaction ID / Phone"
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                  />
                </div>
                <div className="flex flex-col w-[230px]">
                  <Label htmlFor="status">Status</Label>
                  <div className="mt-1">
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
                </div>
                <div className="flex flex-col w-[230px]">
                  <Label className="text-sm font-medium leading-none">
                    Date Range
                  </Label>
                  <DateRangeAccordion
                    label={getFormattedDateRange()}
                    startDate={filters.dateStart}
                    endDate={filters.dateEnd}
                    onStartDateChange={(date: any) => handleFilterChange('dateStart', date)}
                    onEndDateChange={(date: any) => handleFilterChange('dateEnd', date)}
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
            </React.Fragment>
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
