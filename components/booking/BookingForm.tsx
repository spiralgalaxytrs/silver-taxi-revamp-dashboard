"use client"

import React, { useEffect, useState } from 'react';
import { Button } from '../ui/button';
import { useSearchParams } from 'next/navigation';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from "components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '../ui/select';
import { toast } from 'sonner';
import { useBookingStore } from 'stores/bookingStore';
import { useVehicleStore } from 'stores/vehicleStore';
import { useOfferStore } from 'stores/offerStore';
import { getMinDateTime, getMaxDateTime,getMinDate } from '../../lib/date-restrict';
import axios from "../../lib/http-common"
import { useTariffStore } from 'stores/tariffStore';
import { Loader2 } from 'lucide-react';
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
import { useEnquiryStore } from 'stores/enquiryStore';
import LocationAutocomplete from '../localtion/LocationAutocomplete';
import PhoneInput from 'react-phone-input-2'
import { useServiceStore } from 'stores/serviceStore';

interface CreateBookingFormProps {
    id?: string;
    createdBy: string;
}

type Booking = {
    bookingId?: string;
    name: string;
    phone: string;
    email: string;
    pickup: string;
    drop: string;
    pickupDateTime: string;
    dropDate: string | null;
    vehicleId: string;
    distance: number;
    enquiryId?: string | null;
    offerId?: string | null;
    finalAmount: number;
    estimatedAmount: number;
    upPaidAmount: number;
    price: number;
    extraPrice: number;
    distanceLimit: number;
    discountAmount: number;
    advanceAmount: number;
    paymentMethod: "UPI" | "Bank" | "Cash" | "Card";
    packageId?: string;
    packageType?: string;
    dayOrHour?: string;
    type: "Website" | "App" | "Manual";
    paymentStatus: "Pending" | "Paid" | "Partially Paid";
    serviceType: "One way" | "Round trip" | "Airport Pickup" | "Airport Drop" | "Day Packages" | "Hourly Packages";
    status: "Completed" | "Cancelled" | "Not-Started" | "Started";
    createdBy: "Admin" | "Vendor";
    toll?: number | null;
    hill?: number | null;
    permitCharge?: number | null;
    taxPercentage?: number | null;
    taxAmount?: number | null;
    driverBeta?: number | null;
    duration?: string | null;
    pricePerKm?: number | null;
}

