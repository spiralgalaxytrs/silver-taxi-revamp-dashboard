'use client'
import { useState, useEffect } from 'react';
import Loading from 'app/Loading';
import { columns } from 'app/admin/enquiry/columns';
import { useEnquiryStore } from 'stores/enquiryStore-';
import { DataTable } from 'components/others/DataTable';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import {
    MaterialReactTable,
    MRT_ColumnDef
} from 'material-react-table';


export const EnquiryTable: React.FC = () => {
    const router = useRouter();
    const { enquiries, fetchVendorEnquiries, isLoading, error } = useEnquiryStore()

    // Global sorting state
    const [sortConfig, setSortConfig] = useState<{
        columnId: string | null;
        direction: 'asc' | 'desc' | null;
    }>({ columnId: null, direction: null });

    useEffect(() => {
        fetchVendorEnquiries()
    }, [])

    const applyFilters = () => {

        const filteredBookingData = enquiries.filter(enquiry => enquiry.createdBy === 'Vendor');

        const ChangedEnquiries = filteredBookingData.map((enquiry) => {
            if (enquiry) { // Check if enquiry is not null or undefined
                return {
                    ...enquiry,
                    dropDate: enquiry.dropDate ? new Date(enquiry.dropDate) : null,
                };
            }
            return null; // Return null for invalid enquiries
        }).filter(enquiry => enquiry !== null);


        let filteredData = ChangedEnquiries

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

    const handleSort = (columnId: string) => {
        setSortConfig(prev => ({
            columnId,
            direction: prev.columnId === columnId && prev.direction === 'asc' ? 'desc' : 'asc',
        }));
    };

    const handleRoute = () => {
        router.push('/vendor/enquiry')
    }

    if (isLoading) {
        <>
            <div className="flex items-center justify-center h-screen bg-gray-50">
                <Loader2 className="w-12 h-12 animate-spin text-primary" />
            </div>
        </>
    }

    return (
        <div className="p-6 space-y-6">
            <div className="rounded bg-white p-5 shadow md:p-5">
                <div className="flex items-center justify-between ">
                    <h1 className="text-2xl font-bold tracking-tight">Enquiry Page</h1>
                    <div className="flex items-center gap-2">
                        <button onClick={handleRoute} className="btn bg-[#D5C7A3]">View Enquiries</button>
                    </div>
                </div>
            </div>
            <div className="rounded bg-white shadow ">
                 <MaterialReactTable
                    columns={columns as MRT_ColumnDef<any>[]}
                    data={enquiryFilteredData}
                    enableRowSelection
                    positionGlobalFilter="left"
                    enableSorting
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
                />
            </div>
        </div>
    )
}