
import React from "react";
import { StatsCard } from "./StatsCard";
import { Driver } from "types/react-query/driver";
import { columns } from "app/admin/drivers/view/[id]/columns";
import {
  MRT_ColumnDef,
  MaterialReactTable
} from 'material-react-table';


interface BookingsTabProps {
  totalTrips: number;
  editedDriver: Driver | null;
  bookingData: any[];

}

export default function BookingsTab({
  totalTrips,
  editedDriver,
  bookingData,
}: BookingsTabProps) {
  return (
    <div className="relative p-12 py-20">
      <div className="grid gap-5 md:grid-cols-3 lg:grid-cols-3">
        <StatsCard
          count={totalTrips}
          label="Total Trips"
          gradientFrom="emerald"
          gradientTo="teal"
          color="emerald"
        />
        <StatsCard
          count={editedDriver?.totalEarnings || 0}
          label="Total Earned"
          gradientFrom="blue"
          gradientTo="indigo"
          color="blue"
          format="currency"
        />
        <StatsCard
          count={editedDriver?.wallet?.balance ?? 0}
          label="Wallet Balance"
          gradientFrom="purple"
          gradientTo="pink"
          color="purple"
        />
      </div>
      <div className="flex flex-col gap-4 pt-5">
        <h2 className="text-black text-lg font-bold">Booking History</h2>
        <MaterialReactTable
          columns={columns as MRT_ColumnDef<any>[]}
          data={bookingData as any}
          positionGlobalFilter="left"
          enableSorting
          enableHiding={false}
          enableDensityToggle={false}
          initialState={{
            density: 'compact',
            pagination: { pageIndex: 0, pageSize: 10 },
            showGlobalFilter: true
          }}
          muiSearchTextFieldProps={{
            placeholder: 'Search bookings...',
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
        />
      </div>
    </div>
  );
}