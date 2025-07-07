"use client";

import { Badge } from "components/ui/badge";
import {
    MRT_ColumnDef,
} from "material-react-table"

export type VendorTransaction = {
    transactionId: string;
    vendorId?: string;
    initiatedBy: string;
    initiatedTo: string;
    ownedBy: "Driver" | "Vendor";
    type: string;
    amount: number;
    createdAt?: string;
    description: string;
    remark: string;
};

export const walletColumns: MRT_ColumnDef<VendorTransaction>[] = [
    {
        header: "S.No",
        Cell: ({ row }) => row.index + 1,
        muiTableHeadCellProps: { align: 'center' },
        muiTableBodyCellProps: { align: 'center' },
    },
    {
        accessorKey: "transactionId",
        header: "Transaction ID",
        muiTableHeadCellProps: { align: 'center' },
        muiTableBodyCellProps: { align: 'center' },
    },
    // {
    //     accessorKey: "vendorId",
    //     header: "Vendor ID",
    //   muiTableHeadCellProps: { align: 'center' },
    // muiTableBodyCellProps: { align: 'center' },
    // },
    {
        accessorKey: "initiatedTo",
        header: "Name/Phone",
        muiTableHeadCellProps: { align: 'center' },
        muiTableBodyCellProps: { align: 'center' },
    },
    {
        accessorKey: "ownedBy",
        header: "Category",
        muiTableHeadCellProps: { align: 'center' },
        muiTableBodyCellProps: { align: 'center' },
    },
    {
        accessorKey: "type",
        header: "Transaction Type",
        Cell: ({ row }) => {
            const type = row.getValue("type") as string;
            return (
                <div>
                    <Badge variant={type.toLowerCase() === "credit" ? "default" : "destructive"}>
                        {type}
                    </Badge>
                </div>
            );
        },
        muiTableHeadCellProps: { align: 'center' },
        muiTableBodyCellProps: { align: 'center' },
    },
    {
        accessorKey: "amount",
        header: "Amount",
        Cell: ({ row }) => {
            const amount = parseFloat(row.getValue("amount"));
            const type = row.getValue("type") as string;
            const prefix = type.toLowerCase() === "credit" ? "+" : "-";
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
        accessorKey: "remark",
        header: "Remarks",
        Cell: ({ row }) => {
            const remark: string = row.getValue("remark");
            return (
                <div>
                    <p>{remark || "-"}</p>
                </div>
            )
        },
        muiTableHeadCellProps: { align: 'center' },
        muiTableBodyCellProps: { align: 'center' },
    },
    {
        accessorKey: "createdAt",
        header: "Date/Time",
        Cell: ({ row }) => {
            const createdAt: string = row.getValue("createdAt")
            const date = new Date(createdAt);
            const convertedDate = date.toLocaleDateString();
            const options: Intl.DateTimeFormatOptions = { hour: 'numeric', minute: 'numeric', hour12: true };
            const amPmTime = date.toLocaleTimeString('en-IN', options);

            return (
                <div>
                    <p>{convertedDate}</p>
                    <p>{amPmTime}</p>
                </div>
            )
        },
        muiTableHeadCellProps: { align: 'center' },
        muiTableBodyCellProps: { align: 'center' },
    },
];