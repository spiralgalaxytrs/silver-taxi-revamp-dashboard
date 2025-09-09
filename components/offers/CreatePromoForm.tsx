"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Card, CardContent } from "components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '../ui/select';
import { toast } from 'sonner';
// import { useOfferStore } from '../../stores/-offerStore';
import { useRouter } from 'next/navigation';
import { Upload } from 'lucide-react';
import { getMaxDateTime, getMinDateTime } from '../../lib/dateFunctions';
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
import { useCreatePromoCode, usePromoCodesAll } from 'hooks/react-query/usePromoCodes';
import { title } from 'process';

type FormData = {
    promoName: string;
    title: string;
    category: string;
    code: string;
    description: string;
    value: string;
    startDate: string;
    endDate: string;
    keywords: string;
    status: boolean;
    usedCount: number;
    bannerImage: File | undefined | string;
    limit: number;
}

export function CreatePromoForm() {
    // const { createOffer, fetchOffers } = useOfferStore();
    const router = useRouter();
    const [promoType, setPromoType] = useState<'Flat' | 'Percentage'>('Flat');
    const [formData, setFormData] = useState<FormData>({
        promoName: '',
        title: '',
        category: '',
        code: '',
        description: '',
        value: '',
        startDate: '',
        endDate: '',
        keywords: '',
        status: true,
        usedCount: 0,
        bannerImage: undefined,
        limit: 1,
    });

    const [bannerImageURL, setBannerImageURL] = useState<string | null>(null);
    const [isFormDirty, setIsFormDirty] = useState(false);
    const [showUnsavedChangesDialog, setShowUnsavedChangesDialog] = useState(false);
    const [pendingNavigation, setPendingNavigation] = useState<() => void>(() => { });
    const { mutate: createPromoCode, isPending: isCreatePending } = useCreatePromoCode();
    const { data: fetchPromoCodes, isPending: isFetchPening } = usePromoCodesAll();



    const handleBannerImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        setBannerImageURL(file ? URL.createObjectURL(file) : null);
        setFormData(prevData => ({ ...prevData, bannerImage: file ?? undefined }));
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData(prevData => ({ ...prevData, [e.target.name]: e.target.value }));
    };

    useEffect(() => {
        const initialData = {
            promoName: '',
            title: '',
            category: '',
            description: '',
            value: '',
            startDate: '',
            endDate: '',
            keywords: '',
            status: true,
            claimedCount: 0,
            bannerImage: undefined
        };

        const currentData = formData;
        setIsFormDirty(JSON.stringify(initialData) !== JSON.stringify(formData));
    }, [formData]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isCreatePending) return; // Prevent multiple submissions

        try {
            const { promoName, code, startDate, endDate, value } = formData;
            const numericValue = Number(value);

            if (!promoName || !code || !startDate || !endDate) {
                toast.error("Please fill all required fields");
                return;
            }

            if (isNaN(numericValue)) {
                toast.error("Please enter a valid number for promo code value");
                return;
            }

            if (promoType === 'Percentage' && (numericValue < 0 || numericValue > 100)) {
                toast.error("Percentage must be between 0 and 100");
                return;
            }

            if (promoType === 'Flat' && numericValue < 0) {
                toast.error("Flat value must be greater than 0");
                return;
            }

            const start = new Date(startDate);
            const end = new Date(endDate);

            if (start > end) {
                toast.error("Start date must be before end date");
                return;
            }

            // Check for duplicate promo code
            if (fetchPromoCodes?.some((promo: any) => promo.code === code)) {
                toast.error("Promo code already exists");
                return;
            }

            const promoCodeData = {
                ...formData,
                type: promoType,
                value: numericValue,
                startDate: start,
                endDate: end,
            };

            createPromoCode(promoCodeData, {
                onSuccess: (data: any) => {
                    toast.success(data?.message || "Promo code created successfully", {
                        style: {
                            backgroundColor: "#009F7F",
                            color: "#fff",
                        },
                    });
                    setFormData({
                        promoName: '',
                        title: '',
                        category: '',
                        description: '',
                        code: '',
                        value: '',
                        startDate: '',
                        endDate: '',
                        keywords: '',
                        status: true,
                        usedCount: 0,
                        bannerImage: undefined,
                        limit: 1,
                    });
                    setBannerImageURL(null);
                    router.push('/admin/promo-codes');
                },
                onError: (error: any) => {
                    const message = error?.response?.data?.message || error.message || "Failed to create promo code";
                    toast.error(message, {
                        style: {
                            backgroundColor: "#FF0000",
                            color: "#fff",
                        },
                    });
                },
            });
        } catch (error: any) {
            const message = error?.message || "An unexpected error occurred";
            toast.error(message, {
                style: { background: '#FF0000', color: '#fff' },
            });
        }
    };

    // const handleSubmit = async (e: React.FormEvent) => {
    //     e.preventDefault();


    //     console.log("Hiii, h")

    //     try {
    //         const { promoName, code, startDate, endDate, value } = formData;
    //         const numericValue = Number(value);
    //         console.log("Deiiiiii")


    //         if (!promoName || !code || !startDate || !endDate) {
    //             toast.error("Please fill all required fields");
    //             return;
    //         }

    //         console.log("Bus")
    //         if (isNaN(numericValue)) {
    //             toast.error("Please enter a valid number for promo code value");
    //             return;
    //         }

    //         console.log("MOssss ")
    //         if (promoType === 'Percentage' && (numericValue < 0 || numericValue > 100)) {
    //             toast.error("Percentage must be between 0 and 100");
    //             return;
    //         }

    //         console.log("percenteage")

    //         if (promoType === 'Flat' && numericValue < 0) {
    //             toast.error("Flat value must be greater than 0");
    //             return;
    //         }

    //         console.log("Flat")
    //         const start = new Date(startDate);
    //         const end = new Date(endDate);

    //         if (start > end) {
    //             toast.error("Start date must be before end date");
    //             return;
    //         }

    //         console.log("Date")

    //         const promoCodeData = {
    //             ...formData,
    //             type: promoType,
    //             value: numericValue,
    //             startDate: start,
    //             endDate: end
    //         };


    //         // const response = await createPromoCode(promoCodeData);

    //         createPromoCode(promoCodeData, {
    //             onSuccess: (data: any) => {
    //                 console.log("From success")

    //                 toast.success(data?.message || "Promo code created successfully", {
    //                     style: {
    //                         backgroundColor: "#009F7F",
    //                         color: "#fff",
    //                     },
    //                 });


    //                 setFormData({
    //                     promoName: '',
    //                     category: '',
    //                     description: '',
    //                     code: '',
    //                     value: '',
    //                     startDate: '',
    //                     endDate: '',
    //                     keywords: '',
    //                     status: true,
    //                     claimedCount: 0,
    //                     bannerImage: undefined,
    //                 });

    //                 setBannerImageURL(null);
    //                 router.push('/admin/promo-codes');

    //             },
    //             onError: (error: any) => {
    //                 console.log("From error")

    //                 toast.error(error?.response?.data?.message || "Failed to create promo-code", {
    //                     style: {
    //                         backgroundColor: "#FF0000",
    //                         color: "#fff",
    //                     },
    //                 });
    //             },
    //         });
    //         // const { success, message } = response ?? fetchPromoCodes.getState();

    //         // if (success === true) {
    //         //     toast.success("Promo code created successfully", {
    //         //         style: { background: '#009F7F', color: '#fff' }
    //         //     });

    //         //     setFormData({
    //         //         promoName: '',
    //         //         category: '',
    //         //         description: '',
    //         //         code: '',
    //         //         value: '',
    //         //         startDate: '',
    //         //         endDate: '',
    //         //         keywords: '',
    //         //         status: true,
    //         //         claimedCount: 0,
    //         //         bannerImage: undefined
    //         //     });
    //         //     setBannerImageURL(null);
    //         //     router.push('/admin/promo-codes/');
    //         // }

    //     } catch (error: any) {
    //         toast.error(error.response?.data?.message || "Failed to create promo-code", {
    //             style: { background: '#FF0000', color: '#fff' }
    //         });
    //     }
    // };


    // Add beforeunload handler
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

    // Modify handleClose function
    const handleClose = () => {
        if (isFormDirty) {
            setShowUnsavedChangesDialog(true);
            setPendingNavigation(() => () => router.push('/admin/promo-codes'));
        } else {
            router.push('/admin/promo-codes');
        }
    };

    // Add navigation confirmation handler
    const handleConfirmNavigation = () => {
        setIsFormDirty(false);
        setShowUnsavedChangesDialog(false);
        pendingNavigation();
    };

    return (
        <div>
            <Card className='rounded-none'>
                <div className="flex justify-between items-center p-6 pb-6 pt-2">
                    <h2 className="text-3xl font-bold tracking-tight">
                        Create New Promo Code
                    </h2>
                    <Button onClick={handleClose} variant="outline">
                        Close
                    </Button>
                </div>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-4 mt-4">
                            <div className="grid grid-cols-2 gap-4">
                                {/* Offer Type Selection */}
                                <div className="space-y-2">
                                    <Label htmlFor="promoType">Promo Type <span className='text-red-500'>*</span></Label>
                                    <Select
                                        value={promoType}
                                        onValueChange={(value: 'Flat' | 'Percentage') => setPromoType(value)}
                                    >
                                        <SelectTrigger className="h-12">
                                            <SelectValue placeholder="Select Promo type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Flat">Flat Discount</SelectItem>
                                            <SelectItem value="Percentage">Percentage Discount</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Form Fields */}
                                <div className="space-y-2">
                                    <Label htmlFor="promoName">Promo Name <span className='text-red-500'>*</span></Label>
                                    <Input
                                        required
                                        id="promoName"
                                        name="promoName"
                                        placeholder='Enter promo code name'
                                        value={formData.promoName}
                                        onChange={handleInputChange}
                                        className="h-12"
                                    />
                                </div>
                                  <div className="space-y-2">
                                    <Label htmlFor="title">Title <span className='text-red-500'>*</span></Label>
                                    <Input
                                        required
                                        id="title"
                                        name="title"
                                        placeholder='Title'
                                        value={formData.title}
                                        onChange={handleInputChange}
                                        className="h-12"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="code">Promo Code <span className='text-red-500'>*</span></Label>
                                    <Input
                                        required
                                        id="code"
                                        name="code"
                                        placeholder='Enter promo code'
                                        value={formData.code}
                                        onChange={handleInputChange}
                                        className="h-12"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="value">
                                        {promoType === 'Flat' ? 'Amount' : 'Percentage'}
                                        <span className='text-red-500'>*</span>
                                    </Label>
                                    <Input
                                        required
                                        id="value"
                                        name="value"
                                        type="number"
                                        placeholder={promoType === 'Flat' ? "Enter the flat amount" : "Enter the promo percentage"}
                                        value={formData.value}
                                        onChange={handleInputChange}
                                        className="h-12"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="category">Service Type <span className='text-red-500'>*</span></Label>
                                    <Select
                                        value={formData.category}
                                        onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                                    >
                                        <SelectTrigger className="h-12">
                                            <SelectValue placeholder="Select service type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="All">All</SelectItem>
                                            <SelectItem value="One way">One Way</SelectItem>
                                            <SelectItem value="Round trip">Round Trip</SelectItem>
                                            {/* <SelectItem value="Airport Pickup">Airport Pickup</SelectItem> */}
                                            {/* <SelectItem value="Airport Drop">Airport Drop</SelectItem> */}
                                            {/* <SelectItem value="Day Packages">Day Packages</SelectItem> */}
                                            <SelectItem value="Hourly Packages">Hourly Packages</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>



                                <div className="space-y-2">
                                    <Label htmlFor="startDate">Start Date/Time <span className='text-red-500'>*</span></Label>
                                    <Input
                                        required
                                        id="startDate"
                                        name="startDate"
                                        type="datetime-local"
                                        value={formData.startDate}
                                        onChange={handleInputChange}
                                        className="h-12"
                                        min={getMinDateTime()}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="endDate">End Date/Time <span className='text-red-500'>*</span></Label>
                                    <Input
                                        required
                                        id="endDate"
                                        name="endDate"
                                        type="datetime-local"
                                        value={formData.endDate}
                                        onChange={handleInputChange}
                                        className="h-12"
                                        min={getMinDateTime()}
                                    />
                                </div>
                                {/* <div className="space-y-2">
                                    <Label htmlFor="endDate">Promo Code Quantity <span className='text-red-500'>*</span></Label>
                                    <Input
                                        required
                                        id="endDate"
                                        name="endDate"
                                        value={formData.endDate}
                                        onChange={handleInputChange}
                                        className="h-12"
                                        min={getMinDateTime()}
                                    />
                                </div> */}


                                          <div className="space-y-2">
                                    <Label htmlFor="value">
                                        Limit Per User
                                        <span className='text-red-500'>*</span>
                                    </Label>
                                    <Input
                                        required
                                        id="limit"
                                        name="limit"
                                        type="number"
                                        placeholder="Enter the limit per user"
                                        value={formData.limit}
                                        onChange={handleInputChange}
                                        className="h-12"
                                    />
                                </div>
                                  
                                <div className="space-y-2">
                                    <Label htmlFor="description">Description</Label>
                                    <Textarea
                                        id="description"
                                        name="description"
                                        placeholder='Enter the description'
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        className="h-12"

                                    />
                                </div>

                                  
                            </div>

                            {/* Banner Image Upload */}
                            <div className="space-y-2 col-span-2">
                                <Label htmlFor="bannerImage">Banner Image</Label>
                                <div className="border bg-white rounded p-4 border-dashed border-border-base">
                                    <div className="flex flex-col items-center justify-center h-32 cursor-pointer">
                                        <Label htmlFor="bannerImage-upload" className="flex flex-col items-center w-full">
                                            {!bannerImageURL && <>
                                                <Upload className="text-gray-600 text-4xl mb-2" />
                                                <p className="text-gray-600 text-sm mb-2">Click to upload</p>
                                                <span className="text-xs text-gray-400">Only image files (JPG, PNG, etc.)</span>
                                                <input
                                                    id="bannerImage-upload"
                                                    type="file"
                                                    accept="image/*"
                                                    className="hidden"
                                                    onChange={handleBannerImageChange}
                                                    placeholder="Upload banner image"
                                                    title="Upload banner image"
                                                />
                                            </>}
                                            {bannerImageURL && (
                                                <>
                                                    <img
                                                        src={
                                                            formData.bannerImage instanceof File
                                                                ? URL.createObjectURL(formData.bannerImage)
                                                                : formData.bannerImage as string
                                                        }
                                                        alt="Banner Preview"
                                                        className="w-full h-32 object-cover rounded"
                                                    />
                                                    <div className='flex flex-col items-center'>
                                                        <p className="text-gray-400 mt-2 text-center text-base">
                                                            {formData.bannerImage instanceof File ? formData.bannerImage.name : formData.bannerImage}
                                                        </p>
                                                        <span className='cursor-pointer text-black text-base border border-black rounded bg-[#EFEFEF] p-1'>change image</span>
                                                        <input
                                                            id="bannerImage-upload"
                                                            type="file"
                                                            accept="image/*"
                                                            className="hidden"
                                                            onChange={handleBannerImageChange}
                                                            title="Upload banner image"
                                                            placeholder="Upload banner image"
                                                        />
                                                    </div>
                                                </>
                                            )}
                                        </Label>
                                    </div>
                                </div>
                            </div>

                            {/* Submit Button */}
                            <div className="flex justify-end mt-8">
                                <Button
                                    type="submit"
                                    className="px-6 py-2 bg-[#009F7F] text-white hover:bg-green-600"
                                >
                                    Create Promo Code
                                </Button>
                            </div>
                        </div>
                    </form>
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
        </div>
    );
}