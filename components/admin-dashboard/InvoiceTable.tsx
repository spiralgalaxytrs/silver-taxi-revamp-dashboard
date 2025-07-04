'use client'

import { useState, useEffect } from 'react';
import { DataTable } from 'components/others/DataTable';
import { columns } from 'app/admin/invoices/columns';
import { useInvoiceStore } from 'stores/invoiceStore'
import { ColumnDef } from '@tanstack/react-table'
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export const InvoiceTable: React.FC = () => {
    const router = useRouter();
    const [sortConfig, setSortConfig] = useState<{
        columnId: string | null;
        direction: 'asc' | 'desc' | null;
    }>({ columnId: null, direction: null });

    const { invoices, fetchInvoices, isLoading, error } = useInvoiceStore()

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
                <DataTable
                    columns={columns.slice(1, columns.length - 1) as unknown as ColumnDef<{ id: string; amount: number; status: string; email: string; createdAt: string }, unknown>[]}
                    data={filteredData as unknown as { id: string; amount: number; status: string; email: string; createdAt: string }[]}
                    onSort={handleSort}
                    sortConfig={sortConfig}
                />
            </div>
        </>
    );
}