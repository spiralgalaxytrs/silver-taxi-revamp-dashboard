"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DataTable } from 'components/others/DataTable';
import { columns } from './columns';
import { Button } from 'components/ui/button';
import { Input } from 'components/ui/input';
import { Label } from 'components/ui/label';
import { Card } from 'components/ui/card';
import CounterCard from 'components/cards/CounterCard';
import {toast} from "sonner"
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
import { ArrowDown, ArrowUp, Activity, Trash } from 'lucide-react';
import DateRangeAccordion from 'components/others/DateRangeAccordion';
import { useInvoiceStore } from 'stores/invoiceStore';

export default function InvoicesPage() {
  const { invoices, fetchVendorInvoices, multiDeleteInvoice } = useInvoiceStore();
  const router = useRouter();
  const [totalInvoices, setTotalInvoices] = useState(0);
  const [partiallyPaidInvoices, setPartiallyPaidInvoices] = useState(0);
  const [paidInvoices, setPaidInvoices] = useState(0);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [unpaidInvoices, setUnpaidInvoices] = useState(0);

  const [sortConfig, setSortConfig] = useState<{
    columnId: string | null;
    direction: 'asc' | 'desc' | null;
  }>({ columnId: null, direction: null });

  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    creationDateStart: '',
    creationDateEnd: ''
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchVendorInvoices();
  }, [fetchVendorInvoices]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleClear = async () => {
    try {
      setFilters({
        search: '',
        status: '',
        creationDateStart: '',
        creationDateEnd: ''
      });
      setSortConfig({ columnId: null, direction: null }); // Reset sorting
    } catch (error) {
      console.error('Error clearing filters:', error);
    }
  };

  const [invoiceData, setInvoiceData] = useState(
    invoices.map((invoice) => {
      return {
        ...invoice,
        // id: invoice.invoiceId ? invoice.invoiceId : "",
        invoiceId: invoice.invoiceId || "", // Ensure invoiceId is always a string
        createdAt: invoice.createdAt ? invoice.createdAt : ""
      }
    })
  );

  const filteredInvoiceData = invoiceData.filter((invoice) => invoice.createdBy === 'Vendor');

  const unFilteredData = [...filteredInvoiceData].sort((a, b) => {
    const aCreatedAt = new Date(a.createdAt || "").getTime();
    const bCreatedAt = new Date(b.createdAt || "").getTime();
    return bCreatedAt - aCreatedAt; // Descending order
  });

  const applyFilters = () => {
    let filteredData = [...unFilteredData];

    if (filters.search) {
      filteredData = filteredData.filter(
        (invoice) =>
          invoice.invoiceId?.toLowerCase().includes(filters.search.toLowerCase()) ||
          invoice.email?.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    if (filters.status) {
      filteredData = filteredData.filter(
        (invoice) => invoice.status === filters.status
      );
    }

    if (filters.creationDateStart || filters.creationDateEnd) {
      filteredData = filteredData.filter(invoice => {
        const created = invoice.createdAt ? new Date(invoice.createdAt).setHours(0, 0, 0, 0) : null;
        const filterStart = filters.creationDateStart ? new Date(filters.creationDateStart).setHours(0, 0, 0, 0) : null;
        const filterEnd = filters.creationDateEnd ? new Date(filters.creationDateEnd).setHours(0, 0, 0, 0) : null;
        return (created && (!filterStart || created >= filterStart) && (!filterEnd || created <= filterEnd));
      });
    }

    // Global sorting logic - Updated to handle different data types
    if (sortConfig.columnId && sortConfig.direction) {
      filteredData = [...filteredData].sort((a, b) => {
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

  const filteredData = applyFilters();

  useEffect(() => {
    const counts = filteredData.reduce(
      (acc, invoice) => {
        acc.total += 1;
        switch (invoice.status) {
          case 'Partial Paid':
            acc.partiallyPaid += 1;
            break;
          case 'Paid':
            acc.paid += 1;
            break;
          case 'Unpaid':
            acc.unpaid += 1;
            break;
        }
        return acc;
      },
      { total: 0, partiallyPaid: 0, paid: 0, unpaid: 0 }
    );

    setTotalInvoices(counts.total);
    setPartiallyPaidInvoices(counts.partiallyPaid);
    setPaidInvoices(counts.paid);
    setUnpaidInvoices(counts.unpaid);
  }, [filteredData]);

  const handleSort = (columnId: string) => {
    setSortConfig(prev => ({
      columnId,
      direction: prev.columnId === columnId && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const getFormattedCreatedDateRange = () => {
    const start = filters.creationDateStart ? new Date(filters.creationDateStart).toLocaleDateString() : '';
    const end = filters.creationDateEnd ? new Date(filters.creationDateEnd).toLocaleDateString() : '';
    return start && end ? `${start} - ${end}` : 'Pick a Range';
  };

  const handleBulkDelete = () => {
    const selectedIds = Object.keys(rowSelection);
    if (selectedIds.length === 0) return;
    setIsDialogOpen(true);
  };

  const confirmBulkDelete = async () => {
    const selectedIds = Object.keys(rowSelection);
    await multiDeleteInvoice(selectedIds);
    const newData = invoiceData.filter(invoice => !selectedIds.includes(invoice.invoiceId ?? ''));
    setInvoiceData(newData);
    setRowSelection({});
    const status = useInvoiceStore.getState().statusCode
    const message = useInvoiceStore.getState().message
    if (status === 200 || status === 201) {
      toast.success("Invoices deleted successfully", {
        style: {
            backgroundColor: "#009F7F",
            color: "#fff",
        },
    });
      router.push("/vendor/invoices");
    } else {
      toast.error(message || "Error deleting Invoices", {
        style: {
            backgroundColor: "#FF0000",
            color: "#fff",
        },
    });
    }
    setIsDialogOpen(false);
  }

  const cancelBulkDelete = () => {
    setIsDialogOpen(false);
  }

  const handleCreateInvoice = () => {
    router.push('/vendor/invoices/create');
  };

  return (
    <>
      <div className="space-y-6">
        <div className="rounded bg-white p-5 shadow">
          <div className="flex flex-col">
            <div className="flex justify-between items-center mb-5">
              <h1 className="text-2xl font-bold tracking-tight">Invoices</h1>
              <div className="flex items-center gap-2">
                <Button
                  className="bg-[rgb(0,159,127)]"
                  onClick={handleCreateInvoice}
                >
                  Create Invoice
                </Button>
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
                              Are you sure you want to delete {Object.keys(rowSelection).length} selected invoices?
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
            {/* Counter Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-5">
              <Card className="relative overflow-hidden border-none bg-gradient-to-br from-emerald-50 to-teal-50 shadow-md w-[230px] h-[120px] transform transition duration-300 ease-in-out hover:scale-105">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 opacity-0 w-full" />
                <div className="h-[150PX] w-full">
                  <CounterCard
                    color="bg-emerald-100"
                    icon={Activity}
                    count={totalInvoices}
                    label="Total Invoices"
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
                    count={partiallyPaidInvoices}
                    label="Partially Paid"
                    cardSize="w-[180px] h-[90px]"
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
                    count={paidInvoices}
                    label="Paid"
                    cardSize="w-[180px] h-[90px]"
                  />
                </div>
                <div className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-purple-500 to-pink-500 transform scale-x-100" />
              </Card>
              <Card className="relative overflow-hidden border-none bg-gradient-to-br from-purple-50 to-pink-50 shadow-md w-[230px] h-[120px] transform transition duration-300 ease-in-out hover:scale-105">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 opacity-100 w-full" />
                <div className="h-[150px] w-full">
                  <CounterCard
                    color="bg-orange-100"
                    icon={Activity}
                    count={unpaidInvoices}
                    label="Unpaid"
                    cardSize="w-[180px] h-[90px]"
                  />
                </div>
                <div className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-orange-500 to-red-500 transform scale-x-100" />
              </Card>
            </div>
          </div>
          {showFilters && (
            <div className="flex gap-8 items-center mt-4">
              <div className="flex flex-col w-[230px]">
                <Label className="text-sm font-medium">Search</Label>
                <Input
                  id="search"
                  placeholder="Search in invoices"
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                />
              </div>
              <div className="flex flex-col w-[230px]">
                <Label htmlFor="status" className="text-sm font-medium mb-3">
                  Status
                </Label>
                <Select onValueChange={(value) => handleFilterChange('status', value)}>
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="partially_paid">Partially Paid</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="unpaid">Unpaid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col w-[230px]">
                <Label className="text-sm font-medium leading-none">Created At</Label>
                <DateRangeAccordion
                  label={getFormattedCreatedDateRange()}
                  startDate={filters.creationDateStart}
                  endDate={filters.creationDateEnd}
                  onStartDateChange={(date: any) => handleFilterChange('creationDateStart', date)}
                  onEndDateChange={(date: any) => handleFilterChange('creationDateEnd', date)}
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
            data={applyFilters()}
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