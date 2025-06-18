'use client'

import { useState, useEffect } from 'react';
import Loading from 'app/Loading';
import { columns } from 'app/admin/bookings/columns';
import { useBookingStore } from 'stores/bookingStore';
import { DataTable } from 'components/DataTable';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export const BookingTable: React.FC = () => {
    const router = useRouter();
    const { bookings, fetchBookings, isLoading, error } = useBookingStore();

    // Global sorting state
    const [sortConfig, setSortConfig] = useState<{
        columnId: string | null;
        direction: 'asc' | 'desc' | null;
    }>({ columnId: null, direction: null });


    useEffect(() => {
        fetchBookings();
    }, [fetchBookings]);


    const applyFilters = () => {

        const ChangedBookings = bookings.map((booking) => ({
            ...booking,
            pickupDate: booking.pickupDate,
            dropDate: booking.dropDate ? new Date(booking.dropDate).toLocaleDateString() : null,
        }));

        let filteredData = [...ChangedBookings];

        // Global sorting logic
        if (sortConfig.columnId && sortConfig.direction) {
            filteredData.sort((a, b) => {
                const aValue = a[sortConfig.columnId as keyof typeof a];
                const bValue = b[sortConfig.columnId as keyof typeof b];

                if (aValue === null || bValue === null) return 0;

                if (aValue === bValue) return 0;

                if (sortConfig.direction === 'asc') {
                    return (aValue || 0) > (bValue || 0) ? 1 : -1;
                } else {
                    return (aValue || 0) < (bValue || 0) ? 1 : -1;
                }
            });
        }

        filteredData = [...filteredData].sort((a, b) => {
            const abookingDate = new Date(a.bookingDate || "").getTime();
            const bbookingDate = new Date(b.bookingDate || "").getTime();
            return bbookingDate - abookingDate; // Descending order
        });

        return filteredData;
    };

    const filteredData = applyFilters();

    const handleSort = (columnId: string) => {
        setSortConfig(prev => ({
            columnId,
            direction: prev.columnId === columnId && prev.direction === 'asc' ? 'desc' : 'asc',
        }));
    };

    useEffect(() => {
        fetchBookings();

        const intervalId = setInterval(() => {
            applyFilters();
        }, 180000);

        return () => clearInterval(intervalId);
    }, [fetchBookings]);

    const handleRoute = () => {
        router.push('/admin/bookings')
    }

    if (isLoading) {
        <>
            <div className="flex items-center justify-center h-screen bg-gray-50">
                <Loader2 className="w-12 h-12 animate-spin text-primary" />
            </div>
        </>
    }

    // if (error) {
    //   return <div>Error: {error}</div>;
    // }

    return (
        <>
            <div className="p-6 space-y-6">
                <div className="rounded bg-white p-5 shadow md:p-5">
                    <div className="flex items-center justify-between border-b-1">
                        <h1 className="text-2xl font-bold tracking-tight">Recent Booking</h1>
                        <div className="flex items-center gap-2">
                            <button onClick={handleRoute} className="btn bg-[#D5C7A3]">View Bookings</button>
                        </div>
                    </div>
                </div>
                <div className="rounded bg-white shadow">
                    <DataTable
                        columns={columns.slice(1, columns.length - 1)}
                        data={filteredData as any}
                        onSort={handleSort}
                        sortConfig={sortConfig}
                    />
                </div>
            </div>
        </>
    )
}