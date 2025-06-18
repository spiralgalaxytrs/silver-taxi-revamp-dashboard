"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DataTable } from 'components/DataTable';
import { columns, ServicePayment } from './columns';
import { Button } from 'components/ui/button';
import { Activity, ArrowDown, ArrowUp, Trash } from 'lucide-react';
import CounterCard from 'components/CounterCard';
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
import DateRangeAccordion from 'components/DateRangeAccordion';

function getData(): ServicePayment[] {
  //Fetch data from your API here. (Note: added a status property for filtering purposes.)
  return [
    {
      transactionId: 'SP001',
      refId: 'R001',
      driverId: 'D001',
      date: '2023-10-01',
      amount: 50.0,
      status: 'completed',
    },
    {
      transactionId: 'SP002',
      refId: 'R002',
      driverId: 'D002',
      date: '2023-10-02',
      amount: 75.0,
      status: 'pending',
    },
    {
      transactionId: 'SP003',
      refId: 'R003',
      driverId: 'D003',
      date: '2023-10-03',
      amount: 100.0,
      status: 'cancelled',
    },
    {
      transactionId: 'SP004',
      refId: 'R004',
      driverId: 'D004',
      date: '2023-10-04',
      amount: 125.0,
      status: 'completed',
    },
    {
      transactionId: 'SP005',
      refId: 'R005',
      driverId: 'D005',
      date: '2023-10-05',
      amount: 150.0,
      status: 'pending',
    },
    {
      transactionId: 'SP006',
      refId: 'R006',
      driverId: 'D006',
      date: '2023-10-06',
      amount: 175.0,
      status: 'completed',
    },
    {
      transactionId: 'SP007',
      refId: 'R007',
      driverId: 'D007',
      date: '2023-10-07',
      amount: 200.0,
      status: 'pending',
    },
    {
      transactionId: 'SP008',
      refId: 'R008',
      driverId: 'D008',
      date: '2023-10-08',
      amount: 225.0,
      status: 'completed',
    },
    {
      transactionId: 'SP009',
      refId: 'R009',
      driverId: 'D009',
      date: '2023-10-09',
      amount: 250.0,
      status: 'cancelled',
    },
    {
      transactionId: 'SP010',
      refId: 'R010',
      driverId: 'D010',
      date: '2023-10-10',
      amount: 275.0,
      status: 'completed',
    },
    // Add more data as needed
  ];
}

export default function InvoicesPage() {
  const router = useRouter();
  const [data, setData] = useState(getData().map((payment) => ({ ...payment, id: payment.transactionId })));

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

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});
  const [totalPayments, setTotalPayments] = useState(0);
  const [todayPayments, setTodayPayments] = useState(0);

  // Apply filters to the data.
  const applyFilters = () => {
    let filteredData = data;

    if (filters.search) {
      filteredData = filteredData.filter((payment) =>
        payment.transactionId.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    if (filters.status) {
      filteredData = filteredData.filter((payment) => payment.status === filters.status);
    }

    if (filters.dateStart || filters.dateEnd) {
      filteredData = filteredData.filter((payment) => {
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
      filteredData.sort((a, b) => {
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

    return filteredData;
  };

  const filteredData = applyFilters();

  // Update counters based on the filtered data.
  useEffect(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    const counts = filteredData.reduce(
      (acc, payment) => {
        acc.total += 1;
        if (payment.date === todayStr) {
          acc.today += 1;
        }
        return acc;
      },
      { total: 0, today: 0 }
    );
    setTotalPayments(counts.total);
    setTodayPayments(counts.today);
  }, [filteredData]);

  // Clear filters and reset sorting.
  const handleClear = () => {
    setFilters({
      search: '',
      status: '',
      dateStart: '',
      dateEnd: '',
    });
    setSortConfig({ columnId: null, direction: null });
  };

  // Filter change handler.
  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleSort = (columnId: string) => {
    setSortConfig((prev) => ({
      columnId,
      direction: prev.columnId === columnId && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

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

  // Helper function to format the date range for the filter label.
  const getFormattedDateRange = () => {
    const start = filters.dateStart ? new Date(filters.dateStart).toLocaleDateString() : '';
    const end = filters.dateEnd ? new Date(filters.dateEnd).toLocaleDateString() : '';
    return start && end ? `${start} - ${end}` : 'Date Range';
  };

  return (
    <>
    <div className="space-y-6">
      <div className="rounded bg-white p-5 shadow">
        <div className="flex flex-col">
          <div className="flex justify-between items-center mb-5">
            <h1 className="text-2xl font-bold tracking-tight">Service Payments</h1>
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
          <div className="flex gap-8 items-center mt-4">
            <div className="flex flex-col w-[230px]">
              <Label className="text-sm font-medium leading-none">Search</Label>
              <Input
                id="search"
                placeholder="Search payments"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
              />
            </div>
            <div className="flex flex-col w-[230px]">
              <Label className="text-sm font-medium leading-none">Status</Label>
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
            <div className="flex flex-col w-[230px]">
              <Label className="text-sm font-medium leading-none">Date Range</Label>
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
