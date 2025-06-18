"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "components/ui/button";
import { Label } from 'components/ui/label';
import CounterCard from "components/CounterCard";
import { Activity, Loader2 } from "lucide-react";
import { Card, CardContent } from 'components/ui/card';
import { Input } from 'components/ui/input';
import Link from "next/link";
import { useCustomerStore } from "stores/customerStore";
import { DataTable } from "components/DataTable";
import { bookingColumns, Booking } from "./columns";
import React from "react";



export default function ViewCustomerPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const { customer, customers, getCustomerBooking, customerBookings, getCustomerById, isLoading } = useCustomerStore();
    const [totalTrips, setTotalTrips] = useState(25);
    const [totalEarnings, setTotalEarnings] = useState(0);
    const [customerData, setCustomerData] = useState(
        customers.map(customer => ({ ...customer, id: customer.customerId }))
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
            getCustomerBooking(id);
            getCustomerById(id);
        }
    }, [id, getCustomerBooking, getCustomerById]);

    useEffect(() => {
        if (customer) {
            setCustomerData(customers.map((customer: any) => ({
                ...customer,
                id: customer.customerId ?? '',
            })));
        }
    }, [customers]);

    useEffect(() => {
        if (customers && id) {
            const filteredcustomers = customers.filter(customer => customer.customerId === id);
            setCustomerData(filteredcustomers.map(customer => ({
                ...customer,
                id: customer.customerId,
            })));
        }
    }, [customers, id]);

    const handleBack = () => {
        router.push('/vendor/customers');
    };

    const handleSort = (columnId: string) => {
        setSortConfig(prev => ({
            columnId,
            direction: prev.columnId === columnId && prev.direction === 'asc' ? 'desc' : 'asc',
        }));
    };

    const unFiltered = [...customerBookings].sort((a, b) => {
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
    }, [customerBookings, sortConfig]);

    useEffect(() => {
        const calculateCustomerStats = () => {
            return fData.reduce((acc, customer) => {
                // Total bookings count
                acc.total++;

                // Total booking value
                acc.totalValue += Number(customer.finalAmount) || 0;

                return acc;
            }, { total: 0, totalValue: 0, yearly: 0, completed: 0 });
        };

        const stats = calculateCustomerStats();
        setTotalTrips(stats.total);
        setTotalEarnings(stats.totalValue);
    }, [fData]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-50">
                <Loader2 className="w-12 h-12 animate-spin text-primary" />
            </div>
        );
    }


    return (
        <>
            <div>
                <Card className='rounded-5 bg-white p-6 '>
                    <CardContent>
                        <div className="space-y-6   ">
                            <div className="flex gap-20">
                                {/* Customer Details Section */}
                                <div className="flex flex-col py-4 gap-4">
                                    <h2 className='text-black text-lg font-bold'>Customer Information</h2>
                                    <div className='bg-white p-6 rounded-lg'>
                                        <div className="space-y-3 text-gray-700">
                                            <div className="flex items-center gap-3">
                                                <span className="font-semibold w-24">Name:</span>
                                                <p className="text-gray-900">{customer?.name || '-'}</p>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className="font-semibold w-24">Email:</span>
                                                <p className="text-gray-900 break-all">{customer?.email || '-'}</p>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className="font-semibold w-24">Phone:</span>
                                                <p className="text-gray-900">{customer?.phone || '-'}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Statistics Section */}
                                <div className="grid ml-10 gap-10 md:grid-cols-2 lg:grid-cols-2 mt-14">
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
                                                label="Total Amount"
                                                //cardSize="w-[200px] h-[100px]"
                                                format="currency"
                                            />
                                        </div>
                                        <div className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-blue-500 to-indigo-500 transform scale-x-100" />
                                    </Card>
                                </div>
                            </div>

                            {/* Booking History Section */}
                            <div className="flex flex-col  gap-4">
                                <div className="flex justify-between">
                                    <h2 className='text-black text-lg font-bold'>Booking History</h2>
                                    <Link href="/vendor/customers">
                                        <Button className="px-6 py-2">Back to Customers</Button>
                                    </Link>
                                </div>
                                <div >
                                    <DataTable
                                        columns={bookingColumns}
                                        data={fData}
                                        onSort={handleSort}
                                        sortConfig={sortConfig}
                                    />
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}