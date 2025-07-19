"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent } from 'components/ui/card';
import CounterCard from "components/cards/CounterCard";
import { Activity, Loader2, RefreshCcw } from "lucide-react";
import Link from "next/link";
import { columns } from "./columns";
import { Button } from "components/ui/button";
import { Switch } from "components/ui/switch";
import {
    MRT_ColumnDef,
    MaterialReactTable
} from "material-react-table";
import { Input } from "components/ui/input";
import { Label } from "components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogTrigger,
    DialogClose,
    DialogHeader,
    DialogTitle,
} from "components/ui/dialog";
import {
    Select, SelectContent, SelectItem,
    SelectTrigger, SelectValue
} from "components/ui/select";
import { walletColumns, VendorTransaction } from "./walletColumns";
import {
    useVendorById,
    useAdjustWallet
} from 'hooks/react-query/useVendor';
import {
    useFetchVendorBookings,
    useFetchVendorBookingsById
} from 'hooks/react-query/useBooking';
import {
    useVendorTransactions
} from 'hooks/react-query/useWallet';
import { toast } from "sonner";


export default function ViewDVendorPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();


    const [id, setId] = useState<string | undefined>('')

    useEffect(() => {
        const resolvedParams = async () => {
            const resolvedParams = await params
            setId(resolvedParams.id)
        }
        resolvedParams()
    }, [params])

    const {
        data: vendor = null,
        isLoading,
        refetch,
    } = useVendorById(id ?? '');

    const { mutate: adjustVendorWallet } = useAdjustWallet();

    const {
        data: bookings = [],
        refetch: refetchBookings
    } = useFetchVendorBookingsById(id ?? '');

    const {
        data: vendorTransactions = [],
    } = useVendorTransactions(id ?? '');

    console.log("vendorTransactions >> ", vendorTransactions);
    console.log("bookings >> ", bookings);


    const [sorting, setSorting] = useState<{ id: string; desc: boolean }[]>([])
    const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({})
    const [isSpinning, setIsSpinning] = useState(false)
    const [totalTrips, setTotalTrips] = useState(25);
    const [totalEarnings, setTotalEarnings] = useState(0);
    const [walletAmount, setWalletAmount] = useState(0);
    const [showVendorTransactions, setShowVendorTransactions] = useState(false);
    const [sortConfig, setSortConfig] = useState<{
        columnId: string | null;
        direction: 'asc' | 'desc' | null;
    }>({ columnId: null, direction: null });
    const [adjustmentAmount, setAdjustmentAmount] = useState("");
    const [adjustmentRemarks, setAdjustmentRemarks] = useState("");
    const [adjustmentType, setAdjustmentType] = useState("add");
    const [localError, setLocalError] = useState("");
    const [walletMessage, setWalletMessage] = useState("");
    const [adjustmentReason, setAdjustmentReason] = useState("");


    const vendorData = useMemo(() => {
        if (!vendor || !id) return [];
        return [vendor];
    }, [vendor, id]);

    // ✅ Memoized bookingData filtered by vendorId
    const bookingData = useMemo(() => {
        if (!bookings || !id) return [];

        return bookings
            .filter((booking: any) => booking.vendorId === id)
            .map((booking: any) => ({
                ...booking,
                id: booking.bookingId,
                pickupDate: booking.pickupDate,
                dropDate: booking.dropDate
                    ? new Date(booking.dropDate).toLocaleDateString()
                    : null,
            }));
    }, [bookings, id]);

    const vendorsTransactions = useMemo(() => {
        if (!id || !showVendorTransactions) return [];

        return vendorTransactions
            .filter((t) => t.vendorId === id)
            .map(transaction => ({
                transactionId: transaction.transactionId,
                vendorId: transaction.vendorId,
                initiatedBy: transaction.initiatedBy,
                initiatedTo: transaction.initiatedTo,
                ownedBy: transaction.ownedBy,
                type: transaction.type,
                amount: transaction.amount,
                description: transaction.description,
                createdAt: transaction.createdAt,
                remark: transaction.remark
            }));
    }, [id, showVendorTransactions, vendorTransactions]);

    useEffect(() => {
        if (vendorData && id) {
            const wAmount = vendorData.find((vendor: any) => vendor.vendorId === id)?.wallet?.balance;
            setWalletAmount(wAmount || 0);

            const totalEarnings = vendorData.find((vendor: any) => vendor.vendorId === id)?.totalEarnings;
            setTotalEarnings(totalEarnings || 0);
        }
    }, [vendorData, id]);

    const handleBack = () => {
        router.push('/admin/vendor');
    };

    const handleSort = (columnId: string) => {
        setSortConfig(prev => ({
            columnId,
            direction: prev.columnId === columnId && prev.direction === 'asc' ? 'desc' : 'asc',
        }));
    };


    const unFiltered = [...bookingData].sort((a, b) => {
        const aCreatedAt = new Date(a.createdAt || "").getTime();
        const bCreatedAt = new Date(b.createdAt || "").getTime();
        return bCreatedAt - aCreatedAt; // Descending order
    });

    // Memoize sorted bookings
    const fData = React.useMemo(() => {
        let sorted = [...unFiltered];
        if (sortConfig.columnId && sortConfig.direction) {
            sorted.sort((a, b) => {
                const aValue = a[sortConfig.columnId as keyof typeof a];
                const bValue = b[sortConfig.columnId as keyof typeof b];

                if (aValue === null || bValue === null) return 0;

                if (aValue === bValue) return 0;

                if (sortConfig.direction === 'asc') {
                    return (aValue ?? '') > (bValue ?? '') ? 1 : -1;
                } else {
                    return (aValue ?? '') < (bValue ?? '') ? 1 : -1;
                }
            });
        }
        return sorted;
    }, [bookingData, sortConfig]);

    useEffect(() => {
        const calculateBookingStats = () => {
            return fData.reduce((acc, booking) => {
                acc.total++;

                return acc;
            }, { total: 0, totalValue: 0 });
        };

        const stats = calculateBookingStats();
        setTotalTrips(stats.total);
    }, [fData]);

    const handleRefetch = async () => {
        setIsSpinning(true);
        try {
            await refetch(); // wait for the refetch to complete
        } finally {
            // stop spinning after short delay to allow animation to play out
            setTimeout(() => setIsSpinning(false), 500);
        }
    };

    const creditReasons = [
        { value: "referral_bonus", label: "Referral Bonus" },
        { value: "manual_credit", label: "Manual Credit" },
    ];

    const debitReasons = [
        { value: "withdrawal", label: "Wallet Withdrawal" },
        { value: "admin_deduction", label: "Admin Deduction" },
    ];

    const handleSubmit = async () => {
        const amount = Number(adjustmentAmount);
        const id = vendor?.vendorId;

        if (!amount || isNaN(amount) || amount <= 0) {
            setLocalError("Please enter a valid positive amount");
            return;
        }

        if (!id) {
            setLocalError("Driver ID is missing");
            return;
        }

        try {
            adjustVendorWallet({ id, amount, remark: adjustmentRemarks, adjustmentReason, type: adjustmentType as "add" | "minus" }, {
                onSuccess: () => {
                    toast.success(
                        adjustmentType === "add"
                            ? "Amount added successfully!"
                            : "Amount subtracted successfully!",
                        {
                            style: {
                                backgroundColor: "#009F7F",
                                color: "#fff",
                            },
                        }
                    );

                    // Reset fields
                    handleClose();

                    // Optional optimistic UI update
                    if (vendor?.wallet) {
                        const newBalance =
                            adjustmentType === "add"
                                ? (vendor.wallet.balance ?? 0) + amount
                                : (vendor.wallet.balance ?? 0) - amount;
                    }
                },

                onError: (error: any) => {
                    toast.error(
                        error?.response?.data?.message || "Failed to adjust balance",
                        {
                            style: {
                                backgroundColor: "#FF0000",
                                color: "#fff",
                            },
                        }
                    );
                    setWalletMessage("");
                    console.error("Wallet adjustment error:", error);
                },
            });

        } catch (err: any) {
            toast.error(err?.response?.data?.message || "Failed to adjust balance", {
                style: {
                    backgroundColor: "#FF0000",
                    color: "#fff",
                },
            });
            console.error("Wallet adjustment error:", err);
            setWalletMessage("");
        }
    };

    const handleClose = () => {
        setAdjustmentAmount("");
        setAdjustmentRemarks("");
        setAdjustmentType("add");
        setLocalError("");
        setWalletMessage("");
    };


    const handleAdjustmentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const rawValue = e.target.value;
        const sanitizedValue = rawValue.replace(/\D/g, "");
        setAdjustmentAmount(sanitizedValue);

        if (sanitizedValue === "" || Number(sanitizedValue) <= 0) {
            toast.error("Please enter a positive amount", {
                style: {
                    backgroundColor: "#FF0000",
                    color: "#fff",
                },
            });
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-50">
                <Loader2 className="w-12 h-12 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <React.Fragment>
            <div className="rounded bg-white p-5 shadow">
                <Card className='rounded-none'>
                    <CardContent>
                        <div className="flex gap-20">
                            {/* Details Section */}
                            <div className="flex flex-col py-4 gap-4">
                                <h2 className='text-black text-lg font-bold'>Vendor Information</h2>
                                <div className='bg-white p-6 rounded-lg'>
                                    <div className="space-y-3 text-gray-700">
                                        <div className="flex items-center gap-3">
                                            <span className="font-semibold w-14">Name:</span>
                                            <p className="text-gray-900">{vendor?.name || '-'}</p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="font-semibold w-14">Email:</span>
                                            <p className="text-gray-900 break-all">{vendor?.email || '-'}</p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="font-semibold w-14">Phone:</span>
                                            <p className="text-gray-900">{vendor?.phone || '-'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Statistics Section */}
                            <div className="grid gap-5 md:grid-cols-3 lg:grid-cols-3 mt-14">
                                <Card className="relative overflow-hidden border-none bg-gradient-to-br from-emerald-50 to-teal-50 shadow-md w-[230px] h-[120px] transform transition duration-300 ease-in-out hover:scale-105">
                                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 opacity-0 w-full" />
                                    <div className="h-[150PX] w-full">
                                        <CounterCard
                                            color="bg-emerald-100"
                                            icon={Activity}
                                            count={totalTrips.toString()}
                                            label="Total Bookings"
                                            className="relative z-10 p-6"
                                        //cardSize="w-[200px] h-[100px]"
                                        />
                                    </div>
                                    <div className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-emerald-500 to-teal-500 transform scale-x-100" />
                                </Card>
                                <Card className="relative overflow-hidden border-none bg-gradient-to-br from-blue-50 to-indigo-50 shadow-md w-[230px] h-[120px] transform transition duration-300 ease-in-out hover:scale-105">
                                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 opacity-0 w-full" />
                                    <div className="h-[150PX] w-full">
                                        <CounterCard
                                            color="bg-blue-100"
                                            icon={Activity}
                                            count={totalEarnings}
                                            label="Total Earned"
                                            //cardSize="w-[200px] h-[100px]"
                                            format="currency"
                                        />
                                    </div>
                                    <div className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-blue-500 to-indigo-500 transform scale-x-100" />
                                </Card>
                                <Card className="relative overflow-hidden border-none bg-gradient-to-br from-purple-50 to-pink-50 shadow-md w-[230px] h-[120px] transform transition duration-300 ease-in-out hover:scale-105">
                                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 opacity-100 w-full" />
                                    <div className="h-[150px] w-full">
                                        <CounterCard
                                            color="bg-purple-100"
                                            icon={Activity}
                                            count={walletAmount}
                                            label="Wallet Balance"
                                        //cardSize="w-[200px] h-[100px]"
                                        />
                                    </div>
                                    <div className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-purple-500 to-pink-500 transform scale-x-100" />
                                </Card>
                            </div>
                        </div>
                        <div className="flex items-center justify-between">
                            <h2 className="text-black text-lg font-bold invisible">Wallet Transactions</h2>
                            <Dialog onOpenChange={handleClose} >
                                <DialogTrigger asChild>
                                    <Button
                                        type="button"
                                        className="flex items-center gap-2 group bg-transparent hover:bg-transparent my-2"
                                    >
                                        <span className="text-sm font-semibold text-gray-700 group-hover:text-indigo-600 transition-colors duration-300">
                                            Adjust Wallet Balance
                                        </span>
                                        <div className="relative w-8 h-8 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center overflow-hidden">
                                            <svg
                                                className="w-4 h-4 text-white group-hover:scale-110 transition-transform duration-300"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                                xmlns="http://www.w3.org/2000/svg"
                                            >
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                                            </svg>
                                            <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
                                        </div>
                                    </Button>
                                </DialogTrigger>

                                <DialogContent className="w-full max-w-lg rounded-xl">
                                    <div className="p-6 overflow-y-auto max-h-[80vh] space-y-4 scrollbar-hide">
                                        <DialogHeader className="flex justify-between items-center">
                                            <DialogTitle className="text-lg font-semibold text-gray-900">Adjust Wallet Balance</DialogTitle>
                                        </DialogHeader>

                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <Label className="text-sm font-medium text-gray-700">Current Balance</Label>
                                                <div className="flex items-center gap-2">
                                                    <Input
                                                        id="walletAmount"
                                                        name="walletAmount"
                                                        type="number"
                                                        value={vendor?.wallet?.balance ?? 0}
                                                        disabled
                                                        className="h-10 bg-gray-100 font-semibold text-lg text-gray-900 border border-gray-300 rounded-lg"
                                                    />
                                                    <span className="text-xl font-bold text-gray-900">₹</span>
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <Label className="text-sm font-medium text-gray-700">Adjustment Type</Label>
                                                <Select
                                                    value={adjustmentType}
                                                    onValueChange={(value) => {
                                                        setAdjustmentType(value);
                                                        setAdjustmentReason("");
                                                    }}
                                                >
                                                    <SelectTrigger className="h-10 border-gray-300 focus:ring-2 focus:ring-indigo-500">
                                                        <SelectValue placeholder="Select type" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="add">Add to Wallet</SelectItem>
                                                        <SelectItem value="subtract">Take from Wallet</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            {adjustmentType && (
                                                <div className="space-y-2">
                                                    <Label className="text-sm font-medium text-gray-700">Reason</Label>
                                                    <Select value={adjustmentReason} onValueChange={setAdjustmentReason}>
                                                        <SelectTrigger className="h-10 border-gray-300 focus:ring-2 focus:ring-indigo-500">
                                                            <SelectValue placeholder="Select reason" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {(adjustmentType === "add" ? creditReasons : debitReasons).map((reason) => (
                                                                <SelectItem key={reason.value} value={reason.value}>
                                                                    {reason.label}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            )}

                                            <div className="space-y-2">
                                                <Label className="text-sm font-medium text-gray-700">Amount</Label>
                                                <Input
                                                    id="adjustmentAmount"
                                                    name="adjustmentAmount"
                                                    type="text"
                                                    value={adjustmentAmount}
                                                    onChange={handleAdjustmentChange}
                                                    placeholder="Enter amount"
                                                    className="h-10 text-center border-gray-300 rounded-lg"
                                                    min="0"
                                                />
                                                {localError && <p className="text-sm text-red-500">{localError}</p>}
                                            </div>

                                            <div className="space-y-2">
                                                <Label className="text-sm font-medium text-gray-700">Remarks (Optional)</Label>
                                                <Input
                                                    id="adjustmentRemarks"
                                                    name="adjustmentRemarks"
                                                    value={adjustmentRemarks}
                                                    onChange={(e) => setAdjustmentRemarks(e.target.value)}
                                                    placeholder="Enter remarks"
                                                    className="h-10 border-gray-300 rounded-lg"
                                                />
                                            </div>

                                            <Button
                                                onClick={handleSubmit}
                                                className="w-full bg-indigo-600 text-white hover:bg-indigo-700 h-10 rounded-lg"
                                                disabled={isLoading || !!localError}
                                            >
                                                {isLoading ? (
                                                    <>
                                                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                                        Processing...
                                                    </>
                                                ) : (
                                                    "Apply Adjustment"
                                                )}
                                            </Button>

                                            {walletMessage && (
                                                <p className="text-sm text-green-500 text-center">{walletMessage}</p>
                                            )}
                                        </div>
                                    </div>
                                </DialogContent>
                            </Dialog>
                        </div>
                        {/* Booking History Section */}
                        <div className="flex flex-col gap-4">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-4">
                                    <h2 className='text-black text-lg font-bold'>
                                        {showVendorTransactions ? 'Transactions' : 'Booking History'}
                                    </h2>
                                    <div className="flex items-center space-x-2">
                                        <Switch
                                            checked={showVendorTransactions}
                                            onCheckedChange={setShowVendorTransactions}
                                        />
                                        <span className="text-sm text-gray-500">
                                            Show Wallet Transactions
                                        </span>
                                    </div>
                                </div>
                                <Link href="/admin/vendor">
                                    <Button className="px-6 py-2">Back to Vendors</Button>
                                </Link>
                            </div>
                            <div>
                                {showVendorTransactions ? (
                                    <div>
                                        <MaterialReactTable
                                            columns={walletColumns as MRT_ColumnDef<any>[]}
                                            data={vendorsTransactions}
                                            positionGlobalFilter="left"
                                            enableHiding={false}
                                            onRowSelectionChange={setRowSelection}
                                            state={{ rowSelection, sorting }}
                                            onSortingChange={setSorting}
                                            enableSorting
                                            initialState={{
                                                density: 'compact',
                                                pagination: { pageIndex: 0, pageSize: 10 },
                                                showGlobalFilter: true,
                                            }}
                                            muiSearchTextFieldProps={{
                                                placeholder: 'Search Transactions...',
                                                variant: 'outlined',
                                                fullWidth: true, // 🔥 Makes the search bar take full width
                                                sx: {
                                                    minWidth: '600px', // Adjust width as needed
                                                    marginLeft: '16px',
                                                },
                                            }}
                                            muiToolbarAlertBannerProps={{
                                                sx: {
                                                    justifyContent: 'flex-start', // Aligns search left
                                                },
                                            }}
                                            renderTopToolbarCustomActions={() => (
                                                <div className="flex flex-1 justify-end items-center">
                                                    {/* 🔁 Refresh Button */}
                                                    <Button
                                                        variant={"ghost"}
                                                        onClick={handleRefetch}
                                                        className="text-gray-600 hover:text-primary transition p-0 m-0 hover:bg-transparent hover:shadow-none"
                                                        title="Refresh Data"
                                                    >
                                                        <RefreshCcw className={`w-5 h-5 ${isSpinning ? 'animate-spin-smooth ' : ''}`} />
                                                    </Button>
                                                </div>
                                            )}
                                        />
                                    </div>
                                ) : (
                                    <div>
                                        <MaterialReactTable
                                            columns={columns as MRT_ColumnDef<any>[]}
                                            data={fData}
                                            positionGlobalFilter="left"
                                            enableHiding={false}
                                            onRowSelectionChange={setRowSelection}
                                            state={{ rowSelection, sorting }}
                                            onSortingChange={setSorting}
                                            enableSorting
                                            initialState={{
                                                density: 'compact',
                                                pagination: { pageIndex: 0, pageSize: 10 },
                                                showGlobalFilter: true,
                                            }}
                                            muiSearchTextFieldProps={{
                                                placeholder: 'Search Booking...',
                                                variant: 'outlined',
                                                fullWidth: true, // 🔥 Makes the search bar take full width
                                                sx: {
                                                    minWidth: '600px', // Adjust width as needed
                                                    marginLeft: '16px',
                                                },
                                            }}
                                            muiToolbarAlertBannerProps={{
                                                sx: {
                                                    justifyContent: 'flex-start', // Aligns search left
                                                },
                                            }}
                                            renderTopToolbarCustomActions={() => (
                                                <div className="flex flex-1 justify-end items-center">
                                                    {/* 🔁 Refresh Button */}
                                                    <Button
                                                        variant={"ghost"}
                                                        onClick={handleRefetch}
                                                        className="text-gray-600 hover:text-primary transition p-0 m-0 hover:bg-transparent hover:shadow-none"
                                                        title="Refresh Data"
                                                    >
                                                        <RefreshCcw className={`w-5 h-5 ${isSpinning ? 'animate-spin-smooth ' : ''}`} />
                                                    </Button>
                                                </div>
                                            )}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </React.Fragment>
    );
}