"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from 'components/ui/button'
import { Input } from 'components/ui/input'
import { Label } from 'components/ui/label'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from 'components/ui/select'
import { toast } from 'sonner'
import { Textarea } from 'components/ui/textarea'
import { Card, CardContent } from 'components/ui/card'
import { useDriverStore } from 'stores/-driverStore'
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
import { Upload } from 'lucide-react'

type FormData = {
    name: string;
    phone: string;
    email: string;
    license: string;
    isActive: boolean | null;
    address: string;
    licenseValidity: string;
    aadharNumber: string;
    licenseImage: File | undefined;
    vehicleId: string;
    remark: string;
    walletAmount: number;
}

export default function AddDriverPage() {
    const router = useRouter();
    const { createDriver } = useDriverStore();
    const [formData, setFormData] = useState<FormData>({
        name: '',
        phone: '',
        email: '',
        license: '',
        isActive: null,
        address: '',
        licenseValidity: '',
        aadharNumber: '',
        licenseImage: undefined,
        vehicleId: '',
        remark: '',
        walletAmount: 0,
    });
    const [isFormDirty, setIsFormDirty] = useState(false);

    const [showUnsavedChangesDialog, setShowUnsavedChangesDialog] = useState(false);
    const [pendingNavigation, setPendingNavigation] = useState<() => void>(() => { });


    const handleLicenseImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        setFormData(prevData => ({ ...prevData, licenseImage: file ?? undefined }));
    };
    // Handle text and textarea input changes
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setIsFormDirty(true);
        setFormData((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };
    
    const handleAmountChange = (name: string, value: any) => {
        setFormData((prev) => { 
            return {
                ...prev,
                [name]: String(value).replace(/[^0-9.]/g, ''),
            }
        })
    }

    // Handle select input changes
    const handleSelectChange = (name: string, value: string) => {
        setIsFormDirty(true);
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
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

    // Modify your cancel button handler
    const handleCancel = () => {
        if (isFormDirty) {
            setShowUnsavedChangesDialog(true);
            setPendingNavigation(() => () => router.push('/admin/drivers'));
        } else {
            router.push('/admin/drivers');
        }
    };

    // Add before return statement
    const handleConfirmNavigation = () => {
        setIsFormDirty(false);
        setShowUnsavedChangesDialog(false);
        pendingNavigation();
    };

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            // Ensure licenseValidity is converted correctly
            const driverData = {
                ...formData,
                licenseValidity: formData.licenseValidity ? formData.licenseValidity : "",
            };

            // Call API function to create a new driver
            await createDriver(driverData);

            // Get response isActive code from store
            const isActive = useDriverStore.getState().statusCode;
            const error = useDriverStore.getState().error;

            if (isActive !== 201) {
                toast.error(error || "Failed to add driver.", {
                    style: {
                        backgroundColor: "#FF0000",
                        color: "white"
                    },
                });
                return;
            }

            // Success message
            toast.success("Driver added successfully", {
                style: {
                    backgroundColor: "#009F7F",
                    color: "white"
                },
            });
            await new Promise((resolve) => setTimeout(resolve, 2000));

            // Navigate to drivers list
            router.push("/admin/drivers");
        } catch (err) {
            toast.error("An unexpected server error occurred.", {
                style: {
                    backgroundColor: "#FF0000",
                    color: "white"
                },
            });
            console.error(err);
        }
    };

    return (
        <div className='bg-white p-5 rounded-lg'>
            <Card className='rounded-none'>
                <div className="flex justify-between items-center p-6 pb-6 pt-2">
                    <h2 className="text-3xl font-bold tracking-tight">Add New Driver</h2>
                    <Button variant="outline" onClick={handleCancel}>
                        Close
                    </Button>
                </div>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-4 mt-4">
                            <div className="grid grid-cols-2 gap-4">
                                {/* Driver Details */}
                                <div className="space-y-2">
                                    <Label>Driver Name <span className='text-red-500'>*</span></Label>
                                    <Input
                                        name="name"
                                        placeholder='Enter Driver Name'
                                        className='h-12'
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Phone Number <span className='text-red-500'>*</span></Label>
                                    <Input
                                        name="phone"
                                        placeholder='Enter Phone Number'
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                        required
                                        pattern="[0-9]{10}"
                                        maxLength={10}
                                        inputMode="numeric"
                                        className='h-12'
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Email</Label>
                                    <Input
                                        name="email"
                                        placeholder='Enter Email'
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        className='h-12'
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>License Number <span className='text-red-500'>*</span></Label>
                                    <Input
                                        name="license"
                                        placeholder='Enter License Number'
                                        className='h-12'
                                        value={formData.license}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>License Validity Date <span className='text-red-500'>*</span></Label>
                                    <Input
                                        name="licenseValidity"
                                        type="date"
                                        className='h-12'
                                        value={formData.licenseValidity}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Aadhar Number <span className='text-red-500'>*</span></Label>
                                    <Input
                                        name="aadharNumber"
                                        placeholder='Enter Aadhar Number'
                                        className='h-12'
                                        value={formData.aadharNumber}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>

                                {/* <div className="space-y-2">
                                    <Label>Driver Image URL</Label>
                                    <Input
                                        name="driverImageUrl"
                                        placeholder='Enter Driver Image URL'
                                        value={formData.driverImageUrl}
                                        onChange={handleInputChange}
                                        className='h-12'
                                    />
                                </div> */}

                                <div className="flex flex-col items-center justify-center border border-dashed border-gray-400 rounded-lg p-6 hover:border-gray-600 transition cursor-pointer">
                                    <Label className='text-gray-600 text-sm mb-2'>License Image Upload</Label>
                                    <Label htmlFor="licenseImageFile" className="flex flex-col items-center cursor-pointer">
                                        {!formData.licenseImage && <>
                                            <Upload className="text-gray-600 text-4xl mb-2" />
                                            <p className="text-gray-600 text-sm mb-2">Click to upload or drag and drop</p>
                                            <span className="text-xs text-gray-400">Only image files (Webp,SVG, PNG, etc.) max size 2MB</span>
                                            <input
                                                id="licenseImageFile"
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                onChange={handleLicenseImageChange}
                                            />
                                        </>}
                                        {formData.licenseImage && (
                                            <>
                                                <img
                                                    src={
                                                        formData.licenseImage instanceof File
                                                            ? URL.createObjectURL(formData.licenseImage)
                                                            : formData.licenseImage as string
                                                    }
                                                    alt="Banner Preview"
                                                    className="w-full h-32 object-cover rounded"
                                                />
                                                <div className='flex flex-col items-center'>
                                                    <p className="text-gray-400 mt-2 text-center text-base">
                                                        {formData.licenseImage?.name}
                                                    </p>
                                                    <span className='cursor-pointer text-black text-base border border-black rounded bg-[#EFEFEF] p-1'>change image</span>
                                                    <input
                                                        id="licenseImageFile"
                                                        type="file"
                                                        accept="image/*"
                                                        className="hidden"
                                                        onChange={handleLicenseImageChange}
                                                    />
                                                </div>
                                            </>
                                        )}
                                    </Label>
                                </div>

                                {/* <div className="space-y-2">
                                    <Label>Vehicle ID</Label>
                                    <Input
                                        name="vehicleId"
                                        placeholder='Enter Vehicle Id'
                                        className='h-12'
                                        value={formData.vehicleId}
                                        onChange={handleInputChange}
                                    />
                                </div> */}

                                <div className="space-y-2">
                                    <Label>Wallet Amount</Label>
                                    <Input
                                        name="walletAmount"
                                        placeholder='Enter Wallet Amount'
                                        type='number'
                                        className='h-12'
                                        value={formData.walletAmount}
                                        onChange={(e) => handleAmountChange("walletAmount", Number(e.target.value))}
                                    />
                                </div>

                                <div className="space-y-2 col-span-2">
                                    <Label>Address <span className='text-red-500'>*</span></Label>
                                    <Textarea
                                        rows={4}
                                        name='address'
                                        placeholder='Enter Address'
                                        className='w-full py-3'
                                        value={formData.address}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>

                                <div className="space-y-2 col-span-2">
                                    <Label>Remarks</Label>
                                    <Textarea
                                        rows={4}
                                        name='remark'
                                        placeholder='Enter remarks'
                                        className='w-full py-3'
                                        value={formData.remark}
                                        onChange={handleInputChange}
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end space-x-4">
                                <Button variant="outline" onClick={handleCancel}>
                                    Cancel
                                </Button>
                                <Button type="submit">Save</Button>
                            </div>
                        </div>
                    </form>
                </CardContent>
            </Card>

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
        </div>
    )
}

