"use client"

import React, { useEffect, useMemo, useState } from 'react';
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
import { getMinDateTime, getMaxDateTime, getMinDate } from '../../lib/date-restrict';
import axios from "../../lib/http-common"
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
import LocationAutocomplete from '../localtion/LocationAutocomplete';
import PhoneInput from 'react-phone-input-2'
import {
    useServices
} from 'hooks/react-query/useServices';
import {
    useTariffs,
    usePackageTariffs,
    usePackageTariffByVehicle
} from 'hooks/react-query/useTariff';
import {
    useCreateBooking,
    useUpdateBooking,
    useFetchBookingById
} from 'hooks/react-query/useBooking';
import {
    useVehiclesAdmin
} from 'hooks/react-query/useVehicle';
import {
    useEnquiryById
} from 'hooks/react-query/useEnquiry';
import {
    useOffers
} from 'hooks/react-query/useOffers';



interface CreateBookingFormProps {
    id?: string;
    createdBy: string;
}

type ExtraCharges = {
    toll?: number;
    hill?: number;
    permitCharge?: number;
};

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
    paymentStatus: "Unpaid" | "Paid" | "Partial Paid";
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
    extraCharges: ExtraCharges;

}

export function VendorBookingForm({ id, createdBy }: CreateBookingFormProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const enquiryIdParam = searchParams.get('enquiryId')

    const { data: vehicles = [], isLoading: isVehiclesLoading } = useVehiclesAdmin();
    const { data: services = [], isLoading: isServicesLoading } = useServices();
    const { data: tariffs = [], isLoading: isTariffsLoading } = useTariffs();
    const { data: offers = [], isLoading: isOffersLoading } = useOffers();
    // const { data: packageTariffs = [], isLoading: isPackageTariffsLoading } = usePackageTariffs();
    const { data: enquiry = null } = useEnquiryById(enquiryIdParam || "")
    const { data: booking = null, isLoading: isBookingLoading } = useFetchBookingById(id || "");
    const { mutate: createBooking, isPending: isCreatePending } = useCreateBooking();
    const { mutate: updateBooking, isPending: isUpdatePending } = useUpdateBooking();


    const [currentStep, setCurrentStep] = useState(1);
    const [localLoading, setLocalLoading] = useState(false);
    const [updatedOffers, setUpdatedOffers] = useState<any[]>([]);
    const [isFormDirty, setIsFormDirty] = useState(false);
    // const [serviceId, setServiceId] = useState('');
    const [serviceType, setServiceType] = useState("")
    const [showUnsavedChangesDialog, setShowUnsavedChangesDialog] = useState(false);
    const [pendingNavigation, setPendingNavigation] = useState<() => void>(() => { });
    // const [filteredVehicles, setFilteredVehicles] = useState<any[]>([]);


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
        paymentStatus: 'Unpaid',
        toll: 0,
        hill: 0,
        permitCharge: 0,
        taxPercentage: 0,
        taxAmount: 0,
        driverBeta: 0,
        duration: "",
        pricePerKm: 0,
        extraCharges: {
            toll: 0,
            hill: 0,
            permitCharge: 0,
        },
    });

    let pastTimeToastShown = false;

    const filteredVehicles = useMemo(() => {
        return vehicles.filter(vehicle =>
            vehicle.isActive &&
            tariffs.some(
                tariff =>
                    tariff.vehicleId === vehicle.vehicleId &&
                    tariff.price > 0 &&
                    tariff.services?.name === formData.serviceType
            )
        );
    }, [vehicles, tariffs, formData.serviceType]);


    const findServiceId = (serviceType: string) => {
        const foundService: any = services.find(service => service.name === serviceType);
        return foundService ? foundService.serviceId as string : "";
    }

    const findServiceType = (serviceId: string) => {
        const gotService = services.find(service => service.serviceId === serviceId);
        return gotService?.name || "";
    };

    // useEffect to update formData when `enquiry` arrives
    useEffect(() => {
        if (enquiryIdParam && enquiry) {
            const updatedEnquiryData = {
                name: enquiry.name || '',
                email: enquiry.email || '',
                phone: enquiry.phone || '',
                pickup: enquiry.pickup || '',
                drop: enquiry.drop || '',
                vehicleId: enquiry.vehicleId || '',
                packageId: enquiry.packageId,
                enquiryId: enquiry.enquiryId || null,
                pickupDateTime: new Date(enquiry.pickupDateTime).toISOString().slice(0, 16),
                dropDate: enquiry.dropDate ? new Date(enquiry.dropDate).toISOString().slice(0, 10) : null,
                serviceType: findServiceType(enquiry.serviceId) as
                    | "One way"
                    | "Round trip"
                    | "Airport Pickup"
                    | "Airport Drop"
                    | "Day Packages"
                    | "Hourly Packages",
                type: enquiry.type,
                createdBy: enquiry.createdBy as "Admin" | "Vendor",
            };

            setFormData(prev => ({ ...prev, ...updatedEnquiryData }));
        }
    }, [enquiryIdParam, enquiry]);

    useEffect(() => {
        if (id && booking) {
            const updatedBookingData = {
                ...booking,
                pickupDateTime:
                    typeof booking.pickupDate === "string"
                        ? booking.pickupDate.slice(0, 16)
                        : new Date().toISOString().slice(0, 16),
                dropDate: booking.dropDate
                    ? typeof booking.dropDate === "string"
                        ? booking.dropDate.slice(0, 10)
                        : new Date(booking.dropDate).toISOString().slice(0, 10)
                    : null,
                vehicleId: booking.vehicleId || '',
                packageId: booking.packageId,
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
                serviceType: booking.serviceType as
                    | "One way"
                    | "Round trip"
                    | "Airport Pickup"
                    | "Airport Drop"
                    | "Day Packages"
                    | "Hourly Packages",
                extraCharges: booking.extraCharges || [],

            };
            setFormData(updatedBookingData);
            setCurrentStep(2);
        }
    }, [id, booking]);

    useEffect(() => {
        if (offers.length > 0) {
            setUpdatedOffers(offers.filter((offer: any) => offer.status === true));
        }
    }, [offers]);

    // Add this useEffect to fetch package tariffs when service type and vehicle are selected
    const {
        data: pkgTariffs = [],
        isLoading: isPkgTariffsLoading
    } = usePackageTariffByVehicle(formData.vehicleId, findServiceId(formData.serviceType) as string, 'hourly');

    useEffect(() => {
        const initialData = { ...formData }; // same as before
        const isDirty = JSON.stringify(initialData) !== JSON.stringify(formData);

        setIsFormDirty(prev => {
            if (prev !== isDirty) return isDirty;
            return prev;
        });
    }, [formData]);

    const fetchDistance = async (pickup: string, drop: string, tariff: any) => {
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
                    duration: duration,
                    pricePerKm: tariff.price,
                    estimatedAmount: distance * tariff.price,
                    finalAmount: distance * tariff.price
                }));

                setLocalLoading(false);
            } catch (error) {
                toast.error('Failed to calculate distance');
                setLocalLoading(false);
            }
        }
    };

    const handleInputChange = (name: keyof Booking | `extraCharges.${keyof ExtraCharges}`, value: any) => {
        setFormData((prev) => {


            let newValue = value;

            // if (name.startsWith("extraCharges.")) {
            //     const field = name.split(".")[1] as keyof ExtraCharges;
            //     return {
            //         ...prev,
            //         extraCharges: {
            //             ...prev.extraCharges,
            //             [field]: Number(value), 
            //         },
            //     };
            // }       

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

            if (["estimatedAmount", "upPaidAmount", "discountAmount", "advanceAmount", "driverBeta"].includes(name)) {
                newValue = value.replace(/[^0-9.]/g, "");
            }

            const newState = {
                ...prev,
                [name]: newValue,
            };


            if (name.startsWith("extraCharges.")) {
                const field = name.split(".")[1] as keyof ExtraCharges;

                const updatedExtraCharges = {
                    ...prev.extraCharges,
                    [field]: Number(value),
                };

                const totalExtraCharge = Object.values(updatedExtraCharges).reduce(
                    (sum, charge) => sum + (Number(charge) || 0),
                    0
                );

                newState.extraCharges = updatedExtraCharges;
                newState.finalAmount = (prev.estimatedAmount || 0) + totalExtraCharge;

                // Also recalculate upPaidAmount
                newState.upPaidAmount =
                    (newState.finalAmount + Number(prev.driverBeta || 0)) -
                    (Number(prev.discountAmount || 0) + Number(prev.advanceAmount || 0));

                return newState;
            }

            if (name === "offerId") {
                if (value === "None") {
                    newState.offerId = null;
                    newState.discountAmount = 0;
                } else {
                    const offer = offers.find((offer: any) => offer.offerId === value);
                    if (offer?.type === "Percentage") {
                        newState.discountAmount = Math.trunc((Number(newState.estimatedAmount) * offer.value) / 100);
                    } else if (offer?.type === "Flat") {
                        newState.discountAmount = offer.value || 0;
                    }
                }
            }

            if (name === "pricePerKm" || name === "distance") {
                newState.estimatedAmount = newState.distance * (newState.pricePerKm || 0);
                newState.finalAmount = newState.estimatedAmount;
            }

            if (name === "advanceAmount") {
                newState.paymentStatus = newState.advanceAmount > 0 ? "Partial Paid" : "Unpaid";
            }

            // Ensure `finalAmount` is always correctly calculated
            newState.upPaidAmount =
                (Number(newState.finalAmount || 0) + Number(newState.driverBeta || 0)) -
                (Number(newState.discountAmount || 0) + Number(newState.advanceAmount || 0));

            // console.log('Form data updated:', { name, value, newState });
            return newState;
        });
    };


    const handleNextStep = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();

        const serviceId = findServiceId(formData.serviceType);

        // Validate required fields
        if (
            !formData.serviceType ||
            !formData.name ||
            !formData.phone ||
            !formData.pickup ||
            !formData.vehicleId ||
            !formData.pickupDateTime
        ) {
            toast.error("Please fill all required fields", {
                style: {
                    backgroundColor: "#FF0000",
                    color: "#fff",
                },
            }
            );
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

        const tariff = tariffs.find((tariff) => tariff.vehicleId === formData.vehicleId && tariff.serviceId === serviceId);

        // Only calculate distance for non-package bookings
        if (formData.serviceType !== 'Day Packages' && formData.serviceType !== 'Hourly Packages') {
            await fetchDistance(formData.pickup, formData.drop, tariff);
        }
        setCurrentStep(2);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (
            !formData.driverBeta
        ) {
            toast.error("Please fill all required fields", {
                style: {
                    backgroundColor: "#FF0000",
                    color: "#fff",
                },
            }

            );
            return;
        }
        try {
            if (id) {
                console.log('Updating booking with ID:', id, 'and data:', formData);

                updateBooking({ id, data: formData }, {
                    onSuccess: (data: any) => {
                        toast.success(data?.message || 'Booking updated successfully', {
                            style: {
                                backgroundColor: "#009F7F",
                                color: "#fff",
                            },
                        });
                        setTimeout(() => router.push(`/vendor/bookings`), 500);
                    },
                    onError: (error: any) => {
                        toast.error(error?.response?.data?.message || 'Failed to update booking', {
                            style: {
                                backgroundColor: "#FF0000",
                                color: "#fff",
                            },
                        });
                    }
                });
            } else {
                createBooking(formData, {
                    onSuccess: (data: any) => {
                        toast.success(data?.message || 'Booking created successfully', {
                            style: {
                                backgroundColor: "#009F7F",
                                color: "#fff",
                            },
                        });
                        setTimeout(() => router.push(`/vendor/bookings`), 500);
                    },
                    onError: (error: any) => {
                        toast.error(error?.response?.data?.message || 'Failed to create booking', {
                            style: {
                                backgroundColor: "#FF0000",
                                color: "#fff",
                            },
                        });
                    }
                });
            }
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Failed to save booking", {
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

    // Modify handleClose function
    const handleClose = () => {
        if (isFormDirty) {
            setShowUnsavedChangesDialog(true);
            setPendingNavigation(() => () => router.push(`/vendor/bookings`));
        } else {
            router.push(`/vendor/bookings`);
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

        return "";
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

    const isAnyLoading = localLoading || isTariffsLoading || isVehiclesLoading;
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
                    {id ? 'Edit Booking' : enquiryIdParam ? ` Update Enquiry → Booking` : 'Create New Booking'}
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
                                {/* {(formData.serviceType === 'Day Packages' || formData.serviceType === 'Hourly Packages') && formData.vehicleId && (
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
                                                            {pkg.dayOrHour} {pkg.dayOrHour > 1 ? "Hours" : "Hour"} - {pkg.distanceLimit} Km - ₹ {pkg.price}
                                                        </SelectItem>
                                                    ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )} */}

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
                                            onChange={e => handleInputChange('distance', e.target.value)}
                                            className="h-12 bg-muted"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Price Per KM <span className='text-red-500'>*</span></Label>
                                        <Input
                                            value={formData.pricePerKm || ''}
                                            className="h-12 bg-muted"
                                            onChange={e => handleInputChange('pricePerKm', e.target.value)}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Estimated Amount <span className='text-red-500'>*</span></Label>
                                        <Input
                                            value={formData.estimatedAmount}
                                            className="h-12 bg-muted"
                                            readOnly
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Driver Beta <span className='text-red-500'>*</span></Label>
                                        <Input
                                            value={formData.driverBeta || ''}
                                            className="h-12 bg-muted"
                                            onChange={e => handleInputChange('driverBeta', e.target.value)}
                                        />
                                    </div>

                                    {/* <div className="space-y-2">
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
                                    </div> */}

                                    {/* <div className="space-y-2">
                                        <Label>Discount Amount <span className='text-red-500'>*</span></Label>
                                        <Input
                                            id="discountAmount"
                                            value={formData.discountAmount}
                                            onChange={(e) => handleInputChange("discountAmount", e.target.value)}
                                            readOnly// Make read-only when an offer is selected
                                            className="h-12"
                                        />
                                    </div> */}

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
                                                <SelectValue placeholder="Select Payment Method" />
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
                                                {['Unpaid', 'Paid', 'Partial Paid'].map(status => (
                                                    <SelectItem key={status} value={status}>
                                                        {status}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Toll <span className='text-xs text-gray-500 ml-1'>(Optional)</span></Label>
                                        <Input
                                            value={formData.extraCharges.toll || []}
                                            className="h-12 bg-muted"
                                            onChange={e => handleInputChange('extraCharges.toll', e.target.value)}

                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Hill <span className='text-xs text-gray-500 ml-1'>(Optional)</span></Label>
                                        <Input
                                            value={formData.extraCharges.hill || ''}
                                            className="h-12 bg-muted"
                                            onChange={e => handleInputChange('extraCharges.hill', e.target.value)}

                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Permit <span className='text-xs text-gray-500 ml-1'>(Optional)</span></Label>
                                        <Input
                                            value={formData.extraCharges.permitCharge || ''}
                                            className="h-12 bg-muted"
                                            onChange={e => handleInputChange('extraCharges.permitCharge', e.target.value)}

                                        />
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
                                disabled={isAnyLoading}
                            >
                                Next
                            </Button>
                        ) : (
                            <Button type="submit" disabled={isCreatePending || isUpdatePending}>
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
