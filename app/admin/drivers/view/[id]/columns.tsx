"use client";

import { BookingPopup } from 'components/booking/BookingPopup';
import {
  MRT_ColumnDef,
} from 'material-react-table'

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

export const columns: MRT_ColumnDef<Booking>[] = [
  {
    header: "S.No",
    Cell: ({ row }) => row.index + 1, // Assigns Serial Number dynamically
    muiTableHeadCellProps: { align: 'center' },
    muiTableBodyCellProps: { align: 'center' },
  },
  {
    accessorKey: "bookingId",
    header: "Booking ID",
    muiTableHeadCellProps: { align: 'center' },
    muiTableBodyCellProps: { align: 'center' },
    Cell: ({ row }) => {
      const booking = row.original;

      return (
        <BookingPopup
          trigger={
            <span
              style={{
                color: 'blue',
                textDecoration: 'underline',
                cursor: 'pointer',
              }}
            >
              {booking.bookingId}
            </span>
          }
          booking={booking}
        />
      );
    },
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
    Cell: ({ row }) => {
      const pickup = row.getValue("pickup") as string;
      if (!pickup) return <div>-</div>;
      if (pickup.length > 15) {
        const firstWord = pickup.split(" ")[0];
        if (firstWord.length > 15) {
          return <div>{pickup.slice(0, 15)}...</div>;
        }
        return <div>{firstWord}...</div>;
      }
      return <div>{pickup}</div>;
    }
  },
  {
    accessorKey: "drop",
    header: "To",
    muiTableHeadCellProps: { align: 'center' },
    muiTableBodyCellProps: { align: 'center' },
    Cell: ({ row }) => {
      const drop = row.getValue("drop") as string;
      if (!drop) return <div>-</div>;
      if (drop.length > 15) {
        const firstWord = drop.split(" ")[0];
        if (firstWord.length > 15) {
          return <div>{drop.slice(0, 15)}...</div>;
        }
        return <div>{firstWord}...</div>;
      }
      return <div>{drop}</div>;
    }
  },
  {
    accessorKey: "driverBeta",
    header: "Driver Beta",
    Cell: ({ row }) => {
      const amount = parseFloat(row.getValue("driverBeta"))
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
    accessorKey: "estimatedAmount",
    header: "Estimated Amount",
    Cell: ({ row }) => {
      const amount = parseFloat(row.getValue("estimatedAmount"))
      const formatted = new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
      }).format(amount)

      return <div>{formatted}</div>
    }
  },
  {
    accessorKey: "pickupDateTime",
    id: "pickupDate",
    header: "PickUp Date",
    Cell: ({ row }) => {
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
    }
  },
  {
    accessorKey: "createdAt",
    header: "Bookings At",
    Cell: ({ row }) => {
      const bookingDate: string = row.getValue("createdAt");
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