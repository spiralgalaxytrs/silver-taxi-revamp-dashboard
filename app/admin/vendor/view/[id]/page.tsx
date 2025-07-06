"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent } from 'components/ui/card';
import CounterCard from "components/cards/CounterCard";
import { Activity, Loader2, RefreshCcw } from "lucide-react";
import Link from "next/link";
import { useVendorStore } from "stores/-vendorStore";
import { useWalletTransactionStore } from "stores/-walletTransactionStore";
import { useBookingStore } from 'stores/bookingStore';
import { columns } from "./columns";
import React from "react";
import { Button } from "components/ui/button";
import { Switch } from "components/ui/switch";
import {
    MRT_ColumnDef,
    MaterialReactTable
} from "material-react-table";
import { walletColumns, VendorTransaction } from "./walletColumns";

export default function ViewDVendorPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();

    const { vendors, vendor, fetchVendors, fetchVendorById, isLoading } = useVendorStore();
    const { fetchVendorTransactions, vendorTransactions } = useWalletTransactionStore();
    const { bookings, fetchBookings, error } = useBookingStore();


    const [sorting, setSorting] = useState<{ id: string; desc: boolean }[]>([])
    const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({})
    const [isSpinning, setIsSpinning] = useState(false)
    const [totalTrips, setTotalTrips] = useState(25);
    const [totalEarnings, setTotalEarnings] = useState(0);
    const [walletAmount, setWalletAmount] = useState(0);
    const [showVendorTransactions, setShowVendorTransactions] = useState(false);
    const [vendorsTransactions, setVendorsTransactions] = useState<VendorTransaction[]>([]);

    const [vendorData, setVendorData] = useState(
        vendors.map(vendor => ({ ...vendor, id: vendor.vendorId }))
    );

    const [bookingData, setBookingData] = useState(
        bookings.map(booking => ({
            ...booking,
            id: booking.bookingId,
            pickupDate: booking.pickupDate,
            dropDate: booking.dropDate ? new Date(booking.dropDate).toLocaleDateString() : null,
        }))
    );

    const [sortConfig, setSortConfig] = useState<{
        columnId: string | null;
        direction: 'asc' | 'desc' | null;
    }>({ columnId: null, direction: null });

    const [id, setId] = useState<string | undefined>('')

    useEffect(() => {
        const resolvedParams = async () => {
            const resolvedParams = await params
            setId(resolvedParams.id)
        }
        resolvedParams()
    }, [params])

    useEffect(() => {
        fetchBookings();
        if (id) {
            fetchVendorById(id);
        }
    }, [id]);

    useEffect(() => {
        if (vendors) {
            const filteredVendors = vendors.filter((vendor) => vendor.vendorId === id);
            setVendorData(filteredVendors.map(vendor => ({
                ...vendor,
                id: vendor.vendorId ?? '',
                walletAmount: vendor.wallet?.balance ?? 0,
            })));
        }
    }, [vendors, id]);

    useEffect(() => {
        if (bookings && id && bookings.length > 0) {
            const filteredBookings = bookings.filter(booking => booking.vendorId === id);
            setBookingData(filteredBookings.map(booking => ({
                ...booking,
                id: booking.bookingId,
                pickupDate: booking.pickupDate,
                dropDate: booking.dropDate ? new Date(booking.dropDate).toLocaleDateString() : null,
            })));
        }
    }, [bookings, id]);

    useEffect(() => {
        if (vendorData && id) {
            const wAmount = vendorData.find(vendor => vendor.vendorId === id)?.wallet?.balance;
            setWalletAmount(wAmount || 0);

            const totalEarnings = vendorData.find(vendor => vendor.vendorId === id)?.totalEarnings;
            setTotalEarnings(totalEarnings || 0);
        }
    }, [vendorData, id]);

    const handleBack = () => {
        router.push('/admin/vendor');
    };

    useEffect(() => {
        const fetchTransactions = async () => {
            if (id && showVendorTransactions) {
                await fetchVendorTransactions(id);
                const data = vendorTransactions
                    .filter((t) => t.vendorId === id)
                    .map(transaction => ({
                        transactionId: transaction.transactionId,
                        vendorId: transaction.vendorId,
                        initiatedBy: transaction.initiatedBy,
                        initiatedTo: transaction.initiatedTo,
                        ownedBy: transaction.ownedBy,
                        type: transaction.type,
                        amount: transaction.amount,
                        description: transaction.description,
                        createdAt: transaction.createdAt,
                        remark: transaction.remark
                    }));
                setVendorsTransactions(data);
            }
        };
        fetchTransactions();
    }, [id, showVendorTransactions, vendorTransactions]);

    const handleSort = (columnId: string) => {
        setSortConfig(prev => ({
            columnId,
            direction: prev.columnId === columnId && prev.direction === 'asc' ? 'desc' : 'asc',
        }));
    };


    const unFiltered = [...bookingData].sort((a, b) => {
        const aCreatedAt = new Date(a.createdAt || "").getTime();
        const bCreatedAt = new Date(b.createdAt || "").getTime();
        return bCreatedAt - aCreatedAt; // Descending order
    });

    // Memoize sorted bookings
    const fData = React.useMemo(() => {
        let sorted = [...unFiltered];
        if (sortConfig.columnId && sortConfig.direction) {
            sorted.sort((a, b) => {
                const aValue = a[sortConfig.columnId as keyof typeof a];
                const bValue = b[sortConfig.columnId as keyof typeof b];

                if (aValue === null || bValue === null) return 0;

                if (aValue === bValue) return 0;

                if (sortConfig.direction === 'asc') {
                    return (aValue ?? '') > (bValue ?? '') ? 1 : -1;
                } else {
                    return (aValue ?? '') < (bValue ?? '') ? 1 : -1;
                }
            });
        }
        return sorted;
    }, [bookingData, sortConfig]);

    useEffect(() => {
        const calculateBookingStats = () => {
            return fData.reduce((acc, booking) => {
                acc.total++;

                return acc;
            }, { total: 0, totalValue: 0 });
        };

        const stats = calculateBookingStats();
        setTotalTrips(stats.total);
    }, [fData]);

    const handleRefetch = async (isBooking: boolean) => {
        setIsSpinning(true);
        try {
            // isBooking ? await fetchBookings() : await fetchVendorById(id); // wait for the refetch to complete
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
        );
    }

    if (!vendor) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-50">
                <Loader2 className="w-12 h-12 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <>
            <div className="rounded bg-white p-5 shadow">
                <Card className='rounded-none'>
                    <CardContent>
                        <div className="flex gap-20">
                            {/* Details Section */}
                            <div className="flex flex-col py-4 gap-4">
                                <h2 className='text-black text-lg font-bold'>Vendor Information</h2>
                                <div className='bg-white p-6 rounded-lg'>
                                    <div className="space-y-3 text-gray-700">
                                        <div className="flex items-center gap-3">
                                            <span className="font-semibold w-14">Name:</span>
                                            <p className="text-gray-900">{vendor?.name || '-'}</p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="font-semibold w-14">Email:</span>
                                            <p className="text-gray-900 break-all">{vendor?.email || '-'}</p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="font-semibold w-14">Phone:</span>
                                            <p className="text-gray-900">{vendor?.phone || '-'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Statistics Section */}
                            <div className="grid gap-5 md:grid-cols-3 lg:grid-cols-3 mt-14">
                                <Card className="relative overflow-hidden border-none bg-gradient-to-br from-emerald-50 to-teal-50 shadow-md w-[230px] h-[120px] transform transition duration-300 ease-in-out hover:scale-105">
                                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 opacity-0 w-full" />
                                    <div className="h-[150PX] w-full">
                                        <CounterCard
                                            color="bg-emerald-100"
                                            icon={Activity}
                                            count={totalTrips.toString()}
                                            label="Total Bookings"
                                            className="relative z-10 p-6"
                                        //cardSize="w-[200px] h-[100px]"
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
                                            count={totalEarnings}
                                            label="Total Earned"
                                            //cardSize="w-[200px] h-[100px]"
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
                                            count={walletAmount}
                                            label="Wallet Balance"
                                        //cardSize="w-[200px] h-[100px]"
                                        />
                                    </div>
                                    <div className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-purple-500 to-pink-500 transform scale-x-100" />
                                </Card>
                            </div>
                        </div>

                        {/* Booking History Section */}
                        <div className="flex flex-col gap-4">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-4">
                                    <h2 className='text-black text-lg font-bold'>
                                        {showVendorTransactions ? 'Transactions' : 'Booking History'}
                                    </h2>
                                    <div className="flex items-center space-x-2">
                                        <Switch
                                            checked={showVendorTransactions}
                                            onCheckedChange={setShowVendorTransactions}
                                        />
                                        <span className="text-sm text-gray-500">
                                            Show Wallet Transactions
                                        </span>
                                    </div>
                                </div>
                                <Link href="/admin/vendor">
                                    <Button className="px-6 py-2">Back to Vendors</Button>
                                </Link>
                            </div>
                            <div>
                                {showVendorTransactions ? (
                                    <MaterialReactTable
                                        columns={walletColumns as MRT_ColumnDef<any>[]}
                                        data={vendorsTransactions}
                                        positionGlobalFilter="left"
                                        enableHiding={false}
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
                                            placeholder: 'Search Transactions...',
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
                                                    onClick={() => handleRefetch(false)}
                                                    className="text-gray-600 hover:text-primary transition p-0 m-0 hover:bg-transparent hover:shadow-none"
                                                    title="Refresh Data"
                                                >
                                                    <RefreshCcw className={`w-5 h-5 ${isSpinning ? 'animate-spin-smooth ' : ''}`} />
                                                </Button>
                                            </div>
                                        )}
                                    />
                                ) : (
                                    <MaterialReactTable
                                        columns={columns as MRT_ColumnDef<any>[]}
                                        data={fData}
                                        positionGlobalFilter="left"
                                        enableHiding={false} 
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
                                            placeholder: 'Search Booking...',
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
                                                    onClick={() => handleRefetch(true)}
                                                    className="text-gray-600 hover:text-primary transition p-0 m-0 hover:bg-transparent hover:shadow-none"
                                                    title="Refresh Data"
                                                >
                                                    <RefreshCcw className={`w-5 h-5 ${isSpinning ? 'animate-spin-smooth ' : ''}`} />
                                                </Button>
                                            </div>
                                        )}
                                    />
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}