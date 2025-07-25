"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { columns } from "./columns";
import { Card } from 'components/ui/card'
import CounterCard from 'components/cards/CounterCard'
import { Button } from "components/ui/button";
import { Input } from "components/ui/input";
import { Label } from "components/ui/label";
import { Activity, Trash, ArrowDown, ArrowUp, Loader2, RefreshCcw } from "lucide-react";
import DateRangeAccordion from "components/others/DateRangeAccordion";
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
import { Select, SelectItem, SelectTrigger, SelectValue, SelectContent } from "components/ui/select";
import {
  useVendors,
  useBulkDeleteVendors
} from 'hooks/react-query/useVendor';
import { toast } from "sonner";
import {
  MRT_ColumnDef,
  MaterialReactTable
} from 'material-react-table'
import { useBackNavigation } from "hooks/navigation/useBackNavigation";

export default function VendorPage() {
  const router = useRouter();

  const {
    data: vendors = [],
    isLoading,
    refetch
  } = useVendors()

  const {
    mutate: bulkDeleteVendors
  } = useBulkDeleteVendors()

  const [filters, setFilters] = useState({
    search: "",
    creationDateStart: "",
    creationDateEnd: "",
    isActive: null,
  });

  const [lockBack, setLockBack] = useState(false);
  useBackNavigation(lockBack);
  const [sorting, setSorting] = useState<{ id: string; desc: boolean }[]>([])
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({})
  const [isSpinning, setIsSpinning] = useState(false)
  const [showFilters, setShowFilters] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [sortConfig, setSortConfig] = useState<{
    columnId: string | null;
    direction: "asc" | "desc" | null;
  }>({ columnId: null, direction: null });

  // Counter states based on the filtered vendor data
  const [totalVendors, setTotalVendors] = useState(0);
  const [activeVendors, setActiveVendors] = useState(0);
  const [inactiveVendors, setInactiveVendors] = useState(0);

  const vendorData = useMemo(() => {
    return vendors.map(vendor => ({
      ...vendor,
      id: vendor.vendorId
    }))
  }, [vendors])

  const unFiltered = [...vendorData].sort((a, b) => {
    const aCreatedAt = new Date(a.createdAt || "").getTime();
    const bCreatedAt = new Date(b.createdAt || "").getTime();
    return bCreatedAt - aCreatedAt;
  });

  const applyFilters = () => {
    let filtered = [...unFiltered];

    if (filters.search) {
      filtered = filtered.filter((vendor) =>
        vendor.vendorId?.toLowerCase().includes(filters.search.toLowerCase()) ||
        vendor.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        vendor.phone.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    if (filters.creationDateStart || filters.creationDateEnd) {
      filtered = filtered.filter((vendor) => {
        const created = new Date(vendor.createdAt).setHours(0, 0, 0, 0);
        const filterStart = filters.creationDateStart
          ? new Date(filters.creationDateStart).setHours(0, 0, 0, 0)
          : null;
        const filterEnd = filters.creationDateEnd
          ? new Date(filters.creationDateEnd).setHours(0, 0, 0, 0)
          : null;
        return (!filterStart || created >= filterStart) && (!filterEnd || created <= filterEnd);
      });
    }

    if (filters.isActive !== null && filters.isActive !== "") {
      const isActiveValue = filters.isActive === "true";
      filtered = filtered.filter(vendor => vendor.isLogin === isActiveValue);
    }
    if (sortConfig.columnId && sortConfig.direction) {
      filtered.sort((a, b) => {
        const aValue = (a as any)[sortConfig.columnId!];
        const bValue = (b as any)[sortConfig.columnId!];
        if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  };

  // Compute filtered vendors using useMemo for performance
  const filteredVendors = useMemo(() => applyFilters(), [vendorData, filters, sortConfig]);

  // Update the counter cards based on the filtered vendor data
  useEffect(() => {
    const total = filteredVendors.length;
    const activeCount = filteredVendors.filter((vendor) => vendor.isLogin).length;
    setTotalVendors(total);
    setActiveVendors(activeCount);
    setInactiveVendors(total - activeCount);
  }, [filteredVendors]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleClear = () => {
    setFilters({
      search: "",
      creationDateStart: "",
      creationDateEnd: "",
      isActive: null,
    });
    setSortConfig({ columnId: null, direction: null });
  };

  const getFormattedCreatedDateRange = () => {
    const start = filters.creationDateStart
      ? new Date(filters.creationDateStart).toLocaleDateString()
      : "";
    const end = filters.creationDateEnd
      ? new Date(filters.creationDateEnd).toLocaleDateString()
      : "";
    return start && end ? `${start} - ${end}` : "Created Date Range";
  };

  const handleBulkDelete = () => {
    const selectedIds = Object.keys(rowSelection);
    if (selectedIds.length === 0) return;
    setIsDialogOpen(true);

  };

  const confirmBulkDelete = async () => {
    const selectedIndices = Object.keys(rowSelection)
    const selectedIds = selectedIndices.map(index => {
      const vendorId = filteredVendors[parseInt(index)]?.vendorId
      return vendorId !== undefined ? vendorId : null
    }).filter(id => id !== null)
    bulkDeleteVendors(selectedIds, {
      onSuccess: (data: any) => {
        toast.success(data?.message || "Vendors deleted successfully!", {
          style: {
            backgroundColor: "#009F7F",
            color: "#fff",
          },
        });
        setIsDialogOpen(false);
        setTimeout(() => router.push("/admin/vendor"), 500);
      },
      onError: (error: any) => {
        setIsDialogOpen(false);
        toast.error(error?.response?.data?.message || "Error deleting Vendors!", {
          style: {
            backgroundColor: "#FF0000",
            color: "#fff",
          },
        });
      }
    });
  };

  const cancelBulkDelete = () => {
    setIsDialogOpen(false);
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
        <div className="rounded bg-white p-5 shadow ">
          <div className="flex flex-col ">
            <div className="flex justify-between items-center mb-5">
              <h1 className="text-2xl font-bold tracking-tight">Vendor Page</h1>
              <div className="flex items-center gap-2">
                <Button
                  className='bg-[rgb(0,159,127)]'
                  onClick={() => router.push('/admin/vendor/create')}
                >
                  Create Vendor
                </Button>
                {/* {showFilters && <Button variant="outline" onClick={handleClear}>
                  Clear
                </Button>} */}
                <Button
                  variant="none"
                  className='text-[#009F7F] hover:bg-[#009F7F] hover:text-white'
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
                        ({Object.keys(rowSelection).length})
                      </Button>

                      <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete {Object.keys(rowSelection).length} selected vendors?
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
            {/* Add counter cards here */}
            <div className="flex justify-center gap-5 mb-5">
              <Card className="relative overflow-hidden border-none bg-gradient-to-br from-emerald-50 to-teal-50 shadow-md w-[230px] h-[120px] transform transition duration-300 ease-in-out hover:scale-105">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 opacity-0 w-full" />
                <div className="h-[150PX] w-full">
                  <CounterCard
                    color="bg-emerald-100"
                    icon={Activity}
                    count={totalVendors}
                    label="Total Vendors"
                    className="relative z-10 p-6"
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
                    count={activeVendors}
                    label="Active Vendors"
                    cardSize="w-[180px] h-[90px]"
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
                    count={inactiveVendors}
                    label="Inactive Vendors"
                    cardSize="w-[180px] h-[90px]"
                  />
                </div>
                <div className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-purple-500 to-pink-500 transform scale-x-100" />
              </Card>
            </div>
          </div>
          {showFilters && (
            <React.Fragment>
              <div className="flex gap-8 items-center mt-4">
                <div className="flex flex-col w-[230px]">
                  <Label className="text-sm font-medium leading-none">Search</Label>
                  <Input
                    id="search"
                    placeholder="Search vendors"
                    value={filters.search}
                    onChange={(e) => handleFilterChange("search", e.target.value)}
                  />
                </div>
                <div className="flex flex-col w-[230px]">
                  <Label className="text-sm font-medium leading-none">Status</Label>
                  <div className='mt-1'>
                    <Select onValueChange={(value) => handleFilterChange('isActive', value)}>
                      <SelectTrigger id="isActive">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="true">Active</SelectItem>
                        <SelectItem value="false">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex flex-col w-[230px]">
                  <Label className="text-sm font-medium leading-none">Created Date Range</Label>
                  <DateRangeAccordion
                    label={getFormattedCreatedDateRange()}
                    startDate={filters.creationDateStart}
                    endDate={filters.creationDateEnd}
                    onStartDateChange={(date: any) => handleFilterChange("creationDateStart", date)}
                    onEndDateChange={(date: any) => handleFilterChange("creationDateEnd", date)}
                  />
                </div>
                <div className='flex justify-start items-center'>
                  <Button
                    className='mt-4 p-1 border-none bg-[#009F87] flex justify-center items-center w-28'
                    // variant="outline"
                    onClick={handleClear}
                    disabled={isLoading}
                  >
                    Clear
                  </Button>
                </div>
              </div>
            </React.Fragment>
          )}
        </div>
        {/* Data Table */}
        <div className="rounded bg-white shadow">
          <MaterialReactTable
            columns={columns as MRT_ColumnDef<any>[]}
            data={filteredVendors}
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
              placeholder: 'Search Vendors...',
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