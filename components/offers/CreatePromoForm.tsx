"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent } from "components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '../ui/select';
import { toast } from 'sonner';
import { useOfferStore } from '../../stores/-offerStore';
import { useRouter } from 'next/navigation';
import { Upload } from 'lucide-react';
import { getMaxDateTime, getMinDateTime } from '../../lib/date-restrict';
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

type FormData = {
    offerName: string;
    category: string;
    description: string;
    value: string;
    startDate: string;
    endDate: string;
    keywords: string;
    status: boolean;
    claimedCount: number;
    bannerImage: File | undefined | string;
}

export function CreatePromoForm() {
    const { createOffer, fetchOffers } = useOfferStore();
    const router = useRouter();
    const [offerType, setOfferType] = useState<'Flat' | 'Percentage'>('Flat');
    const [formData, setFormData] = useState<FormData>({
        offerName: '',
        category: '',
        description: '',
        value: '',
        startDate: '',
        endDate: '',
        keywords: '',
        status: true,
        claimedCount: 0,
        bannerImage: undefined
    });

    const [bannerImageURL, setBannerImageURL] = useState<string | null>(null);
    const [isFormDirty, setIsFormDirty] = useState(false);
    const [showUnsavedChangesDialog, setShowUnsavedChangesDialog] = useState(false);
    const [pendingNavigation, setPendingNavigation] = useState<() => void>(() => { });

    const handleBannerImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        setBannerImageURL(file ? URL.createObjectURL(file) : null);
        setFormData(prevData => ({ ...prevData, bannerImage: file ?? undefined }));
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prevData => ({ ...prevData, [e.target.name]: e.target.value }));
    };

    useEffect(() => {
        const initialData = {
            name: '',
            offerName: '',
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
        try {
            const numericValue = Number(formData.value);
            if (isNaN(numericValue)) {
                toast.error("Please enter a valid number for offer value");
                return;
            }

            if (offerType === 'Percentage' && (numericValue < 0 || numericValue > 100)) {
                toast.error("Percentage must be between 0 and 100");
                return;
            }

            if (offerType === 'Flat' && numericValue < 0) {
                toast.error("Flat value must be greater than 0");
                return;
            }

            const offerData = {
                ...formData,
                type: offerType,
                value: numericValue,
                startDate: new Date(formData.startDate),
                endDate: new Date(formData.endDate)
            };

            await createOffer(offerData);

            const { statusCode, message } = useOfferStore.getState();

            if (statusCode === 400) {
                toast.error(message || "An active offer already exists", {
                    style: {
                        background: '#FF0000',
                        color: '#fff'
                    }
                });
            } else if (statusCode === 201 || statusCode === 200) {
                toast.success("Offer created successfully", {
                    style: {
                        background: '#009F7F',
                        color: '#fff'
                    }
                });

                // Reset form
                setFormData({
                    offerName: '',
                    category: '',
                    description: '',
                    value: '',
                    startDate: '',
                    endDate: '',
                    keywords: '',
                    status: true,
                    claimedCount: 0,
                    bannerImage: undefined
                });
                setBannerImageURL(null);
                // Optionally, navigate to another page
                router.push('/admin/offers/');
            } else {
                toast.error(message || "Failed to create offer", {
                    style: {
                        background: '#FF0000',
                        color: '#fff'
                    }
                });
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to create offer", {
                style: {
                    background: '#FF0000',
                    color: '#fff'
                }
            });
        }
    };

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
            router.push('/admin/offers');
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
                                    <Label htmlFor="offerType">Offer Type <span className='text-red-500'>*</span></Label>
                                    <Select
                                        value={offerType}
                                        onValueChange={(value: 'Flat' | 'Percentage') => setOfferType(value)}
                                    >
                                        <SelectTrigger className="h-12">
                                            <SelectValue placeholder="Select offer type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Flat">Flat Offer</SelectItem>
                                            <SelectItem value="Percentage">Percentage Offer</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Form Fields */}
                                <div className="space-y-2">
                                    <Label htmlFor="offerName">Promo Name <span className='text-red-500'>*</span></Label>
                                    <Input
                                        required
                                        id="offerName"
                                        name="offerName"
                                        placeholder='Enter offer name'
                                        value={formData.offerName}
                                        onChange={handleInputChange}
                                        className="h-12"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="offerName">Promo Code <span className='text-red-500'>*</span></Label>
                                    <Input
                                        required
                                        id="offerName"
                                        name="offerName"
                                        placeholder='Enter offer name'
                                        value={formData.offerName}
                                        onChange={handleInputChange}
                                        className="h-12"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="value">
                                        {offerType === 'Flat' ? 'Amount' : 'Percentage'}
                                        <span className='text-red-500'>*</span>
                                    </Label>
                                    <Input
                                        required
                                        id="value"
                                        name="value"
                                        type="number"
                                        placeholder={offerType === 'Flat' ? "Enter the flat amount" : "Enter the promo percentage"}
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
                                            <SelectItem value="Airport Pickup">Airport Pickup</SelectItem>
                                            <SelectItem value="Airport Drop">Airport Drop</SelectItem>
                                            {/* <SelectItem value="Day Packages">Day Packages</SelectItem> */}
                                            <SelectItem value="Hourly Packages">Hourly Packages</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="description">Description</Label>
                                    <Input
                                        id="description"
                                        name="description"
                                        placeholder='Enter the description'
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        className="h-12"
                                    />
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
                                <div className="space-y-2">
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
                                </div>
                            </div>

                            {/* Banner Image Upload */}
                            <div className="space-y-2 col-span-2">
                                <Label htmlFor="bannerImage">Banner Image</Label>
                                <div className="border bg-white rounded p-4 border-dashed border-border-base">
                                    <div className="flex flex-col items-center justify-center h-32 cursor-pointer">
                                        <Label htmlFor="bannerImage" className="flex flex-col items-center w-full">
                                            {!bannerImageURL && <>
                                                <Upload className="text-gray-600 text-4xl mb-2" />
                                                <p className="text-gray-600 text-sm mb-2">Click to upload or drag and drop</p>
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
                                                            id="bannerImage"
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