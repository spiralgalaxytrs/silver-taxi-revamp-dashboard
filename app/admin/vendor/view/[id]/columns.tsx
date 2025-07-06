"use client";

import {
  MRT_ColumnDef
} from 'material-react-table'

export type Booking = {
  id: string | undefined;
  bookingId?: string;
  name: string;
  phone: string;
  estimatedAmount: number | null;
  bookingDate: string;
  pickup: string;
  drop: string;
  pickupDate: string;
  dropDate: string | null;
};

export const columns: MRT_ColumnDef<Booking>[] = [
  {
    header: "S.No",
    Cell: ({ row }) => row.index + 1,
    muiTableHeadCellProps: { align: 'center' },
    muiTableBodyCellProps: { align: 'center' },
    
  },
  {
    accessorKey: "bookingId",
    header: "Booking ID",
    muiTableHeadCellProps: { align: 'center' },
    muiTableBodyCellProps: { align: 'center' },
  },
  {
    accessorKey: "name",
    header: "Customer Name",
    muiTableHeadCellProps: { align: 'center' },
    muiTableBodyCellProps: { align: 'center' },
  },
  {
    accessorKey: "phone",
    header: "Mobile Number",
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
    accessorKey: "estimatedAmount",
    header: "Estimated Amount",
    Cell: ({ row }) => {
      const amount = parseFloat(row.getValue("estimatedAmount"))
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
    header: "PickUp Date",
    Cell: ({ row }) => {
      const pickupDate: string = row.getValue("pickupDate");
      if (!pickupDate) {
        return <div>-</div>;
      }

      // Parse the stored UTC date
      const utcDate = new Date(pickupDate);

      // Adjust back to IST (Subtract 5.5 hours)
      const istDate = new Date(utcDate.getTime() - (5.5 * 60 * 60 * 1000));

      // Format the corrected IST date
      const formattedDate = istDate.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });

      return (
        <div>
          <div>{formattedDate}</div>
        </div>
      );
    },
    muiTableHeadCellProps: { align: 'center' },
    muiTableBodyCellProps: { align: 'center' },
  },
  {
    accessorKey: "dropDate",
    header: "Drop Date",
    Cell: ({ row }) => {
      const dropDate: string = row.getValue("dropDate");
      if (!dropDate) {
        return <div>-</div>;
      }

      // Parse the stored UTC date
      const utcDate = new Date(dropDate);

      // Adjust back to IST (Subtract 5.5 hours)
      const istDate = new Date(utcDate.getTime() - (5.5 * 60 * 60 * 1000));

      // Format the corrected IST date
      const formattedDate = istDate.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });

      return <div>{formattedDate}</div>;
    },
    muiTableHeadCellProps: { align: 'center' },
    muiTableBodyCellProps: { align: 'center' },
  },
  {
    accessorKey: "bookingDate",
    header: "Bookings At",
    Cell: ({ row }) => {
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
    muiTableHeadCellProps: { align: 'center' },
    muiTableBodyCellProps: { align: 'center' },
  },
]