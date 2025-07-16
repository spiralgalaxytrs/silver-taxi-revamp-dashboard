"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "components/ui/button";
import CounterCard from "components/cards/CounterCard";
import { Activity, Loader2, RefreshCcw } from "lucide-react";
import { Card, CardContent } from 'components/ui/card';
import Link from "next/link";
import { bookingColumns } from "./columns";
import {
  useVendorCustomers,
  useCustomerBookings,
  useCustomerById,
} from 'hooks/react-query/useCustomer';
import {
  MRT_ColumnDef,
  MaterialReactTable
} from 'material-react-table'

export default function ViewCustomerPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();

  const [id, setId] = useState<string | undefined>('');
  const [sortConfig, setSortConfig] = useState<{
    columnId: string | null;
    direction: 'asc' | 'desc' | null;
  }>({ columnId: null, direction: null });

  useEffect(() => {
    const resolveParams = async () => {
      const resolvedParams = await params;
      setId(resolvedParams.id);
    };
    resolveParams();
  }, [params]);

  const {
    data: customers = [],
    isLoading: isCustomersLoading,
    refetch
  } = useVendorCustomers();

  const {
    data: customer,
    isLoading: isCustomerLoading,
  } = useCustomerById(id ?? '');

  const {
    data: customerBookings = [],
    isLoading: isBookingsLoading,
    refetch: refetchBookings
  } = useCustomerBookings(id ?? '');

  const unFiltered = [...customerBookings].sort((a, b) => {
    const aCreatedAt = new Date(a.createdAt || "").getTime();
    const bCreatedAt = new Date(b.createdAt || "").getTime();
    return bCreatedAt - aCreatedAt;
  });

  const fData = useMemo(() => {
    let sorted = [...unFiltered];
    if (sortConfig.columnId && sortConfig.direction) {
      sorted.sort((a, b) => {
        const aValue = a[sortConfig.columnId as keyof typeof a];
        const bValue = b[sortConfig.columnId as keyof typeof b];
        if (aValue == null || bValue == null) return 0; // Add null check here
        if (aValue === bValue) return 0;
        return sortConfig.direction === 'asc'
          ? aValue > bValue ? 1 : -1
          : aValue < bValue ? 1 : -1;
      });
    }
    return sorted;
  }, [unFiltered, sortConfig]);

  const [sorting, setSorting] = useState<{ id: string; desc: boolean }[]>([])
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({})
  const [isSpinning, setIsSpinning] = useState(false)
  const [totalTrips, setTotalTrips] = useState(0);
  const [totalEarnings, setTotalEarnings] = useState(0);

  useEffect(() => {
    const stats = fData.reduce((acc, booking) => {
      acc.total++;
      acc.totalValue += Number(booking.finalAmount) || 0;
      return acc;
    }, { total: 0, totalValue: 0 });

    setTotalTrips(stats.total);
    setTotalEarnings(stats.totalValue);
  }, [fData]);

  const handleRefetch = async () => {
    setIsSpinning(true);
    try {
      await refetchBookings();
    } finally {
      // stop spinning after short delay to allow animation to play out
      setTimeout(() => setIsSpinning(false), 500);
    }
  };

  if (isCustomersLoading || isCustomerLoading || isBookingsLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div>
      <Card className='rounded-5 bg-white p-6 '>
        <CardContent>
          <div className="space-y-6">
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
                      format="currency"
                    />
                  </div>
                  <div className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-blue-500 to-indigo-500 transform scale-x-100" />
                </Card>
              </div>
            </div>

            {/* Booking History Section */}
            <div className="flex flex-col gap-4">
              <div className="flex justify-between">
                <h2 className='text-black text-lg font-bold'>Booking History</h2>
                <Link href="/vendor/customers">
                  <Button className="px-6 py-2">Back to Customers</Button>
                </Link>
              </div>
              <MaterialReactTable
                columns={bookingColumns as MRT_ColumnDef<any>[]}
                data={fData}
                positionGlobalFilter="left"
                enableHiding={false}
                enableDensityToggle={false}
                state={{ sorting }}
                onSortingChange={setSorting}
                enableSorting
                initialState={{
                  // density: '',
                  pagination: { pageIndex: 0, pageSize: 10 },
                  showGlobalFilter: true,
                }}
                muiSearchTextFieldProps={{
                  placeholder: 'Search Bookings...',
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
        </CardContent>
      </Card>
    </div>
  );
}