export function BookingForm({ id, createdBy }: CreateBookingFormProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { createBooking, updateBooking, bookings, isLoading, error } = useBookingStore();
    const { enquiry, fetchEnquiryById } = useEnquiryStore();
    const { vehicles, fetchActiveVehicles } = useVehicleStore();
    const { tariffs, fetchTariffs, packageTariffs, fetchPackageTariffByVehicleId, pkgTariffs, fetchPackageTariffs } = useTariffStore();
    const { services } = useServiceStore();
    const { offers, fetchOffers } = useOfferStore();
    const [currentStep, setCurrentStep] = useState(1);
    const [localLoading, setLocalLoading] = useState(false);
    const [updatedOffers, setUpdatedOffers] = useState<any[]>([]);
    const [isFormDirty, setIsFormDirty] = useState(false);
    const [serviceId, setServiceId] = useState('');
    const [serviceType, setServiceType] = useState("")
    const [showUnsavedChangesDialog, setShowUnsavedChangesDialog] = useState(false);
    const [pendingNavigation, setPendingNavigation] = useState<() => void>(() => { });
    const [isTariffsLoaded, setIsTariffsLoaded] = useState(false);
    const [filteredVehicles, setFilteredVehicles] = useState<any[]>([]);

    const [formData, setFormData] = useState<Booking>({
        name: '',
        email: '',
        phone: '',
        pickup: '',
        drop: '',
        pickupDateTime: '',
        dropDate: '',
        serviceType: 'One way',
        vehicleId: '',
        distance: 0,
        enquiryId: null,
        offerId: null,
        packageId: '',
        packageType: '',
        dayOrHour: '',
        price: 0,
        extraPrice: 0,
        distanceLimit: 0,
        finalAmount: 0,
        estimatedAmount: 0,
        discountAmount: 0,
        upPaidAmount: 0,
        advanceAmount: 0,
        type: 'Manual',
        paymentMethod: 'Cash',
        status: 'Not-Started',
        createdBy: createdBy as "Admin" | "Vendor",
        paymentStatus: 'Pending',
        toll: 0,
        hill: 0,
        permitCharge: 0,
        taxPercentage: 0,
        taxAmount: 0,
        driverBeta: 0,
        duration: "",
        pricePerKm: 0,
    });

    let pastTimeToastShown = false; // Flag to track if the toast has been shown


    const findServiceId = (serviceType: string) => {
        const services = useServiceStore.getState().services;
        const foundService: any = services.find(service => service.name === serviceType);
        return foundService ? foundService.serviceId as string : "";
    }

    useEffect(() => {
        const fetchEnquiry = async () => {
            if (searchParams.get('enquiryId')) {
                const enquiryId = searchParams.get('enquiryId') as string;
                await fetchEnquiryById(enquiryId); // Await the fetchEnquiryById call
                if (enquiry) {
                    const findServiceType = (serviceId: string) => {
                        const services = useServiceStore.getState().services;
                        const gotService: any = services.find(service => service.serviceId === serviceId);
                        return gotService ? gotService.name as string : "";
                    }
                    setFormData({
                        ...formData,
                        name: enquiry.name || '',
                        email: enquiry.email || '',
                        phone: enquiry.phone || '',
                        pickup: enquiry.pickup || '',
                        drop: enquiry.drop || '',
                        vehicleId: enquiry.vehicleId || '',
                        packageId:enquiry.packageId,
                        enquiryId: enquiry.enquiryId || null,
                        pickupDateTime: new Date(enquiry.pickupDateTime).toISOString().slice(0, 16),
                        dropDate: enquiry.dropDate ? new Date(enquiry.dropDate).toISOString().slice(0, 10) : null,
                        serviceType: findServiceType(enquiry.serviceId) as "One way" | "Round trip" | "Airport Pickup" | "Airport Drop" | "Day Packages" | "Hourly Packages", // Removed await as it's not needed
                        type: enquiry.type,
                        createdBy: enquiry.createdBy as "Admin" | "Vendor",
                    });
                }
            }
        }
        fetchEnquiry();

        if (id) {
            const booking = bookings.find(b => b.bookingId === id);
            console.log("booking data ==>", booking)
            if (booking) {
                setFormData({
                    ...booking,
                    pickupDateTime: typeof (booking.pickupDate) === "string" ? booking.pickupDate.slice(0, 16) : new Date().toLocaleString(),
                    dropDate: booking.dropDate ? (typeof booking.dropDate === "string" ? booking.dropDate.slice(0, 10) : new Date(booking.dropDate).toLocaleString().slice(0, 10)) : null,
                    vehicleId: booking.vehicleId || '',
                    packageId:booking.packageId,
                    distance: booking.distance || 0,
                    finalAmount: booking.finalAmount || 0,
                    estimatedAmount: booking.estimatedAmount || 0,
                    discountAmount: booking.discountAmount || 0,
                    advanceAmount: booking.advanceAmount || 0,
                    upPaidAmount: booking.upPaidAmount || 0,
                    price: booking.price || 0,
                    extraPrice: booking.extraPrice || 0,
                    distanceLimit: booking.distanceLimit || 0,
                    createdBy: booking.createdBy as "Admin" | "Vendor",
                    serviceType: booking.serviceType as "One way" | "Round trip" | "Airport Pickup" | "Airport Drop" | "Day Packages" | "Hourly Packages"
                });
                console.log("form data ===>",formData)
                setCurrentStep(2);
            }
        }
    }, [id, bookings]);

    useEffect(() => {
        const services = useServiceStore.getState().services;
        const initSer = services.find(service => service.name === "One way");
        setServiceId(initSer?.serviceId as string);
        fetchActiveVehicles();
        fetchOffers();
        fetchTariffs();
    }, []);

    useEffect(() => {
        const fetchTariffsAndSetLoaded = async () => {
            await fetchTariffs();
            setIsTariffsLoaded(true);
        };
        fetchTariffsAndSetLoaded();
    }, []);

    useEffect(() => {
        if (offers.length > 0) {
            setUpdatedOffers(offers.filter(offer => offer.status === true));
        }
    }, [offers]);

    // Add this useEffect to fetch package tariffs when service type and vehicle are selected
    useEffect(() => {
        const fetchPackages = async () => {
            if ((formData.serviceType === 'Day Packages' || formData.serviceType === 'Hourly Packages') && formData.vehicleId) {
                const serviceId = findServiceId(formData.serviceType);
                const type = formData.serviceType === 'Day Packages' ? 'day' : 'hourly';
                if (serviceId) {
                    await fetchPackageTariffByVehicleId(formData.vehicleId, serviceId, type);
                }
            }
        };
        fetchPackages();
    }, [formData.serviceType, formData.vehicleId]);

    useEffect(() => {
        const initialData = {
            name: '',
            email: '',
            phone: '',
            pickup: '',
            drop: '',
            pickupDateTime: '',
            dropDate: '',
            serviceType: 'One way',
            vehicleId: '',
            distance: 0,
            offerId: null,
            packageId: '',
            packageType: '',
            dayOrHour: "",
            finalAmount: 0,
            estimatedAmount: 0,
            discountAmount: 0,
            advanceAmount: 0,
            type: 'Manual',
            paymentMethod: 'Cash',
            status: 'Not-Started',
            createdBy: 'Admin',
            paymentStatus: 'Pending',
            toll: 0,
            hill: 0,
            permitCharge: 0,
            taxPercentage: 0,
            taxAmount: 0,
            driverBeta: 0,
            duration: "",
            pricePerKm: 0,
        };

        const currentData = formData;
        setIsFormDirty(JSON.stringify(initialData) !== JSON.stringify(formData));
    }, [formData]);

    const fetchDistance = async (pickup: string, drop: string) => {
        if (pickup && drop) {
            setLocalLoading(true);
            try {
                const response = await axios.get(`/global/distance`, {
                    params: { origin: pickup, destination: drop }
                });
                let { distance, duration } = response.data.data;
                setFormData(prev => ({
                    ...prev,
                    distance: distance,
                    duration: duration
                }));


                if (distance > 0) {
                    await handleFairCalculation(
                        formData.serviceType,
                        formData.vehicleId,
                        distance,
                        formData.pickupDateTime,
                        formData.dropDate || ''
                    );
                }
                setLocalLoading(false);
            } catch (error) {
                toast.error('Failed to calculate distance');
                setLocalLoading(false);
            }
        }
    };


    const handleFairCalculation = async (serviceType: string, vehicleId: string, distance: number, pickupDateTime: string, dropDate: string) => {
        setLocalLoading(true);
        try {
            // Start with base payload
            const payload: any = {
                serviceType,
                vehicleId,
                distance,
                pickupDateTime,
                dropDate,
                createdBy: formData.createdBy
            };

            // Add package-related fields only for Day/Hourly Packages
            if (formData.serviceType === 'Day Packages' || formData.serviceType === 'Hourly Packages') {
                if (!formData.packageId) {
                    toast.error('Please select a package first');
                    setLocalLoading(false);
                    return;
                }

                payload.packageId = formData.packageId;
                payload.packageType = formData.serviceType === 'Day Packages' ? 'Day Package' : 'Hourly Package';
                payload.createdBy = formData.createdBy;
            }

            const response = await axios.post(`/v1/bookings/fair-calculation`, payload);
            let { basePrice, driverBeta, pricePerKm, finalPrice, taxAmount, taxPercentage } = response.data.data;

            setFormData(prev => ({
                ...prev,
                estimatedAmount: basePrice,
                finalAmount: finalPrice,
                driverBeta: driverBeta,
                pricePerKm: pricePerKm,
                taxAmount: taxAmount,
                taxPercentage: taxPercentage,
                price: basePrice,
                extraPrice: pricePerKm || 0,
                upPaidAmount: finalPrice
            }));
            setLocalLoading(false);
        } catch (err) {
            toast.error('Failed to calculate fare');
            setLocalLoading(false);
        }
    };

    const handleInputChange = (name: keyof Booking, value: any) => {
        setFormData((prev) => {
            let newValue = value;

            if (name === "pickupDateTime") {
                const now = new Date();
                const selectedDate = new Date(value);

                // Ensure we get HH:MM format for comparison
                const minTime = now.toISOString().slice(11, 16);
                const selectedTime = value.slice(11, 16);

                // If the selected date is today, enforce time restriction
                if (selectedDate.toDateString() === now.toDateString() && selectedTime < minTime) {
                    newValue = new Date().toISOString().slice(11, 16);

                    // Check if the toast has already been shown to prevent duplicates
                    if (!pastTimeToastShown) {
                        toast.error("You cannot select a past time!", {
                            id: "past-time-toast",
                            duration: 2000,
                            closeButton: true,
                            position: "top-right",
                            icon: "🚫",
                            style: {
                                borderRadius: "10px",
                                padding: "20px",
                            }
                        });
                        pastTimeToastShown = true; // Set the flag to true after showing the toast
                    }
                }
            }

            if (["distance", "estimatedAmount", "upPaidAmount", "discountAmount", "advanceAmount"].includes(name)) {
                newValue = value.replace(/[^0-9.]/g, "");
            }

            const newState = {
                ...prev,
                [name]: newValue,
            };

            if (name === "offerId") {
                if (value === "None") {
                    newState.offerId = null;
                    newState.discountAmount = 0;
                } else {
                    const offer = offers.find((offer) => offer.offerId === value);
                    if (offer?.type === "Percentage") {
                        newState.discountAmount = Math.trunc((Number(newState.estimatedAmount) * offer.value) / 100);
                    } else if (offer?.type === "Flat") {
                        newState.discountAmount = offer.value || 0;
                    }
                }
            }

            // Ensure `finalAmount` is always correctly calculated
            newState.upPaidAmount =
                Number(newState.finalAmount || 0) -
                Number(newState.discountAmount || 0) -
                Number(newState.advanceAmount || 0);

            // console.log('Form data updated:', { name, value, newState });
            return newState;
        });
    };


    const handleNextStep = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();

        const serviceId = findServiceId(formData.serviceType);
        setServiceId(serviceId);

        if (!isTariffsLoaded) {
            toast.error("Tariffs are still loading. Please wait...");
            return;
        }

        // Validate required fields
        if (
            !formData.serviceType ||
            !formData.name ||
            !formData.phone ||
            !formData.pickup ||
            !formData.vehicleId ||
            !formData.pickupDateTime
        ) {
            toast.error("Please fill all required fields");
            return;
        }

        // Additional validation for packages
        if ((formData.serviceType === 'Day Packages' || formData.serviceType === 'Hourly Packages') && !formData.packageId) {
            toast.error("Please select a package");
            return;
        }

        const selectedTariff = tariffs.filter((tariff) => tariff.vehicleId === formData.vehicleId && tariff.serviceId === serviceId);

        if (!selectedTariff) {
            toast.error("Selected Vehicle Tariff Not Found");
            return;
        }

        // Only calculate distance for non-package bookings
        if (formData.serviceType !== 'Day Packages' && formData.serviceType !== 'Hourly Packages') {
            await fetchDistance(formData.pickup, formData.drop);
        }

        setCurrentStep(2);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (id) {
                await updateBooking(id, formData);
            } else {
                await createBooking(formData);
            }
            const status = useBookingStore.getState().statusCode;
            const message = useBookingStore.getState().message;
            if (status === 200 || status === 201) {
                toast.success(message, {
                    style: {
                        backgroundColor: "#009F7F",
                        color: "#fff",
                    },
                });
                router.push(`/${createdBy === "Admin" ? "admin" : "vendor"}/bookings`);
            } else {
                toast.error(message, {
                    style: {
                        backgroundColor: "#FF0000",
                        color: "#fff",
                    },
                });
            }
        } catch (err) {
            toast.error(error || "Failed to save booking", {
                style: {
                    backgroundColor: "#FF0000",
                    color: "#fff",
                },
            });
        }
    };

    // Add beforeunload handler
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


    useEffect(() => {
        fetchPackageTariffs(serviceType)
    }, [serviceType])

    const getFilteredVehicles = async (serviceType: string, vehicles: any[], tariffs: any[]) => {
        
        const normalizedServiceType = serviceType === "Day Packages" ? "day" :
            serviceType === "Hourly Packages" ? "hourly" :
                serviceType;
        setServiceType(normalizedServiceType);

        const serviceId = findServiceId(serviceType); // Map serviceType to serviceId

        if (!serviceId) {
            console.warn("Invalid serviceId. Returning empty array.");
            return [];
        }

        const isPackageType = serviceType === "Day Packages" || serviceType === "Hourly Packages";

        // Main filtering logic wrapped in an async function
        const filterVehicles = async () => {
            const filtered = vehicles.filter((vehicle) => {
                let vehicleTariffs;

                if (isPackageType) {
                    // For package types, we need to check both the serviceId and the package type
                    vehicleTariffs = pkgTariffs.filter((tariff: any) => {
                        const isMatchingService = tariff.serviceId === serviceId;
                        const isMatchingType = serviceType === "Hourly Packages" ? true : tariff.type === normalizedServiceType;
                        const isMatchingVehicle = tariff.vehicleId === vehicle?.vehicleId;
                        const hasValidPrice = Number(tariff.extraPrice) > 0;
                        const isActive = tariff.status === true;
                        
                        return isMatchingService && isMatchingType && isMatchingVehicle && hasValidPrice && isActive;
                    });
                } else {
                    vehicleTariffs = tariffs.filter((tariff: any) => {
                        return (
                            tariff.vehicleId === vehicle?.vehicleId &&
                            tariff.serviceId === serviceId &&
                            Number(tariff.price) > 0 &&
                            Number(tariff.extraPrice) > 0
                        );
                    });
                }

                return vehicleTariffs.length > 0;
            });

            return filtered;
        };

        // Return the promise from filterVehicles
        return await filterVehicles();
    };

    useEffect(() => {
        const fetchFilteredVehicles = async () => {
            const vehiclesFiltered = await getFilteredVehicles(formData.serviceType, vehicles, tariffs);
            setFilteredVehicles(vehiclesFiltered);
        };

        fetchFilteredVehicles();
    }, [formData.serviceType, vehicles, tariffs, pkgTariffs]);

    // Modify handleClose function
    const handleClose = () => {
        if (isFormDirty) {
            setShowUnsavedChangesDialog(true);
            setPendingNavigation(() => () => router.push(`/${createdBy === "Admin" ? "admin" : "vendor"}/bookings`));
        } else {
            router.push(`/${createdBy === "Admin" ? "admin" : "vendor"}/bookings`);
        }
    };

    // Add navigation confirmation handler
    const handleConfirmNavigation = () => {
        setIsFormDirty(false);
        setShowUnsavedChangesDialog(false);
        pendingNavigation();
    };
    // Restrict past times on today's date
    const getMinTimeForToday = () => {
        if (!formData.pickupDateTime) return ""; // No restriction if no date is selected

        const selectedDate = new Date(formData.pickupDateTime);
        const today = new Date();

        if (selectedDate.toDateString() === today.toDateString()) {
            // If the selected date is today, restrict past times
            return today.toISOString().slice(11, 16); // Extract HH:MM
        }

        return ""; // No restriction for future dates
    };

    const handleLocationSelectFromGoogle = (address: string) => {
        setFormData(prev => ({
            ...prev,
            pickup: address,
        }));
    }

    const handleLocationSelectToGoogle = (address: string) => {
        setFormData(prev => ({
            ...prev,
            drop: address,
        }));
    }

    // Add this useEffect to trigger fair calculation when package details change
    useEffect(() => {
        const calculatePackageFare = async () => {
            if (
                (formData.serviceType === 'Day Packages' || formData.serviceType === 'Hourly Packages') &&
                formData.vehicleId &&
                formData.packageId &&
                formData.pickupDateTime
            ) {
                await handleFairCalculation(
                    formData.serviceType,
                    formData.vehicleId,
                    formData.distance || 0,
                    formData.pickupDateTime,
                    formData.dropDate || '',

                );
            }
        };

        calculatePackageFare();
    }, [formData.packageId, formData.vehicleId, formData.pickupDateTime]);

    const isAnyLoading = isLoading || localLoading;
    if (isAnyLoading) {
        return (
            <div className="flex items-center justify-center h-[500px] bg-gray-50">
                <Loader2 className="w-12 h-12 animate-spin text-primary" />
            </div>
        );
    }


    return (
        <Card className="rounded-none">
            <div className="flex justify-between items-center p-6 pb-0">
                <h2 className="text-3xl font-bold tracking-tight">
                    {id ? 'Edit Booking' : 'Create New Booking'}
                </h2>
                <Button onClick={handleClose} variant="outline">
                    Close
                </Button>
            </div>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Step 1: Trip Details */}
                    {currentStep === 1 && (
                        <div className="space-y-4 mt-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Service Type <span className='text-red-500'>*</span></Label>
                                    <Select
                                        value={formData.serviceType}
                                        onValueChange={(v) => {
                                            handleInputChange('serviceType', v);
                                            // Reset vehicleId when service type changes to ensure valid selection
                                            handleInputChange('vehicleId', '');
                                        }}
                                    >
                                        <SelectTrigger className="h-12">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {services
                                                .filter(service => service.isActive) // Optional: only show active services
                                                .map(service => (
                                                    <SelectItem key={service.serviceId} value={service.name}>
                                                        {service.name}
                                                    </SelectItem>
                                                ))
                                            }
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Package Type (Conditional) */}
                                {/* {formData.serviceType === 'Package' && (
                                    <div className="space-y-2">
                                        <Label>Package Type <span className='text-red-500'>*</span></Label>
                                        <Select
                                            onValueChange={(value) => setSubServiceType(value)}
                                            value={subServiceType}
                                        >
                                            <SelectTrigger className="h-12">
                                                <SelectValue placeholder="Select package type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="dayPackages">Day Packages</SelectItem>
                                                <SelectItem value="hourlyPackages">Hourly Packages</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )} */}

                                {/* Package Type (Conditional) */}
                                {/* {formData.serviceType === 'Airport' && (
                                    <div className="space-y-2">
                                        <Label>Type<span className='text-red-500'>*</span></Label>
                                        <Select
                                            onValueChange={(value) => setSubServiceType(value)}
                                            value={subServiceType}
                                        >
                                            <SelectTrigger className="h-12">
                                                <SelectValue placeholder="Select package type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="pickup">Pickup</SelectItem>
                                                <SelectItem value="drop">Drop</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )} */}


                                <div className="space-y-2">
                                    <Label>Vehicle Type <span className='text-red-500'>*</span></Label>
                                    <Select
                                        value={formData.vehicleId || ""} // Ensure this is not an empty string
                                        onValueChange={async (v) => {
                                            const selectedVehicle = filteredVehicles.find(vehicle => vehicle.vehicleId === v);
                                            
                                            // Update all related fields at once
                                            setFormData(prev => {
                                                const newState = {
                                                    ...prev,
                                                    vehicleId: v,
                                                    // Add any other vehicle-related fields you want to update
                                                };
                                                return newState;
                                            });
                                        }}
                                    >
                                        <SelectTrigger className="h-12">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {filteredVehicles.length > 0 ? (
                                                filteredVehicles.map((vehicle: any) => (
                                                    <SelectItem key={vehicle.vehicleId} value={vehicle.vehicleId}>
                                                        {vehicle.name}
                                                    </SelectItem>
                                                ))
                                            ) : (
                                                <SelectItem value="no-vehicles" disabled>
                                                    No vehicles available
                                                </SelectItem>
                                            )}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Add this new conditional package selection */}
                                {(formData.serviceType === 'Day Packages' || formData.serviceType === 'Hourly Packages') && formData.vehicleId && (
                                    <div className="space-y-2">
                                        <Label>Package Selection <span className='text-red-500'>*</span></Label>
                                        <Select
                                            value={formData.packageId}
                                            onValueChange={async (v) => {
                                                const selectedPackage = packageTariffs.find(pkg => pkg.packageId === v);
                                                
                                                // Update all related fields at once
                                                setFormData(prev => {
                                                    const newState = {
                                                        ...prev,
                                                        packageId: v,
                                                        dayOrHour: selectedPackage?.dayOrHour || '',
                                                        distanceLimit: selectedPackage?.distanceLimit || 0,
                                                        price: selectedPackage?.price || 0,
                                                        extraPrice: selectedPackage?.extraPrice || 0
                                                    };
                                                    return newState;
                                                });
                                            }}
                                        >
                                            <SelectTrigger className="h-12">
                                                <SelectValue placeholder="Select a package" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {packageTariffs
                                                    .filter(pkg => pkg.createdBy === 'Admin')
                                                    .map(pkg => (
                                                        <SelectItem key={pkg.packageId} value={pkg.packageId}>
                                                            {pkg.dayOrHour} {pkg.dayOrHour > 1 ? "Hours" : "Hour" } - {pkg.distanceLimit} Km - ₹ {pkg.price}
                                                        </SelectItem>
                                                    ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <Label>Customer Name <span className='text-red-500'>*</span></Label>
                                    <Input
                                        value={formData.name}
                                        onChange={e => handleInputChange('name', e.target.value)}
                                        className="h-12"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Phone Number <span className='text-red-500'>*</span></Label>
                                    <PhoneInput
                                        value={formData.phone}
                                        country="in" // Default country code (India)
                                        onChange={(phone: string, country: { dialCode: string }) => {
                                            // Get the country code dynamically based on selected country
                                            const countryCode = country.dialCode
                                            const actualNumber = phone.substring(countryCode.length)

                                            // Format the phone number as "countryCode phoneNumber"
                                            const formattedPhone = `${countryCode} ${actualNumber}`;
                                            handleInputChange("phone", formattedPhone);
                                        }}
                                        inputStyle={{
                                            width: "100%",
                                            height: "50px",
                                            border: "1px solid #ccc",
                                            borderRadius: "4px",
                                        }}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Email <span className='text-red-500'>*</span></Label>
                                    <Input
                                        value={formData.email}
                                        onChange={e => handleInputChange('email', e.target.value)}
                                        className="h-12"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Pickup Location <span className='text-red-500'>*</span></Label>
                                    <LocationAutocomplete
                                        onSelect={handleLocationSelectFromGoogle}
                                        onChange={e => handleInputChange('pickup', e.target.value)}
                                        getValue={formData.pickup}
                                    />
                                </div>

                                {formData.serviceType !== 'Day Packages' && formData.serviceType !== 'Hourly Packages' && (
                                    <div className="space-y-2">
                                        <Label>Drop Location <span className='text-red-500'>*</span></Label>
                                        <LocationAutocomplete
                                            onSelect={handleLocationSelectToGoogle}
                                            onChange={e => handleInputChange('drop', e.target.value)}
                                            getValue={formData.drop}
                                        />
                                    </div>
                                )}


                                <div className="space-y-2">
                                    <Label>Pickup Date & Time <span className='text-red-500'>*</span></Label>
                                    <Input
                                        type="datetime-local"
                                        value={formData.pickupDateTime}
                                        onChange={e => handleInputChange('pickupDateTime', e.target.value)}
                                        min={getMinDateTime()}
                                        max={getMaxDateTime()}
                                        step="60"
                                        className="h-12"
                                    />
                                </div>


                                {formData.serviceType === 'Round trip' && (
                                    <div className="space-y-2">
                                        <Label>Drop Date <span className='text-red-500'>*</span></Label>
                                        <Input
                                            type="date"
                                            value={formData.dropDate ? formData.dropDate : ''}
                                            onChange={e => handleInputChange('dropDate', e.target.value)}
                                            className="h-12"
                                            min={getMinDate()}
                                            max={getMaxDateTime().substring(0, 10)}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Step 2: Pricing & Payment */}
                    {currentStep === 2 && (
                        <>
                            <div className="space-y-4 mt-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Distance (km) <span className='text-red-500'>*</span></Label>
                                        <Input
                                            value={formData.distance}
                                            readOnly
                                            className="h-12 bg-muted"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Estimated Amount <span className='text-red-500'>*</span></Label>
                                        <Input
                                            value={formData.estimatedAmount}
                                            className="h-12 bg-muted"
                                            onChange={e => handleInputChange('estimatedAmount', e.target.value)}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Offer <span className='text-red-500'>*</span></Label>
                                        <Select
                                            value={formData.offerId || ""}
                                            onValueChange={v => {
                                                handleInputChange('offerId', v);
                                            }}
                                        >
                                            <SelectTrigger className="h-12">
                                                <SelectValue placeholder="Select Offer" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {updatedOffers
                                                    .filter(offer =>
                                                        offer.category === formData.serviceType ||
                                                        offer.category === "All"
                                                    )
                                                    .map(offer => (
                                                        <SelectItem key={offer.offerId} value={offer.offerId}>
                                                            {offer.offerName}
                                                        </SelectItem>
                                                    ))}
                                                <SelectItem value="None">None</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Discount Amount <span className='text-red-500'>*</span></Label>
                                        <Input
                                            id="discountAmount"
                                            value={formData.discountAmount}
                                            onChange={(e) => handleInputChange("discountAmount", e.target.value)}
                                            readOnly// Make read-only when an offer is selected
                                            className="h-12"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Advance Amount <span className='text-red-500'>*</span></Label>
                                        <Input
                                            value={formData.advanceAmount}
                                            onChange={e => handleInputChange('advanceAmount', e.target.value)}
                                            className="h-12"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Final Amount <span className='text-red-500'>*</span></Label>
                                        <Input
                                            value={formData.upPaidAmount}
                                            readOnly
                                            className="h-12 bg-muted"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Payment Method <span className='text-red-500'>*</span></Label>
                                        <Select
                                            value={formData.paymentMethod}
                                            onValueChange={v => handleInputChange('paymentMethod', v)}
                                        >
                                            <SelectTrigger className="h-12">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {['Cash', 'UPI', 'Bank', 'Card'].map(method => (
                                                    <SelectItem key={method} value={method}>
                                                        {method}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Payment Status <span className='text-red-500'>*</span></Label>
                                        <Select
                                            value={formData.paymentStatus}
                                            onValueChange={v => handleInputChange('paymentStatus', v)}
                                        >
                                            <SelectTrigger className="h-12">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {['Pending', 'Paid', 'Partially Paid'].map(status => (
                                                    <SelectItem key={status} value={status}>
                                                        {status}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    {/* Navigation Controls */}
                    <div className="flex justify-end gap-4 mt-8">
                        {currentStep === 2 && (
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setCurrentStep(1)}
                            >
                                Previous
                            </Button>
                        )}

                        {currentStep === 1 ? (
                            <Button
                                type="button"
                                onClick={handleNextStep}
                                disabled={isLoading}
                            >
                                Next
                            </Button>
                        ) : (
                            <Button type="submit" disabled={isLoading}>
                                {id ? 'Update Booking' : 'Create Booking'}
                            </Button>
                        )}
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
    );
}