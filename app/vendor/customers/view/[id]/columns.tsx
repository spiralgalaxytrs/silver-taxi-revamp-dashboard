"use client";

import { ColumnDef } from "@tanstack/react-table";

export type Booking = {
  bookingId: string;
  pickup: string;
  drop: string;
  serviceType: string;
  pickupDate: string;
  dropDate: string;
  finalAmount: number;
};

export const bookingColumns: ColumnDef<Booking>[] = [
  {
    accessorKey: "bookingId",
    header: "Booking ID",
  },
  {
    accessorKey: "pickup",
    header: "From",
  },
  {
    accessorKey: "drop",
    header: "To",
  },
  {
    accessorKey: "serviceType",
    header: "Booking Type",
  },
  {
    accessorKey: "finalAmount",
    header: "Total Amount",
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("finalAmount"))
      const formatted = new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
      }).format(amount)

      return <div>{formatted}</div>
    },
  },
  {
    accessorKey: "pickupDate",
    header: "Pickup Date",
    cell: ({ row }) => {
      const pickupDate: string = row.getValue("pickupDate")
      if (pickupDate === null) {
        return <div>-</div>
      }
      const date = new Date(pickupDate);
      const convertedDate = date.toLocaleDateString();
      return <div>{convertedDate}</div>
    },
  },
  {
    accessorKey: "dropDate",
    header: "Drop Date",
    cell: ({ row }) => {
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
    }
  }
];