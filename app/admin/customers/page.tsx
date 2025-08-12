"use client";

import React, { useState, useEffect, useMemo } from "react";
import { columns } from "./columns";
import { Button } from "components/ui/button";
import { Input } from "components/ui/input";
import { Label } from "components/ui/label";
import { Card } from "components/ui/card";
import CounterCard from "components/cards/CounterCard";
import { Loader2, Activity, Trash, ArrowDown, ArrowUp, RefreshCcw } from "lucide-react";
import DateRangeAccordion from "components/others/DateRangeAccordion";
import { toast } from "sonner"
import { useRouter } from "next/navigation";
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
  useCustomers,
  useBulkDeleteCustomers
} from "hooks/react-query/useCustomer";
import {
  MRT_ColumnDef,
  MaterialReactTable
} from 'material-react-table'
import {
  useTableColumnVisibility,
  useUpdateTableColumnVisibility
} from 'hooks/react-query/useImageUpload';

interface Customer {
  customerId?: string;
  name: string;
  email: string;
  phone: string;
  bookingCount: number;
  finalAmount: number;
  totalAmount: number;
  createdBy: "Admin" | "Vendor";
  createdAt: string;
}

// customerId

export default function CustomersPage() {
  const router = useRouter()

  const {
    data: customers = [],
    isLoading,
    isError,
    refetch
  } = useCustomers();

  const {
    mutate: multiDeleteCustomers
  } = useBulkDeleteCustomers();

  const {
    data: tableColumnVisibility = {},
  } = useTableColumnVisibility("customers");

  const {
    mutate: updateTableColumnVisibility
  } = useUpdateTableColumnVisibility("customers");


  const [filters, setFilters] = useState({
    search: "",
    createdStartDate: '',
    createdEndDate: '',
  });


  const [sorting, setSorting] = useState<{ id: string; desc: boolean }[]>([])
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({})
  const [localColumnVisibility, setLocalColumnVisibility] = useState<Record<string, boolean>>({})
  const [isColumnVisibilityUpdated, setIsColumnVisibilityUpdated] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false)
  const [showFilters, setShowFilters] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [sortConfig, setSortConfig] = useState<{
    columnId: string | null;
    direction: "asc" | "desc" | null;
  }>({ columnId: null, direction: null });
  // Counters for metrics: total customers, total bookings, and total spent
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [totalBookings, setTotalBookings] = useState(0);
  const [totalSpent, setTotalSpent] = useState(0);

  const customerData = useMemo(() => {
    return customers.map(customer => ({
      ...customer,
      id: customer.customerId,
      totalAmount: customer.totalAmount,
    }));
  }, [customers]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleClear = () => {
    setFilters({
      search: "",
      createdStartDate: '',
      createdEndDate: '',
    });
    setSortConfig({ columnId: null, direction: null });
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
  

  const unFiltered = [...customerData].sort((a, b) => {
    const aCreatedAt = new Date(a.createdAt || "").getTime();
    const bCreatedAt = new Date(b.createdAt || "").getTime();
    return bCreatedAt - aCreatedAt; // Descending order
  });

  const applyFilters = () => {
    let filtered = [...unFiltered];

    if (filters.search) {
      filtered = filtered.filter((customer) =>
        customer.customerId?.toLowerCase().includes(filters.search.toLowerCase()) ||
        customer.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        customer.phone.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    if (filters.createdStartDate || filters.createdEndDate) {
      filtered = filtered.filter(customer => {
        const createdAtDate = new Date(customer.createdAt).setHours(0, 0, 0, 0);
        const startDate = filters.createdStartDate ? new Date(filters.createdStartDate).setHours(0, 0, 0, 0) : null;
        const endDate = filters.createdEndDate ? new Date(filters.createdEndDate).setHours(0, 0, 0, 0) : null;

        return (!startDate || createdAtDate >= startDate) && (!endDate || createdAtDate <= endDate);
      });
    }

    // Global sorting logic
    if (sortConfig.columnId && sortConfig.direction) {
      filtered.sort((a, b) => {
        const columnKey = sortConfig.columnId as keyof typeof a;
        const aValue = a[columnKey];
        const bValue = b[columnKey];

        // Handle null/undefined cases
        if (aValue == null) return sortConfig.direction === 'asc' ? 1 : -1;
        if (bValue == null) return sortConfig.direction === 'asc' ? -1 : 1;

        // Date comparison for date fields
        if (['startDate', 'endDate', 'createdAt'].includes(columnKey as string)) {
          const dateA = new Date(aValue as string).getTime();
          const dateB = new Date(bValue as string).getTime();
          return sortConfig.direction === 'asc' ? dateA - dateB : dateB - dateA;
        }

        // Numeric comparison for numeric fields
        if (typeof aValue === 'number' && typeof bValue === 'number') {
          return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
        }

        // String comparison for other fields
        const strA = String(aValue).toLowerCase();
        const strB = String(bValue).toLowerCase();
        return sortConfig.direction === 'asc'
          ? strA.localeCompare(strB)
          : strB.localeCompare(strA);
      });
    }

    return filtered;
  };

  const finalData = applyFilters();

  useEffect(() => {
    // Initialize totals
    let total = 0;
    let bookings = 0;
    let spent = 0;

    customers.forEach((customer) => {
      total += 1; // Count total customers
      bookings += customer.bookingCount; // Sum total bookings

      // Ensure totalAmount is a valid number
      const amount = Number(customer.totalAmount);
      if (!isNaN(amount)) {
        spent += amount; // Sum total spent
      } else {
        console.error("Invalid totalAmount:", customer.totalAmount);
      }
    });

    // Update state
    setTotalCustomers(total);
    setTotalBookings(bookings);
    setTotalSpent(spent);
  }, [customers]);

  // Handle bulk deletion from the table
  const handleBulkDelete = () => {
    const selectedIndices = Object.keys(rowSelection)
    const selectedIds = selectedIndices.map(index => {
      const customerId = finalData[parseInt(index)]?.customerId
      return customerId !== undefined ? customerId : null
    }).filter(id => id !== null)
    if (selectedIds.length === 0) return;
    setIsDialogOpen(true);
  };

  const confirmBulkDelete = async () => {
    const selectedIds = Object.keys(rowSelection);
    multiDeleteCustomers(selectedIds, {
      onSuccess: () => {
        toast.success("Customers deleted successfully!", {
          style: {
            backgroundColor: "#009F7F",
            color: "#fff",
          },
        });
        setIsDialogOpen(false);
        router.push("/admin/customers");
      },
      onError: (error: any) => {
        setIsDialogOpen(false);
        toast.error(error?.response?.data?.message || "Error deleting Customers!", {
          style: {
            backgroundColor: "#FF0000",
            color: "#fff",
          },
        });
      }
    });
  }

  const cancelBulkDelete = () => {
    setIsDialogOpen(false);
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

  const getFormattedCreatedDateRange = () => {
    const start = filters.createdStartDate ? new Date(filters.createdStartDate).toLocaleDateString() : '';
    const end = filters.createdEndDate ? new Date(filters.createdEndDate).toLocaleDateString() : '';
    return start && end ? `${start} - ${end}` : 'Pick a range';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <>
      <div className="space-y-6">
        <div className="rounded bg-white p-5 shadow">
          <div className="flex flex-col">
            <div className="flex justify-between items-center mb-5">
              <h1 className="text-3xl font-bold tracking-tight">Customers</h1>
              <div className="flex items-center gap-2">
                {/* {showFilters && <Button variant="outline" onClick={handleClear}>
                  Clear
                </Button>} */}
                <Button
                  variant="none"
                  className="text-[#009F7F] hover:bg-[#009F7F] hover:text-white"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  {showFilters ? "Hide Filters" : "Show Filters"}
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
                              Are you sure you want to delete {Object.keys(rowSelection).length} selected customers?
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
            <div className="flex justify-center gap-20 mt-4">
              {/* <Card className="w-[250px]">
              <CounterCard
                color="bg-[#D0DDD0]"
                icon={Activity}
                count={totalCustomers}
                label="Total Customers"
                cardSize="w-[180px] h-[90px]"
              />
            </Card> */}
              <Card className="relative overflow-hidden border-none bg-gradient-to-br from-emerald-50 to-teal-50 shadow-md w-[230px] h-[120px] transform transition duration-300 ease-in-out hover:scale-105">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 opacity-0 w-full" />
                <div className="h-[150PX] w-full">
                  <CounterCard
                    color="bg-emerald-100"
                    icon={Activity}
                    count={totalBookings.toLocaleString()}
                    label="Total Trip Completed"
                    cardSize="w-[200px] h-[90px]"
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
                    count={totalSpent}
                    label="Total Amount"
                    cardSize="w-[200px] h-[90px]"
                  />
                </div>
                <div className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-blue-500 to-indigo-500 transform scale-x-100" />
              </Card>
            </div>
            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 border-t-2 mt-4 p-3 pt-8">
                <div className="flex flex-col w-[230px]">
                  <Label className="text-sm font-medium leading-none">Search</Label>
                  <Input
                    id="search"
                    placeholder="Search customers"
                    value={filters.search}
                    onChange={(e) => handleFilterChange("search", e.target.value)}
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Created At</Label>
                  <DateRangeAccordion
                    label={getFormattedCreatedDateRange()}
                    startDate={filters.createdStartDate}
                    endDate={filters.createdEndDate}
                    onStartDateChange={(date: any) => handleFilterChange('createdStartDate', date)}
                    onEndDateChange={(date: any) => handleFilterChange('createdEndDate', date)}
                  />
                </div>
                <div className='flex justify-start items-center'>
                  <Button
                    className='mt-5 p-1 border-none bg-[#009F87] flex justify-center items-center w-28'
                    // variant="outline"
                    onClick={handleClear}
                  >
                    Clear
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
        {/* Data Table */}
        <div className="rounded bg-white shadow">
          <MaterialReactTable
            columns={columns as MRT_ColumnDef<any>[]}
            data={finalData}
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
    </>
  );
}