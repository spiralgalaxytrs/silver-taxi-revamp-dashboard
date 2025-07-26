"use client";

import { Badge } from "components/ui/badge";
import {
  MRT_ColumnDef
} from 'material-react-table'

export type GeneralTransaction = {
  transactionId: string;
  driverId?: string;
  VendorId?: string;
  initiatedBy: string;
  initiatedTo: string;
  type: string;
  amount: number;
  createdAt: string;
  description: string;
};

export const columns: MRT_ColumnDef<GeneralTransaction>[] = [
  {
    header: "S.No",
    Cell: ({ row }) => row.index + 1,
    muiTableHeadCellProps: { align: 'center' },
    muiTableBodyCellProps: { align: 'center' },
  },
  {
    accessorKey: "bookingOrderId",
    header: "Transaction ID",
    Cell: ({ row }) => {
      const bookingOrderId = row.getValue("bookingOrderId") as string;

      if (!bookingOrderId || bookingOrderId === "null") return <div>-</div>;

      return (
        <div>
          {bookingOrderId}
        </div>
      );
    },
    muiTableHeadCellProps: { align: 'center' },
    muiTableBodyCellProps: { align: 'center' },
  },
  {
    accessorKey: "name",
    header: "Name",
    Cell: ({ row }) => {
      const name = row.getValue("name") as string;

      if (!name || name === "null") return <div>-</div>;

      return (
        <div>
          {name}
        </div>
      );
    },
    muiTableHeadCellProps: { align: 'center' },
    muiTableBodyCellProps: { align: 'center' },
  },
  {
    accessorKey: "phone",
    header: "Phone",
    muiTableHeadCellProps: { align: 'center' },
    muiTableBodyCellProps: { align: 'center' },
  }, {
    accessorKey: "email",
    header: "Email",
    muiTableHeadCellProps: { align: 'center' },
    muiTableBodyCellProps: { align: 'center' },
  },
  {
    accessorKey: "paymentMethod",
    header: "Payment Method",
    Cell: ({ row }) => {
      const type = row.getValue("paymentMethod") as string;
      return (
        <div>
          <Badge variant="outline">
            {type}
          </Badge>
        </div>
      );
    },
    muiTableHeadCellProps: { align: 'center' },
    muiTableBodyCellProps: { align: 'center' },
  },
  {
    accessorKey: "tripCompletedFinalAmount",
    header: "Amount",
    Cell: ({ row }) => {
      const amount = parseFloat(row.getValue("tripCompletedFinalAmount"));
      const prefix = row.getValue("status") === "Completed" ? "+" : "";
      const formatted = new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
      }).format(amount);

      return <div>{prefix} {formatted}</div>
    },
    muiTableHeadCellProps: { align: 'center' },
    muiTableBodyCellProps: { align: 'center' },
  },
  {
    accessorKey: "status",
    header: "Status",
    Cell: ({ row }) => {
      const status = row.getValue("status") as string;
      return (
        <div>
          <Badge variant="default">
            {status}
          </Badge>
        </div>
      );
    },
    muiTableHeadCellProps: { align: 'center' },
    muiTableBodyCellProps: { align: 'center' },
  },
  {
    accessorKey: "createdAt",
    header: "Created Date/Time",
    Cell: ({ row }) => {
      const createdAt: string = row.getValue("createdAt")
      const date = new Date(createdAt);
      const convertedDate = date.toLocaleDateString();
      const options: Intl.DateTimeFormatOptions = { hour: 'numeric', minute: 'numeric', hour12: true };
      const amPmTime = date.toLocaleTimeString('en-IN', options);

      return (
        <div>
          <div>{convertedDate}</div>
          <div>{amPmTime}</div>
        </div>
      )
    },
    muiTableHeadCellProps: { align: 'center' },
    muiTableBodyCellProps: { align: 'center' },
  }
];