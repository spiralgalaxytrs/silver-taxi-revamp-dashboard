"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "components/ui/badge";

export type VendorTransaction = {
    transactionId: string;
    vendorId?: string;
    initiatedBy: string;
    initiatedTo: string;
    ownedBy: "Driver" | "Vendor";
    type: string;
    amount: number;
    createdAt?: string;
    description: string
};

export const columns: ColumnDef<VendorTransaction>[] = [
    {
        header: "S.No",
        cell: ({ row }) => row.index + 1,
    },
    {
        accessorKey: "transactionId",
        header: "Transaction ID",
    },
    // {
    //     accessorKey: "vendorId",
    //     header: "Vendor ID",
    // },
    {
        accessorKey: "initiatedTo",
        header: "Name",
    },
      {
        accessorKey: "initiatedTo",
        header: "Phone",
    },
      {
        accessorKey: "initiatedTo",
        header: "Email",
    },
      
    {
        accessorKey: "ownedBy",
        header: "Category",
    },
    {
        accessorKey: "type",
        header: "Transaction Type",
        cell: ({ row }) => {
            const type = row.getValue("type") as string;
            return (
                <div>
                    <Badge variant={type.toLowerCase() === "credit" ? "default" : "destructive"}>
                        {type}
                    </Badge>
                </div>
            );
        },
    },
    {
        accessorKey: "amount",
        header: "Amount",
        cell: ({ row }) => {
            const amount = parseFloat(row.getValue("amount"));
            const type = row.getValue("type") as string;
            const prefix = type.toLowerCase() === "credit" ? "+" : "-";
            const formatted = new Intl.NumberFormat("en-IN", {
                style: "currency",
                currency: "INR",
            }).format(amount);

            return <div>{prefix} {formatted}</div>
        },
    },
    {
        accessorKey: "initiatedTo",
        header: "Status",
    },
    {
        accessorKey: "createdAt",
        header: "Created Date/Time",
        cell: ({ row }) => {
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
    }
];