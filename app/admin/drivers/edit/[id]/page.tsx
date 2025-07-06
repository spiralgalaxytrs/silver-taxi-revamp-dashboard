"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "components/ui/button";
import { Input } from "components/ui/input";
import { Label } from "components/ui/label";
import { toast } from "sonner";
import { Textarea } from "components/ui/textarea";
import { Card, CardContent } from "components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from 'components/ui/select'
import { Plus, Minus } from "lucide-react";
import {
    AlertDialog,
    AlertDialogTrigger,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogFooter
} from 'components/ui/alert-dialog'
import { notFound } from "next/navigation";
import {
    useDriverById,
    useUpdateDriver,
    useAdjustWallet
} from 'hooks/react-query/useDriver';

type FormDataType = {
    id: string;
    adminId: string;
    driverId?: string;
    name: string;
    phone: string;
    email?: string;
    address?: string;
    license: string;
    aadharNumber: string;
    licenseValidity: string;
    licenseImage?: File | string | undefined;
    assigned?: boolean;
    vehicleId?: string;
    isActive: boolean | null;
    remark?: string;
    walletAmount: number;
    walletId?: string;
    wallet?: {
        balance: number;
        walletId: string;
        currency: string;
    };
};

const EditDriverPage = () => {
    const router = useRouter();
    const params = useParams();
    const id = params?.id as string;

    const {
        data: driver = null,
        isLoading,
        isError
    } = useDriverById(id);

    const {
        mutate: updateDriver,
        isPending: isUpdatePending
    } = useUpdateDriver();



    // ✅ Prevent uncontrolled input error by ensuring default values are always set
    const [formData, setFormData] = useState<FormDataType>({
        id: '',
        adminId: '',
        name: '',
        phone: '',
        email: '',
        license: '',
        licenseValidity: '',
        aadharNumber: '',
        licenseImage: undefined,
        isActive: null,
        address: '',
        vehicleId: '',
        remark: '',
        walletAmount: 0,
    });
    const [adjustmentAmount, setAdjustmentAmount] = useState('');
    const [isFormDirty, setIsFormDirty] = useState(false);
    const [showUnsavedChangesDialog, setShowUnsavedChangesDialog] = useState(false);
    const [adjustmentRemarks, setAdjustmentRemarks] = useState('');
    const [pendingNavigation, setPendingNavigation] = useState<() => void>(() => { });

    useEffect(() => {
        if (driver) {
            let walletAmount = driver?.wallet?.balance;
            let licenseValidity = new Date(driver.licenseValidity).toISOString().split('T')[0];
            setFormData(prevData => ({
                ...prevData,
                name: driver.name || "",
                phone: driver.phone || "",
                email: driver.email || "",
                license: driver.license || "",
                licenseValidity: licenseValidity,
                aadharNumber: driver.aadharNumber || "",
                licenseImage: driver.licenseImage || undefined,
                address: driver.address || "",
                isActive: driver.isActive !== undefined ? driver.isActive : true,
                vehicleId: driver.vehicleId || "",
                remark: driver.remark || "",
                walletAmount: walletAmount || 0,
            }));
        }
    }, [driver]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setIsFormDirty(true);
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };
    const handleSelectChange = (name: string, value: string) => {
        setIsFormDirty(true);
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSelectChange2 = (name: string, value: string) => {
        setIsFormDirty(true);
        setFormData((prev) => ({
            ...prev,
            [name]: value === "active", // ✅ Converts "active" → true, "inactive" → false
        }));
    };

    const handleAdjustmentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        if (/^\d*\.?\d*$/.test(value)) {
            setAdjustmentAmount(value);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            updateDriver({ id, data: formData }, {
                onSuccess: () => {
                    toast.success("Driver updated successfully", {
                        style: {
                            backgroundColor: "#009F7F",
                            color: "#fff",
                        },
                    });
                    setTimeout(() => router.push("/admin/drivers"), 2000)
                    setIsFormDirty(false);
                },
                onError: () => {
                    toast.error("Failed to update driver", {
                        style: {
                            backgroundColor: "#FF0000",
                            color: "#fff",
                        },
                    });
                }
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

    // Add browser tab close/refresh prevention
    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (isFormDirty) {
                e.preventDefault();
                e.returnValue = '';
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [isFormDirty]);

    // Modify cancel handler
    const handleCancel = () => {
        if (isFormDirty) {
            setShowUnsavedChangesDialog(true);
            setPendingNavigation(() => () => router.push('/admin/drivers'));
        } else {
            router.push('/admin/drivers');
        }
    };

    // Add navigation confirmation handler
    const handleConfirmNavigation = () => {
        setIsFormDirty(false);
        setShowUnsavedChangesDialog(false);
        pendingNavigation();
    };

    const isPage = true

    if (isPage) {
        return notFound()
    }

    return (
        <>
            <Card className="rounded bg-white">
                <div className="flex justify-between items-center p-6 pb-6 pt-2">
                    <h2 className="text-3xl font-bold tracking-tight">Edit Driver</h2>
                    <Button variant="outline" onClick={handleCancel}>
                        Close
                    </Button>
                </div>
                <CardContent>
                    <div className="space-y-6">
                        <div className="space-y-4 mt-4">
                            <div className="grid grid-cols-2 gap-4">
                                {/* Driver Details */}
                                <div className="space-y-2">
                                    <Label>Driver Name <span className='text-red-500'>*</span></Label>
                                    <Input
                                        id="name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        required
                                        className="h-12"
                                        placeholder="Enter driver name"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Phone Number <span className='text-red-500'>*</span></Label>
                                    <Input
                                        id="phone"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                        required
                                        pattern="[0-9]{10}"
                                        maxLength={10}
                                        inputMode="numeric"
                                        className="h-12"
                                        placeholder="Enter phone number"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Email</Label>
                                    <Input
                                        id="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        className="h-12"
                                        placeholder="Enter email"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>License Number <span className='text-red-500'>*</span></Label>
                                    <Input
                                        id="license"
                                        name="license"
                                        value={formData.license}
                                        onChange={handleInputChange}
                                        required
                                        className="h-12"
                                        placeholder="Enter license number"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>License Image URL</Label>
                                    <img
                                        src={
                                            formData.licenseImage ?
                                                formData.licenseImage instanceof File ?
                                                    URL.createObjectURL(formData.licenseImage) : formData.licenseImage as string : "/public/img/no_img.webp"}
                                        alt="Banner Preview"
                                        className="w-full h-32 object-cover rounded"
                                    />
                                </div>

                                <div className="space-y-4 p-4 bg-muted/50 rounded-lg border">
                                    <div className="space-y-1">
                                        <Label className="text-sm font-medium">Current Balance</Label>
                                        <div className="flex items-center gap-2">
                                            <Input
                                                id="walletAmount"
                                                name="walletAmount"
                                                type="number"
                                                value={formData.walletAmount}
                                                readOnly
                                                className="h-12 bg-background font-semibold text-lg text-foreground border-2 border-muted-foreground/20"
                                            />
                                            <span className="text-2xl font-bold text-foreground">₹</span>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <Label className="text-sm font-medium">Balance Adjustment</Label>
                                        <div className="flex flex-col gap-3">
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    variant="outline"
                                                    // onClick={() => handleMinusDriverWallet(id, Number(adjustmentAmount), adjustmentRemarks)}
                                                    className="h-11 w-11 p-0 rounded-lg border-red-200 hover:bg-red-50 text-red-600"
                                                >
                                                    <Minus className="w-5 h-5" />
                                                </Button>
                                                <Input
                                                    id="adjustmentAmount"
                                                    name="adjustmentAmount"
                                                    type="number"
                                                    value={adjustmentAmount}
                                                    onChange={handleAdjustmentChange}
                                                    placeholder="Enter amount"
                                                    className="h-11 text-center text-lg font-medium border-2 border-muted-foreground/20 flex-1"
                                                    min="0"
                                                />
                                                <Button
                                                    variant="outline"
                                                    // onClick={() => handleAddDriverWallet(id, Number(adjustmentAmount), adjustmentRemarks)}
                                                    className="h-11 w-11 p-0 rounded-lg border-green-200 hover:bg-green-50 text-green-600"
                                                >
                                                    <Plus className="w-5 h-5" />
                                                </Button>
                                            </div>
                                            {Number(adjustmentAmount) < 0 && (
                                                <p className="text-sm text-red-500">Adjustment amount cannot be negative</p>
                                            )}
                                            <div className="space-y-2">
                                                <Label className="text-sm font-medium">Remarks</Label>
                                                <Input
                                                    id="adjustmentRemarks"
                                                    name="adjustmentRemarks"
                                                    value={adjustmentRemarks}
                                                    onChange={(e) => setAdjustmentRemarks(e.target.value)}
                                                    placeholder="Enter remarks"
                                                    className="h-11"
                                                />
                                            </div>
                                        </div>
                                        <p className="text-sm text-muted-foreground">
                                            Enter amount and choose to add/subtract from current balance
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-2 col-span-2">
                                    <Label>Address <span className='text-red-500'>*</span></Label>
                                    <Textarea
                                        rows={4}
                                        id="address"
                                        name="address"
                                        value={formData.address}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full py-3"
                                        placeholder="Enter full address"
                                    />
                                </div>

                                <div className="space-y-2 col-span-2">
                                    <Label>Remarks</Label>
                                    <Textarea
                                        rows={4}
                                        id="remark"
                                        name="remark"
                                        value={formData.remark}
                                        onChange={handleInputChange}
                                        className="w-full py-3"
                                        placeholder="Enter remarks"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Status <span className='text-red-500'>*</span></Label>
                                    <Select
                                        name="isActive"
                                        value={formData.isActive ? "active" : "inactive"}
                                        onValueChange={(value) => handleSelectChange2("isActive", value)}
                                        required
                                    >
                                        <SelectTrigger className="h-12">
                                            <SelectValue placeholder="Select status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="active">Active</SelectItem>
                                            <SelectItem value="inactive">Inactive</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="flex justify-end space-x-4">
                                <Button variant="outline" onClick={handleCancel}>
                                    Cancel
                                </Button>
                                <Button onClick={handleSubmit} type="submit">Save</Button>
                            </div>
                        </div>
                    </div>
                </CardContent>
                <AlertDialog open={showUnsavedChangesDialog} onOpenChange={setShowUnsavedChangesDialog}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Unsaved Changes</AlertDialogTitle>
                            <AlertDialogDescription>
                                You have unsaved changes. Are you sure you want to leave this page?
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Stay</AlertDialogCancel>
                            <AlertDialogAction onClick={handleConfirmNavigation}>
                                Leave
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </Card>
        </>
    );
};

export default EditDriverPage;
