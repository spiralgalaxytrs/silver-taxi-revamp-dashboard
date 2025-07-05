"use client"

import React, { useState, useEffect } from 'react'
import { toast } from "sonner"
import { DataTable } from 'components/others/DataTable'
import { useRouter } from 'next/navigation'
import { columns } from './columns'
import { Button } from 'components/ui/button'
import { Input } from 'components/ui/input'
import { Label } from 'components/ui/label'
import { ListRestart, RotateCcw, ArrowDown, ArrowUp, Activity, Trash, Loader2 } from 'lucide-react';
import { useEnquiryStore } from 'stores/-enquiryStore'
import DateRangeAccordion from 'components/others/DateRangeAccordion';
import { Card } from 'components/ui/card';
import dayjs from 'dayjs'
import CounterCard from 'components/cards/CounterCard';
import { Select, SelectContent, SelectValue, SelectTrigger, SelectItem } from 'components/ui/select'
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

export default function EnquiryPage() {
  const router = useRouter()
  const { enquiries, fetchVendorEnquiries, isLoading, error, bulkDeleteEnquiries } = useEnquiryStore()
  const [filters, setFilters] = useState({
    search: '',
    vehicleType: '',
    status: '',
    enquiryStartDate: '',
    enquiryEndDate: '',
    pickupStartDate: '',
    pickupEndDate: '',
    dropStartDate: '',
    dropEndDate: '',
    serviceName: ''
  })

  // Global sorting state
  const [sortConfig, setSortConfig] = useState<{
    columnId: string | null;
    direction: 'asc' | 'desc' | null;
  }>({ columnId: null, direction: null });

  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});
  const [showFilters, setShowFilters] = useState(false);
  const [totalEnquiries, setTotalEnquiries] = useState(0);
  const [todayEnquiries, setTodayEnquiries] = useState(0);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const [enquiryData, setEnquiryData] = useState(
    enquiries.map((enquiry) => ({
      ...enquiry,
      id: enquiry.enquiryId,
      dropDate: enquiry.dropDate ? new Date(enquiry.dropDate) : null,
    }))
  )

  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  // Add this function to categorize enquiries
  const categorizeEnquiries = (enquiries: any[]) => {
    const today = dayjs().startOf('day'); // Use dayjs to get today's date

    return enquiries.reduce(
      (acc, enquiry) => {
        const enquiryDate = enquiry.createdAt ? dayjs(enquiry.createdAt).startOf('day') : null;

        // Count total
        acc.total = enquiries.length; // Set total enquiries using the length of the enquiries array

        // Count today's enquiries
        if (enquiryDate && enquiryDate.isSame(today, 'day')) { // Check if enquiry date is today
          acc.today++;
        }

        return acc;
      },
      { total: 0, today: 0 }
    );
  };

  useEffect(() => {
    fetchVendorEnquiries()
  }, [])

  useEffect(() => {
    setEnquiryData(
      enquiries.map((enquiry) => ({
        ...enquiry,
        id: enquiry.enquiryId,
        dropDate: enquiry.dropDate ? new Date(enquiry.dropDate) : null,
      }))
    );
  }, [enquiries]);

  const handleClear = async () => {
    try {
      setFilters({
        search: '',
        vehicleType: '',
        enquiryStartDate: '',
        enquiryEndDate: '',
        pickupStartDate: '',
        pickupEndDate: '',
        dropStartDate: '',
        dropEndDate: '',
        status: '',
        serviceName: ''
      })
      setSortConfig({ columnId: null, direction: null });
    } catch (error) {
      console.error('Error refreshing data:', error)
    }
  }

  const filteredCustomerData = enquiryData.filter(enquiry => enquiry.createdBy === 'Vendor');

  const unFilteredData = [...filteredCustomerData].sort((a, b) => {
    const aCreatedAt = new Date(a.createdAt).getTime();
    const bCreatedAt = new Date(b.createdAt).getTime();
    return bCreatedAt - aCreatedAt;
  });

  const applyFilters = () => {
    let filteredData = [...unFilteredData]

    if (filters.search) {
      filteredData = filteredData.filter(enquiry =>
        enquiry.name?.toLowerCase().includes(filters.search.toLowerCase()) ||
        enquiry.enquiryId?.toLowerCase().includes(filters.search.toLowerCase()) ||
        enquiry.phone.toLowerCase().includes(filters.search.toLowerCase()) ||
        enquiry.pickup.toLowerCase().includes(filters.search.toLowerCase()) ||
        enquiry.drop.toLowerCase().includes(filters.search.toLowerCase()) ||
        enquiry.serviceType.toLowerCase().includes(filters.search.toLowerCase()) ||
        enquiry.type.toLowerCase().includes(filters.search.toLowerCase()) ||
        enquiry.status.toLowerCase().includes(filters.search.toLowerCase()) ||
        enquiry.createdBy.toLowerCase().includes(filters.search.toLowerCase()) ||
        enquiry.createdAt.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    if (filters.status && filters.status !== "all") {
      filteredData = filteredData.filter(enquiry =>
        enquiry.status?.toLowerCase() === filters.status.toLowerCase()
      );
    }

    if (filters.serviceName && filters.serviceName !== "all") {
      filteredData = filteredData.filter(enquiry =>
        enquiry.serviceType?.toLowerCase() === filters.serviceName.toLowerCase()
      );
    }

    if (filters.enquiryStartDate || filters.enquiryEndDate) {
      filteredData = filteredData.filter(enquiry => {
        const enquiredDate = new Date(enquiry.pickupDateTime).setHours(0, 0, 0, 0);
        const startDate = filters.enquiryStartDate ? new Date(filters.enquiryStartDate).setHours(0, 0, 0, 0) : null;
        const endDate = filters.enquiryEndDate ? new Date(filters.enquiryEndDate).setHours(0, 0, 0, 0) : null;

        return (!startDate || enquiredDate >= startDate) && (!endDate || enquiredDate <= endDate);
      });
    }

    if (filters.pickupStartDate || filters.pickupEndDate) {
      filteredData = filteredData.filter(enquiry => {
        const pickupDate = new Date(enquiry.pickupDateTime).setHours(0, 0, 0, 0);
        const startDate = filters.pickupStartDate ? new Date(filters.pickupStartDate).setHours(0, 0, 0, 0) : null;
        const endDate = filters.pickupEndDate ? new Date(filters.pickupEndDate).setHours(0, 0, 0, 0) : null;

        return (!startDate || pickupDate >= startDate) && (!endDate || pickupDate <= endDate);
      });
    }

    if (filters.dropStartDate || filters.dropEndDate) {
      filteredData = filteredData.filter(enquiry => {
        const dropDate = enquiry.dropDate ? new Date(enquiry.dropDate).setHours(0, 0, 0, 0) : null;
        const startDate = filters.dropStartDate ? new Date(filters.dropStartDate).setHours(0, 0, 0, 0) : null;
        const endDate = filters.dropEndDate ? new Date(filters.dropEndDate).setHours(0, 0, 0, 0) : null;

        return (!startDate || (dropDate && dropDate >= startDate)) && (!endDate || (dropDate && dropDate <= endDate));
      });
    }

    // Fix sorting logic to match IP Tracking page's implementation
    if (sortConfig.columnId && sortConfig.direction) {
      filteredData = [...filteredData].sort((a, b) => {
        const aValue = a[sortConfig.columnId as keyof typeof a];
        const bValue = b[sortConfig.columnId as keyof typeof b];

        // Handle null/undefined cases
        if (aValue == null) return 1;
        if (bValue == null) return -1;

        // Numeric comparison for numeric fields
        if (typeof aValue === 'number' && typeof bValue === 'number') {
          return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
        }

        // Date comparison for date fields
        if (aValue instanceof Date && bValue instanceof Date) {
          return sortConfig.direction === 'asc'
            ? aValue.getTime() - bValue.getTime()
            : bValue.getTime() - aValue.getTime();
        }

        // Default to string comparison
        return sortConfig.direction === 'asc'
          ? String(aValue).localeCompare(String(bValue))
          : String(bValue).localeCompare(String(aValue));
      });
    }

    return filteredData;
  }

  const filteredData = applyFilters()

  useEffect(() => {
    const counts = categorizeEnquiries(filteredData);
    setTotalEnquiries(counts.total);
    setTodayEnquiries(counts.today);
  }, [filteredData]);

  const handleSort = (columnId: string) => {
    setSortConfig(prev => ({
      columnId,
      direction: prev.columnId === columnId && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  useEffect(() => {
    fetchVendorEnquiries();

    const intervalId = setInterval(() => {
      applyFilters();
    }, 180000);

    return () => clearInterval(intervalId);
  }, [fetchVendorEnquiries])


  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    )
  }

  // if (error) {
  //   return <div>Error: {error}</div>
  // }

  const handleCreateEnquiry = () => {
    router.push('/vendor/enquiry/create')
  }

  const handleRefresh = async () => {
    await handleClear();
    await fetchVendorEnquiries();
  };

  const getFormattedEnquiryDateRange = () => {
    const start = filters.enquiryStartDate ? new Date(filters.enquiryStartDate).toLocaleDateString() : '';
    const end = filters.enquiryEndDate ? new Date(filters.enquiryEndDate).toLocaleDateString() : '';
    return start && end ? `${start} - ${end}` : 'Pick a range';
  };

  const getFormattedDateRange = () => {
    const start = filters.pickupStartDate ? new Date(filters.pickupStartDate).toLocaleDateString() : '';
    const end = filters.pickupEndDate ? new Date(filters.pickupEndDate).toLocaleDateString() : '';
    return start && end ? `${start} - ${end}` : 'Pick a range';
  };

  const getFormattedDropDateRange = () => {
    const start = filters.dropStartDate ? new Date(filters.dropStartDate).toLocaleDateString() : '';
    const end = filters.dropEndDate ? new Date(filters.dropEndDate).toLocaleDateString() : '';
    return start && end ? `${start} - ${end}` : 'Pick a range';
  };

  const handleBulkDelete = () => {
    const selectedIds = Object.keys(rowSelection);
    if (selectedIds.length === 0) return;
    setIsDialogOpen(true);
  };

  const confirmBulkDelete = async () => {
    const selectedIds = Object.keys(rowSelection);
    await bulkDeleteEnquiries(selectedIds);
    const newData = filteredData
      .filter(enquiry => !selectedIds.includes(enquiry.enquiryId || ''))
      .map(enquiry => ({ ...enquiry, id: enquiry.enquiryId }));
    setEnquiryData(newData);
    setRowSelection({});
    const status = useEnquiryStore.getState().statusCode
    const message = useEnquiryStore.getState().message
    if (status === 200 || status === 201) {
      toast.success("Enquiries deleted successfully");
      router.push("/vendor/enquiry");
    } else {
      toast.error(message || "Error deleting Enquiries", {
        style: {
            backgroundColor: "#FF0000",
            color: "#fff",
        },
    });
    }
    setIsDialogOpen(false);
  };

  const cancelBulkDelete = () => {
    setIsDialogOpen(false);
  };

  return (
    <React.Fragment>
      <div className="p-6 space-y-6">
        <div className="rounded bg-white p-5 shadow ">
          <div className="flex flex-col">
            <div className="flex items-center justify-between  border-b-1 mb-5">
              <h1 className="text-2xl font-bold tracking-tight">Enquiry Page</h1>
              <div className="flex items-center gap-2">
                <Button
                  className='bg-[rgb(0,159,127)] inline-flex items-center justify-center flex-shrink-0 font-medium leading-none rounded-full outline-none transition duration-300 ease-in-out focus:outline-none focus:shadow text-white border border-solid border-accent hover:bg-[rgb(0,159,135)] hover:text-white hover:border-transparent px-5 py-0 h-12 text-[15px] lg:text-bas w-full md:w-auto md:ms-6'
                  onClick={handleCreateEnquiry}
                >
                  Create Enquiry
                </Button>
                {/* {showFilters && <Button
                  className=' border-none hover:underline-offset-1 hover:bg-none'
                  variant="outline"
                  onClick={handleClear}
                  disabled={isLoading}
                >
                  {isLoading ? "Refreshing..." : "Clear"}
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
                            Are you sure you want to delete {Object.keys(rowSelection).length} selected enquiries?
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
                {/* <Button
              variant="outline"
              onClick={handleRefresh}
              disabled={isLoading}
            >
              {isLoading ? (<RotateCcw />) : (<ListRestart />)}
            </Button> */}
              </div>
            </div>
          </div>
          {/* Counter Cards */}
          <div className="flex  justify-self-center gap-20 mb-5">
            <Card className="relative overflow-hidden border-none bg-gradient-to-br from-emerald-50 to-teal-50 shadow-md w-[230px] h-[120px] transform transition duration-300 ease-in-out hover:scale-105">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 opacity-0 w-full" />
              <div className="h-[150PX] w-full">
                <CounterCard
                  color="bg-emerald-100"
                  icon={Activity}
                  count={totalEnquiries}
                  label="Enquiries"
                  cardSize="w-[190px] h-[90px]"
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
                  count={todayEnquiries}
                  label="Today's Enquiries"
                  cardSize="w-[190px] h-[90px]"
                />
              </div>
              <div className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-blue-500 to-indigo-500 transform scale-x-100" />
            </Card>
          </div>
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 border-t-2 mt-4 p-3 pt-8">
              <div>
                <label htmlFor="search" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Search
                </label>
                <Input
                  id="search"
                  placeholder="Search in enquiries"
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="status">Select Status</Label>
                <Select onValueChange={(value) => handleFilterChange('status', value)}>
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="fake">Fake</SelectItem>
                    <SelectItem value="current">Current</SelectItem>
                    <SelectItem value="future">Future</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="serviceName">Select ServiceName</Label>
                <Select onValueChange={(value) => handleFilterChange('serviceName', value)}>
                  <SelectTrigger id="serviceName">
                    <SelectValue placeholder="Select serviceName" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Services</SelectItem>
                    <SelectItem value="One Way">One way</SelectItem>
                    <SelectItem value="Round Trip">Round Trip</SelectItem>
                    <SelectItem value="Airport">Airport</SelectItem>
                    <SelectItem value="Package">Package</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {/* <div>
          <Label htmlFor="vehicleType">Vehicle Type</Label>
          <Select onValueChange={(value) => handleFilterChange('vehicleType', value)}>
            <SelectTrigger id="vehicleType">
              <SelectValue placeholder="Select vehicle type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Sedan">Sedan</SelectItem>
              <SelectItem value="SUV">SUV</SelectItem>
              <SelectItem value="Van">Van</SelectItem>
            </SelectContent>
          </Select>
          </div> */}

              <div>
                <Label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Enquiry At</Label>
                <DateRangeAccordion
                  label={getFormattedEnquiryDateRange()}
                  startDate={filters.enquiryStartDate}
                  endDate={filters.enquiryEndDate}
                  onStartDateChange={(date: any) => handleFilterChange('enquiryStartDate', date)}
                  onEndDateChange={(date: any) => handleFilterChange('enquiryEndDate', date)}
                />
              </div>
              <div>
                <Label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Pickup Date</Label>
                <DateRangeAccordion
                  label={getFormattedDateRange()}
                  startDate={filters.pickupStartDate}
                  endDate={filters.pickupEndDate}
                  onStartDateChange={(date: any) => handleFilterChange('pickupStartDate', date)}
                  onEndDateChange={(date: any) => handleFilterChange('pickupEndDate', date)}
                />
              </div>
              <div>
                <Label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Drop Date</Label>
                <DateRangeAccordion
                  label={getFormattedDropDateRange()}
                  startDate={filters.dropStartDate}
                  endDate={filters.dropEndDate}
                  onStartDateChange={(date: any) => handleFilterChange('dropStartDate', date)}
                  onEndDateChange={(date: any) => handleFilterChange('dropEndDate', date)}
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
          )}
        </div>
        <div className="rounded bg-white shadow ">
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
    </React.Fragment>
  )
}