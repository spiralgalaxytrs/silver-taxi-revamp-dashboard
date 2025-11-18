"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { columns } from "./columns";
import { Button } from "components/ui/button";
import { toast } from "sonner"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from 'components/ui/select';
import { Input } from "components/ui/input";
import { Label } from "components/ui/label";
import { Card } from "components/ui/card";
import CounterCard from "components/cards/CounterCard";
import { Activity, Trash, ArrowDown, ArrowUp, Loader2, RefreshCcw } from "lucide-react";
import DateRangeAccordion from "components/others/DateRangeAccordion";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogFooter
} from 'components/ui/alert-dialog';
import {
  useDrivers,
  useBulkDeleteDrivers
} from 'hooks/react-query/useDriver';
import {
  MaterialReactTable,
  type MRT_ColumnDef
} from 'material-react-table'
import DriverWalletRequest from "components/driver/DriverWalletRequest";
import {
  useTableColumnVisibility,
  useUpdateTableColumnVisibility
} from 'hooks/react-query/useImageUpload';


export default function DriversPage(): JSX.Element {
  const router = useRouter();

  // Pagination state
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  // Search and filter state
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('createdAt');
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('DESC');
  const [globalFilter, setGlobalFilter] = useState('');

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

  // adminId will be extracted from token by backend if not provided
  // You can pass it explicitly if available from your auth system
  const {
    data: driversData,
    isLoading,
    refetch
  } = useDrivers({
    enabled: true,
    page,
    limit,
    search: search || undefined,
    status: status || undefined,
    sortBy,
    sortOrder,
    // adminId is optional - backend extracts from token if not provided
  });

  // Extract drivers and pagination from response
  const drivers = driversData?.drivers || [];
  const paginationInfo = driversData?.pagination;

  const {
    mutate: bulkDeleteDrivers
  } = useBulkDeleteDrivers();

  const {
    data: tableColumnVisibility = {},
  } = useTableColumnVisibility("drivers");

  const {
    mutate: updateTableColumnVisibility
  } = useUpdateTableColumnVisibility("drivers");


  const [sorting, setSorting] = useState<{ id: string; desc: boolean }[]>([])
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({})
  const [isSpinning, setIsSpinning] = useState(false)
  const [showFilters, setShowFilters] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [localColumnVisibility, setLocalColumnVisibility] = useState<Record<string, boolean>>({})
  const [isColumnVisibilityUpdated, setIsColumnVisibilityUpdated] = useState(false);

  // Legacy filters for date range (if still needed)
  const [filters, setFilters] = useState({
    creationDateStart: '',
    creationDateEnd: ''
  });

  const driverData = useMemo(() => {
    return drivers.map(driver => ({
      ...driver,
      id: driver?.driverId ?? '',
      walletAmount: driver.wallet?.balance ?? 0
    }))
  }, [drivers]);

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


  // Apply client-side date filters only (search and status are server-side)
  const finalDrivers = useMemo(() => {
    let filtered = [...driverData];

    if (filters.creationDateStart || filters.creationDateEnd) {
      filtered = filtered.filter(driver => {
        const created = new Date(driver.createdAt).setHours(0, 0, 0, 0);
        const filterStart = filters.creationDateStart ? new Date(filters.creationDateStart).setHours(0, 0, 0, 0) : null;
        const filterEnd = filters.creationDateEnd ? new Date(filters.creationDateEnd).setHours(0, 0, 0, 0) : null;
        return (!filterStart || created >= filterStart) && (!filterEnd || created <= filterEnd);
      });
    }

    return filtered;
  }, [driverData, filters.creationDateStart, filters.creationDateEnd]);

  // Calculate counters from pagination info or filtered data
  const totalDrivers = paginationInfo?.totalCount || finalDrivers.length;
  const inactiveDrivers = useMemo(() => (
    finalDrivers.filter(driver => driver.isActive === false).length
  ), [finalDrivers]);
  const activeDrivers = totalDrivers - inactiveDrivers;

  const handleFilterChange = (key: string, value: string) => {
    if (key === 'search') {
      setSearch(value);
      // Reset to first page when search changes
      setPagination(prev => ({ ...prev, pageIndex: 0 }));
    } else if (key === 'status') {
      setStatus(value);
      // Reset to first page when status changes
      setPagination(prev => ({ ...prev, pageIndex: 0 }));
    } else {
      setFilters(prev => ({ ...prev, [key]: value }));
    }
  };

  const handleClear = () => {
    setSearch('');
    setGlobalFilter(''); // Clear table search
    setStatus('');
    setFilters({
      creationDateStart: '',
      creationDateEnd: ''
    });
    setPagination(prev => ({ ...prev, pageIndex: 0 }));
    setSortBy('createdAt');
    setSortOrder('DESC');
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
    const selectedIndices = Object.keys(rowSelection)
    const selectedIds = selectedIndices.map(index => {
      const driverId = finalDrivers[parseInt(index)]?.driverId
      return driverId !== undefined ? driverId : null
    }).filter(id => id !== null)
    try {
      bulkDeleteDrivers(selectedIds, {
        onSuccess: () => {
          toast.success("Drivers deleted successfully!", {
            style: {
              backgroundColor: "#009F7F",
              color: "#fff",
            },
          });
          setIsDialogOpen(false);
          router.push("/admin/drivers");
        },
        onError: (error: any) => {
          setIsDialogOpen(false);
          toast.error(error?.response?.data?.message || "Error deleting drivers!", {
            style: {
              backgroundColor: "#FF0000",
              color: "#fff",
            },
          });
        }
      });
    } catch (error: any) {
      setIsDialogOpen(false);
      toast.error(error?.response?.data?.message || "Error deleting drivers!", {
        style: {
          backgroundColor: "#FF0000",
          color: "#fff",
        },
      });
    }
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
    <React.Fragment>
      <div className="space-y-6">
        <div className="rounded bg-white p-5 shadow ">
          <div className="flex flex-col">
            <div className="flex justify-between items-center mb-5">
              <h1 className="text-3xl font-bold tracking-tight">Drivers</h1>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-3">
                  {/* <DriverWalletRequest /> */}
                  <Button
                    variant="none"
                    className="text-[#009F7F] hover:bg-[#009F7F] hover:text-white"
                    onClick={() => setShowFilters(!showFilters)}
                  >
                    {showFilters ? 'Hide Filters' : 'Show Filters'}
                    {showFilters ? <ArrowDown className="ml-2" /> : <ArrowUp className="ml-2" />}
                  </Button>
                </div>
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
                              Are you sure you want to delete {Object.keys(rowSelection).length} selected drivers?
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
            {/* Counter Cards and Filter Controls */}
            <div className="flex justify-center gap-5 mb-5">

              <Card className="relative overflow-hidden border-none bg-gradient-to-br from-emerald-50 to-teal-50 shadow-md w-[230px] h-[120px] transform transition duration-300 ease-in-out hover:scale-105">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 opacity-0 w-full" />
                <div className="h-[150PX] w-full">
                  <CounterCard
                    color="bg-emerald-100"
                    icon={Activity}
                    count={totalDrivers.toLocaleString()}
                    label="Total Drivers"
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
                    count={activeDrivers.toLocaleString()}
                    label="Active Drivers"
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
                    count={inactiveDrivers.toLocaleString()}
                    label="Inactive Drivers"
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
                    placeholder="Search drivers"
                    value={search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                  />
                </div>
                <div className="flex flex-col w-[230px]">
                  <Label className="text-sm font-medium leading-none">Status</Label>
                  <div className='mt-1'>
                    <Select onValueChange={(value) => handleFilterChange('status', value)} value={status}>
                      <SelectTrigger id="status">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
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
                    className='mt-5 p-1 border-none bg-[#009F87] flex justify-center items-center w-28'
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
            data={finalDrivers}
            enableRowSelection
            onRowSelectionChange={setRowSelection}
            state={{
              rowSelection,
              sorting,
              columnVisibility,
              pagination,
              globalFilter,
            }}
            onGlobalFilterChange={setGlobalFilter}
            manualFiltering={true} // Enable server-side filtering
            onColumnVisibilityChange={(newVisibility) => {
              setIsColumnVisibilityUpdated(true);
              setLocalColumnVisibility(newVisibility);
            }}
            // onSortingChange={handleSortingChange}
            enableSorting
            enableColumnPinning={false}
            // Server-side pagination
            manualPagination={true}
            onPaginationChange={setPagination}
            rowCount={paginationInfo?.totalCount || 0}
            initialState={{
              density: 'compact',
              pagination: { pageIndex: 0, pageSize: 10 },
              columnPinning: { right: ["actions"] },
              showGlobalFilter: true, // Enable global search
            }}
            muiSearchTextFieldProps={{
              placeholder: 'Search ...',
              variant: 'outlined',
              sx: {
                minWidth: '600px',
              },
            }}
            positionGlobalFilter="left"
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
