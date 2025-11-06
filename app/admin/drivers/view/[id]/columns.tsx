"use client";

import { BookingPopup } from 'components/booking/BookingPopup';
import {
  MRT_ColumnDef,
} from 'material-react-table'
import TooltipProvider from 'components/others/TooltipComponent'
import TooltipComponent from 'components/others/TooltipComponent';
import Image from 'next/image'

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
  status: string;
};

export const columns: MRT_ColumnDef<Booking>[] = [
  {
    header: "S.No",
    Cell: ({ row }) => row.index + 1, // Assigns Serial Number dynamically
    muiTableHeadCellProps: {
      align: 'left', sx: {
        '& .MuiBox-root': {
          gap: 0, // ✅ Removes space between filter & menu icons
        },
        '& .MuiButtonBase-root': {
          padding: '2px',
          margin: 0,
        },
      }
    },
    muiTableBodyCellProps: { align: 'left' },
    size: 10,
  },
  {
    accessorKey: "bookingId",
    header: "Booking ID",
    Header: () => (
      <div style={{ textAlign: 'left', lineHeight: 1.2 }}>
        Booking<br />ID
      </div>
    ),
    muiTableHeadCellProps: {
      align: 'left', sx: {
        '& .MuiBox-root': {
          gap: 0, // ✅ Removes space between filter & menu icons
        },
        '& .MuiButtonBase-root': {
          padding: '2px',
          margin: 0,
        },
      }
    },
    muiTableBodyCellProps: { align: 'left' },
    size: 30,
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
          bookingId={booking?.bookingId || ""}
        />
      );
    },
  },
  {
    accessorKey: "name",
    header: "Customer Name",
    Header: () => (
      <div style={{ textAlign: 'left', lineHeight: 1.2 }}>
        Customer<br />Name
      </div>
    ),
    muiTableHeadCellProps: {
      align: 'left', sx: {
        '& .MuiBox-root': {
          gap: 0, // ✅ Removes space between filter & menu icons
        },
        '& .MuiButtonBase-root': {
          padding: '2px',
          margin: 0,
        },
      }
    },
    muiTableBodyCellProps: { align: 'left' },
    size: 30,
  },
  {
    accessorKey: "phone",
    header: "Mobile Number",
    Header: () => (
      <div style={{ textAlign: 'left', lineHeight: 1.2 }}>
        Mobile<br />Number
      </div>
    ),
    muiTableHeadCellProps: {
      align: 'left', sx: {
        '& .MuiBox-root': {
          gap: 0, // ✅ Removes space between filter & menu icons
        },
        '& .MuiButtonBase-root': {
          padding: '2px',
          margin: 0,
        },
      }
    },
    muiTableBodyCellProps: { align: 'left' },
    size: 30,
  },
  {
    accessorKey: "pickup",
    header: "From",
    muiTableHeadCellProps: {
      align: 'left', sx: {
        '& .MuiBox-root': {
          gap: 0, // ✅ Removes space between filter & menu icons
        },
        '& .MuiButtonBase-root': {
          padding: '2px',
          margin: 0,
        },
      }
    },
    muiTableBodyCellProps: { align: 'left' },
    size: 40,
    Cell: ({ row }) => {
      const pickup = row.getValue("pickup") as string;
      if (!pickup) return <div>-</div>;
      if (pickup.length > 15) {
        const firstWord = pickup.split(" ")[0];
        if (firstWord.length > 15) {
          return (
            <TooltipComponent name={pickup}>
              <div>{firstWord}...</div>
            </TooltipComponent>
          )
        }
        return (
          <TooltipComponent name={pickup}>
            <div>{pickup.slice(0, 15)}...</div>
          </TooltipComponent>
        )
      }
      return <div>{pickup}</div>;
    },
  },
  {
    accessorKey: "drop",
    header: "To",
    muiTableHeadCellProps: {
      align: 'left', sx: {
        '& .MuiBox-root': {
          gap: 0, // ✅ Removes space between filter & menu icons
        },
        '& .MuiButtonBase-root': {
          padding: '2px',
          margin: 0,
        },
      }
    },
    muiTableBodyCellProps: { align: 'left' },
    size: 40,
    Cell: ({ row }) => {
      const drop = row.getValue("drop") as string;
      if (!drop) return <div>-</div>;
      if (drop.length > 15) {
        const firstWord = drop.split(" ")[0];
        if (firstWord.length > 15) {
          return (
            <TooltipComponent name={drop}>
              <div>{firstWord}...</div>
            </TooltipComponent>
          )
        }
        return (
          <TooltipComponent name={drop}>
            <div>{drop.slice(0, 15)}...</div>
          </TooltipComponent>
        )
      }
      return <div>{drop}</div>;
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    Cell: ({ row }) => {
      const status = row.getValue("status") as string
      return <div>{status}</div>
    },
    muiTableHeadCellProps: {
      align: 'left', sx: {
        '& .MuiBox-root': {
          gap: 0, // ✅ Removes space between filter & menu icons
        },
        '& .MuiButtonBase-root': {
          padding: '2px',
          margin: 0,
        },
      }
    },
    muiTableBodyCellProps: { align: 'left' },
    size: 20,
  },
  {
    accessorKey: "driverBeta",
    header: "Driver Beta",
    Header: () => (
      <div style={{ textAlign: 'left', lineHeight: 1.2 }}>
        Driver<br />Beta
      </div>
    ),
    Cell: ({ row }) => {
      const amount = parseFloat(row.getValue("driverBeta"))
      const formatted = new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
      }).format(amount)

      return <div>{formatted}</div>
    },
    muiTableHeadCellProps: {
      align: 'left', sx: {
        '& .MuiBox-root': {
          gap: 0, // ✅ Removes space between filter & menu icons
        },
        '& .MuiButtonBase-root': {
          padding: '2px',
          margin: 0,
        },
      }
    },
    muiTableBodyCellProps: { align: 'left' },
    size: 20,
  },
  {
    accessorKey: "estimatedAmount",
    header: "Estimated Amount",
    Header: () => (
      <div style={{ textAlign: 'left', lineHeight: 1.2 }}>
        Estimated<br />Amount
      </div>
    ),
    Cell: ({ row }) => {
      const amount = parseFloat(row.getValue("estimatedAmount"))
      const formatted = new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
      }).format(amount)

      return <div>{formatted}</div>
    },
    muiTableHeadCellProps: {
      align: 'left', sx: {
        '& .MuiBox-root': {
          gap: 0, // ✅ Removes space between filter & menu icons
        },
        '& .MuiButtonBase-root': {
          padding: '2px',
          margin: 0,
        },
      }
    },
    muiTableBodyCellProps: { align: 'left' },
    size: 30,
  },
  {
    accessorKey: "pickupDateTime",
    id: "pickupDate",
    header: "PickUp Date",
    Header: () => (
      <div style={{ textAlign: 'left', lineHeight: 1.2 }}>
        PickUp<br />Date
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
    muiTableHeadCellProps: {
      align: 'left', sx: {
        '& .MuiBox-root': {
          gap: 0, // ✅ Removes space between filter & menu icons
        },
        '& .MuiButtonBase-root': {
          padding: '2px',
          margin: 0,
        },
      }
    },
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
          <div>{convertedDate}</div>
        </div>
      )
    },
    muiTableHeadCellProps: {
      align: 'left', sx: {
        '& .MuiBox-root': {
          gap: 0, // ✅ Removes space between filter & menu icons
        },
        '& .MuiButtonBase-root': {
          padding: '2px',
          margin: 0,
        },
      }
    },
    muiTableBodyCellProps: { align: 'left' },
    size: 20,
  },
  {
    accessorKey: "createdAt",
    header: "Bookings At",
    Header: () => (
      <div style={{ textAlign: 'left', lineHeight: 1.2 }}>
        Bookings<br />At
      </div>
    ),
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
    muiTableHeadCellProps: {
      align: 'left', sx: {
        '& .MuiBox-root': {
          gap: 0, // ✅ Removes space between filter & menu icons
        },
        '& .MuiButtonBase-root': {
          padding: '2px',
          margin: 0,
        },
      }
    },
    muiTableBodyCellProps: { align: 'left' },
    size: 20,
  },
]