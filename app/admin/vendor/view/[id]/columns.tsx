"use client";

import { BookingPopup } from 'components/booking/BookingPopup';
import { dateRangeFilter } from 'lib/dateFunctions';
import {
  MRT_ColumnDef
} from 'material-react-table'
import { Booking } from "types/react-query/booking";
import TooltipComponent from "components/others/TooltipComponent";


export const columns: MRT_ColumnDef<Booking>[] = [
  {
    header: "S.No",
    Cell: ({ row }) => row.index + 1,
    muiTableHeadCellProps: { align: 'left', sx: {
      '& .MuiBox-root': {
        gap: 0, // ✅ Removes space between filter & menu icons
      },
      '& .MuiButtonBase-root': {
        padding: '2px',
        margin: 0,
      },
    } },
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
    muiTableHeadCellProps: { align: 'left', sx: {
      '& .MuiBox-root': {
        gap: 0, // ✅ Removes space between filter & menu icons
      },
      '& .MuiButtonBase-root': {
        padding: '2px',
        margin: 0,
      },
    } },
    muiTableBodyCellProps: { align: 'left' },
    size: 20,
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
    Header: () => (
      <div style={{ textAlign: 'left', lineHeight: 1.2 }}>
        Customer<br />Name
      </div>
    ),
    muiTableHeadCellProps: { align: 'left', sx: {
      '& .MuiBox-root': {
        gap: 0, // ✅ Removes space between filter & menu icons
      },
      '& .MuiButtonBase-root': {
        padding: '2px',
        margin: 0,
      },
    } },
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
    muiTableHeadCellProps: { align: 'left', sx: {
      '& .MuiBox-root': {
        gap: 0, // ✅ Removes space between filter & menu icons
      },
      '& .MuiButtonBase-root': {
        padding: '2px',
        margin: 0,
      },
    } },
    muiTableBodyCellProps: { align: 'left' },
    size: 30,
  },
  {
    accessorKey: "pickup",
    header: "From",
      Cell: ({ row }) => {
          const pickup = row.getValue("pickup") as string;
          if (!pickup) return <div>-</div>;
          return (
            <TooltipComponent name={pickup}>
              <div>{pickup.slice(0, 15)}...</div>
            </TooltipComponent>
          )
        },
    muiTableHeadCellProps: { align: 'left', sx: {
      '& .MuiBox-root': {
        gap: 0, // ✅ Removes space between filter & menu icons
      },
      '& .MuiButtonBase-root': {
        padding: '2px',
        margin: 0,
      },
    } },
    muiTableBodyCellProps: { align: 'left' },
     
    size: 30,
  },
  {
    accessorKey: "drop",
    header: "To",
    Cell: ({ row }) => {
          const drop = row.getValue("drop") as string;
          if (!drop) return <div>-</div>;
          return (
            <TooltipComponent name={drop}>
              <div>{drop.slice(0, 15)}...</div>
            </TooltipComponent>
          )
        },
    muiTableHeadCellProps: { align: 'left', sx: {
      '& .MuiBox-root': {
        gap: 0, // ✅ Removes space between filter & menu icons
      },
      '& .MuiButtonBase-root': {
        padding: '2px',
        margin: 0,
      },
    } },
    muiTableBodyCellProps: { align: 'left' },
    size: 30,
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
    muiTableHeadCellProps: { align: 'left', sx: {
      '& .MuiBox-root': {
        gap: 0, // ✅ Removes space between filter & menu icons
      },
      '& .MuiButtonBase-root': {
        padding: '2px',
        margin: 0,
      },
    } },
    muiTableBodyCellProps: { align: 'left' },
    size: 20,
  },
  {
    id: "pickupDateTime",
    header: "PickUp Date",
    Header: () => (
      <div style={{ textAlign: 'left', lineHeight: 1.2 }}>
        PickUp<br />Date
      </div>
    ),
    muiTableHeadCellProps: { align: 'left', sx: {
      '& .MuiBox-root': {
        gap: 0, // ✅ Removes space between filter & menu icons
      },
      '& .MuiButtonBase-root': {
        padding: '2px',
        margin: 0,
      },
    } },
    muiTableBodyCellProps: { align: 'left' },
    size: 20,
    // filterVariant: "date",
    Cell: ({ row }) => {
      const pickupDate: string = row.original.pickupDateTime || "";
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

      return <div>{formattedDate}</div>;
    },
    accessorFn: (row) => new Date(row.pickupDateTime || ""),
    // filterFn: dateRangeFilter,
    // filterVariant: "date-range",
    // sortingFn: "datetime",
  },
  {
    accessorKey: "pickupDateTime",
    id: "pickupTime",
    header: "PickUp Time",
    Header: () => (
      <div style={{ textAlign: 'left', lineHeight: 1.2 }}>
        PickUp<br />Time
      </div>
    ),
    muiTableHeadCellProps: { align: 'left', sx: {
      '& .MuiBox-root': {
        gap: 0, // ✅ Removes space between filter & menu icons
      },
      '& .MuiButtonBase-root': {
        padding: '2px',
        margin: 0,
      },
    } },
    muiTableBodyCellProps: { align: 'left' },
    size: 20,
    Cell: ({ row }) => {
      const pickupTime: string = row.getValue("pickupTime");
      if (!pickupTime) {
        return <div>-</div>;
      }

      // Parse the stored UTC date
      const utcDate = new Date(pickupTime);

      // Adjust back to IST (Subtract 5.5 hours)
      const istDate = new Date(utcDate.getTime() - (5.5 * 60 * 60 * 1000));

      // Format the corrected IST time
      const options: Intl.DateTimeFormatOptions = {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      };

      const amPmTime = new Intl.DateTimeFormat("en-IN", options).format(istDate);

      return <div>{amPmTime}</div>;
    },
   
  },
  {
    id: "dropDate",
    header: "Drop Date",
    Header: () => (
      <div style={{ textAlign: 'left', lineHeight: 1.2 }}>
        Drop<br />Date
      </div>
    ),
    muiTableHeadCellProps: { align: 'left', sx: {
      '& .MuiBox-root': {
        gap: 0, // ✅ Removes space between filter & menu icons
      },
      '& .MuiButtonBase-root': {
        padding: '2px',
        margin: 0,
      },
    } },
    muiTableBodyCellProps: { align: 'left' },
    size: 20,
    Cell: ({ row }) => {
      const dropDate: string = row.original.dropDate || "";

      if (!dropDate) {
        return <div>-</div>;
      }

      // Parse the stored UTC date
      const utcDate = new Date(dropDate);

      // Adjust back to IST (Subtract 5.5 hours)
      const istDate = new Date(utcDate.getTime() - (5.5 * 60 * 60 * 1000));

      // Format the corrected IST date
      const formattedDate = istDate.toLocaleString("en-IN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });

      return <div>{formattedDate}</div>;
    },
    accessorFn: (row) => new Date(row.dropDate || ""),
    // filterFn: dateRangeFilter,
    // filterVariant: "date-range",
    // sortingFn: "datetime",
  },
  {
    id: "createdAt",
    header: "Bookings At",
    Header: () => (
      <div style={{ textAlign: 'left', lineHeight: 1.2 }}>
        Bookings<br />At
      </div>
    ),
    muiTableHeadCellProps: { align: 'left', sx: {
      '& .MuiBox-root': {
        gap: 0, // ✅ Removes space between filter & menu icons
      },
      '& .MuiButtonBase-root': {
        padding: '2px',
        margin: 0,
      },
    } },
    muiTableBodyCellProps: { align: 'left' },
    size: 20,
    Cell: ({ row }) => {
      const bookingDate: string = row.original.createdAt || "";
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

      const amPmTime = new Intl.DateTimeFormat("en-IN", options).format(utcDate);

      return (
        <div>
          <div>{formattedDate}</div>
          <div>{amPmTime}</div>
        </div>
      )
    },
    accessorFn: (row) => new Date(row.createdAt || ""),
    // filterFn: dateRangeFilter,
    // filterVariant: "date-range",
    // sortingFn: "datetime",
  },
]