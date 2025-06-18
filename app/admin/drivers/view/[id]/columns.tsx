"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "components/ui/badge"
import { Button } from "components/ui/button"

export type WalletAttributes = {
  balance: number;
}

export type Booking = {
  id: string | undefined;
  bookingId?: string;
  name: string;
  phone: string;
  bookingDate: string;
  pickup: string;
  drop: string;
  pickupDate: string;
  dropDate: string | null;
  driverBeta: number | null;
};

export const columns: ColumnDef<Booking>[] = [
  {
    header: "S.No",
    cell: ({ row }) => row.index + 1, // Assigns Serial Number dynamically
  },
  {
    accessorKey: "bookingId",
    header: "Booking ID",
  },
  {
    accessorKey: "name",
    header: "Customer Name",
  },
  {
    accessorKey: "phone",
    header: "Mobile Number",
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
    accessorKey: "driverBeta",
    header: "Driver Beta",
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("driverBeta"))
      const formatted = new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
      }).format(amount)

      return <div>{formatted}</div>
    },
  },
  {
    accessorKey: "estimatedAmount",
    header: "Estimated Amount",
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("estimatedAmount"))
      const formatted = new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
      }).format(amount)

      return <div>{formatted}</div>
    },
  },
  {
    accessorKey: "pickupDate",
    header: "PickUp Date",
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
  },
  {
    accessorKey: "bookingDate",
    header: "Bookings At",
    cell: ({ row }) => {
      const bookingDate: string = row.getValue("bookingDate");
      if (!bookingDate) {
        return <div>-</div>;
      }

      // Parse the stored UTC date
      const utcDate = new Date(bookingDate);

      // Adjust back to IST (Subtract 5.5 hours)
      const istDate = new Date(utcDate.getTime() - (5.5 * 60 * 60 * 1000));

      // Format the corrected IST time
      const options: Intl.DateTimeFormatOptions = {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      };

      const formattedDate = istDate.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });

      const amPmTime = new Intl.DateTimeFormat("en-IN", options).format(istDate);

      return (
        <div>
          <div>{formattedDate}</div>
          <div>{amPmTime}</div>
        </div>
      )
    },
  },
]