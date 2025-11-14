"use client";

import { Badge } from "components/ui/badge";
import {
    MRT_ColumnDef,
} from 'material-react-table'
import TooltipComponent from "components/others/TooltipComponent";
import { WalletTransaction } from "types/react-query/wallet";

export const walletColumns: MRT_ColumnDef<WalletTransaction>[] = [
    {
        header: "S.No",
        Cell: ({ row }) => row.index + 1, // Assigns Serial Number dynamically
        muiTableHeadCellProps: {
            align: 'left',
            sx: {
                '& .MuiBox-root': {
                    gap: 0, // ✅ Removes space between filter & menu icons
                },
                '& .MuiButtonBase-root': {
                    padding: '2px',
                    margin: 0,
                },
            },
        },
        muiTableBodyCellProps: { align: 'left' },
        size: 10,
    },
    {
        accessorKey: "transactionId",
        header: "Transaction ID",
        Header: () => (
            <div style={{ textAlign: 'left', lineHeight: 1.2 }}>
                Transaction<br />ID
            </div>
        ),
        muiTableHeadCellProps: {
            align: 'left',
            sx: {
                '& .MuiBox-root': {
                    gap: 0, // ✅ Removes space between filter & menu icons
                },
                '& .MuiButtonBase-root': {
                    padding: '2px',
                    margin: 0,
                },
            },
        },
        muiTableBodyCellProps: { align: 'left' },
        size: 20,
    },
    // {
    //     accessorKey: "driverId",
    //     header: "Driver ID",
    // },
    {
        accessorKey: "initiatedTo",
        header: "Name/Phone",
        muiTableHeadCellProps: {
            align: 'left',
            sx: {
                '& .MuiBox-root': {
                    gap: 0, // ✅ Removes space between filter & menu icons
                },
                '& .MuiButtonBase-root': {
                    padding: '2px',
                    margin: 0,
                },
            },
        },
        muiTableBodyCellProps: { align: 'left' },
        size: 20,
    },
    {
        accessorKey: "ownedBy",
        header: "Category",
        muiTableHeadCellProps: {
            align: 'left',
            sx: {
                '& .MuiBox-root': {
                    gap: 0, // ✅ Removes space between filter & menu icons
                },
                '& .MuiButtonBase-root': {
                    padding: '2px',
                    margin: 0,
                },
            },
        },
        muiTableBodyCellProps: { align: 'left' },
        size: 20,
    },
    {
        accessorKey: "type",
        header: "Transaction Type",
        Header: () => (
            <div style={{ textAlign: 'left', lineHeight: 1.2 }}>
                Transaction<br />Type
            </div>
        ),
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
        muiTableHeadCellProps: {
            align: 'left',
            sx: {
                '& .MuiBox-root': {
                    gap: 0, // ✅ Removes space between filter & menu icons
                },
                '& .MuiButtonBase-root': {
                    padding: '2px',
                    margin: 0,
                },
            },
        },
        muiTableBodyCellProps: { align: 'left' },
        size: 25,
    },
    {
        accessorKey: "previousWalletBalance",
        header: "Previous Balance",
        Cell: ({ row }) => {
            const fareBreakdown = row.original.fareBreakdown;
            const amount = parseFloat(fareBreakdown?.previousWalletBalance || 0);
            const formatted = new Intl.NumberFormat("en-IN", {
                style: "currency",
                currency: "INR",
            }).format(amount);

            return <div>{formatted}</div>
        },
        muiTableHeadCellProps: {
            align: 'left',
            sx: {
                '& .MuiBox-root': {
                    gap: 0, // ✅ Removes space between filter & menu icons
                },
                '& .MuiButtonBase-root': {
                    padding: '2px',
                    margin: 0,
                },
            },
        },
        muiTableBodyCellProps: { align: 'left' },
        size: 20,
    }, {
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
        muiTableHeadCellProps: {
            align: 'left',
            sx: {
                '& .MuiBox-root': {
                    gap: 0, // ✅ Removes space between filter & menu icons
                },
                '& .MuiButtonBase-root': {
                    padding: '2px',
                    margin: 0,
                },
            },
        },
        muiTableBodyCellProps: { align: 'left' },
        size: 20,
    }, {
        accessorKey: "postWalletBalance",
        header: "Current Balance",
        Cell: ({ row }) => {
            const fareBreakdown = row.original.fareBreakdown;
            const amount = parseFloat(fareBreakdown?.postWalletBalance || 0);
            const formatted = new Intl.NumberFormat("en-IN", {
                style: "currency",
                currency: "INR",
            }).format(amount);

            return <div>{formatted}</div>
        },
        muiTableHeadCellProps: {
            align: 'left',
            sx: {
                '& .MuiBox-root': {
                    gap: 0, // ✅ Removes space between filter & menu icons
                },
                '& .MuiButtonBase-root': {
                    padding: '2px',
                    margin: 0,
                },
            },
        },
        muiTableBodyCellProps: { align: 'left' },
        size: 20,
    },
    {
        accessorKey: "remark",
        header: "Remarks",
        Cell: ({ row }) => {
            const remark = row.getValue("remark") as string
            if (!remark) return <div>-</div>
            return (
                <TooltipComponent name={remark}>
                    <div>{remark.slice(0, 15)}...</div>
                </TooltipComponent>
            )

        },
        muiTableHeadCellProps: {
            align: 'left',
            sx: {
                '& .MuiBox-root': {
                    gap: 0, // ✅ Removes space between filter & menu icons
                },
                '& .MuiButtonBase-root': {
                    padding: '2px',
                    margin: 0,
                },
            },
        },
        muiTableBodyCellProps: { align: 'left' },
        size: 20,
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
                    <div>{convertedDate}</div>
                    <div>{amPmTime}</div>
                </div>
            )
        },
        muiTableHeadCellProps: {
            align: 'left',
            sx: {
                '& .MuiBox-root': {
                    gap: 0, // ✅ Removes space between filter & menu icons
                },
                '& .MuiButtonBase-root': {
                    padding: '2px',
                    margin: 0,
                },
            },
        },
        muiTableBodyCellProps: { align: 'left' },
        size: 20,
    },
];