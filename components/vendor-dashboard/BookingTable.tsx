'use client'

import React, { useState } from 'react';
import { columns } from 'app/admin/bookings/columns';
import { Loader2, RefreshCcw } from 'lucide-react';
import { useRouter } from 'next/navigation';
import {
    MaterialReactTable,
    MRT_ColumnDef
} from 'material-react-table';
import { Button } from 'components/ui/button';

export const BookingTable: React.FC<{ bookings: any[], isLoading: boolean }> = ({ bookings, isLoading }) => {
    const router = useRouter();

    // Global sorting state
    const [isSpinning, setIsSpinning] = useState(false)
    const [sortConfig, setSortConfig] = useState<{
        columnId: string | null;
        direction: 'asc' | 'desc' | null;
    }>({ columnId: null, direction: null });


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

    const handleRoute = () => {
        router.push('/admin/bookings')
    }

    const handleRefetch = async () => {
        setIsSpinning(true);
        try {
            // await refetch(); // wait for the refetch to complete
        } finally {
            // stop spinning after short delay to allow animation to play out
            setTimeout(() => setIsSpinning(false), 500);
        }
    };

    if (isLoading) {
        <div className="flex items-center justify-center h-screen bg-gray-50">
            <Loader2 className="w-12 h-12 animate-spin text-primary" />
        </div>
    }

    return (
        <React.Fragment>
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
                    <MaterialReactTable
                        columns={columns.slice(1, columns.length - 1)}
                        data={filteredData as any}
                        positionGlobalFilter="left"
                        enableSorting
                        enableHiding={false}
                        enableDensityToggle={false}
                        enableColumnPinning={false}
                        initialState={{
                            density: 'compact',
                            pagination: { pageIndex: 0, pageSize: 10 },
                            showGlobalFilter: true,
                            columnPinning: { right: ["actions"] },
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
        </React.Fragment>
    )
}