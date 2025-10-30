"use client";

import React, { useState } from "react";
import { Badge } from "components/ui/badge";
import {
    MRT_ColumnDef,
} from "material-react-table"
import {
    Dialog, DialogContent,
    DialogFooter, DialogHeader,
    DialogTitle
} from "components/ui/dialog"
import { Input } from "components/ui/input";
import { useVendorTransactionsReasonAdd } from "hooks/react-query/useWallet";
import { toast } from "sonner";
import { Button } from "components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "components/ui/dropdown-menu"

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
    status: "Paid" | "Unpaid";
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
    // {
    //     accessorKey: "ownedBy",
    //     header: "Category",
    //     muiTableHeadCellProps: { align: 'center' },
    //     muiTableBodyCellProps: { align: 'center' },
    // },
    {
        accessorKey: "status",
        header: "Transaction Status",
        Cell: ({ row }) => {
            const status = row.getValue("status") as "Paid" | "Unpaid";

            const {
                mutate: vendorReasonAdd,
                isPending: isLoading
            } = useVendorTransactionsReasonAdd();

            const [isDialogOpen, setIsDialogOpen] = useState(false);
            const [reason, setReason] = useState("");

            const id = row.original.transactionId ?? "";
            const handleToggleStatus = async () => {
                try {
                    vendorReasonAdd({ id, reason: reason }, {
                        onSuccess: () => {
                            toast.success("Vendor status updated successfully", {
                                style: {
                                    backgroundColor: "#009F7F",
                                    color: "#fff",
                                },
                            });
                        },
                        onError: (error: any) => {
                            toast.error(error?.response?.data?.message || "Failed to update vendor status", {
                                style: {
                                    backgroundColor: "#FF0000",
                                    color: "#fff",
                                },
                            });
                        },
                    });
                } catch (error) {
                    toast.error("An unexpected error occurred", {
                        style: {
                            backgroundColor: "#FF0000",
                            color: "#fff",
                        },
                    });
                    // console.error(error);
                }
            };
            return (
                <React.Fragment>
                    <div className="flex items-center justify-center">
                        {status === "Paid" ?
                            (
                                <Badge variant={status === "Paid" ? 'default' : 'warning'}>
                                    {status}
                                </Badge>
                            ) : (
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            className="h-8 hover:bg-transparent active:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
                                        >
                                            <Badge variant={'warning'}>
                                                {status}
                                            </Badge>
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-48">
                                        {/* Dropdown options for updating the status */}
                                        <DropdownMenuItem
                                            onClick={() => {
                                                setIsDialogOpen(true);
                                            }}
                                        >
                                            Paid
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            )}
                    </div>
                    <div className="flex items-center justify-center">
                        <Dialog
                            open={isDialogOpen}
                            onOpenChange={setIsDialogOpen}
                        >
                            <DialogContent className="max-w-[400px]">
                                <DialogHeader>
                                    <DialogTitle>Are you sure you want to change the status?</DialogTitle>
                                    <div>
                                        <div className="flex flex-col gap-2">
                                            <Input
                                                type="text"
                                                placeholder="Enter Reason"
                                                value={reason}
                                                onChange={(e) => setReason(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </DialogHeader>
                                <DialogFooter>
                                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>No</Button>
                                    <Button onClick={() => {
                                        handleToggleStatus();
                                        setIsDialogOpen(false);
                                    }}>Yes</Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>
                </React.Fragment>
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
            // const type = row.getValue("type") as string;
            // const prefix = type.toLowerCase() === "credit" ? "+" : "-";
            const formatted = new Intl.NumberFormat("en-IN", {
                style: "currency",
                currency: "INR",
            }).format(amount);

            return <div>{formatted}</div>
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
        accessorKey: "date",
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