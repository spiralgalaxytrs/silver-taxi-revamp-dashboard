"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent } from 'components/ui/card';
import CounterCard from "components/CounterCard";
import { Activity, Loader2 } from "lucide-react";
import Link from "next/link";
import { useDriverStore } from "stores/driverStore";
import { useBookingStore } from 'stores/bookingStore';
import { useWalletTransactionStore } from "stores/walletTransactionStore";
import { columns } from "./columns";
import React from "react";
import { Button } from "components/ui/button";
import { DataTable } from "components/DataTable";
import { Switch } from "components/ui/switch";
import { walletColumns, DriverTransaction } from "./walletColumns";

export default function ViewDriverPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const { fetchDriverById, drivers, driver, isLoading } = useDriverStore();
    const { fetchDriverTransactions, driverTransactions} = useWalletTransactionStore();
    const { bookings, fetchBookings, error } = useBookingStore();
    const [totalTrips, setTotalTrips] = useState(0);
    const [totalEarnings, setTotalEarnings] = useState(0);
    const [walletAmount, setWalletAmount] = useState(0);
    const [showDriverTransactions, setShowDriverTransactions] = useState(false);
    const [walletTransactions, setDriverTransactions] = useState<DriverTransaction[]>([]);
    const [driverData, setDriverData] = useState(
        drivers.map(driver => ({ ...driver, id: driver.driverId }))
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
        if (id) {
            fetchDriverById(id);
            fetchBookings(); // Fetch bookings when the component mounts
        }
    }, [id]);

    useEffect(() => {
        if (drivers) {
            setDriverData(drivers.map(driver => ({
                ...driver,
                id: driver.driverId ?? '',
                walletAmount: driver.wallet?.balance ?? 0
            })));
        }
    }, [drivers]);

    useEffect(() => {
        if (bookings && id) {
            const filteredBookings = bookings.filter(booking => booking.driverId === id);
            setBookingData(filteredBookings.map(booking => ({
                ...booking,
                id: booking.bookingId,
                pickupDate: booking.pickupDate,
                dropDate: booking.dropDate ? new Date(booking.dropDate).toLocaleDateString() : null,
            })));
        }
    }, [bookings, id]);

    useEffect(() => {
        if (driverData && id) {
            const wAmount = driverData.find(driver => driver.driverId === id)?.wallet?.balance;
            setWalletAmount(wAmount || 0);

            const totalEarnings = driverData.find(driver => driver.driverId === id)?.totalEarnings;
            setTotalEarnings(totalEarnings || 0);
        }
    },[driverData, id]);

    useEffect(() => {
        const fetchTransactions = async () => {
            if (id && showDriverTransactions) {
                await fetchDriverTransactions(id);
                const data = driverTransactions
                .filter((t) => t.driverId === id)
                .map(transaction => ({
                    transactionId: transaction.transactionId,
                    driverId: transaction.driverId,
                    initiatedBy: transaction.initiatedBy,
                    initiatedTo: transaction.initiatedTo,
                    ownedBy: transaction.ownedBy,
                    type: transaction.type,
                    amount: transaction.amount,
                    description: transaction.description,
                    createdAt: transaction.createdAt,
                    remark: transaction.remark
                }));
                setDriverTransactions(data);
            }
        };
        fetchTransactions();
    }, [id, showDriverTransactions, driverTransactions]);

    const handleBack = () => {
        router.push('/admin/drivers');
    };

    const handleSort = (columnId: string) => {
        setSortConfig(prev => ({
            columnId,
            direction: prev.columnId === columnId && prev.direction === 'asc' ? 'desc' : 'asc',
        }));
    };

    const unFiltered = [...bookingData].sort((a, b) => {
        const aCreatedAt = new Date(a.createdAt || "").getTime();
        const bCreatedAt = new Date(b.createdAt || "").getTime();
        return bCreatedAt - aCreatedAt;
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
            }, { total: 0});
        };

        const stats = calculateBookingStats();
        setTotalTrips(stats.total);    
    }, [fData]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-50">
                <Loader2 className="w-12 h-12 animate-spin text-primary" />
            </div>
        );
    }

    if (!driver) {
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
                            {/* Driver Details Section */}
                            <div className="flex flex-col py-4 gap-4">
                                <h2 className='text-black text-lg font-bold'>Driver Information</h2>
                                <div className='bg-white p-6 rounded-lg'>
                                    <div className="space-y-3 text-gray-700">
                                        <div className="flex items-center gap-3">
                                            <span className="font-semibold w-14">Name:</span>
                                            <p className="text-gray-900">{driver?.name || '-'}</p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="font-semibold w-14">Email:</span>
                                            <p className="text-gray-900 break-all">{driver?.email || '-'}</p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="font-semibold w-14">Phone:</span>
                                            <p className="text-gray-900">{driver?.phone || '-'}</p>
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
                                            count={totalTrips}
                                            label="Total Trips"
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
                                        {showDriverTransactions ? 'Transactions' : 'Booking History'}
                                    </h2>
                                    <div className="flex items-center space-x-2">
                                        <Switch
                                            checked={showDriverTransactions}
                                            onCheckedChange={setShowDriverTransactions}
                                        />
                                        <span className="text-sm text-gray-500">
                                            Show Wallet Transactions
                                        </span>
                                    </div>
                                </div>
                                <Link href="/admin/drivers">
                                    <Button className="px-6 py-2">Back to drivers</Button>
                                </Link>
                            </div>
                            <div>
                                {showDriverTransactions ? (
                                    <DataTable
                                        columns={walletColumns}
                                        data={walletTransactions}
                                        onSort={handleSort}
                                        sortConfig={sortConfig}
                                    />
                                ) : (
                                    <DataTable
                                        columns={columns}
                                        data={fData}
                                        onSort={handleSort}
                                        sortConfig={sortConfig}
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