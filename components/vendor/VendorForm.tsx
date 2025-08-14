"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "components/ui/button";
import { Input } from "components/ui/input";
import { Label } from "components/ui/label";
import { toast } from "sonner";
import { Textarea } from "components/ui/textarea";
import { Card, CardContent } from "components/ui/card";
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
    AlertDialogFooter,
} from "components/ui/alert-dialog";
import {
    useCreateVendor,
    useUpdateVendor,
    useAdjustWallet,
    useVendorById
} from "hooks/react-query/useVendor";

interface VendorFormProps {
    id?: string; // Optional ID for updating a vendor
}

type VendorFormData = {
    id?: string; // Optional for updates
    name: string;
    email: string;
    phone: string;
    password?: string; // Optional for updates (required for create)
    remark?: string;
    walletAmount: number;
    isActive?: boolean | null; // Optional status field for vendors
};

export function VendorForm({ id }: VendorFormProps) {
    const router = useRouter();

    const {
        data: vendor = null,
        isLoading,
    } = useVendorById(id ?? "");
    const { mutate: createVendor } = useCreateVendor();
    const { mutate: updateVendor } = useUpdateVendor();
    const { mutate: adjustVendorWallet } = useAdjustWallet();

    // Initialize form data with default values to prevent uncontrolled input errors
    const [formData, setFormData] = useState<VendorFormData>({
        name: "",
        email: "",
        phone: "",
        password: "", // Required for create, optional for update
        remark: "",
        walletAmount: 0,
        isActive: false,
    });
    const [adjustmentAmount, setAdjustmentAmount] = useState("");
    const [isFormDirty, setIsFormDirty] = useState(false);
    const [showUnsavedChangesDialog, setShowUnsavedChangesDialog] = useState(false);
    const [pendingNavigation, setPendingNavigation] = useState<() => void>(() => { });
    const [adjustmentRemarks, setAdjustmentRemarks] = useState('');

    useEffect(() => {
        if (vendor && id) {
            setFormData({
                name: vendor.name || "",
                email: vendor.email || "",
                phone: vendor.phone || "",
                password: "", // Don't pre-fill password for security
                remark: vendor.remark || "",
                walletAmount: vendor.wallet.balance || 0,
                isActive: vendor.isLogin || false,
            });
        }
    }, [vendor]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setIsFormDirty(true);
        const { name, value } = e.target;
        let formattedValue = value
        if (name === "phone" || name === "walletAmount") {
            formattedValue = value.replace(/[^0-9]/g, '');
        }
        setFormData({
            ...formData,
            [name]: formattedValue
        });
    };

    const handleAdjustmentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        if (/^\d*\.?\d*$/.test(value)) {
            setAdjustmentAmount(value);
        }
    };

    const handleSelectChange = (name: string, value: string | boolean) => {
        setIsFormDirty(true);
        setFormData((prev) => ({
            ...prev,
            [name]: value === "active" ? true : false, // Convert "active"/"inactive" to boolean
        }));
    };

    const handleAddVendorWallet = async (id: string, amount: number, remark: string) => {
        try {
            adjustVendorWallet({ id, amount, remark, adjustmentReason: "", type: "add" as "add" | "minus" }, {
                onSuccess: (data: any) => {
                    toast.success(data.message || "Wallet amount added successfully!", {
                        style: {
                            backgroundColor: "#009F7F",
                            color: "#fff",
                        },
                    });
                    setAdjustmentAmount('');
                    setFormData({
                        ...formData,
                        walletAmount: formData.walletAmount + amount
                    })
                },
                onError: (error: any) => {
                    toast.error(error?.response?.data?.message || "Error adding wallet amount!", {
                        style: {
                            backgroundColor: "#FF0000",
                            color: "#fff",
                        },
                    });
                    setAdjustmentAmount('');
                }
            });
        } catch (error) {
            const errorMessage = (error instanceof Error) ? error.message : "An unexpected error occurred";
            toast.error(errorMessage, {
                style: {
                    backgroundColor: "#FF0000",
                    color: "#fff",
                },
            });
            // console.error(error);
        }
    };

    const handleMinusVendorWallet = async (id: string, amount: number, remark: string) => {
        try {
            adjustVendorWallet({ id, amount, remark, adjustmentReason: "", type: "minus" as "add" | "minus" }, {
                onSuccess: (data: any) => {
                    toast.success(data.message || "Wallet amount deducted successfully!", {
                        style: {
                            backgroundColor: "#009F7F",
                            color: "#fff",
                        },
                    });
                    setFormData({
                        ...formData,
                        walletAmount: formData.walletAmount - amount
                    })
                    setAdjustmentAmount('');
                },
                onError: (error: any) => {
                    toast.error(error?.response?.data?.message || "Error deducting wallet amount!", {
                        style: {
                            backgroundColor: "#FF0000",
                            color: "#fff",
                        },
                    });
                    setAdjustmentAmount('');
                }
            });
        } catch (error) {
            const errorMessage = (error instanceof Error) ? error.message : "An unexpected error occurred";
            toast.error(errorMessage, {
                style: {
                    backgroundColor: "#FF0000",
                    color: "#fff",
                },
            });
            // console.error(error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            if (id) {
                // Update vendor (no password required)
                updateVendor({ id, data: formData }, {
                    onSuccess: (data: any) => {
                        toast.success(data.message || "Vendor updated successfully!", {
                            style: {
                                backgroundColor: "#009F7F",
                                color: "#fff",
                            },
                        });
                        setTimeout(() => router.push("/admin/vendor"), 2000);
                    },
                    onError: (error: any) => {
                        toast.error(error?.response?.data?.message || "Error updating vendor!", {
                            style: {
                                backgroundColor: "#FF0000",
                                color: "#fff",
                            },
                        });
                    }
                });
            } else {
                // Create vendor (ensure password is provided)
                if (!formData.password) {
                    toast.error("Password is required to create a new vendor", {
                        style: {
                            backgroundColor: "#FF0000",
                            color: "#fff",
                        },
                    });
                    return;
                }
                createVendor(formData, {
                    onSuccess: (data: any) => {
                        toast.success(data.message || "Vendor created successfully!", {
                            style: {
                                backgroundColor: "#009F7F",
                                color: "#fff",
                            },
                        });
                        setTimeout(() => router.push("/admin/vendor"), 2000);
                    },
                    onError: (error: any) => {
                        toast.error(error?.response?.data?.message || "Error creating vendor!", {
                            style: {
                                backgroundColor: "#FF0000",
                                color: "#fff",
                            },
                        });
                    }
                });
            }
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

    // Prevent tab close/refresh if form is dirty
    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (isFormDirty) {
                e.preventDefault();
                e.returnValue = "";
            }
        };

        window.addEventListener("beforeunload", handleBeforeUnload);
        return () => window.removeEventListener("beforeunload", handleBeforeUnload);
    }, [isFormDirty]);

    // Handle cancel navigation with unsaved changes dialog
    const handleCancel = () => {
        if (isFormDirty) {
            setShowUnsavedChangesDialog(true);
            setPendingNavigation(() => () => router.push("/admin/vendor"));
        } else {
            router.push("/admin/vendor");
        }
    };

    const handleConfirmNavigation = () => {
        setIsFormDirty(false);
        setShowUnsavedChangesDialog(false);
        pendingNavigation();
    };

    return (
        <Card className="rounded-none bg-white">
            <CardContent>
                <div className="flex py-4 gap-4">
                    <div className="w-1/4">
                        <h2 className="text-black text-lg font-bold mt-3">
                            {id ? "Edit Vendor Details" : "New Vendor Details"}
                        </h2>
                    </div>
                    <div className="w-3/4">
                        <div className="border bg-white px-8 rounded my-5 p-4 border-dashed border-border-base pb-5 md:pb-7">
                            <div className="mb-4">
                                <Label htmlFor="name">Vendor Name <span className="text-red-500">*</span></Label>
                                <Input
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="Name"
                                    className='w-full border-black py-6'
                                />
                            </div>

                            <div className="mb-4">
                                <Label htmlFor="phone">Phone Number <span className="text-red-500">*</span></Label>
                                <Input
                                    id="phone"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="Phone Number"
                                    pattern="[0-9]{10}"
                                    maxLength={10}
                                    inputMode="numeric"
                                    className='w-full border-black py-6'
                                />
                            </div>

                            {/* <div className="mb-4">
                                <Label htmlFor="email">Email <span className="text-red-500">*</span></Label>
                                <Input
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="Email"
                                    className='w-full border-black py-6'
                                />
                            </div> */}

                            <div className="mb-4">
                                <Label htmlFor="password">
                                    {id ? (
                                        <>
                                            New Password (Optional)
                                        </>
                                    ) : (
                                        <>
                                            Password <span className="text-red-500">*</span>
                                        </>
                                    )}
                                </Label>
                                <Input
                                    id="password"
                                    name="password"
                                    type="password"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    className='w-full border-black py-6'
                                    required={!id} // Required only for creating, optional for updating
                                />
                            </div>
                            <div className="mb-4">
                                <Label htmlFor="remark">Remarks <span className="text-[10px]">( optional )</span></Label>
                                <Textarea
                                    rows={3}
                                    id="remark"
                                    name="remark"
                                    value={formData.remark}
                                    onChange={handleInputChange}
                                    className='w-full border-black py-6'
                                />
                            </div>
                            <div className="mb-4">
                                <Label htmlFor="walletAmount">
                                    Add Wallet Amount <span className="text-[10px]">( optional )</span>
                                </Label>
                                <Input
                                    id="walletAmount"
                                    name="walletAmount"
                                    type="text"
                                    value={formData.walletAmount}
                                    onChange={handleInputChange}
                                    className='w-full border-black py-6'
                                    readOnly={id ? true : false}
                                />
                            </div>
                            {id && ( // Only show wallet adjustment for update mode
                                <div className="mb-4 space-y-4">
                                    {/* <div>
                                        <Label htmlFor="walletAmount">
                                            Current Wallet Balance
                                        </Label>
                                        <Input
                                            id="walletAmount"
                                            name="walletAmount"
                                            type="number"
                                            value={formData.walletAmount}
                                            readOnly
                                            className='w-full border-black py-7'
                                        />
                                    </div> */}
                                    <div className="space-y-3">
                                        <Label htmlFor="adjustmentAmount">Adjust Balance</Label>
                                        <div className="flex flex-col gap-3">
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    variant="outline"
                                                    onClick={() => handleMinusVendorWallet(id, Number(adjustmentAmount), adjustmentRemarks)}
                                                    className="h-11 w-11 p-0 rounded-lg border-red-200 hover:bg-red-50 text-red-600"
                                                >
                                                    <Minus className="w-4 h-4 text-red-500" />
                                                </Button>
                                                <Input
                                                    id="adjustmentAmount"
                                                    name="adjustmentAmount"
                                                    type="text"
                                                    value={adjustmentAmount}
                                                    onChange={handleAdjustmentChange}
                                                    className="h-11 text-center text-lg font-medium border-2 border-muted-foreground/20  w-60"
                                                    min="0"
                                                />
                                                <Button
                                                    variant="outline"
                                                    onClick={() => handleAddVendorWallet(id, Number(adjustmentAmount), adjustmentRemarks)}
                                                    className="h-11 w-11 p-0 rounded-lg border-green-200 hover:bg-green-50 text-green-600"
                                                >
                                                    <Plus className="w-4 h-4 text-green-500" />
                                                </Button>
                                            </div>
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
                                    </div>
                                </div>
                            )}
                            {/* 
                            <div className="mb-4">
                                <Label htmlFor="isActive">Status <span className="text-red-500">*</span></Label>

                                <Select name="isActive"
                                    value={formData.isActive ? "active" : "inactive"}
                                    onValueChange={(value) => handleSelectChange("isActive", value)}
                                    // required
                                >
                                    <SelectTrigger className='w-full border-black py-6'>
                                        <SelectValue placeholder="Select Login Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="active">Active</SelectItem>
                                        <SelectItem value="inactive">Inactive</SelectItem>
                                    </SelectContent>
                                </Select>

                            </div> */}
                        </div>
                        <div className="flex justify-end space-x-4">
                            <Button variant="outline" onClick={handleCancel}>
                                Cancel
                            </Button>
                            <Button onClick={handleSubmit} type="button">
                                {id ? "Update" : "Save"}
                            </Button>
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
        </Card >
    );
}