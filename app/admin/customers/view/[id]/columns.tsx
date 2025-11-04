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
    Header: () => (
      <div style={{ textAlign: 'left', lineHeight: 1.2 }}>
        Booking<br />ID
      </div>
    ),
    muiTableHeadCellProps: { align: 'left' },
    muiTableBodyCellProps: { align: 'left' },
    size: 30,
  },
  {
    accessorKey: "pickup",
    header: "From",
    muiTableHeadCellProps: { align: 'left' },
    muiTableBodyCellProps: { align: 'left' },
  },
  {
    accessorKey: "drop",
    header: "To",
    muiTableHeadCellProps: { align: 'left' },
    muiTableBodyCellProps: { align: 'left' },
  },
  {
    accessorKey: "serviceType",
    header: "Booking Type",
    Header: () => (
      <div style={{ textAlign: 'left', lineHeight: 1.2 }}>
        Booking<br />Type
      </div>
    ),
    muiTableHeadCellProps: { align: 'left' },
    muiTableBodyCellProps: { align: 'left' },
    size: 30,
  },
  {
    accessorKey: "finalAmount",
    header: "Total Amount",
    Header: () => (
      <div style={{ textAlign: 'left', lineHeight: 1.2 }}>
        Total<br />Amount
      </div>
    ),
    Cell: ({ row }) => {
      const amount = parseFloat(row.getValue("finalAmount"))
      const formatted = new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
      }).format(amount)

      return <div>{formatted}</div>
    },
    muiTableHeadCellProps: { align: 'left' },
    muiTableBodyCellProps: { align: 'left' },
    size: 30,
  },
  {
    accessorKey: "pickupDate",
    header: "Pickup Date",
    Header: () => (
      <div style={{ textAlign: 'left', lineHeight: 1.2 }}>
        Pickup<br />Date
      </div>
    ),
    Cell: ({ row }) => {
      const pickupDate: string = row.getValue("pickupDate")
      if (pickupDate === null) {
        return <div>-</div>
      }
      const date = new Date(pickupDate);
      const convertedDate = date.toLocaleDateString();
      return <div>{convertedDate}</div>
    },
    muiTableHeadCellProps: { align: 'left' },
    muiTableBodyCellProps: { align: 'left' },
    size: 20,
  },
  {
    accessorKey: "dropDate",
    header: "Drop Date",
    Header: () => (
      <div style={{ textAlign: 'left', lineHeight: 1.2 }}>
        Drop<br />Date
      </div>
    ),
    Cell: ({ row }) => {
      const dropDate: string = row.getValue("dropDate")
      if (dropDate === null) {
        return <div>-</div>
      }
      const date = new Date(dropDate);
      const convertedDate = date.toLocaleDateString();

      return (
        <div>
          <p>{convertedDate}</p>
        </div>
      )
    },
    muiTableHeadCellProps: { align: 'left' },
    muiTableBodyCellProps: { align: 'left' },
    size: 20,
  }
];