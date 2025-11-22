"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { columns } from './columns';
import { Button } from 'components/ui/button';
import { Input } from 'components/ui/input';
import { Label } from 'components/ui/label';
import { Card } from 'components/ui/card';
import CounterCard from 'components/cards/CounterCard';
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
import { ArrowDown, ArrowUp, Activity, Trash, RefreshCcw, Loader2 } from 'lucide-react';
import DateRangeAccordion from 'components/others/DateRangeAccordion';
import {
  MRT_ColumnDef,
  MaterialReactTable
} from 'material-react-table'
import { useBackNavigation } from 'hooks/navigation/useBackNavigation';
import {
  useInvoices,
  useMultiDeleteInvoice
} from 'hooks/react-query/useInvoice';
import {
  useTableColumnVisibility,
  useUpdateTableColumnVisibility
} from 'hooks/react-query/useImageUpload';

export default function InvoicesPage() {
  const router = useRouter();

  // Pagination state
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  // Search and filter state
  const [search, setSearch] = useState('');
  const [globalFilter, setGlobalFilter] = useState('');
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    creationDateStart: '',
    creationDateEnd: ''
  });
  const [showFilters, setShowFilters] = useState(false);

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
    data: invoicesData = { invoices: [], invoicesCount: { total: 0, partiallyPaid: 0, paid: 0, unpaid: 0 }, pagination: { currentPage: 1, totalPages: 1, totalCount: 0, hasNext: false, hasPrev: false, limit: 10 } },
    isPending,
    refetch
  } = useInvoices({
    page,
    limit,
    search: search || undefined,
    status: filters.status || undefined,
  });
  const { mutate: multiDeleteInvoice } = useMultiDeleteInvoice();

  // Handle API response structure
  const invoices = invoicesData.invoices || [];
  const invoicesCount = invoicesData.invoicesCount;
  const paginationInfo = invoicesData.pagination;

  const {
    data: tableColumnVisibility = {},
  } = useTableColumnVisibility("invoices");

  const {
    mutate: updateTableColumnVisibility
  } = useUpdateTableColumnVisibility("invoices");

  const [lockBack, setLockBack] = useState(false);
  useBackNavigation(lockBack);
  const [sorting, setSorting] = useState<{ id: string; desc: boolean }[]>([])
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({})
  const [isSpinning, setIsSpinning] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [localColumnVisibility, setLocalColumnVisibility] = useState<Record<string, boolean>>({})
  const [isColumnVisibilityUpdated, setIsColumnVisibilityUpdated] = useState(false);

  // Reset pagination when status filter changes
  useEffect(() => {
    setPagination(prev => ({ ...prev, pageIndex: 0 }));
  }, [filters.status]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    // Reset pagination when filters change
    if (key === 'status') {
      setPagination(prev => ({ ...prev, pageIndex: 0 }));
    }
  };

  const handleClear = async () => {
    try {
      setFilters({
        search: '',
        status: '',
        creationDateStart: '',
        creationDateEnd: ''
      });
      setGlobalFilter('');
      setSearch('');
      setPagination(prev => ({ ...prev, pageIndex: 0 }));
    } catch (error) {
      console.error('Error clearing filters:', error);
    }
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


  const invoiceData = useMemo(() => {
    return invoices.map(invoice => ({
      ...invoice,
      id: invoice.invoiceId ? invoice.invoiceId : "",
      invoiceId: invoice.invoiceId || "",
      createdAt: invoice.createdAt ? invoice.createdAt : ""
    }));
  }, [invoices]);

  // Apply client-side date filtering if needed
  const filteredData = useMemo(() => {
    let data = [...invoiceData];

    // Client-side date filtering (if backend doesn't support it)
    if (filters.creationDateStart || filters.creationDateEnd) {
      data = data.filter(invoice => {
        const created = invoice.createdAt ? new Date(invoice.createdAt).setHours(0, 0, 0, 0) : null;
        const filterStart = filters.creationDateStart ? new Date(filters.creationDateStart).setHours(0, 0, 0, 0) : null;
        const filterEnd = filters.creationDateEnd ? new Date(filters.creationDateEnd).setHours(0, 0, 0, 0) : null;
        return (created && (!filterStart || created >= filterStart) && (!filterEnd || created <= filterEnd));
      });
    }

    return data;
  }, [invoiceData, filters.creationDateStart, filters.creationDateEnd]);

  // Use server-side counts if available, otherwise calculate from filtered data
  const totalInvoices = invoicesCount?.total || filteredData.length;
  const partiallyPaidInvoices = invoicesCount?.partiallyPaid || filteredData.filter(inv => inv.status === 'Partial Paid').length;
  const paidInvoices = invoicesCount?.paid || filteredData.filter(inv => inv.status === 'Paid').length;
  const unpaidInvoices = invoicesCount?.unpaid || filteredData.filter(inv => inv.status === 'Unpaid').length;

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
    const selectedIndices = Object.keys(rowSelection)
    const selectedIds = selectedIndices.map(index => {
      const invoiceId = filteredData[parseInt(index)]?.invoiceId
      return invoiceId !== undefined ? invoiceId : null
    }).filter(id => id !== null)
    multiDeleteInvoice(selectedIds, {
      onSuccess: () => {
        toast.success("Invoices deleted successfully", {
          style: {
            backgroundColor: "#009F7F",
            color: "#fff",
          },
        });
        setIsDialogOpen(false);
        setRowSelection({});
        refetch();
      },
      onError: (error: any) => {
        toast.error(error?.response?.data?.message || "Error deleting Invoices", {
          style: {
            backgroundColor: "#FF0000",
            color: "#fff",
          },
        });
        setIsDialogOpen(false);
      }
    });
  }

  const handleRefetch = async () => {
    setIsSpinning(true);
    try {
      await refetch(); // wait for the refetch to complete
    } finally {
      // stop spinning after short delay to allow animation to play out
      setTimeout(() => setIsSpinning(false), 500);
    }
  };

  const cancelBulkDelete = () => {
    setIsDialogOpen(false);
  }

  const handleCreateInvoice = () => {
    router.push('/admin/invoices/create');
  };

  if (isPending && pagination.pageIndex === 0) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <React.Fragment>
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
                  value={globalFilter}
                  onChange={(e) => setGlobalFilter(e.target.value)}
                />
              </div>
              <div className="flex flex-col w-[230px]">
                <Label htmlFor="status" className="text-sm font-medium mb-3">
                  Status
                </Label>
                <Select 
                  value={filters.status} 
                  onValueChange={(value) => handleFilterChange('status', value)}
                >
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Status</SelectItem>
                    <SelectItem value="Partial Paid">Partially Paid</SelectItem>
                    <SelectItem value="Paid">Paid</SelectItem>
                    <SelectItem value="Unpaid">Unpaid</SelectItem>
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