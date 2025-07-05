"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DataTable } from 'components/others/DataTable';
import { columns } from './columns'; // Adjust the type as needed.
import { Button } from 'components/ui/button';
import { Input } from 'components/ui/input';
import { Label } from 'components/ui/label';
import { Card } from 'components/ui/card';
import CounterCard from 'components/cards/CounterCard';
import { ArrowDown, ArrowUp, Trash, Activity } from 'lucide-react';
import DateRangeAccordion from 'components/others/DateRangeAccordion';
import { useSpecialPackageStore } from 'stores/-PermitChargesStore';
import { toast } from "sonner"
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

export default function AllIncludingPackagesPage() {
  const router = useRouter();
  const { fetchSpecialPackage, deletePackage, specialPackage, bulkDeleteSpecialPackage, isLoading, error } = useSpecialPackageStore();
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});
  const [showFilters, setShowFilters] = useState(false);
  const [totalPackages, setTotalPackages] = useState(0);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const [data, setData] = useState(
    (specialPackage || []).map(pkg => ({ ...pkg, id: pkg.permitId }))
  );

  const [sortConfig, setSortConfig] = useState<{
    columnId: string | null;
    direction: 'asc' | 'desc' | null;
  }>({ columnId: null, direction: null });

  const [filters, setFilters] = useState({
    search: '',
    createdStartDate: '',
    createdEndDate: '',
  });
  useEffect(() => {
    fetchSpecialPackage();
  }, [fetchSpecialPackage]);

  // Update total packages when data loads
  useEffect(() => {
    setTotalPackages((specialPackage || []).length);
  }, [specialPackage]);

  useEffect(() => {
    setData(
      (specialPackage || []).map(pkg => ({ ...pkg, id: pkg.permitId }))
    )
  }, [specialPackage])

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleClear = () => {
    setFilters({
      search: '',
      createdStartDate: '',
      createdEndDate: '',
    });
    setSortConfig({ columnId: null, direction: null });
  };

  const unFilteredData = [...data].sort((a, b) => {
    const aCreatedAt = new Date(a.createdAt || "").getTime();
    const bCreatedAt = new Date(b.createdAt || "").getTime();
    return bCreatedAt - aCreatedAt; // Descending order
  });

  const applyFilters = () => {
    let filteredData = [...unFilteredData];
    if (filters.search) {
      filteredData = filteredData.filter(pkg =>
        pkg.permitId.toLowerCase().includes(filters.search.toLowerCase()) || 
        pkg.origin.toLowerCase().includes(filters.search.toLowerCase()) ||
        pkg.destination.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    // Filter by createdAt date range.
    if (filters.createdStartDate || filters.createdEndDate) {
      filteredData = filteredData.filter(pkg => {
        const createdDate = new Date(pkg.createdAt || '').setHours(0, 0, 0, 0);
        const startDate = filters.createdStartDate
          ? new Date(filters.createdStartDate).setHours(0, 0, 0, 0)
          : null;
        const endDate = filters.createdEndDate
          ? new Date(filters.createdEndDate).setHours(0, 0, 0, 0)
          : null;
        return (!startDate || createdDate >= startDate) && (!endDate || createdDate <= endDate);
      });
    }

    // Updated sorting logic with proper type handling
    if (sortConfig.columnId && sortConfig.direction) {
      filteredData = [...filteredData].sort((a, b) => {
        const aValue = a[sortConfig.columnId as keyof typeof a];
        const bValue = b[sortConfig.columnId as keyof typeof b];

        // Handle null/undefined cases
        if (aValue == null) return 1;
        if (bValue == null) return -1;

        // Numeric comparison (for fields like amount)
        if (typeof aValue === 'number' && typeof bValue === 'number') {
          return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
        }

        // Date comparison (for createdAt field)
        if (sortConfig.columnId === 'createdAt') {
          const dateA = new Date(aValue as string).getTime();
          const dateB = new Date(bValue as string).getTime();
          return sortConfig.direction === 'asc' ? dateA - dateB : dateB - dateA;
        }

        // Default string comparison
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

  const handleSort = (columnId: string) => {
    setSortConfig(prev => ({
      columnId,
      direction: prev.columnId === columnId && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const handleBulkDelete = async () => {
    const selectedIds = Object.keys(rowSelection);
    if (selectedIds.length === 0) return;
    setIsDialogOpen(true);
  };

  const confirmBulkDelete = async () => {
    const selectedIds = Object.keys(rowSelection);
    await bulkDeleteSpecialPackage(selectedIds);
    const newData = data.filter(pkg => !selectedIds.includes(pkg.permitId));
    setData(newData);
    setRowSelection({});
    const status = useSpecialPackageStore.getState().statusCode
    if (status === 200 || status === 201) {
      toast.success("Package deleted successfully!");
      router.push("/admin/special-packages");
    } else {
      toast.error("Error deleting package!");
    }
    setIsDialogOpen(false);
  };

  const cancelBulkDelete = () => {
    setIsDialogOpen(false);
  }

  const handleCreatePackage = () => {
    router.push('/admin/special-packages/create');
  };

  const getFormattedCreatedDateRange = () => {
    const start = filters.createdStartDate
      ? new Date(filters.createdStartDate).toLocaleDateString()
      : '';
    const end = filters.createdEndDate
      ? new Date(filters.createdEndDate).toLocaleDateString()
      : '';
    return start && end ? `${start} - ${end}` : 'Pick a range';
  };

  return (
    <div className="space-y-6">
      <div className="rounded bg-white p-5 shadow">
        <div className="flex flex-col">
          <div className="flex justify-between items-center mb-5">
            <h1 className="text-2xl font-bold tracking-tight">
              Special Packages
            </h1>
            <div className="flex items-center gap-2">
              <Button
                className="bg-[rgb(0,159,127)]"
                onClick={handleCreatePackage}
              >
                Create Package
              </Button>
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
                      <Trash className="h-4 w-4" /> (
                      {Object.keys(rowSelection).length})
                    </Button>

                    <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete {Object.keys(rowSelection).length} selected packages?
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
          {/* Counter Card */}
          <div className="flex justify-center gap-4 mb-5">
            <Card className="relative overflow-hidden border-none bg-gradient-to-br from-emerald-50 to-teal-50 shadow-md w-[230px] h-[120px] transform transition duration-300 ease-in-out hover:scale-105">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 opacity-0 w-full" />
              <div className="h-[150PX] w-full">
                <CounterCard
                  color="bg-emerald-100"
                  icon={Activity}
                  count={totalPackages}
                  label="Total Packages"
                  cardSize="w-[180px] h-[90px]"
                />
              </div>
              <div className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-emerald-500 to-teal-500 transform scale-x-100" />
            </Card>
          </div>
        </div>
        {showFilters && (
          <div className="flex gap-8 items-center mt-4">
            <div className="flex flex-col w-[230px]">
              <Label className="text-sm font-medium">Search</Label>
              <Input
                id="search"
                placeholder="Search packages"
                value={filters.search}
                onChange={(e) =>
                  handleFilterChange("search", e.target.value)
                }
              />
            </div>
            <div className="flex flex-col w-[230px]">
              <Label className="text-sm font-medium">Created At</Label>
              <DateRangeAccordion
                label={getFormattedCreatedDateRange()}
                startDate={filters.createdStartDate}
                endDate={filters.createdEndDate}
                onStartDateChange={(date: any) =>
                  handleFilterChange("createdStartDate", date)
                }
                onEndDateChange={(date: any) =>
                  handleFilterChange("createdEndDate", date)
                }
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
        )}
      </div>
      <div className="rounded bg-white shadow">
        <DataTable
          columns={columns}
          data={filteredData as any}
          onSort={handleSort}
          sortConfig={sortConfig}
          rowSelection={rowSelection}
          onRowSelectionChange={setRowSelection}
        />
      </div>
    </div>
  );
}