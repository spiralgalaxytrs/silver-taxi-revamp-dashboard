"use client"


import { columns } from './columns';
import { Button } from 'components/ui/button';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useMemo } from 'react';
import { ArrowDown, ArrowUp, Activity, Trash, Loader2, RefreshCcw } from 'lucide-react';
import { Input } from 'components/ui/input';
import { Label } from 'components/ui/label';
import { Card } from 'components/ui/card';
import CounterCard from 'components/cards/CounterCard';
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
import DateRangeAccordion from 'components/others/DateRangeAccordion';
import { useOfferStore } from 'stores/-offerStore';
import { toast } from "sonner";
import {
    MRT_ColumnDef,
    MaterialReactTable
} from 'material-react-table';
import { useBackNavigation } from 'hooks/navigation/useBackNavigation'
import {
    useTableColumnVisibility,
    useUpdateTableColumnVisibility
} from 'hooks/react-query/useImageUpload';

export default function OffersPage() {

    const router = useRouter();
    const { offers, fetchOffers, multiDeleteOffers, isLoading } = useOfferStore();

    const {
        data: tableColumnVisibility = {},
    } = useTableColumnVisibility("offers");

    const {
        mutate: updateTableColumnVisibility
    } = useUpdateTableColumnVisibility("offers");
    const [lockBack, setLockBack] = useState(false);
    useBackNavigation(lockBack);
    const [sorting, setSorting] = useState<{ id: string; desc: boolean }[]>([])
    const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({})
    const [isSpinning, setIsSpinning] = useState(false)
    const [totalOffers, setTotalOffers] = useState(0);
    const [todayOffers, setTodayOffers] = useState(0);
    const [activeOffers, setActiveOffers] = useState(0);
    const [inactiveOffers, setInactiveOffers] = useState(0)
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [localColumnVisibility, setLocalColumnVisibility] = useState<Record<string, boolean>>({})
    const [isColumnVisibilityUpdated, setIsColumnVisibilityUpdated] = useState(false);
    const [filters, setFilters] = useState({
        search: '',
        category: '',
        offerType: '',
        startDateStart: '',
        startDateEnd: '',
        endDateStart: '',
        endDateEnd: '',
        createdAtStart: '',
        createdAtEnd: ''
    });
    const [showFilters, setShowFilters] = useState(false);
    const [sortConfig, setSortConfig] = useState<{
        columnId: string | null;
        direction: 'asc' | 'desc' | null;
    }>({ columnId: null, direction: null });
    const [offersData, setOffersData] = useState(
        offers.map(offer => ({
            ...offer,
            id: offer.offerId
        }))
    );

    useEffect(() => {
        setOffersData(
            offers.map(offer => ({
                ...offer,
                id: offer.offerId
            }))
        );
    }, [offers])



    const handleFilterChange = (key: string, value: string) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    useEffect(() => {
        fetchOffers();
        setOffersData(offersData);
    }, []);

    const handleClear = async () => {
        try {
            setFilters({
                search: '',
                category: '',
                offerType: '',
                startDateStart: '',
                startDateEnd: '',
                endDateStart: '',
                endDateEnd: '',
                createdAtStart: '',
                createdAtEnd: ''
            });
            setSortConfig({ columnId: null, direction: null }); // Reset sorting
        } catch (error) {
            console.error('Error refreshing data:', error);
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


    const unFilteredData = [...offersData].sort((a, b) => {
        const acreatedAt = new Date(a.createdAt).getTime();
        const bcreatedAt = new Date(b.createdAt).getTime();
        return bcreatedAt - acreatedAt; // Descending order
    });

    const applyFilters = () => {
        let filteredData = [...unFilteredData];

        if (filters.search) {
            filteredData = filteredData.filter(offer =>
                offer.offerId?.toLowerCase().includes(filters.search.toLowerCase()) ||
                offer.offerName.toLowerCase().includes(filters.search.toLowerCase()) ||
                offer.category.toLowerCase().includes(filters.search.toLowerCase())
            );
        }

        if (filters.category) {
            filteredData = filteredData.filter(offer => offer.category === filters.category);
        }

        // if (filters.createdAtStart || filters.createdAtEnd) {
        //     filteredData = filteredData.filter(offer => {
        //         const createdDate = new Date(offer.createdAt).setHours(0, 0, 0, 0);
        //         const startDate = filters.createdAtStart ? new Date(filters.createdAtStart).setHours(0, 0, 0, 0) : null;
        //         const endDate = filters.createdAtEnd ? new Date(filters.createdAtEnd).setHours(0, 0, 0, 0) : null;
        //         return (!startDate || createdDate >= startDate) && (!endDate || createdDate <= endDate);
        //     });
        // }

        if (filters.startDateStart || filters.startDateEnd) {
            filteredData = filteredData.filter(offer => {
                const offerStart = new Date(offer.startDate).setHours(0, 0, 0, 0);
                const filterStart = filters.startDateStart ? new Date(filters.startDateStart).setHours(0, 0, 0, 0) : null;
                const filterEnd = filters.startDateEnd ? new Date(filters.startDateEnd).setHours(0, 0, 0, 0) : null;
                return (!filterStart || offerStart >= filterStart) &&
                    (!filterEnd || offerStart <= filterEnd);
            });
        }

        if (filters.endDateStart || filters.endDateEnd) {
            filteredData = filteredData.filter(offer => {
                const offerEnd = new Date(offer.endDate).setHours(0, 0, 0, 0);
                const filterStart = filters.endDateStart ? new Date(filters.endDateStart).setHours(0, 0, 0, 0) : null;
                const filterEnd = filters.endDateEnd ? new Date(filters.endDateEnd).setHours(0, 0, 0, 0) : null;

                return (!filterStart || offerEnd >= filterStart) &&
                    (!filterEnd || offerEnd <= filterEnd);
            });
        }

        // Updated sorting logic
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
        const today = new Date().toISOString().split('T')[0];
        const currentDate = new Date();

        const counts = {
            total: filteredData.length,
            today: filteredData.filter(offer =>
                new Date(offer.startDate).toISOString().split('T')[0] === today
            ).length,
            active: filteredData.filter(offer => offer.status).length,
            inactive: filteredData.filter(offer => !offer.status).length
        };

        setTotalOffers(counts.total);
        setTodayOffers(counts.today);
        setActiveOffers(counts.active);
        setInactiveOffers(counts.inactive);
    }, [filteredData]);

    const handleSort = (columnId: string) => {
        setSortConfig(prev => ({
            columnId,
            direction: prev.columnId === columnId && prev.direction === 'asc' ? 'desc' : 'asc',
        }));
    };

    const getFormattedCreatedDateRange = () => {
        const start = filters.createdAtStart ? new Date(filters.createdAtStart).toLocaleDateString() : '';
        const end = filters.createdAtEnd ? new Date(filters.createdAtEnd).toLocaleDateString() : '';
        return start && end ? `${start} - ${end}` : 'Pick a range';
    };

    const getFormattedStartDateRange = () => {
        const start = filters.startDateStart ? new Date(filters.startDateStart).toLocaleDateString() : '';
        const end = filters.startDateEnd ? new Date(filters.startDateEnd).toLocaleDateString() : '';
        return start && end ? `${start} - ${end}` : 'Start Date Range';
    };

    const getFormattedEndDateRange = () => {
        const start = filters.endDateStart ? new Date(filters.endDateStart).toLocaleDateString() : '';
        const end = filters.endDateEnd ? new Date(filters.endDateEnd).toLocaleDateString() : '';
        return start && end ? `${start} - ${end}` : 'End Date Range';
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-50">
                <Loader2 className="w-12 h-12 animate-spin text-primary" />
            </div>
        )
    }

    const handleBulkDelete = async () => {
        const selectedIds = Object.keys(rowSelection);
        if (selectedIds.length === 0) return;
        setIsDialogOpen(true);
    };

    const confirmBulkDelete = async () => {
        const selectedIndices = Object.keys(rowSelection)
        const selectedIds = selectedIndices.map(index => {
            const offerId = filteredData[parseInt(index)]?.offerId
            return offerId !== undefined ? offerId : null
        }).filter(id => id !== null);
        await multiDeleteOffers(selectedIds);
        const newData = filteredData.filter(offer => !selectedIds.includes(offer.offerId || ""));
        setOffersData(newData);
        setRowSelection({});
        const { statusCode, message } = useOfferStore.getState()
        if (statusCode === 200 || statusCode === 201) {
            toast.success("Offers deleted successfully");
            router.push("/admin/offers");
        } else {
            toast.error(message || "Error deleting Offers", {
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

    const handleRefetch = async () => {
        setIsSpinning(true);
        try {
            // await refetch(); // wait for the refetch to complete
        } finally {
            // stop spinning after short delay to allow animation to play out
            setTimeout(() => setIsSpinning(false), 500);
        }
    };

    return (
        <>
            <div className="space-y-6">
                <div className="rounded bg-white p-5 shadow">
                    <div className='flex flex-col'>
                        <div className="flex justify-between items-center mb-5">
                            <h1 className="text-2xl font-bold tracking-tight">Offers Page</h1>
                            <div className="flex items-center gap-2">
                                <Button
                                    className='bg-[rgb(0,159,127)]'
                                    onClick={() => router.push('/admin/offers/create')}
                                >
                                    Create Offer
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
                                                            Are you sure you want to delete {Object.keys(rowSelection).length} selected offers?
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
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-5">
                            <Card className="relative overflow-hidden border-none bg-gradient-to-br from-emerald-50 to-teal-50 shadow-md w-[230px] h-[120px] transform transition duration-300 ease-in-out hover:scale-105">
                                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 opacity-0 w-full" />
                                <div className="h-[150PX] w-full">
                                    <CounterCard
                                        color="bg-emerald-100"
                                        icon={Activity}
                                        count={totalOffers}
                                        label="Total Offers"
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
                                        count={todayOffers}
                                        label="Today's Offers"
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
                                        count={activeOffers}
                                        label="Active Offers"
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
                                        count={inactiveOffers}
                                        label="Inactive Offers"
                                        cardSize="w-[180px] h-[90px]"
                                    />
                                </div>
                                <div className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-orange-500 to-red-500 transform scale-x-100" />
                            </Card>
                        </div>
                    </div>
                    {showFilters && (
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 border-t-2 mt-4 p-3 pt-8">
                            <div>
                                <Label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                    Search
                                </Label>
                                <Input
                                    id="search"
                                    placeholder="Search in offers"
                                    value={filters.search}
                                    onChange={(e) => handleFilterChange('search', e.target.value)}
                                />
                            </div>
                            <div>
                                <Label htmlFor="serviceType" className='text-body-dark font-semibold text-sm leading-none mb-3'>Service Type</Label>
                                <Select onValueChange={(value) => handleFilterChange('serviceType', value)}>
                                    <SelectTrigger id="serviceType">
                                        <SelectValue placeholder="Select service type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="oneWay">One Way</SelectItem>
                                        <SelectItem value="roundTrip">Round Trip</SelectItem>
                                        <SelectItem value="airport">Airport</SelectItem>
                                        <SelectItem value="package">Package</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div >
                                <Label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Created At</Label>
                                <DateRangeAccordion
                                    label={getFormattedCreatedDateRange()}
                                    startDate={filters.createdAtStart}
                                    endDate={filters.createdAtEnd}
                                    onStartDateChange={(date: any) => handleFilterChange('createdAtStart', date)}
                                    onEndDateChange={(date: any) => handleFilterChange('createdAtEnd', date)}
                                />
                            </div>
                            <div >
                                <Label className="text-sm font-medium leading-none">Start Date Range</Label>
                                <DateRangeAccordion
                                    label={getFormattedStartDateRange()}
                                    startDate={filters.startDateStart}
                                    endDate={filters.startDateEnd}
                                    onStartDateChange={(date: any) => handleFilterChange('startDateStart', date)}
                                    onEndDateChange={(date: any) => handleFilterChange('startDateEnd', date)}
                                />
                            </div>
                            <div >
                                <Label className="text-sm font-medium leading-none">End Date Range</Label>
                                <DateRangeAccordion
                                    label={getFormattedEndDateRange()}
                                    startDate={filters.endDateStart}
                                    endDate={filters.endDateEnd}
                                    onStartDateChange={(date: any) => handleFilterChange('endDateStart', date)}
                                    onEndDateChange={(date: any) => handleFilterChange('endDateEnd', date)}
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
                <div className="rounded bg-white shadow">
                    <MaterialReactTable
                        columns={columns as MRT_ColumnDef<any>[]}
                        data={filteredData}
                        enableRowSelection
                        positionGlobalFilter="left"
                        onRowSelectionChange={setRowSelection}
                        state={{ rowSelection, sorting, columnVisibility }}
                        onColumnVisibilityChange={(newVisibility) => {
                            setIsColumnVisibilityUpdated(true);
                            setLocalColumnVisibility(newVisibility);
                        }}
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