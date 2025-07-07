'use client'

import { useState, useEffect } from 'react';
import { DataTable } from 'components/others/DataTable';
import { columns } from 'app/admin/invoices/columns';
import { useInvoiceStore } from 'stores/-invoiceStore'
import { ColumnDef } from '@tanstack/react-table'
import { Loader2, RefreshCcw } from 'lucide-react';
import { useRouter } from 'next/navigation';
import {
    MaterialReactTable,
    MRT_ColumnDef
} from 'material-react-table';
import { Button } from 'components/ui/button';

export const InvoiceTable: React.FC = () => {
    const router = useRouter();
    const [sortConfig, setSortConfig] = useState<{
        columnId: string | null;
        direction: 'asc' | 'desc' | null;
    }>({ columnId: null, direction: null });

    const { invoices, fetchInvoices, isLoading, error } = useInvoiceStore()
    const [isSpinning, setIsSpinning] = useState(false)

    useEffect(() => {
        fetchInvoices()
    }, [fetchInvoices])

    const applyFilters = () => {
        let filteredData = invoices;

        // Global sorting logic - Updated to handle different data types
        if (sortConfig.columnId && sortConfig.direction) {
            filteredData = [...filteredData].sort((a, b) => {
                const aValue = a[sortConfig.columnId as keyof typeof a];
                const bValue = b[sortConfig.columnId as keyof typeof b];

                // Handle numeric values (like amount)
                if (typeof aValue === 'number' && typeof bValue === 'number') {
                    return sortConfig.direction === 'asc'
                        ? aValue - bValue
                        : bValue - aValue;
                }

                // Handle string values
                const aString = String(aValue).toLowerCase();
                const bString = String(bValue).toLowerCase();

                if (sortConfig.direction === 'asc') {
                    return aString.localeCompare(bString);
                } else {
                    return bString.localeCompare(aString);
                }
            });
        }

        filteredData = [...filteredData].sort((a, b) => {
            const aCreatedAt = new Date(a.createdAt || "").getTime();
            const bCreatedAt = new Date(b.createdAt || "").getTime();
            return bCreatedAt - aCreatedAt; // Descending order
        });
        return filteredData
    };

    const filteredData = applyFilters();

    const handleSort = (columnId: string) => {
        setSortConfig(prev => ({
            columnId,
            direction: prev.columnId === columnId && prev.direction === 'asc' ? 'desc' : 'asc',
        }));
    };

    const handleRoute = () => {
        router.push('/admin/invoices')
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
        <>
            <div className="flex items-center justify-center h-screen bg-gray-50">
                <Loader2 className="w-12 h-12 animate-spin text-primary" />
            </div>
        </>
    }

    return (
        <>
            <div className="p-6 space-y-6">
                <div className="rounded bg-white p-5 shadow md:p-5">
                    <div className="flex items-center justify-between ">
                        <h1 className="text-2xl font-bold tracking-tight">Recent Invoices</h1>
                        <div className="flex items-center gap-2">
                            <button onClick={handleRoute} className="btn bg-[#D5C7A3]">View Invoices</button>
                        </div>
                    </div>
                </div>
                <MaterialReactTable
                    columns={columns as MRT_ColumnDef<any>[]}
                    data={filteredData}
                    positionGlobalFilter="left"
                    enableSorting
                    enableHiding={false}
                    enableDensityToggle={false}
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
                            minWidth: '400px', // Adjust width as needed
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
        </>
    );
}