"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DataTable } from 'components/others/DataTable';
import { columns, DriverTransaction } from './columns';
import { Button } from 'components/ui/button';
import { Activity, ArrowDown, ArrowUp, Trash } from 'lucide-react';
import CounterCard from 'components/cards/CounterCard';
import { Card } from 'components/ui/card';
import { Input } from 'components/ui/input';
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
import { useWalletTransactionStore } from "stores/-walletTransactionStore";

export default function DriverPaymentPage() {
  const router = useRouter();
  const { fetchAllDriverTransactions, driverTransactions} = useWalletTransactionStore();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
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
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});
  const [totalPayments, setTotalPayments] = useState(0);
  const [todayPayments, setTodayPayments] = useState(0);
  const [transactionData, setTransactionData] = useState(
    driverTransactions.map(transaction => ({
      ...transaction,
      id: transaction.transactionId,
    }))
  );

  useEffect(()=>{
    fetchAllDriverTransactions()
  },[transactionData])

  const unFiltered = [...transactionData ].sort((a, b) => {
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

  return (
    <>
      <div className="space-y-6">
        <div className="rounded bg-white p-5 shadow">
          <div className="flex flex-col">
            <div className="flex justify-between items-center mb-5">
              <h1 className="text-2xl font-bold tracking-tight">Driver Payment</h1>
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
          <DataTable
            columns={columns}
            data={filteredData}
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
