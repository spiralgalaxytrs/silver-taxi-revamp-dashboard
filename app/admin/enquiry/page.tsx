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
import {
  useTableColumnVisibility,
  useUpdateTableColumnVisibility
} from 'hooks/react-query/useImageUpload';
import { Enquiry } from 'types/react-query/enquiry'

export default function EnquiryPage() {
  const router = useRouter()

  // Pagination state
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  // Search and filter state
  const [search, setSearch] = useState('');
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

  const {
    data: enquiriesData = { enquiries: [], enquiriesCount: { total: 0, today: 0, manual: 0, website: 0 }, pagination: { currentPage: 1, totalPages: 1, totalCount: 0, hasNext: false, hasPrev: false, limit: 10 } },
    isPending,
    error,
    refetch
  } = useEnquiries({
    page,
    limit,
    search: search || undefined,
  });
  const {
    mutate: bulkDeleteEnquiries
  } = useBulkDeleteEnquiries();

  const {
    data: tableColumnVisibility = {},
  } = useTableColumnVisibility("enquiries");

  const {
    mutate: updateTableColumnVisibility
  } = useUpdateTableColumnVisibility("enquiries");

  // Handle API typo: backend returns "enquires" instead of "enquiries"
  const enquiries = (enquiriesData.enquiries || (enquiriesData as any).enquires || []) as Enquiry[]
  const enquiriesCount = enquiriesData.enquiriesCount
  const paginationInfo = enquiriesData.pagination

  // Reset pagination when status filter changes
  useEffect(() => {
    setPagination(prev => ({ ...prev, pageIndex: 0 }));
  }, [filters.status]);

  const [sorting, setSorting] = useState<{ id: string; desc: boolean }[]>([])
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({})
  const [isSpinning, setIsSpinning] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [localColumnVisibility, setLocalColumnVisibility] = useState<Record<string, boolean>>({})
  const [isColumnVisibilityUpdated, setIsColumnVisibilityUpdated] = useState(false);
  
  const enquiryData = useMemo(() => {
    const mapped = enquiries.map((enquiry: Enquiry) => ({
      ...enquiry,
      id: enquiry.enquiryId,
      dropDate: enquiry.dropDate ? new Date(enquiry.dropDate) : null,
    }))
    return mapped;
  }, [enquiries])

  // Use server-side counts if available, otherwise calculate from filtered data
  const totalEnquiries = enquiriesCount?.total || 0
  const todayEnquiries = enquiriesCount?.today || 0
  const manualEnquiries = enquiriesCount?.manual || 0
  const websiteEnquiries = enquiriesCount?.website || 0

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


  const handleCreateEnquiry = () => {
    router.push('/admin/enquiry/create')
  }

  const handleBulkDelete = () => {
    const selectedIndices = Object.keys(rowSelection)
    console.log("selectedIndices >> ", selectedIndices)
    if (selectedIndices.length === 0) return
    const selectedIds = selectedIndices.map(index => {
      const enquiryId = enquiryData[parseInt(index)]?.enquiryId
      return enquiryId !== undefined ? enquiryId : null
    }).filter(id => id !== null)
    setIsDialogOpen(true)
  }

  const confirmBulkDelete = async () => {
    const selectedIndices = Object.keys(rowSelection)
    const selectedIds = selectedIndices.map(index => {
      const enquiryId = enquiryData[parseInt(index)]?.enquiryId
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

  if (isPending) {
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
                {/* <Button
                  className="bg-[rgb(0,159,127)] inline-flex items-center justify-center flex-shrink-0 font-medium leading-none rounded-full outline-none transition duration-300 ease-in-out focus:outline-none focus:shadow text-white border border-solid border-accent hover:bg-[rgb(0,159,135)] hover:text-white hover:border-transparent px-5 py-0 h-12 text-[15px] lg:text-base w-full md:w-auto md:ms-6"
                  onClick={handleCreateEnquiry}
                >
                  Create Enquiry
                </Button> */}
                {/* <Button
                  variant="none"
                  className="text-[#009F7F] hover:bg-[#009F7F] hover:text-white"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  {showFilters ? 'Hide Filters' : 'Show Filters'}
                  {showFilters ? <ArrowDown className="ml-2" /> : <ArrowUp className="ml-2" />}
                </Button> */}
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5">
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
            {/* <Card className="relative overflow-hidden border-none bg-gradient-to-br from-purple-50 to-pink-50 shadow-md w-[230px] h-[120px] transform transition duration-300 ease-in-out hover:scale-105">
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
            </Card> */}
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
        </div>
        <div className="rounded bg-white shadow">
          <MaterialReactTable
            columns={columns as MRT_ColumnDef<any>[]}
            data={enquiryData}
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
              
              console.log(newPagination);
              console.log(pagination);
              console.log(paginationInfo?.hasNext);
              console.log(paginationInfo?.hasPrev);
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
  )
}