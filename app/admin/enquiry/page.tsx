"use client"

import React, { useState, useEffect, useMemo } from 'react'
import { toast } from "sonner"
import { MaterialReactTable, MRT_ColumnDef } from 'material-react-table'
import { Button } from 'components/ui/button'
import { Input } from 'components/ui/input'
import { Label } from 'components/ui/label'
import { RefreshCcw, ArrowDown, ArrowUp, Activity, Trash, Loader2 } from 'lucide-react'
import { useRouter, usePathname } from 'next/navigation'
import { columns } from './columns'
import DateRangeAccordion from 'components/others/DateRangeAccordion'
import { Card } from 'components/ui/card'
import dayjs from 'dayjs'
import CounterCard from 'components/cards/CounterCard'
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
} from 'components/ui/alert-dialog'
import {
  useEnquiries,
  useBulkDeleteEnquiries
} from 'hooks/react-query/useEnquiry'
import {
  useNavigationStore
} from 'stores/navigationStore'
import { useBackNavigation } from 'hooks/navigation/useBackNavigation'

export default function EnquiryPage() {
  const router = useRouter()
  const pathname = usePathname()
  const { previousPath } = useNavigationStore()

  const {
    data: enquiries = [],
    isLoading,
    error,
    refetch
  } = useEnquiries();
  const {
    mutate: bulkDeleteEnquiries
  } = useBulkDeleteEnquiries();

  const [filters, setFilters] = useState({
    search: '',
    vehicleType: '',
    status: '',
    serviceName: '',
    enquiryStartDate: '',
    enquiryEndDate: '',
    pickupStartDate: '',
    pickupEndDate: '',
    dropStartDate: '',
    dropEndDate: '',
  })

  const [lockBack, setLockBack] = useState(false);
  useBackNavigation(lockBack);
  const [sorting, setSorting] = useState<{ id: string; desc: boolean }[]>([])
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({})
  const [isSpinning, setIsSpinning] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [totalEnquiries, setTotalEnquiries] = useState(0)
  const [todayEnquiries, setTodayEnquiries] = useState(0)
  const [manualEnquiries, setManualEnquiries] = useState(0)
  const [websiteEnquiries, setWebsiteEnquiries] = useState(0)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const enquiryData = useMemo(() => {
    return enquiries.map((enquiry) => ({
      ...enquiry,
      id: enquiry.enquiryId,
      dropDate: enquiry.dropDate ? new Date(enquiry.dropDate) : null,
    }))
  }, [enquiries])


  const handleFilterChange = (key: string, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  const categorizeEnquiries = (enquiries: any[]) => {
    const today = dayjs().startOf('day')
    return enquiries.reduce(
      (acc, enquiry) => {
        const enquiryDate = enquiry.createdAt ? dayjs(enquiry.createdAt).startOf('day') : null
        acc.total = enquiries.length
        if (enquiryDate && enquiryDate.isSame(today, 'day')) {
          acc.today++
        }
        if (enquiry.type === 'Manual') {
          acc.manual++
        } else if (enquiry.type === 'Website') {
          acc.website++
        }
        return acc
      },
      { total: 0, today: 0, manual: 0, website: 0 }
    )
  }

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
        serviceName: '',
      })
      setSorting([])
      setRowSelection({})
    } catch (error) {
      console.error('Error refreshing data:', error)
    }
  }

  const unFilteredData = [...enquiryData].sort((a, b) => {
    const aCreatedAt = new Date(a.createdAt).getTime()
    const bCreatedAt = new Date(b.createdAt).getTime()
    return bCreatedAt - aCreatedAt
  })

  const applyFilters = () => {
    let filteredData = [...unFilteredData]

    if (filters.search) {
      filteredData = filteredData.filter((enquiry) =>
        enquiry.name?.toLowerCase().includes(filters.search.toLowerCase()) ||
        enquiry.enquiryId?.toLowerCase().includes(filters.search.toLowerCase()) ||
        enquiry.phone?.toLowerCase().includes(filters.search.toLowerCase()) ||
        enquiry.pickup?.toLowerCase().includes(filters.search.toLowerCase()) ||
        enquiry.drop?.toLowerCase().includes(filters.search.toLowerCase()) ||
        enquiry.serviceType?.toLowerCase().includes(filters.search.toLowerCase()) ||
        enquiry.type?.toLowerCase().includes(filters.search.toLowerCase()) ||
        enquiry.status?.toLowerCase().includes(filters.search.toLowerCase()) ||
        enquiry.createdBy?.toLowerCase().includes(filters.search.toLowerCase()) ||
        enquiry.createdAt?.toLowerCase().includes(filters.search.toLowerCase())
      )
    }

    if (filters.status && filters.status !== 'all') {
      filteredData = filteredData.filter((enquiry) =>
        enquiry.status?.toLowerCase() === filters.status.toLowerCase()
      )
    }

    if (filters.serviceName && filters.serviceName !== 'all') {
      filteredData = filteredData.filter((enquiry) =>
        enquiry.serviceType?.toLowerCase() === filters.serviceName.toLowerCase()
      )
    }

    if (filters.enquiryStartDate || filters.enquiryEndDate) {
      filteredData = filteredData.filter((enquiry) => {
        const enquiredDate = new Date(enquiry.pickupDateTime).setHours(0, 0, 0, 0)
        const startDate = filters.enquiryStartDate
          ? new Date(filters.enquiryStartDate).setHours(0, 0, 0, 0)
          : null
        const endDate = filters.enquiryEndDate
          ? new Date(filters.enquiryEndDate).setHours(0, 0, 0, 0)
          : null
        return (!startDate || enquiredDate >= startDate) && (!endDate || enquiredDate <= endDate)
      })
    }

    if (filters.pickupStartDate || filters.pickupEndDate) {
      filteredData = filteredData.filter((enquiry) => {
        const pickupDate = new Date(enquiry.pickupDateTime).setHours(0, 0, 0, 0)
        const startDate = filters.pickupStartDate
          ? new Date(filters.pickupStartDate).setHours(0, 0, 0, 0)
          : null
        const endDate = filters.pickupEndDate
          ? new Date(filters.pickupEndDate).setHours(0, 0, 0, 0)
          : null
        return (!startDate || pickupDate >= startDate) && (!endDate || pickupDate <= endDate)
      })
    }

    if (filters.dropStartDate || filters.dropEndDate) {
      filteredData = filteredData.filter((enquiry) => {
        const dropDate = enquiry.dropDate ? new Date(enquiry.dropDate).setHours(0, 0, 0, 0) : null
        const startDate = filters.dropStartDate
          ? new Date(filters.dropStartDate).setHours(0, 0, 0, 0)
          : null
        const endDate = filters.dropEndDate
          ? new Date(filters.dropEndDate).setHours(0, 0, 0, 0)
          : null
        return (!startDate || (dropDate && dropDate >= startDate)) && (!endDate || (dropDate && dropDate <= endDate))
      })
    }

    return filteredData
  }

  const filteredData = useMemo(() => applyFilters(), [filters, enquiryData])

  useEffect(() => {
    const counts = categorizeEnquiries(filteredData)
    setTotalEnquiries(counts.total)
    setTodayEnquiries(counts.today)
    setManualEnquiries(counts.manual)
    setWebsiteEnquiries(counts.website)
  }, [filteredData])

  const handleCreateEnquiry = () => {
    router.push('/admin/enquiry/create')
  }

  const getFormattedEnquiryDateRange = () => {
    const start = filters.enquiryStartDate ? new Date(filters.enquiryStartDate).toLocaleDateString() : ''
    const end = filters.enquiryEndDate ? new Date(filters.enquiryEndDate).toLocaleDateString() : ''
    return start && end ? `${start} - ${end}` : 'Pick a range'
  }

  const getFormattedDateRange = () => {
    const start = filters.pickupStartDate ? new Date(filters.pickupStartDate).toLocaleDateString() : ''
    const end = filters.pickupEndDate ? new Date(filters.pickupEndDate).toLocaleDateString() : ''
    return start && end ? `${start} - ${end}` : 'Pick a range'
  }

  const getFormattedDropDateRange = () => {
    const start = filters.dropStartDate ? new Date(filters.dropStartDate).toLocaleDateString() : ''
    const end = filters.dropEndDate ? new Date(filters.dropEndDate).toLocaleDateString() : ''
    return start && end ? `${start} - ${end}` : 'Pick a range'
  }

  const handleBulkDelete = () => {
    const selectedIndices = Object.keys(rowSelection)
    console.log("selectedIndices >> ", selectedIndices)
    if (selectedIndices.length === 0) return
    const selectedIds = selectedIndices.map(index => {
      const enquiryId = filteredData[parseInt(index)]?.enquiryId
      return enquiryId !== undefined ? enquiryId : null
    }).filter(id => id !== null)
    setIsDialogOpen(true)
  }

  const confirmBulkDelete = async () => {
    const selectedIndices = Object.keys(rowSelection)
    const selectedIds = selectedIndices.map(index => {
      const enquiryId = filteredData[parseInt(index)]?.enquiryId
      return enquiryId !== undefined ? enquiryId : null
    }).filter(id => id !== null)
    bulkDeleteEnquiries(selectedIds, {
      onSuccess: (data: any) => {
        setIsDialogOpen(false)
        const message = data?.message || "Enquiries deleted successfully";
        toast.success(message, {
          style: {
            backgroundColor: "#009F7F",
            color: "#fff",
          },
        });
        setTimeout(() => router.push("/admin/enquiry"), 2000)
      },
      onError: (error: any) => {
        setIsDialogOpen(false)
        toast.error(error?.response?.data?.message || "Error deleting enquiries!", {
          style: {
            backgroundColor: "#FF0000",
            color: "#fff",
          },
        })
      }
    })

  }

  const cancelBulkDelete = () => {
    setIsDialogOpen(false)
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <React.Fragment>
      <div className="p-6 space-y-6">
        <div className="rounded bg-white p-5 shadow">
          <div className="flex flex-col">
            <div className="flex items-center justify-between border-b-1 mb-5">
              <h1 className="text-2xl font-bold tracking-tight">Enquiry Page</h1>
              <div className="flex items-center gap-2">
                <Button
                  className="bg-[rgb(0,159,127)] inline-flex items-center justify-center flex-shrink-0 font-medium leading-none rounded-full outline-none transition duration-300 ease-in-out focus:outline-none focus:shadow text-white border border-solid border-accent hover:bg-[rgb(0,159,135)] hover:text-white hover:border-transparent px-5 py-0 h-12 text-[15px] lg:text-base w-full md:w-auto md:ms-6"
                  onClick={handleCreateEnquiry}
                >
                  Create Enquiry
                </Button>
                {showFilters && (
                  <Button
                    className="border-none hover:underline-offset-1 hover:bg-none"
                    variant="outline"
                    onClick={handleClear}
                    disabled={isLoading}
                  >
                    {isLoading ? "Refreshing..." : "Clear"}
                  </Button>
                )}
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
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-5">
            <Card className="relative overflow-hidden border-none bg-gradient-to-br from-emerald-50 to-teal-50 shadow-md w-[230px] h-[120px] transform transition duration-300 ease-in-out hover:scale-105">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 opacity-0 w-full" />
              <div className="h-[150px] w-full">
                <CounterCard
                  color="bg-emerald-100"
                  icon={Activity}
                  count={totalEnquiries}
                  label="Total Enquiries"
                  cardSize="w-[190px] h-[90px]"
                />
              </div>
              <div className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-emerald-500 to-teal-500 transform scale-x-100" />
            </Card>
            <Card className="relative overflow-hidden border-none bg-gradient-to-br from-blue-50 to-indigo-50 shadow-md w-[230px] h-[120px] transform transition duration-300 ease-in-out hover:scale-105">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 opacity-0 w-full" />
              <div className="h-[150px] w-full">
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
            <Card className="relative overflow-hidden border-none bg-gradient-to-br from-purple-50 to-pink-50 shadow-md w-[230px] h-[120px] transform transition duration-300 ease-in-out hover:scale-105">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 opacity-100 w-full" />
              <div className="h-[150px] w-full">
                <CounterCard
                  color="bg-purple-100"
                  icon={Activity}
                  count={manualEnquiries}
                  label="Manual Enquiries"
                  cardSize="w-[190px] h-[90px]"
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
                  count={websiteEnquiries}
                  label="Website Enquiries"
                  cardSize="w-[190px] h-[90px]"
                />
              </div>
              <div className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-orange-500 to-red-500 transform scale-x-100" />
            </Card>
          </div>
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 border-t-2 mt-4 p-3 pt-8">
              <div>
                <label
                  htmlFor="search"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
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
              <div>
                <Label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Enquiry At
                </Label>
                <DateRangeAccordion
                  label={getFormattedEnquiryDateRange()}
                  startDate={filters.enquiryStartDate}
                  endDate={filters.enquiryEndDate}
                  onStartDateChange={(date: any) => handleFilterChange('enquiryStartDate', date)}
                  onEndDateChange={(date: any) => handleFilterChange('enquiryEndDate', date)}
                />
              </div>
              <div>
                <Label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Pickup Date
                </Label>
                <DateRangeAccordion
                  label={getFormattedDateRange()}
                  startDate={filters.pickupStartDate}
                  endDate={filters.pickupEndDate}
                  onStartDateChange={(date: any) => handleFilterChange('pickupStartDate', date)}
                  onEndDateChange={(date: any) => handleFilterChange('pickupEndDate', date)}
                />
              </div>
              <div>
                <Label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Drop Date
                </Label>
                <DateRangeAccordion
                  label={getFormattedDropDateRange()}
                  startDate={filters.dropStartDate}
                  endDate={filters.dropEndDate}
                  onStartDateChange={(date: any) => handleFilterChange('dropStartDate', date)}
                  onEndDateChange={(date: any) => handleFilterChange('dropEndDate', date)}
                />
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
            state={{ rowSelection, sorting }}
            onSortingChange={setSorting}
            enableSorting
            initialState={{
              density: 'compact',
              pagination: { pageIndex: 0, pageSize: 10 },
              showGlobalFilter: true,
            }}
            muiSearchTextFieldProps={{
              placeholder: 'Search enquiries...',
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
    </React.Fragment>
  )
}