"use client";

import React, { useMemo, useEffect, useState } from 'react'
import { Button } from 'components/ui/button'
import {
  useVendorTransactionsByVendor,
  useVendorWalletAmount
} from 'hooks/react-query/useWallet';
import { columns } from './column';
import {
  MRT_ColumnDef,
  MaterialReactTable
} from "material-react-table";
import { RefreshCcw, Activity } from 'lucide-react';
import { Card, CardContent } from 'components/ui/card';
import CounterCard from "components/cards/CounterCard";
import {
  useTableColumnVisibility,
  useUpdateTableColumnVisibility
} from 'hooks/react-query/useImageUpload';

const page = () => {

  const {
    data: vendorTransactions = [],
    isLoading: isLoadingVendorTransactions,
    refetch
  } = useVendorTransactionsByVendor();

  const {
    data: vendor = null,
    isLoading: isLoadingWalletAmount,
    refetch: refetchWalletAmount
  } = useVendorWalletAmount();
  const {
    data: tableColumnVisibility = {},
  } = useTableColumnVisibility("vendor-payments");

  const {
    mutate: updateTableColumnVisibility
  } = useUpdateTableColumnVisibility("vendor-payments");

  const [totalTrips, setTotalTrips] = useState(8);
  const [totalEarnings, setTotalEarnings] = useState(22500);
  const [localColumnVisibility, setLocalColumnVisibility] = useState({});
  const [isColumnVisibilityUpdated, setIsColumnVisibilityUpdated] = useState(false);
  const [rowSelection, setRowSelection] = React.useState({});
  const [sorting, setSorting] = React.useState([]);
  const [isSpinning, setIsSpinning] = React.useState(false);


  // 🌟 Fix: Avoid calling updateTableColumnVisibility inside useMemo (side effect in render)
  const columnVisibility = useMemo(() => {
    const serverVisibility = tableColumnVisibility.preferences || {};
    return { ...serverVisibility, ...localColumnVisibility };
  }, [tableColumnVisibility, localColumnVisibility]);

  useEffect(() => {
    // 🌟 Only update server when local or server visibility changes
    const serverVisibility = tableColumnVisibility.preferences || {};
    const finalVisibility = { ...serverVisibility, ...localColumnVisibility };
    if (isColumnVisibilityUpdated) {
      updateTableColumnVisibility(finalVisibility);
      setIsColumnVisibilityUpdated(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localColumnVisibility, isColumnVisibilityUpdated]);


  const handleRefetch = async () => {
    setIsSpinning(true);
    try {
      await refetch(); // wait for the refetch to complete
    } finally {
      // stop spinning after short delay to allow animation to play out
      setTimeout(() => setIsSpinning(false), 500);
    }
  };


  return (
    <React.Fragment>
      <div>
        <div className="rounded bg-white p-5 shadow">
          <div className="flex flex-col">
            <div className="flex justify-between items-center mb-5">
              <h1 className="text-3xl font-bold tracking-tight">Transactions</h1>
            </div>
            {/* Counter Cards */}
            <div className="flex justify-center gap-20 mt-4">
              <Card className="relative overflow-hidden border-none bg-gradient-to-br from-emerald-50 to-teal-50 shadow-md w-[230px] h-[120px] transform transition duration-300 ease-in-out hover:scale-105">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 opacity-0 w-full" />
                <div className="h-[150PX] w-full">
                  <CounterCard
                    color="bg-emerald-100"
                    icon={Activity}
                    count={totalTrips.toString()}
                    label="Total Trip Completed"
                    cardSize="w-[200px] h-[90px]"
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
                    count={vendor?.totalEarnings?.toLocaleString() || '0'}
                    label="Total Earnings"
                    cardSize="w-[200px] h-[90px]"
                  />
                </div>
                <div className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-blue-500 to-indigo-500 transform scale-x-100" />
              </Card>

              <Card className="relative overflow-hidden border-none bg-gradient-to-br from-blue-50 to-indigo-50 shadow-md w-[230px] h-[120px] transform transition duration-300 ease-in-out hover:scale-105">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 opacity-0 w-full" />
                <div className="h-[150PX] w-full">
                  <CounterCard
                    color="bg-blue-100"
                    icon={Activity}
                    count={vendor?.walletAmount || 0}
                    label="Wallet Amount"
                    cardSize="w-[200px] h-[90px]"
                  />
                </div>
                <div className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-blue-500 to-indigo-500 transform scale-x-100" />
              </Card>
            </div>
          </div>
        </div>
        <div>
          <MaterialReactTable
            columns={columns as MRT_ColumnDef<any>[]}
            data={vendorTransactions}
            positionGlobalFilter="left"
            enableHiding={false}
            onRowSelectionChange={setRowSelection}
            state={{ rowSelection, sorting, columnVisibility }}
            onColumnVisibilityChange={(newVisibility) => {
              setIsColumnVisibilityUpdated(true);
              setLocalColumnVisibility(newVisibility);
            }}
            enableSorting
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

export default page