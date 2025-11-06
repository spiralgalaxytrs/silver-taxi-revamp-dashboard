"use client"

import React, { useEffect, useMemo, useState } from 'react';
import { Button } from '../ui/button';
import { useSearchParams } from 'next/navigation';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from "components/ui/card";
import { X, Calendar, MapPin, Calculator, Plus, Loader2, Trash, Info } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { toast } from 'sonner';
import axios from "../../lib/http-common"
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogFooter,
    AlertDialogCancel
} from 'components/ui/alert-dialog'
import LocationAutocomplete from '../location/LocationAutocomplete';
import PhoneInput from 'react-phone-input-2'
import {
    useServices
} from 'hooks/react-query/useServices';
import {
    useTariffs
} from 'hooks/react-query/useTariff';
import {
    useCreateBooking,
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


type Booking = {
    bookingId?: string;
    name: string;
    phone: string;
    email: string;
    pickup: string;
    drop: string;
    stops: any;
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
    pricePerKm?: number | null;
    breakFareDetails?: Record<string, any>;
    vehicleType?: string;
    driverBeta?: number;
}


export function NewBookingForm({ id, createdBy }: CreateBookingFormProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const enquiryIdParam = searchParams.get('enquiryId')


    const { data: vehicles = [], isLoading: isVehiclesLoading } = useVehiclesAdmin();
    const { data: services = [], isLoading: isServicesLoading } = useServices();
    const { data: tariffs = [], isLoading: isTariffsLoading } = useTariffs();
    const { data: offers = [], isLoading: isOffersLoading } = useOffers();
    const { data: enquiry = null } = useEnquiryById(enquiryIdParam || "")
    const { data: booking = null, isLoading: isBookingLoading } = useFetchBookingById(id || "");
    const { mutate: createBooking, isPending: isCreatePending } = useCreateBooking();


    const [localLoading, setLocalLoading] = useState(false);
    const [updatedOffers, setUpdatedOffers] = useState<any[]>([]);
    const [showPreviewDialog, setShowPreviewDialog] = useState(false);


    const [formData, setFormData] = useState<Booking>({
        name: '',
        email: '',
        phone: '',
        pickup: '',
        drop: '',
        stops: [],
        pickupDateTime: '',
        dropDate: '',
        serviceType: 'One way',
        vehicleId: '',
        distance: 0,
        enquiryId: null,
        offerId: null,
        price: 0,
        extraPrice: 0,
        distanceLimit: 0,
        finalAmount: 0,
        estimatedAmount: 0,
        discountAmount: 0,
        upPaidAmount: 0, // Will be updated when finalAmount changes
        advanceAmount: 0,
        type: 'Manual',
        paymentMethod: 'Cash',
        status: 'Not-Started',
        createdBy: createdBy as "Admin" | "Vendor",
        paymentStatus: 'Unpaid',
        pricePerKm: 0,
        breakFareDetails: {},
        vehicleType: "",
        driverBeta: 0
    });


    // let pastTimeToastShown = false;
    const MAX_STOPS = 9999;
    let pastTimeToastShown = false;


    const handleAddStop = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        if (formData.stops.length < MAX_STOPS) {
            setFormData((prev) => ({
                ...prev,
                stops: [...prev.stops, ""]
            }));
        }
    };


    const handleStopChange = (index: number, value: string) => {
        setFormData((prev) => {
            const updatedStops = [...prev.stops];
            updatedStops[index] = value;
            return { ...prev, stops: updatedStops };
        });
    };


    const handleRemoveStop = (index: number, e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        setFormData((prev) => {
            const updatedStops = prev.stops.filter((_: string, i: number) => i !== index);
            return { ...prev, stops: updatedStops };
        });
    };


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
                distance: booking.distance || 0,
                finalAmount: booking.finalAmount || 0,
                estimatedAmount: booking.estimatedAmount || 0,
                discountAmount: booking.discountAmount || 0,
                advanceAmount: booking.advanceAmount || 0,
                upPaidAmount: booking.upPaidAmount || 0,
                price: booking.price || 0,
                extraPrice: booking.extraPrice || 0,
                distanceLimit: booking.distanceLimit || 0,
                offerId: booking.offerId,
                type: booking.type,
                createdBy: booking.createdBy as "Admin" | "Vendor",
                paymentMethod: booking.paymentMethod,
                status: booking.status,
                paymentStatus: booking.paymentStatus,
                pricePerKm: booking.pricePerKm || 0,
                breakFareDetails: booking.breakFareDetails || {},
                vehicleType: booking.vehicleType || "",
                driverBeta: booking.driverBeta || 0
            };


            setFormData(prev => ({ ...prev, ...updatedBookingData }));
        }
    }, [id, booking]);


    useEffect(() => {
        if (offers.length > 0) {
            setUpdatedOffers(offers.filter((offer: any) => offer.status === true));
        }
    }, [offers]);


    // useEffect to recalculate payment status when final amount changes
    useEffect(() => {
        if (formData.finalAmount > 0) {
            const advanceAmount = Number(formData.advanceAmount || 0);
            const finalAmount = Number(formData.finalAmount || 0);
            
            let newPaymentStatus = formData.paymentStatus;
            let newUpPaidAmount = formData.upPaidAmount;
            
            if (advanceAmount <= 0) {
                newPaymentStatus = "Unpaid";
                newUpPaidAmount = finalAmount;
            } else if (advanceAmount >= finalAmount) {
                newPaymentStatus = "Paid";
                newUpPaidAmount = 0;
            } else {
                newPaymentStatus = "Partial Paid";
                newUpPaidAmount = Number((finalAmount - advanceAmount).toFixed(2));
            }
            
            // Only update if values actually changed
            if (newPaymentStatus !== formData.paymentStatus || newUpPaidAmount !== formData.upPaidAmount) {
                setFormData(prev => ({

                    ...prev,

                    paymentStatus: newPaymentStatus,
                    upPaidAmount: newUpPaidAmount
                }));
            }
        }
    }, [formData.finalAmount, formData.advanceAmount]);


    const handleInputChange = (name: keyof Booking, value: any) => {

        setFormData((prev) => {

            let newValue = value;



            // Past time validation for pickupDateTime

            if (name === "pickupDateTime") {

                const now = new Date();

                const selectedDate = new Date(value);

                const minTime = now.toISOString().slice(11, 16);

                const selectedTime = value.slice(11, 16);

                if (selectedDate.toDateString() === now.toDateString() && selectedTime < minTime) {

                    newValue = minTime;

                    toast.error("You cannot select a past time!");
                }

            }



            // Numeric sanitization for numeric fields

            if (["distance", "estimatedAmount", "upPaidAmount", "discountAmount", "advanceAmount", "pricePerKm"].includes(name)) {

                newValue = String(value).replace(/[^0-9.]/g, "");

            }



            let newState = { ...prev, [name]: newValue };



            // Auto-calculate amounts when relevant fields change

            if (["distance", "pricePerKm", "discountAmount", "advanceAmount"].includes(name)) {

                newState = calculateAmounts(newState);

            }



            // Handle advance amount change

            if (name === "advanceAmount") {

                const advanceAmount = Number(newValue);
                const finalAmount = Number(newState.finalAmount || 0);
                
                // Calculate remaining amount correctly
                if (advanceAmount <= 0) {
                    newState.paymentStatus = "Unpaid";
                    newState.upPaidAmount = finalAmount;
                } else if (advanceAmount >= finalAmount) {
                    newState.paymentStatus = "Paid";
                    newState.upPaidAmount = 0;
                } else {
                    newState.paymentStatus = "Partial Paid";
                    newState.upPaidAmount = Number((finalAmount - advanceAmount).toFixed(2));
                }
                
                // Ensure upPaidAmount is not overwritten by calculateAmounts
                newState = calculateAmounts(newState);
                
                // Re-apply the correct payment status and remaining amount
                if (advanceAmount <= 0) {
                    newState.paymentStatus = "Unpaid";
                    newState.upPaidAmount = finalAmount;
                } else if (advanceAmount >= finalAmount) {
                    newState.paymentStatus = "Paid";
                    newState.upPaidAmount = 0;
                } else {
                    newState.paymentStatus = "Partial Paid";
                    newState.upPaidAmount = Number((finalAmount - advanceAmount).toFixed(2));
                }
            }


            return newState;

        });

    };



    // Helper function to calculate all amounts
    const calculateAmounts = (state: any) => {
        const pricePerKm = Number(state.pricePerKm || 0);
        const distance = Number(state.distance || 0);
        const discountAmount = Number(state.discountAmount || 0);
        const advanceAmount = Number(state.advanceAmount || 0);

        let basePrice = 0;
        let totalDistance = distance;

        if (state.serviceType === "Round trip") {
            if (state.dropDate) {
                const pickupDate = new Date(state.pickupDateTime || new Date().toISOString());
                const dropDate = new Date(state.dropDate);
                const timeDiff = dropDate.getTime() - pickupDate.getTime();
                const tripDays = timeDiff > 0 ? Math.ceil(timeDiff / (1000 * 3600 * 24)) : 1;
                
                // For round trip, multiply distance by trip days
                totalDistance = distance * tripDays;
            } else {
                totalDistance = distance * 2; // Simple round trip
            }
        }

        basePrice = totalDistance * pricePerKm;
        
        state.estimatedAmount = Number(basePrice.toFixed(2));
        const driverBeta = Number(state.driverBeta || 0);
        state.finalAmount = Number((basePrice + driverBeta  - discountAmount).toFixed(2));
        
        // Only calculate unpaid amount if it hasn't been set by payment logic
        if (state.upPaidAmount === undefined || state.upPaidAmount === null) {
            if (advanceAmount <= 0) {
                state.upPaidAmount = state.finalAmount;
            } else if (advanceAmount >= state.finalAmount) {
                state.upPaidAmount = 0;
            } else {
                state.upPaidAmount = Number((state.finalAmount - advanceAmount).toFixed(2));
            }
        }

        return state;
    };



    const handleLocationSelect = (field: string) => (address: string, lat: number, lng: number) => {

        handleInputChange(field as keyof Booking, address);

    };



    const handleLocationChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {

        handleInputChange(field as keyof Booking, e.target.value);

    };


    const fetchDistance = async (pickup: string, drop: string) => {
        if (pickup && drop) {
            setLocalLoading(true);
            try {
                const stopsList = (formData.stops || []).map((s: any) => s.location || s);
                let allLocations = [pickup, ...stopsList, drop];

                if (formData.serviceType === "Round trip" && stopsList.length > 0) {
                    allLocations.push(pickup);
                }

                const locationPairs = allLocations.slice(0, -1).map((loc, index) => ({
                    origin: loc,
                    destination: allLocations[index + 1]
                }));

                const results = await Promise.all(
                    locationPairs.map(pair =>
                        axios.get(`/global/distance`, {
                            params: { origin: pair.origin, destination: pair.destination }
                        })
                    )
                );

                const { totalDistance, totalDuration } = results.reduce(
                    (acc, res) => {
                        const { distance, duration } = res.data.data;
                        acc.totalDistance += distance;
                        acc.totalDuration += duration;
                        return acc;
                    },
                    { totalDistance: 0, totalDuration: 0 }
                );

                setFormData(prev => ({
                    ...prev,
                    distance: totalDistance
                }));

                if (totalDistance > 0) {
                    await handleFairCalculation(
                        formData.serviceType,
                        formData.vehicleId,
                        totalDistance,
                        formData.pickupDateTime,
                        formData.dropDate || ''
                    );
                }

                setLocalLoading(false);
            } catch (error) {
                toast.error('Failed to calculate distance and fare. Please try again.');
                setLocalLoading(false);
            }
        }
    };
    const handleFairCalculation = async (serviceType: string, vehicleId: string, distance: number, pickupDateTime: string, dropDate: string) => {
        setLocalLoading(true);
        try {
            const payload: any = {
                serviceType,
                vehicleId,
                distance,
                pickupDateTime,
                dropDate,
                stops: formData.stops,
                createdBy: formData.createdBy
            };

            const response = await axios.post(`/v1/bookings/fair-calculation`, payload);
            let { basePrice, pricePerKm, finalPrice, breakFareDetails, totalDistance, driverBeta } = response.data.data;
            
            // Calculate proper base fare and final amount on frontend
            let calculatedBaseFare = (totalDistance || distance) * (pricePerKm || 0);
            
            // Handle round trip calculations
            if (serviceType === "Round trip" && dropDate) {
                const pickupDate = new Date(pickupDateTime);
                const endDate = new Date(dropDate);
                const timeDiff = endDate.getTime() - pickupDate.getTime();
                const tripDays = timeDiff > 0 ? Math.ceil(timeDiff / (1000 * 3600 * 24)) : 1;
                
                // For round trip with multiple days, adjust distance and base fare
                if (tripDays > 1) {
                    calculatedBaseFare = calculatedBaseFare * tripDays;
                }
            }
            
            const driverBetaFromAPI = driverBeta || 0; // Use API driver beta value
            const calculatedFinalAmount = calculatedBaseFare + driverBetaFromAPI ;
            
            setFormData(prev => ({
                ...prev,
                estimatedAmount: calculatedBaseFare,
                finalAmount: calculatedFinalAmount, // Use calculated amount, not API finalPrice
                pricePerKm: pricePerKm || 0,
                price: calculatedBaseFare,
                extraPrice: 0,
                upPaidAmount: calculatedFinalAmount,
                breakFareDetails: breakFareDetails || {},
                distance: totalDistance || distance,
                driverBeta: driverBetaFromAPI // Use API driver beta, not hardcoded value
            }));
            setLocalLoading(false);
        } catch (err) {
            toast.error('Failed to calculate fare. Please try again.');
            setLocalLoading(false);
        }
    };


    const handleCalculateFare = async () => {

        if (!formData.pickup || !formData.drop || !formData.vehicleId) {

            toast.error("Please fill pickup location, drop location, and select vehicle");

            return;

        }



        const serviceId = findServiceId(formData.serviceType);



        const selectedTariff = tariffs.filter((tariff) => tariff.vehicleId === formData.vehicleId && tariff.serviceId === serviceId);



        if (!selectedTariff) {

            toast.error("Selected Vehicle Tariff Not Found");

            return;

        }



            await fetchDistance(formData.pickup, formData.drop);

        
        // Ensure we have some default values for display
        // if (formData.distance === 0) {
        //     setFormData(prev => ({
        //         ...prev,
        //         // distance, // Default distance
        //         // pricePerKm, // Default price per km
        //         // estimatedAmount: 500, // Default base fare
        //         // finalAmount: 500, // Default final amount
        //         // upPaidAmount: 500 // Default unpaid amount
        //     }));
        // }
        
        setShowPreviewDialog(true);
    };

    const handleConfirmBooking = async () => {
        try {
                createBooking(formData, {

                    onSuccess: (data: any) => {

                        toast.success(data?.message || 'Booking created successfully', {

                            style: {

                                backgroundColor: "#009F7F",

                                color: "#fff",

                            },

                        });

                    setShowPreviewDialog(false);
                        setTimeout(() => router.push(`/${createdBy === "Admin" ? "admin" : "vendor"}/bookings`), 100);

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

        } catch (error) {

            toast.error('An error occurred while creating the booking');
        }

    };



    const handleClose = () => {

            router.push("/admin/bookings");

    };

    const isLoading = isVehiclesLoading || isServicesLoading || isTariffsLoading || isOffersLoading || isBookingLoading;

    if (isLoading) {
        return (

            <div className="flex items-center justify-center h-screen bg-gray-50">

                <Loader2 className="w-12 h-12 animate-spin text-primary" />

            </div>

        );

    }



    return (

        <div className="min-h-screen bg-gray-50">

            {/* Header */}

            <div className="bg-white border-b border-gray-200 px-6 py-4">

                <div className="flex items-center justify-between">

                    <h1 className="text-2xl font-bold text-gray-900">Create New Booking</h1>

                    <Button variant="ghost" size="sm" onClick={handleClose}>

                        <X className="h-5 w-5" />

                    </Button>

                </div>

            </div>



            <form className="max-w-4xl mx-auto p-6 space-y-6">
                {/* Customer Information Section */}

                <Card>

                    <CardContent className="p-6">

                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Customer Information</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                            <div>

                                <Label htmlFor="name" className="text-sm font-medium">Full Name*</Label>

                                <Input

                                    id="name"

                                    value={formData.name}

                                    onChange={(e) => handleInputChange('name', e.target.value)}

                                    placeholder="Enter full name"

                                    className="mt-1"

                                    required

                                />

                            </div>

                            <div>
                                <Label htmlFor="phone" className="text-sm font-medium">Contact No*</Label>
                                <PhoneInput
                                    country={'in'}
                                    value={formData.phone}
                                    onChange={(phone) => handleInputChange('phone', phone)}
                                    inputClass="mt-1 w-full h-10 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                                    containerClass="mt-1"
                                    buttonClass="h-10 px-3 border border-gray-300 rounded-l-md bg-gray-50 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                                    dropdownClass="z-50"
                                    inputProps={{
                                        required: true,
                                        placeholder: "Enter contact number"
                                    }}
                                />
                            </div>

                        </div>

                    </CardContent>

                </Card>



                {/* Trip Information Section */}

                <Card>

                    <CardContent className="p-6">

                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Trip Information</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                            <div>

                                <Label htmlFor="serviceType" className="text-sm font-medium">Service Type*</Label>

                                <Select value={formData.serviceType} onValueChange={(value) => handleInputChange('serviceType', value)}>

                                    <SelectTrigger className="mt-1">

                                        <SelectValue placeholder="Select service type" />

                                    </SelectTrigger>

                                    <SelectContent>

                                        <SelectItem value="One way">One way</SelectItem>

                                        <SelectItem value="Round trip">Round Trip</SelectItem>

                                        {/* <SelectItem value="Airport Pickup">Airport Pickup</SelectItem>
                                        <SelectItem value="Airport Drop">Airport Drop</SelectItem>

                                        <SelectItem value="Day Packages">Day Packages</SelectItem> */}
                                        <SelectItem value="Hourly Packages">Hourly Packages</SelectItem>

                                    </SelectContent>

                                </Select>

                            </div>



                            <div>

                                <Label htmlFor="vehicle" className="text-sm font-medium">Vehicle*</Label>

                                <Select value={formData.vehicleId} onValueChange={(value) => {

                                    const selectedVehicle = vehicles.find(v => v.vehicleId === value);

                                    handleInputChange('vehicleId', value);

                                    if (selectedVehicle) {

                                        handleInputChange('vehicleType', selectedVehicle.vehicleType || '');

                                    }

                                }}>

                                    <SelectTrigger className="mt-1">

                                        <SelectValue placeholder="Select vehicle" />

                                    </SelectTrigger>

                                    <SelectContent>

                                        {filteredVehicles.map((vehicle) => (

                                            <SelectItem key={vehicle.vehicleId || ''} value={vehicle.vehicleId || ''}>

                                                {vehicle.type || 'N/A'}
                                            </SelectItem>

                                        ))}

                                    </SelectContent>

                                </Select>

                            </div>


                            <div>

                                <Label htmlFor="pickupLocation" className="text-sm font-medium">Pickup Location*</Label>

                                <div className="relative mt-1">

                                    <LocationAutocomplete

                                        onSelect={handleLocationSelect('pickup')}

                                        onChange={handleLocationChange('pickup')}

                                        getValue={formData.pickup || ''}

                                    />

                                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />

                                </div>

                            </div>


                            <div>

                                <Label htmlFor="dropLocation" className="text-sm font-medium">Drop Location*</Label>

                                <div className="relative mt-1">

                                    <LocationAutocomplete

                                        onSelect={handleLocationSelect('drop')}

                                        onChange={handleLocationChange('drop')}

                                        getValue={formData.drop || ''}

                                    />

                                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />

                                </div>

                            </div>


                            <div>

                                <Label htmlFor="tripStartDate" className="text-sm font-medium">Trip Start Date*</Label>
                                <div className="relative mt-1">
                                    <Input
                                        id="tripStartDate"
                                        type="datetime-local"
                                        value={formData.pickupDateTime}
                                        onChange={(e) => handleInputChange('pickupDateTime', e.target.value)}
                                        className="pl-10"
                                        required
                                    />
                                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            </div>

                            </div>

                            {formData.serviceType === 'Round trip' && (
                                <div>
                                    <Label htmlFor="tripEndDate" className="text-sm font-medium">Trip End Date*</Label>
                                    <div className="relative mt-1">
                                        <Input
                                            id="tripEndDate"
                                            type="date"
                                            value={formData.dropDate || ''}
                                            onChange={(e) => handleInputChange('dropDate', e.target.value)}
                                            min={formData.pickupDateTime ? formData.pickupDateTime.split('T')[0] : undefined}
                                            className="pl-10"
                                            required
                                        />
                                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    </div>
                                </div>
                            )}





                            {/* Remove empty advance amount div */}
                        </div>



                        {/* Stops Section */}

                        <div className="mt-4">

                            <Label className="text-sm font-medium">Stops</Label>

                            <div className="space-y-2 mt-1">

                                {formData.stops.map((stop: string, index: number) => (

                                    <div key={index} className="flex gap-2">

                                        <div className="relative flex-1">

                                            <LocationAutocomplete

                                                onSelect={(address: string) => handleStopChange(index, address)}

                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleStopChange(index, e.target.value)}

                                                getValue={stop}

                                            />

                                            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />

                                        </div>

                                        <Button

                                            type="button"

                                            variant="outline"

                                            size="sm"

                                            onClick={(e) => handleRemoveStop(index, e)}

                                            className="px-3"

                                        >

                                            <Trash className="h-4 w-4" />

                                        </Button>

                                    </div>

                                ))}

                                <Button

                                    type="button"

                                    variant="outline"

                                    onClick={handleAddStop}

                                    className="w-full"

                                >

                                    <Plus className="h-4 w-4 mr-2" />

                                    Add Stop

                                </Button>

                            </div>

                        </div>



                        {/* Calculate Fare Button */}

                        <div className="mt-4">
                            <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                <p className="text-sm text-blue-700">
                                    <Info className="inline h-4 w-4 mr-2" />
                                    Payment details (Payment Method, Payment Status, and Advance Amount) will be configured in the next step after calculating the fare.
                                </p>
                            </div>
                            <div className="flex justify-end">
                            <Button

                                type="button"

                                onClick={handleCalculateFare}

                                disabled={localLoading || !formData.pickup || !formData.drop || !formData.vehicleId}

                                className="bg-teal-600 hover:bg-teal-700 text-white"

                            >

                                {localLoading ? (

                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />

                                ) : (

                                    <Calculator className="h-4 w-4 mr-2" />

                                )}

                                Calculate Fare

                            </Button>

                            </div>

                        </div>

                    </CardContent>

                </Card>





            </form>



            {/* Booking Preview Dialog */}

            <AlertDialog open={showPreviewDialog} onOpenChange={setShowPreviewDialog}>

                <AlertDialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">

                    <AlertDialogHeader>

                        <AlertDialogTitle className="text-xl font-bold">Booking Details & Confirmation</AlertDialogTitle>
                    </AlertDialogHeader>

                    <div className="space-y-6">

                        {/* Customer Information */}

                        <div className="bg-gray-50 p-4 rounded-lg">

                            <h3 className="text-lg font-semibold mb-3 text-gray-800">Customer Information</h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                                <div>

                                    <Label className="text-sm font-medium text-gray-600">Full Name</Label>

                                    <p className="text-gray-900">{formData.name}</p>

                                </div>

                                <div>

                                    <Label className="text-sm font-medium text-gray-600">Contact Number</Label>

                                    <p className="text-gray-900">{formData.phone}</p>

                                </div>

                            </div>

                        </div>



                        {/* Trip Information */}

                        <div className="bg-gray-50 p-4 rounded-lg">

                            <h3 className="text-lg font-semibold mb-3 text-gray-800">Trip Information</h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                                <div>

                                    <Label className="text-sm font-medium text-gray-600">Service Type</Label>

                                    <p className="text-gray-900">{formData.serviceType}</p>

                                </div>

                                <div>

                                    <Label className="text-sm font-medium text-gray-600">Vehicle Type</Label>
                                    <p className="text-gray-900">{formData.vehicleType || 'N/A'}</p>
                                </div>

                                <div>

                                    <Label className="text-sm font-medium text-gray-600">Pickup Date & Time</Label>

                                    <p className="text-gray-900">{formData.pickupDateTime ? new Date(formData.pickupDateTime).toLocaleString() : 'Not set'}</p>

                                </div>

                                <div>

                                    <Label className="text-sm font-medium text-gray-600">Drop Date</Label>

                                    <p className="text-gray-900">{formData.dropDate ? new Date(formData.dropDate).toLocaleDateString() : 'Not set'}</p>

                                </div>

                                <div className="md:col-span-2">

                                    <Label className="text-sm font-medium text-gray-600">Pickup Location</Label>

                                    <p className="text-gray-900">{formData.pickup}</p>

                                </div>

                                <div className="md:col-span-2">

                                    <Label className="text-sm font-medium text-gray-600">Drop Location</Label>

                                    <p className="text-gray-900">{formData.drop}</p>

                                </div>

                                {formData.stops.length > 0 && (

                                    <div className="md:col-span-2">

                                        <Label className="text-sm font-medium text-gray-600">Stops</Label>

                                        <div className="space-y-1">

                                            {formData.stops.map((stop: any, index: number) => (

                                                <p key={index} className="text-gray-900">• {stop}</p>

                                            ))}

                                        </div>

                                    </div>

                                )}

                            </div>

                        </div>



                        {/* Enhanced Fare Breakdown */}
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <h3 className="text-lg font-semibold mb-3 text-gray-800">Detailed Fare Breakdown</h3>
                            <div className="space-y-3">
                                {/* Distance and Rate Details */}
                                <div className="bg-white p-3 rounded border">
                                    <h4 className="text-sm font-medium text-gray-700 mb-2">Distance & Rate Calculation</h4>
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-gray-600">Total Distance</span>
                                            <span className="font-medium">{formData.distance} km</span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-gray-600">Price per km</span>
                                            <span className="font-medium">₹{formData.pricePerKm}</span>
                                        </div>
                                        {/* <div className="flex justify-between items-center text-sm">
                                            <span className="text-gray-600">Service Type Multiplier</span>
                                            <span className="font-medium">
                                                {formData.serviceType === 'Round trip' ? '2x' : '1x'}
                                            </span>
                                        </div> */}
                                    </div>
                                </div>

                                {/* Base Fare Calculation */}
                                <div className="bg-white p-3 rounded border">
                                    <h4 className="text-sm font-medium text-gray-700 mb-2">Base Fare Calculation</h4>
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-gray-600">Distance × Rate</span>
                                            <span className="font-medium">
                                                {formData.distance} km × ₹{formData.pricePerKm}
                                            </span>
                                        </div>
                                        {/* <div className="flex justify-between items-center text-sm">
                                            <span className="text-gray-600">Service Type Adjustment</span>
                                            <span className="font-medium">
                                                {formData.serviceType === 'Round trip' ? 
                                                    `× 2 (Round Trip)` : 
                                                    `× 1 (One Way)`
                                                }
                                            </span>
                                        </div> */}
                                        <div className="border-t pt-2">
                                            <div className="flex justify-between items-center font-medium">
                                                <span className="text-gray-700">Base Fare</span>
                                                <span className="text-blue-600">₹{formData.estimatedAmount}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Additional Charges */}
                                <div className="bg-white p-3 rounded border">
                                    <h4 className="text-sm font-medium text-gray-700 mb-2">Additional Charges</h4>
                                    <div className="space-y-2">
                                        {(formData.driverBeta || 0) > 0 && (
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="text-gray-600">Driver Beta</span>
                                                <span className="font-medium text-orange-600">+₹{formData.driverBeta || 0}</span>
                                            </div>
                                        )}
                                        {formData.extraPrice > 0 && (
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="text-gray-600">Extra Charges</span>
                                                <span className="font-medium text-orange-600">+₹{formData.extraPrice}</span>
                                            </div>
                                        )}
                                        {formData.distanceLimit > 0 && formData.distance > formData.distanceLimit && (
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="text-gray-600">Overage Distance</span>
                                                <span className="font-medium text-orange-600">
                                                    +₹{((formData.distance - formData.distanceLimit) * (formData.pricePerKm || 0)).toFixed(2)}
                                                </span>
                                            </div>
                                        )}
                                     
                                    </div>
                                </div>

                                {/* Discounts */}
                                {formData.discountAmount > 0 && (
                                    <div className="bg-white p-3 rounded border border-green-200">
                                        <h4 className="text-sm font-medium text-green-700 mb-2">Discounts Applied</h4>
                                        <div className="flex justify-between items-center">
                                            <span className="text-green-600">Discount Amount</span>
                                            <span className="font-medium text-green-600">-₹{formData.discountAmount}</span>
                                        </div>
                                    </div>
                                )}

                                {/* Final Calculation */}
                                <div className="bg-blue-50 p-3 rounded border border-blue-200">
                                    <h4 className="text-sm font-medium text-blue-700 mb-2">Final Calculation</h4>
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-blue-600">Base Fare</span>
                                            <span className="font-medium">₹{formData.estimatedAmount}</span>
                                        </div>
                                        {formData.extraPrice > 0 && (
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="text-blue-600">Extra Charges</span>
                                                <span className="font-medium">+₹{formData.extraPrice}</span>
                                            </div>
                                        )}
                                     
                                        {formData.discountAmount > 0 && (
                                            <div className="flex justify-between items-center text-sm text-green-600">
                                                <span>Discount</span>
                                                <span className="font-medium">-₹{formData.discountAmount}</span>
                                            </div>
                                        )}
                                        <div className="border-t border-blue-300 pt-2">
                                            <div className="flex justify-between items-center text-lg font-bold text-blue-800">
                                                <span>Final Amount</span>
                                                <span>₹{formData.finalAmount}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Summary */}
                                <div className="bg-gray-100 p-3 rounded border">
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div className="text-center">
                                            <span className="text-gray-600 font-medium">Total Distance</span>
                                            <div className="text-lg font-bold text-gray-800">{formData.distance} km</div>
                                        </div>
                                        <div className="text-center">
                                            <span className="text-gray-600 font-medium">Total Fare</span>
                                            <div className="text-lg font-bold text-gray-800">₹{formData.finalAmount}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>


                        {/* Payment Information */}

                        <div className="bg-gray-50 p-4 rounded-lg">

                            <h3 className="text-lg font-semibold mb-3 text-gray-800">Payment Information</h3>

                            
                            {/* Editable Payment Fields */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div>
                                    <Label className="text-sm font-medium text-gray-600">Payment Method*</Label>
                                    <Select value={formData.paymentMethod} onValueChange={(value) => handleInputChange('paymentMethod', value)}>
                                        <SelectTrigger className="mt-1">
                                            <SelectValue placeholder="Select payment method" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Cash">Cash</SelectItem>
                                            <SelectItem value="UPI">UPI</SelectItem>
                                            <SelectItem value="Bank">Bank</SelectItem>
                                            <SelectItem value="Card">Card</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <Label className="text-sm font-medium text-gray-600">Payment Status*</Label>
                                    <div className="mt-1 p-2 bg-gray-100 rounded border">
                                        <span className={`font-medium ${
                                            formData.paymentStatus === 'Paid' ? 'text-green-600' : 
                                            formData.paymentStatus === 'Partial Paid' ? 'text-orange-600' : 
                                            'text-red-600'
                                        }`}>
                                            {formData.paymentStatus}
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">
                                        Automatically calculated based on advance amount
                                    </p>
                                </div>

                                <div>
                                    <Label className="text-sm font-medium text-gray-600">Advance Amount</Label>
                                    <Input
                                        type="number"
                                        min="0"
                                        max={formData.finalAmount || undefined}
                                        step="0.01"
                                        value={formData.advanceAmount}
                                        onChange={(e) => {
                                            const value = parseFloat(e.target.value) || 0;
                                            const finalAmount = Number(formData.finalAmount || 0);
                                            
                                            if (value < 0) {
                                                toast.error("Advance amount cannot be negative");
                                                return;
                                            }
                                            
                                            if (value > finalAmount && finalAmount > 0) {
                                                toast.error(`Advance amount cannot exceed final amount (₹${finalAmount})`);
                                                return;
                                            }
                                            
                                            handleInputChange('advanceAmount', value);
                                        }}
                                        placeholder="0"
                                        className="mt-1"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        Enter 0 for unpaid, or amount less than or equal to final amount for partial/full payment
                                        {formData.finalAmount > 0 && (
                                            <span className="block mt-1 text-blue-600 font-medium">
                                                Max advance: ₹{formData.finalAmount}
                                            </span>
                                        )}
                                    </p>
                                </div>
                            </div>

                            {/* Real-time payment status display */}
                            {formData.finalAmount > 0 && (
                                <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                        <div className="text-center">
                                            <span className="text-blue-700 font-medium">Advance Amount</span>
                                            <div className="text-lg font-bold text-blue-800">₹{formData.advanceAmount || 0}</div>
                                        </div>
                                        <div className="text-center">
                                            <span className="text-blue-700 font-medium">Remaining Amount</span>
                                            <div className="text-lg font-bold text-blue-800">₹{formData.upPaidAmount || 0}</div>
                                        </div>
                                        <div className="text-center">
                                            <span className="text-blue-700 font-medium">Total Amount</span>
                                            <div className="text-lg font-bold text-blue-800">₹{formData.finalAmount || 0}</div>
                                        </div>
                                    </div>
                                    {formData.advanceAmount >= formData.finalAmount && formData.finalAmount > 0 && (
                                        <div className="mt-3 p-2 bg-green-100 border border-green-200 rounded text-center">
                                            <span className="text-green-700 text-sm font-medium">✓ Full Payment Received</span>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Read-only Payment Information Display */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                                <div>

                                    <Label className="text-sm font-medium text-gray-600">Payment Method</Label>

                                    <p className="text-gray-900">{formData.paymentMethod}</p>

                                </div>

                                <div>

                                    <Label className="text-sm font-medium text-gray-600">Payment Status</Label>

                                    <p className="text-gray-900">{formData.paymentStatus}</p>

                                </div>

                                <div>

                                    <Label className="text-sm font-medium text-gray-600">Advance Amount</Label>

                                    <p className="text-gray-900">₹{formData.advanceAmount || 0}</p>
                                </div>

                                <div>

                                    <Label className="text-sm font-medium text-gray-600">Remaining Amount</Label>

                                    <p className="text-gray-900">₹{formData.upPaidAmount || 0}</p>
                                </div>

                            </div>

                            {/* Payment Summary */}
                            <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-blue-700 font-medium">Payment Summary:</span>
                                    <span className="text-blue-700 font-medium">
                                        ₹{formData.advanceAmount || 0} (Paid) + ₹{formData.upPaidAmount || 0} (Remaining) = ₹{formData.finalAmount || 0} (Total)
                                    </span>
                        </div>

                            </div>
                        </div>
                    </div>

                    <AlertDialogFooter>

                        <AlertDialogCancel onClick={() => setShowPreviewDialog(false)}>

                            Cancel

                        </AlertDialogCancel>

                        <Button 
                            onClick={handleConfirmBooking}
                            disabled={isCreatePending}
                            className="bg-teal-600 hover:bg-teal-700 text-white"
                        >
                            {isCreatePending ? (
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            ) : null}
                            Confirm Booking
                        </Button>
                    </AlertDialogFooter>

                </AlertDialogContent>

            </AlertDialog>

        </div>

    );

}

