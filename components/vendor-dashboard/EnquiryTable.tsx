'use client'
import React, { useState } from 'react';
import { columns } from 'app/admin/enquiry/columns';
import { Loader2, RefreshCcw } from 'lucide-react';
import { useRouter } from 'next/navigation';
import {
    MaterialReactTable,
    MRT_ColumnDef
} from 'material-react-table';
import { Button } from 'components/ui/button';

export const EnquiryTable: React.FC<{ enquiries: any[], refetch: any, isLoading: boolean }> = ({ enquiries = [], refetch, isLoading }) => {
    const router = useRouter();

    // Global sorting state
    const [sortConfig, setSortConfig] = useState<{
        columnId: string | null;
        direction: 'asc' | 'desc' | null;
    }>({ columnId: null, direction: null });
    const [isSpinning, setIsSpinning] = useState(false)

    const applyFilters = () => {

        const ChangedEnquiries = enquiries.map((enquiry: any) => {
            if (enquiry) { // Check if enquiry is not null or undefined
                return {
                    ...enquiry,
                    dropDate: enquiry.dropDate ? new Date(enquiry.dropDate) : null,
                };
            }
            return null; // Return null for invalid enquiries
        }).filter(enquiry => enquiry !== null);


        let filteredData = [...ChangedEnquiries]

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
            const aCreatedAt = new Date(a.createdAt).getTime();
            const bCreatedAt = new Date(b.createdAt).getTime();
            return bCreatedAt - aCreatedAt; // Descending order
        });

        return filteredData;
    }

    const enquiryFilteredData = applyFilters()


    const handleRoute = () => {
        router.push('/admin/enquiry')
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
                <div className="rounded bg-white p-5 shadow md:p-5">
                    <div className="flex items-center justify-between ">
                        <h1 className="text-2xl font-bold tracking-tight">Recent Enquiries</h1>
                        <div className="flex items-center gap-2">
                            <button onClick={handleRoute} className="btn bg-[#D5C7A3]">View Enquiries</button>
                        </div>
                    </div>
                </div>
                <div className="rounded bg-white shadow ">
                    <MaterialReactTable
                        columns={columns as MRT_ColumnDef<any>[]}
                        data={enquiryFilteredData}
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
            </div>
        </React.Fragment>
    )
}