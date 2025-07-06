"use client";

import {
  MRT_ColumnDef
} from 'material-react-table'

export type Booking = {
  bookingId: string;
  pickup: string;
  drop: string;
  serviceType: string;
  pickupDate: string;
  dropDate: string;
  finalAmount: number;
};

export const bookingColumns: MRT_ColumnDef<Booking>[] = [
  {
    accessorKey: "bookingId",
    header: "Booking ID",
    muiTableHeadCellProps: { align: 'center' },
    muiTableBodyCellProps: { align: 'center' },
  },
  {
    accessorKey: "pickup",
    header: "From",
    muiTableHeadCellProps: { align: 'center' },
    muiTableBodyCellProps: { align: 'center' },
  },
  {
    accessorKey: "drop",
    header: "To",
    muiTableHeadCellProps: { align: 'center' },
    muiTableBodyCellProps: { align: 'center' },
  },
  {
    accessorKey: "serviceType",
    header: "Booking Type",
    muiTableHeadCellProps: { align: 'center' },
    muiTableBodyCellProps: { align: 'center' },
  },
  {
    accessorKey: "finalAmount",
    header: "Total Amount",
    Cell: ({ row }) => {
      const amount = parseFloat(row.getValue("finalAmount"))
      const formatted = new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
      }).format(amount)

      return <div>{formatted}</div>
    },
    muiTableHeadCellProps: { align: 'center' },
    muiTableBodyCellProps: { align: 'center' },
  },
  {
    accessorKey: "pickupDate",
    header: "Pickup Date",
    Cell: ({ row }) => {
      const pickupDate: string = row.getValue("pickupDate")
      if (pickupDate === null) {
        return <div>-</div>
      }
      const date = new Date(pickupDate);
      const convertedDate = date.toLocaleDateString();
      return <div>{convertedDate}</div>
    },
    muiTableHeadCellProps: { align: 'center' },
    muiTableBodyCellProps: { align: 'center' },
  },
  {
    accessorKey: "dropDate",
    header: "Drop Date",
    Cell: ({ row }) => {
      const dropDate: string = row.getValue("dropDate")
      if (dropDate === null) {
        return <div>-</div>
      }
      const date = new Date(dropDate);
      const convertedDate = date.toLocaleDateString();

      return (
        <div>
          <div>{convertedDate}</div>
        </div>
      )
    },
    muiTableHeadCellProps: { align: 'center' },
    muiTableBodyCellProps: { align: 'center' },
  }
];