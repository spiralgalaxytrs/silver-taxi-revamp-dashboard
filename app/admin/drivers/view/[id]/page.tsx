"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent } from "components/ui/card";
import { Loader2, ChevronLeft } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "components/ui/tabs";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "components/ui/tooltip";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "components/ui/dropdown-menu";
import { Badge } from "components/ui/badge";
import { Button } from "components/ui/button";
import { useBookingStore } from "stores/bookingStore";
import { useWalletTransactionStore } from "stores/-walletTransactionStore";
import { useDriverStore, Driver, ExpiryStatus } from "stores/-driverStore";
import { toast } from "sonner";
import ProfileTab from "components/driver/Tabs/ProfileTab";
import VehicleTab from "components/driver/Tabs/VehicleTab";
import TransactionsTab from "components/driver/Tabs/TransactionsTab";
import BookingsTab from "components/driver/Tabs/BookingsTab";
import { columns } from "./columns";
import { walletColumns, DriverTransaction } from "./walletColumns";

export default function ViewDriverPage() {
    const router = useRouter();
    const { id } = useParams();
    const { bookings, fetchBookings } = useBookingStore();
    const { fetchDriverTransactions, driverTransactions } = useWalletTransactionStore();
    const { toggleDriverStatus, driver, fetchDriverById, isLoading, error, fetchDrivers, minusDriverWallet, addDriverWallet, expiryCheck } = useDriverStore();
    const [totalTrips, setTotalTrips] = useState(0);
    const [totalEarnings, setTotalEarnings] = useState(0);
    const [walletAmount, setWalletAmount] = useState(0);
    const [walletTransactions, setDriverTransactions] = useState<DriverTransaction[]>([]);
    const [activeTab, setActiveTab] = useState("profile");
    const [isEditing, setIsEditing] = useState(false);
    const [editedDriver, setEditedDriver] = useState<Driver | null>(null);
    const [remarks, setRemarks] = useState("");
    const [openDialog, setOpenDialog] = useState(false);
    const [currentDocType, setCurrentDocType] = useState("");
    const [vehicleId, setVehicleId] = useState<undefined | string>("");
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [selectedImageLabel, setSelectedImageLabel] = useState<string>("");
    const [zoomLevel, setZoomLevel] = useState(1);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const imageContainerRef = useRef<HTMLDivElement>(null);
    const [dialogAction, setDialogAction] = useState<"accept" | "reject" | null>(null);
    const [sortConfig, setSortConfig] = useState<{
        columnId: string | null;
        direction: "asc" | "desc" | null;
    }>({ columnId: null, direction: null });
    const [bookingData, setBookingData] = useState<any[]>([]);
    const [filters, setFilters] = useState({
        search: "",
        isActive: null,
        creationDateStart: "",
        creationDateEnd: "",
    });
    const [status, setStatus] = useState<string>("");
    const [adjustmentAmount, setAdjustmentAmount] = useState("");
    const [adjustmentRemarks, setAdjustmentRemarks] = useState("");
    const [adjustmentType, setAdjustmentType] = useState("add");
    const [localError, setLocalError] = useState("");
    const [walletMessage, setWalletMessage] = useState("");
    const [adjustmentReason, setAdjustmentReason] = useState("");
    const [expiryStatus, setExpiryStatus] = useState<ExpiryStatus | null>(null);

    useEffect(() => {
        if (id) {
            fetchDriverById(id as string);
            fetchBookings();
            // fetchDriverTransactions(id as string);
            fetchExpiryStatus(id as string);

            console.log("ID", id);
        }
    }, [id, fetchDriverById,
        fetchBookings,
        //fetchDriverTransactions
    ]);

    useEffect(() => {
        if (driver) {
            setEditedDriver({ ...driver });
            // Check if driver.vehicle exists and is not empty
            const lastVehicle = driver.vehicle && driver.vehicle.length > 0
                ? driver.vehicle[driver.vehicle.length - 1]
                : null;
            setVehicleId(lastVehicle?.vehicleId ?? "");
            setTotalTrips(driver.bookingCount ?? 0);
            setTotalEarnings(driver.totalEarnings ?? 0);
            setWalletAmount(driver.wallet?.balance ?? 0);
        } else {
            console.log("No driver data available");
        }
    }, [driver]);

    useEffect(() => {
        if (bookings && id) {
            const filteredBookings = bookings?.filter((booking) => booking?.driverId === id);
            setBookingData(
                filteredBookings.map((booking) => ({
                    ...booking,
                    id: booking?.bookingId,
                    pickupDate: booking?.pickupDate,
                    dropDate: booking?.dropDate ? new Date(booking.dropDate).toLocaleDateString() : null,
                }))
            );
        }
    }, [bookings, id]);

    

    useEffect(() => {
        const fetchTransactions = async () => {
            if (id) {
                const data = driverTransactions
                    .filter((t) => t?.driverId === id)
                    .map((transaction) => ({
                        transactionId: transaction?.transactionId ?? "",
                        driverId: transaction?.driverId ?? "",
                        initiatedBy: transaction?.initiatedBy ?? "",
                        initiatedTo: transaction?.initiatedTo ?? "",
                        ownedBy: transaction?.ownedBy ?? "",
                        type: transaction?.type ?? "",
                        amount: Number(transaction?.amount) || 0,
                        description: transaction?.description ?? "",
                        createdAt: transaction?.createdAt ?? "",
                        remark: transaction?.remark ?? "",
                        reason: transaction?.reason ?? "",
                    }));
                setDriverTransactions(data);
            }
        };
        fetchTransactions();
    }, [driverTransactions, id]);


            

    const fetchExpiryStatus = async (driverId: string) => {
        try {
            const data = await expiryCheck(driverId);
            setExpiryStatus(data as any);
        } catch (error) {
            console.error("Error fetching expiry status:", error);
        }
    };

    const handleBack = () => {
        router.push("/admin/drivers");
    };

    const handleSort = (columnId: string) => {
        setSortConfig((prev) => ({
            columnId,
            direction: prev.columnId === columnId && prev.direction === "asc" ? "desc" : "asc",
        }));
    };



    const handleImageClick = (url: string, label: string) => {
        setSelectedImage(url);
        setSelectedImageLabel(label);
        setZoomLevel(1);
        setPosition({ x: 0, y: 0 });
    };

    const handleZoomIn = () => {
        setZoomLevel((prev) => Math.min(prev + 0.2, 3));
    };

    const handleZoomOut = () => {
        setZoomLevel((prev) => Math.max(prev - 0.2, 0.5));
    };

    const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        if (zoomLevel > 1) {
            setIsDragging(true);
            setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
        }
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (isDragging && imageContainerRef.current) {
            const newX = e.clientX - dragStart.x;
            const newY = e.clientY - dragStart.y;

            const container = imageContainerRef.current;
            const containerRect = container.getBoundingClientRect();
            const imgWidth = containerRect.width * zoomLevel;
            const imgHeight = containerRect.height * zoomLevel;

            const maxX = (imgWidth - containerRect.width) / 2 / zoomLevel;
            const maxY = (imgHeight - containerRect.height) / 2 / zoomLevel;

            const boundedX = Math.max(-maxX, Math.min(maxX, newX));
            const boundedY = Math.max(-maxY, Math.min(maxY, newY));

            setPosition({ x: boundedX, y: boundedY });
        }
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
        if (zoomLevel > 1 && e.touches.length === 1) {
            setIsDragging(true);
            setDragStart({ x: e.touches[0].clientX - position.x, y: e.touches[0].clientY - position.y });
        }
    };

    const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
        if (isDragging && e.touches.length === 1 && imageContainerRef.current) {
            const newX = e.touches[0].clientX - dragStart.x;
            const newY = e.touches[0].clientY - dragStart.y;

            const container = imageContainerRef.current;
            const containerRect = container.getBoundingClientRect();
            const imgWidth = containerRect.width * zoomLevel;
            const imgHeight = containerRect.height * zoomLevel;

            const maxX = (imgWidth - containerRect.width) / 2 / zoomLevel;
            const maxY = (imgHeight - containerRect.height) / 2 / zoomLevel;

            const boundedX = Math.max(-maxX, Math.min(maxX, newX));
            const boundedY = Math.max(-maxY, Math.min(maxY, newY));

            setPosition({ x: boundedX, y: boundedY });
        }
    };

    const handleTouchEnd = () => {
        setIsDragging(false);
    };

    const handleSubmit = async () => {
        if (!adjustmentAmount || isNaN(Number(adjustmentAmount)) || Number(adjustmentAmount) <= 0) {
            setLocalError("Please enter a valid positive amount");
            return;
        }
        try {
            const amount = Number(adjustmentAmount);
            const id = editedDriver?.driverId;
            if (!id) {
                setLocalError("Driver ID is missing");
                return;
            }
            let response;
            if (adjustmentType === "add") {
                response = await addDriverWallet(id, amount, adjustmentRemarks, adjustmentReason);
            } else {
                response = await minusDriverWallet(id, amount, adjustmentRemarks, adjustmentReason);
            }

            await fetchDriverById(id);

            if (editedDriver?.wallet) {
                const newBalance =
                    adjustmentType === "add"
                        ? (editedDriver?.wallet?.balance ?? 0) + amount
                        : (editedDriver?.wallet?.balance ?? 0) - amount;

                setEditedDriver((prev) => {
                    if (!prev || !prev.wallet || !prev.wallet.walletId || !prev.wallet.currency) {
                        return prev;
                    }

                    return {
                        ...prev,
                        wallet: {
                            ...prev.wallet,
                            balance: newBalance,
                        },
                    };
                });
            }

            setWalletMessage("");
            toast.success(
                adjustmentType === "add" ? "Amount added successfully!" : "Amount subtracted successfully!",
                {
                    style: {
                        backgroundColor: "#009F7F",
                        color: "#fff",
                    },
                }
            );
            setAdjustmentAmount("");
            setAdjustmentRemarks("");
            setAdjustmentType("add");
            setLocalError("");
        } catch (err) {
            setWalletMessage("");
            toast.error(error || "Failed to adjust balance", {
                style: {
                    backgroundColor: "#FF0000",
                    color: "#fff",
                },
            });
            console.error("Submission error:", err);
        }
    };

    const handleClose = () => {
        setAdjustmentAmount("");
        setAdjustmentRemarks("");
        setAdjustmentType("add");
        setLocalError("");
        setWalletMessage("");
    };

    const driverDocuments = [
        { type: "panCard", url: editedDriver?.panCardImage, label: "PAN Card", status: editedDriver?.panCardVerified, remark: editedDriver?.panCardRemark },
        { type: "aadharFront", url: editedDriver?.aadharImageFront, label: "Aadhar Front", status: editedDriver?.aadharImageFrontVerified, remark: editedDriver?.aadharImageFrontRemark },
        { type: "aadharBack", url: editedDriver?.aadharImageBack, label: "Aadhar Back", status: editedDriver?.aadharImageBackVerified, remark: editedDriver?.aadharImageBackRemark },
        {
            type: "licenseFront",
            url: editedDriver?.licenseImageFront,
            label: "License Front",
            expiry: expiryStatus?.license?.expiry,
            isExpired: expiryStatus?.license?.isExpired,
            status: editedDriver?.licenseImageFrontVerified,
            remark: editedDriver?.licenseImageFrontRemark,
        },
        {
            type: "licenseBack",
            url: editedDriver?.licenseImageBack,
            label: "License Back",
            expiry: expiryStatus?.license?.expiry,
            isExpired: expiryStatus?.license?.isExpired,
            status: editedDriver?.licenseImageBackVerified,
            remark: editedDriver?.licenseImageBackRemark,
        },
    ].filter((doc) => doc.url);

    const unFiltered = [...bookingData].sort((a, b) => {
        const aCreatedAt = new Date(a.createdAt || "").getTime();
        const bCreatedAt = new Date(b.createdAt || "").getTime();
        return bCreatedAt - aCreatedAt;
    });

    const fData = React.useMemo(() => {
        let sorted = [...unFiltered];
        if (sortConfig.columnId && sortConfig.direction) {
            sorted.sort((a, b) => {
                const aValue = a[sortConfig.columnId as keyof typeof a];
                const bValue = b[sortConfig.columnId as keyof typeof b];

                if (aValue === null || bValue === null) return 0;
                if (aValue === bValue) return 0;

                if (sortConfig.direction === "asc") {
                    return (aValue ?? "") > (bValue ?? "") ? 1 : -1;
                } else {
                    return (aValue ?? "") < (bValue ?? "") ? 1 : -1;
                }
            });
        }
        return sorted;
    }, [bookingData, sortConfig]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-50">
                <Loader2 className="w-12 h-12 animate-spin text-primary" />
            </div>
        );
    }

    if (error || !editedDriver) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-50">
                <p className="text-red-500">Error loading driver data: {error || "Driver not found"}</p>
            </div>
        );
    }




    return (
        <div className="relative rounded bg-white p-5 shadow">
            <Card className="rounded-none">
                <TooltipProvider>
                    <CardContent className="space-y-6">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-4">
                                <Button variant="ghost" size="icon" onClick={handleBack}>
                                    <ChevronLeft className="h-5 w-5" />
                                </Button>
                                <h1 className="text-2xl font-bold text-gray-800">Driver Details</h1>
                            </div>

                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <span className="relative inline-flex w-12 h-12 group cursor-pointer">
                                        {editedDriver?.adminVerified === "Approved" ? (
                                            <>
                                                <img
                                                    src="/img/driver_verified.png"
                                                    alt="Driver Verified"
                                                    className="w-12 h-12 absolute top-0 left-0 group-hover:opacity-0 transition-opacity duration-200"
                                                />
                                                <img
                                                    src="/img/driver_verified.gif"
                                                    alt="Driver Verified Animation"
                                                    className="w-12 h-12 absolute top-0 left-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                                                />
                                            </>
                                        ) : (
                                            <>
                                                <img
                                                    src="/img/driver_unverified.png"
                                                    alt="Driver Unverified"
                                                    className="w-12 h-12 absolute top-0 left-0 group-hover:opacity-0 transition-opacity duration-200"
                                                />
                                                <img
                                                    src="/img/driver_unverified.gif"
                                                    alt="Driver Unverified Animation"
                                                    className="w-12 h-12 absolute top-0 left-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                                                />
                                            </>
                                        )}
                                    </span>
                                </TooltipTrigger>
                                <TooltipContent
                                    side="top"
                                    align="center"
                                    style={{
                                        backgroundColor: "#333",
                                        color: "#fff",
                                        padding: "8px 12px",
                                        borderRadius: "4px",
                                        fontSize: "14px",
                                        zIndex: 1000,
                                    }}
                                >
                                    {editedDriver?.adminVerified === "Approved"
                                        ? "Driver Approved"
                                        : "Driver Not Approved"}
                                </TooltipContent>
                            </Tooltip>
                        </div>

                        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                            <TabsList className="grid w-full grid-cols-4 tabs-list">
                                <TabsTrigger className="tabs-trigger" value="profile">
                                    Profile & Documents
                                </TabsTrigger>
                                <TabsTrigger className="tabs-trigger" value="vehicle">
                                    Vehicle Details
                                </TabsTrigger>
                                <TabsTrigger className="tabs-trigger" value="transactions">
                                    Transactions
                                </TabsTrigger>
                                <TabsTrigger className="tabs-trigger" value="bookings">
                                    Booking History
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="profile">
                                <ProfileTab
                                    editedDriver={editedDriver}
                                    driverDocuments={driverDocuments as any[]}
                                    expiryStatus={expiryStatus}
                                    id={id as string}
                                    handleImageClick={handleImageClick}
                                    selectedImage={selectedImage}
                                    selectedImageLabel={selectedImageLabel}
                                    zoomLevel={zoomLevel}
                                    position={position}
                                    isDragging={isDragging}
                                    handleMouseDown={handleMouseDown}
                                    handleMouseMove={handleMouseMove}
                                    handleMouseUp={handleMouseUp}
                                    handleTouchStart={handleTouchStart}
                                    handleTouchMove={handleTouchMove}
                                    handleTouchEnd={handleTouchEnd}
                                    handleZoomIn={handleZoomIn}
                                    handleZoomOut={handleZoomOut}
                                    imageContainerRef={imageContainerRef}
                                />
                            </TabsContent>
                            <TabsContent value="vehicle">
                                <VehicleTab
                                    editedDriver={editedDriver}
                                    expiryStatus={expiryStatus}
                                    id={id as string}
                                    handleImageClick={handleImageClick}
                                    selectedImage={selectedImage}
                                    selectedImageLabel={selectedImageLabel}
                                    zoomLevel={zoomLevel}
                                    position={position}
                                    isDragging={isDragging}
                                    handleMouseDown={handleMouseDown}
                                    handleMouseMove={handleMouseMove}
                                    handleMouseUp={handleMouseUp}
                                    handleTouchStart={handleTouchStart}
                                    handleTouchMove={handleTouchMove}
                                    handleTouchEnd={handleTouchEnd}
                                    handleZoomIn={handleZoomIn}
                                    handleZoomOut={handleZoomOut}
                                    imageContainerRef={imageContainerRef}
                                />
                            </TabsContent>
                            <TabsContent value="transactions">
                                <TransactionsTab
                                    walletTransactions={walletTransactions}
                                    handleSort={handleSort}
                                    sortConfig={sortConfig}
                                />
                            </TabsContent>
                            <TabsContent value="bookings">
                                <BookingsTab
                                    totalTrips={totalTrips}
                                    editedDriver={editedDriver}
                                    bookingData={fData}
                                    handleSort={handleSort}
                                    sortConfig={sortConfig}
                                    adjustmentAmount={adjustmentAmount}
                                    setAdjustmentAmount={setAdjustmentAmount}
                                    adjustmentRemarks={adjustmentRemarks}
                                    setAdjustmentRemarks={setAdjustmentRemarks}
                                    adjustmentType={adjustmentType}
                                    setAdjustmentType={setAdjustmentType}
                                    adjustmentReason={adjustmentReason}
                                    setAdjustmentReason={setAdjustmentReason}
                                    localError={localError}
                                    walletMessage={walletMessage}
                                    isLoading={isLoading}
                                    handleSubmit={handleSubmit}
                                    handleClose={handleClose}
                                />
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                </TooltipProvider>
            </Card>
        </div>
    );
}