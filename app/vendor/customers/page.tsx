"use client";

import React, { useState, useEffect } from "react";
import { DataTable } from "components/others/DataTable";
import { columns } from "./columns";
import { Button } from "components/ui/button";
import { Input } from "components/ui/input";
import { Label } from "components/ui/label";
import { Card } from "components/ui/card";
import CounterCard from "components/cards/CounterCard";
import { Activity, Trash, ArrowDown, ArrowUp } from "lucide-react";
import DateRangeAccordion from "components/others/DateRangeAccordion";
import { useCustomerStore } from "stores/customerStore";
import {toast} from "sonner"
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

interface Customer {
  customerId?: string;
  name: string;
  email: string;
  phone: string;
  bookingCount: number;
  totalAmount: number;
  createdBy: "Admin" | "Vendor";
  createdAt: string;
}

// customerId

export default function CustomersPage() {
  const router = useRouter()
  const { customers, fetchVendorCustomers,multiDeleteCustomers } = useCustomerStore();
  const [filters, setFilters] = useState({
    search: "",
    createdStartDate: '',
    createdEndDate: '',
  });
  const [showFilters, setShowFilters] = useState(false);
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [sortConfig, setSortConfig] = useState<{
    columnId: string | null;
    direction: "asc" | "desc" | null;
  }>({ columnId: null, direction: null });


  useEffect(() => {
    fetchVendorCustomers();
  }, [fetchVendorCustomers]);

  // Counters for metrics: total customers, total bookings, and total spent
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [totalBookings, setTotalBookings] = useState(0);
  const [totalSpent, setTotalSpent] = useState(0);
  const [customerData, setCustomerData] = useState(
    customers.map(customer => ({
      ...customer,
      id: customer.customerId
    }))
  );

  useEffect(() => {
    async function fetchData() {
      setCustomerData(customers.map(customer => ({
        ...customer,
        id: customer.customerId,
        totalAmount:customer.totalAmount,
      })));
    }
    fetchData();
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

  const filteredCustomerData = customerData.filter((customer)=> customer.createdBy === 'Vendor');

  const unFiltered = [...filteredCustomerData].sort((a, b) => {
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
        if (['startDate', 'endDate', 'createdAt'].includes(columnKey)) {
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

  const handleSort = (columnId: string) => {
    setSortConfig((prev) => ({
      columnId,
      direction:
        prev.columnId === columnId && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  // Handle bulk deletion from the table
  const handleBulkDelete = () => {
    const selectedIds = Object.keys(rowSelection);
    if (selectedIds.length === 0) return;
    setIsDialogOpen(true);
  };

  const confirmBulkDelete = async () => {
    const selectedIds = Object.keys(rowSelection);
    await multiDeleteCustomers(selectedIds);
    const newData = finalData
      .filter(customer => !selectedIds.includes(customer.customerId ?? ''))
    // .map(customer => ({ ...customer, id: customer.customerId }));
    setCustomerData(newData);
    setRowSelection({});
    const status = useCustomerStore.getState().statusCode
    const message = useCustomerStore.getState().message
    if (status === 200 || status === 201) {
      toast.success("Customers deleted successfully!", {
        style: {
            backgroundColor: "#009F7F",
            color: "#fff",
        },
    });
      router.push("/vendor/customers");
    } else {
      toast.error(message || "Error deleting Customers!", {
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

  const getFormattedCreatedDateRange = () => {
    const start = filters.createdStartDate ? new Date(filters.createdStartDate).toLocaleDateString() : '';
    const end = filters.createdEndDate ? new Date(filters.createdEndDate).toLocaleDateString() : '';
    return start && end ? `${start} - ${end}` : 'Pick a range';
  };

  useEffect(() => {
  }, [customerData, filters, sortConfig]);

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
        </div>
        {/* Data Table */}
        <div className="rounded bg-white shadow">
          {finalData.length > 0 ? (
            <DataTable
              columns={columns}
              data={finalData}
              onSort={handleSort}
              sortConfig={sortConfig}
              rowSelection={rowSelection}
              onRowSelectionChange={setRowSelection}
            />
          ) : (
            <p className="h-24 text-center pt-10">No data available.</p>
          )}
        </div>
      </div>
    </>
  );
}