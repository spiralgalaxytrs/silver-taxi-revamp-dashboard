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
import { getMinDateTime, getMaxDateTime, getMinDate } from '../../lib/dateFunctions';
import axios from "../../lib/http-common"
import { Loader2, ArrowUp, ArrowDown, Plus, Trash } from 'lucide-react';
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
import FairCalculationPopup from './FairCalculationPopup';
import InfoComponent from 'components/ui/Info';
import { distance } from 'framer-motion';

interface FareCalculationData {
  distance: number;
  duration: string;
  estimatedAmount: number;
  finalAmount: number;
  fareBreakdown: any;
  taxAmount: number;
  taxPercentage: number;
  convenienceFee: number;
}



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
    extraPricePerKm?: number;
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
    status: "Booking Confirmed" | "Completed" | "Cancelled" | "Not-Started" | "Started";
    createdBy: "Admin" | "Vendor";
    toll?: number | null;
    hill?: number | null;
    permitCharge?: number | null;
    taxPercentage?: number | null;
    taxAmount?: number | null;
    driverBeta?: number | null;
    duration?: string | null;
    pricePerKm?: number | null;
    breakFareDetails?: Record<string, any>;
    vehicleType?: string;
    extraCharges?: Record<string, any>;
    extraDriverBeta: number;
    extraHill: number;
    extraPermitCharge: number;
    extraToll: number;
    noOfHours?: number;
    hourlyPrice?: number;
    additionalExtraPricePerKm?: number;
    minKm?: number;
    convenienceFee?: number;
    days?: number;
}

export function BookingForm({ id, createdBy }: CreateBookingFormProps) {
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

    const findServiceId = (serviceType: string) => {
        const foundService: any = services.find(service => service.name === serviceType);
        return foundService ? foundService.serviceId as string : "";
    }

    const [currentStep, setCurrentStep] = useState(1);
    const [localLoading, setLocalLoading] = useState(false);
    const [updatedOffers, setUpdatedOffers] = useState<any[]>([]);
    const [isFormDirty, setIsFormDirty] = useState(false);
    const [showUnsavedChangesDialog, setShowUnsavedChangesDialog] = useState(false);
    const [showFareCalculation, setShowFareCalculation] = useState(false);
    const [fareData, setFareData] = useState<FareCalculationData | null>(null);
    const [pendingNavigation, setPendingNavigation] = useState<() => void>(() => { });
    const [finalTax, setFinalTax] = useState("");
    // const [filteredVehicles, setFilteredVehicles] = useState<any[]>([]);

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
        packageId: '',
        packageType: '',
        dayOrHour: '',
        price: 0,
        extraPrice: 0,
        extraPricePerKm: 0,
        distanceLimit: 0,
        finalAmount: 0,
        estimatedAmount: 0,
        discountAmount: 0,
        upPaidAmount: 0,
        advanceAmount: 0,
        type: 'Manual',
        paymentMethod: 'Cash',
        status: 'Booking Confirmed',
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
        breakFareDetails: {},
        extraCharges: {
            "Toll": 0,
            "Hill": 0,
            "Permit Charge": 0,
            "Parking Charge": 0,
            "Pet Charge": 0,
            "Waiting Charges": 0,
            "Night Charges": 0,
            "Luggage Charges": 0,
        },
        vehicleType: "",
        extraDriverBeta: 0,
        extraHill: 0,
        extraPermitCharge: 0,
        extraToll: 0,
     
    });

    // Fetch all package tariffs for the service type
    const {
        data: allPkgTariffs = [],
        isLoading: isPkgTariffsLoading
    } = usePackageTariffs(
        formData.serviceType === 'Hourly Packages' ? 'hourly' :
            formData.serviceType === 'Day Packages' ? 'day' : ''
    );

    // Fetch specific package tariffs when vehicle is selected
    const {
        data: pkgTariffs = [],
        isLoading: isPkgTariffsLoadingSpecific
    } = usePackageTariffByVehicle(
        formData.vehicleId,
        findServiceId(formData.serviceType) as string,
        formData.serviceType === 'Hourly Packages' ? 'hourly' :
            formData.serviceType === 'Day Packages' ? 'day' : ''
    );

    let pastTimeToastShown = false;

    const MAX_STOPS = 9999;

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
                extraPricePerKm: booking.extraPricePerKm || 0,
                distanceLimit: booking.distanceLimit || 0,
                createdBy: booking.createdBy as "Admin" | "Vendor",
                serviceType: booking.serviceType as
                    | "One way"
                    | "Round trip"
                    | "Airport Pickup"
                    | "Airport Drop"
                    | "Day Packages"
                    | "Hourly Packages",
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

    useEffect(() => {
        const initialData = { ...formData }; // same as before
        const isDirty = JSON.stringify(initialData) !== JSON.stringify(formData);

        setIsFormDirty(prev => {
            if (prev !== isDirty) return isDirty;
            return prev;
        });
    }, [formData]);

    const fetchDistance = async (pickup: string, drop: string) => {
        if (pickup && drop) {
            setLocalLoading(true);
            try {
                // Ensure stops are strings (adjust if stops already strings)
                const stopsList = (formData.stops || []).map((s: any) => s.location || s);

                // Build location sequence
                let allLocations = [pickup, ...stopsList, drop];

                // For round trips, add pickup again at end if stops exist
                if (formData.serviceType === "Round trip" && stopsList.length > 0) {
                    allLocations.push(pickup);
                }

                // Build origin-destination pairs
                const locationPairs = allLocations.slice(0, -1).map((loc, index) => ({
                    origin: loc,
                    destination: allLocations[index + 1]
                }));

                // Fetch all distances in parallel
                const results = await Promise.all(
                    locationPairs.map(pair =>
                        axios.get(`/global/distance`, {
                            params: { origin: pair.origin, destination: pair.destination }
                        })
                    )
                );

                // Helper function to parse duration string to minutes
                const parseDurationToMinutes = (durationStr: string): number => {
                    if (typeof durationStr === 'number') return durationStr;

                    const hoursMatch = durationStr.match(/(\d+)\s*hours?/i);
                    const minsMatch = durationStr.match(/(\d+)\s*mins?/i);

                    const hours = hoursMatch ? parseInt(hoursMatch[1]) : 0;
                    const minutes = minsMatch ? parseInt(minsMatch[1]) : 0;

                    return hours * 60 + minutes;
                };

                // Helper function to format minutes back to duration string
                const formatMinutesToDuration = (totalMinutes: number): string => {
                    const hours = Math.floor(totalMinutes / 60);
                    const minutes = totalMinutes % 60;

                    if (hours > 0 && minutes > 0) {
                        return `${hours} hours ${minutes} mins`;
                    } else if (hours > 0) {
                        return `${hours} hours`;
                    } else {
                        return `${minutes} mins`;
                    }
                };

                // Sum total distance and duration
                const { totalDistance, totalDurationMinutes } = results.reduce(
                    (acc, res) => {
                        const { distance, duration } = res.data.data;
                        acc.totalDistance += distance;
                        acc.totalDurationMinutes += parseDurationToMinutes(duration);
                        return acc;
                    },
                    { totalDistance: 0, totalDurationMinutes: 0 }
                );

                const totalDuration = formatMinutesToDuration(totalDurationMinutes);

                // Save to form state
                setFormData(prev => ({
                    ...prev,
                    distance: totalDistance,
                    duration: String(totalDuration)
                }));

                // Trigger fare calculation
                if (totalDistance > 0) {
                    await handleFairCalculation(
                        formData.serviceType,
                        formData.vehicleId,
                        totalDistance,
                        formData.pickupDateTime,
                        formData.dropDate || '',
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

    console.log("fair calculation", formData.name)
    try {
        const payload: any = {
            pickup: formData.pickup,   // REQUIRED
            drop: formData.drop,       // REQUIRED
            
            // Convert all numeric fields to numbers
            distance: Number(distance) || 0,
            pricePerKm: Number(formData.pricePerKm) || 0,
            extraPricePerKm: Number(formData.extraPricePerKm) || 0,
            driverBeta: Number(formData.driverBeta) || 0,
            extraDriverBeta: Number(formData.extraDriverBeta) || 0,
            hill: Number(formData.hill) || 0,
            extraHill: Number(formData.extraHill) || 0,
            permitCharge: Number(formData.permitCharge) || 0,
            extraPermitCharge: Number(formData.extraPermitCharge) || 0,
            toll: Number(formData.toll) || 0,
            extraToll: Number(formData.extraToll) || 0,

            
            // Existing fields
            serviceType,
            vehicleId,
            vehicleType: formData.vehicleType,
            pickupDateTime,
            dropDate,
            stops: formData.stops || [],
            createdBy: formData.createdBy,
            
            // Recommended additions
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            advanceAmount: Number(formData.advanceAmount) || 0,
            discountAmount: Number(formData.discountAmount) || 0,
            paymentMethod: formData.paymentMethod || "Cash",
            paymentStatus: formData.paymentStatus || "Unpaid",
            status: formData.status || "Booking Confirmed",
            type: formData.type || "App"
        };

             // Add package-related fields only for Day/Hourly Packages
        if (serviceType === 'Day Packages' || serviceType === 'Hourly Packages') {
            if (!formData.packageId) {
                toast.error('Please select a package first');
                setLocalLoading(false);
                return;
            }

            payload.packageId = formData.packageId;
            payload.packageType = serviceType === 'Day Packages' ? 'Day Package' : 'Hourly Package';
            
            // Add hourly-specific fields
            if (serviceType === 'Hourly Packages') {
                payload.noOfHours = formData.noOfHours;
                payload.hourlyPrice = formData.hourlyPrice;
                payload.additionalExtraPricePerKm = formData.additionalExtraPricePerKm || 0;
            }
        }

        const response = await axios.post(`/v1/bookings/fair-calculation`, payload);
        const { data } = response.data;
        
        // Update form with correct field names from backend response
        setFormData(prev => ({
            ...prev,
            estimatedAmount: data.estimatedAmount,
            finalAmount: data.finalAmount,
            driverBeta: data.driverBeta || 0,
            pricePerKm: data.pricePerKm || 0,
            taxAmount: data.taxAmount || 0,
            taxPercentage: data.taxPercentage || 0,
            price: data.estimatedAmount, // Use estimatedAmount as base price
            extraPrice: data.extraPricePerKm || 0,
            upPaidAmount: data.upPaidAmount || 0,
            breakFareDetails: data.fareBreakdown || {},
            distance: data.distance || distance,
            // Add other relevant fields from response
            duration: data.duration,
            days: data.days,
            convenienceFee: data.convenienceFee,
            minKm: data.minKm,
            toll: data.toll || 0,
            extraToll: data.extraToll || 0,
            hill: data.hill || 0,
            extraHill: data.extraHill || 0,
            permitCharge: data.permitCharge || 0,
            extraPermitCharge: data.extraPermitCharge || 0,
            extraDriverBeta: data.extraDriverBeta || 0,
            extraPricePerKm: data.extraPricePerKm || 0
        }));
        
        setShowFareCalculation(true);
        // Pass the complete API response data to FairCalculationPopup
        // This ensures all fields from fair-calculation API are available for booking creation
        setFareData(data);
    } catch (err) {
        console.error('Fair calculation error:', err);
        toast.error('Failed to calculate fare. Please check your inputs and try again.');
    } finally {
        setLocalLoading(false);
    }
};

    const handleInputChange = (name: keyof Booking, value: any) => {
        setFormData((prev) => {
            let newValue = value;

            // Past time check (unchanged)
            if (name === "pickupDateTime") {
                const now = new Date();
                const selectedDate = new Date(value);
                const minTime = now.toISOString().slice(11, 16);
                const selectedTime = value.slice(11, 16);
                if (selectedDate.toDateString() === now.toDateString() && selectedTime < minTime) {
                    newValue = minTime;
                    if (!pastTimeToastShown) {
                        toast.error("You cannot select a past time!", { id: "past-time-toast" });
                        pastTimeToastShown = true;
                    }
                }
            }

            // Numeric sanitization
            if (["distance", "estimatedAmount", "upPaidAmount", "discountAmount", "advanceAmount", "pricePerKm"].includes(name)) {
                newValue = String(value).replace(/[^0-9.]/g, "");
            }

            const newState = { ...prev, [name]: newValue };

            // Skip client-side calculations for package services (Hourly/Day Packages)
            // as they use API-calculated amounts
            if (newState.serviceType === 'Hourly Packages' || newState.serviceType === 'Day Packages') {
                // Only update payment status and unpaid amount for package services
                if (name === "advanceAmount") {
                    newState.paymentStatus = Number(newValue) > 0 ? "Partial Paid" : "Unpaid";
                }
                // Always recalc unpaid amount
                newState.upPaidAmount = Number(newState.finalAmount || 0) - Number(newState.advanceAmount || 0);
                return newState;
            }

            let pricePerKm = Number(newState.pricePerKm || 0);
            let totalDistance = 0;

            if (newState.serviceType === "Round trip") {
                let oneWayDistance = Number(newState.distance || 0);

                // let roundTripDistance = oneWayDistance * 2;

                const pickupDate = new Date(newState.pickupDateTime || new Date().toISOString());
                const dropDate = new Date(newState.dropDate || new Date().toISOString());
                const timeDiff = dropDate.getTime() - pickupDate.getTime();
                const tripDays = timeDiff > 0 ? Math.ceil(timeDiff / (1000 * 3600 * 24)) : 1;

                totalDistance = Math.max(newState.distance
                    // 300 * tripDays
                );

                // const driverBetaTotal = (Number(newState.driverBeta) || 0) * tripDays;
                const basePrice = totalDistance * pricePerKm;
                const taxAmount = (basePrice * (Number(newState.taxPercentage) || 0)) / 100;
                setFinalTax(String(taxAmount));
                newState.taxAmount = taxAmount;

                newState.estimatedAmount = Number((basePrice).toFixed(2));

                newState.finalAmount = Number((basePrice + (newState.driverBeta || 0) + taxAmount - (Number(newState.discountAmount) || 0)).toFixed(2));

            } else {
                // Regular single trip calculation
                pricePerKm = name === "pricePerKm" ? Number(newValue) : Number(prev.pricePerKm || 0);
                const distance = name === "distance" ? Number(newValue) : Number(prev.distance || 0);
                const estimated = pricePerKm * distance;
                const taxAmount = (estimated * (Number(newState.taxPercentage) || 0)) / 100;
                setFinalTax(String(taxAmount));
                newState.taxAmount = taxAmount;
                const driverBeta = Number(newState.driverBeta || 0);
                newState.estimatedAmount = Number((estimated).toFixed(2));
                newState.finalAmount = Number((estimated - Number(newState.discountAmount || 0) + taxAmount + driverBeta).toFixed(2));
            }

            // Offer handling (unchanged)
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

            if (name === "advanceAmount") {
                newState.paymentStatus = Number(newState.advanceAmount) > 0 ? "Partial Paid" : "Unpaid";
            }

            // Always recalc unpaid
            newState.upPaidAmount = Number(newState.finalAmount || 0) - Number(newState.advanceAmount || 0);

            return newState;
        });
    };

    const calculateFare = async () => {
        try {
            // Call your fare calculation API here
            const response = await axios.post('/api/calculate-fare', {
                pickup: formData.pickup,
                drop: formData.drop,
                vehicleType: formData.vehicleType,
                serviceType: formData.serviceType,
                // Add other necessary parameters
            });

            setFareData({
                distance: response.data.distance,
                duration: response.data.duration,
                estimatedAmount: response.data.estimatedAmount,
                finalAmount: response.data.finalAmount,
                fareBreakdown: response.data.fareBreakdown,
                taxAmount: response.data.taxAmount,
                taxPercentage: response.data.taxPercentage,
                convenienceFee: response.data.convenienceFee || 0
            });

            setShowFareCalculation(true);
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to calculate fare');
        }
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
            !formData.pickupDateTime ||
            !formData.vehicleType
            || !formData.driverBeta
            || !formData.pricePerKm
        ) {
            toast.error("Please fill all required fields",
                {
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
         console.log("formData", formData)
        // Only calculate distance for non-package bookings
        if (formData.serviceType !== 'Day Packages' && formData.serviceType !== 'Hourly Packages') {
            await fetchDistance(formData.pickup, formData.drop);
        } else if ((formData.serviceType === 'Hourly Packages' || formData.serviceType === 'Day Packages') && formData.packageId) {
            // For package services, trigger fare calculation with package details

            await handleFairCalculation(
                formData.serviceType,
                formData.vehicleId,
                formData.distanceLimit || 0,
                formData.pickupDateTime,
                formData.dropDate || '',
            );
        } else {

        }
        setFinalTax('');
    };


    const filterFormData = (data: any) => {
        const filteredData: any = {};
        Object.keys(data).forEach(key => {
            if (data[key] !== undefined && data[key] !== null && data[key] !== '') {
                // If the value is an object, recursively filter it
                if (typeof data[key] === 'object' && !Array.isArray(data[key]) && data[key] !== null) {
                    const filteredObj = filterFormData(data[key]);
                    if (Object.keys(filteredObj).length > 0) {
                        filteredData[key] = filteredObj;
                    }
                } else if (Array.isArray(data[key])) {
                    // Handle arrays - keep empty arrays but filter their contents if they're objects
                    if (data[key].length > 0 && typeof data[key][0] === 'object') {
                        filteredData[key] = data[key].map((item: any) => 
                            typeof item === 'object' ? filterFormData(item) : item
                        );
                    } else {
                        filteredData[key] = data[key];
                    }
                } else {
                    filteredData[key] = data[key];
                }
            }
        });
        return filteredData;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const filteredData = filterFormData(formData);
            if (id) {
                updateBooking({ id, data: filteredData }, {
                    onSuccess: (data: any) => {
                        toast.success(data?.message || 'Booking updated successfully', {
                            style: {
                                backgroundColor: "#009F7F",
                                color: "#fff",
                            },
                        });
                        setTimeout(() => router.push(`/${createdBy === "Admin" ? "admin" : "vendor"}/bookings`), 100);
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
                createBooking(filteredData, {
                    onSuccess: (data: any) => {
                        toast.success(data?.message || 'Booking created successfully', {
                            style: {
                                backgroundColor: "#009F7F",
                                color: "#fff",
                            },
                        });
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

    const filteredVehicles = useMemo(() => {
        if (formData.serviceType === 'Hourly Packages' || formData.serviceType === 'Day Packages') {
            // For package services, show vehicles that support the selected package
            if (formData.packageId) {
                return vehicles.filter(vehicle =>
                    vehicle.isActive &&
                    allPkgTariffs.some(
                        pkgTariff =>
                            pkgTariff.vehicleId === vehicle.vehicleId &&
                            pkgTariff.packageId === formData.packageId &&
                            pkgTariff.price > 0
                    )
                );
            } else {
                // If no package selected, show all vehicles that have packages
                return vehicles.filter(vehicle =>
                    vehicle.isActive &&
                    allPkgTariffs.some(
                        pkgTariff =>
                            pkgTariff.vehicleId === vehicle.vehicleId &&
                            pkgTariff.price > 0
                    )
                );
            }
        } else {
            // For regular services, check regular tariffs
            return vehicles.filter(vehicle =>
                vehicle.isActive &&
                tariffs.some(
                    tariff =>
                        tariff.vehicleId === vehicle.vehicleId &&
                        tariff.price > 0 &&
                        tariff.services?.name === formData.serviceType
                )
            );
        }
    }, [vehicles, tariffs, allPkgTariffs, formData.serviceType, formData.packageId]);

    const isAnyLoading = localLoading || isTariffsLoading || isVehiclesLoading;
    if (isAnyLoading) {
        return (
            <div className="flex items-center justify-center h-[500px] bg-gray-50">
                <Loader2 className="w-12 h-12 animate-spin text-primary" />
            </div>
        );
    }

    const handleMoveStop = (
        index: number,
        direction: number,
        e: React.MouseEvent<HTMLButtonElement> | React.TouchEvent<HTMLButtonElement>
    ) => {
        e.preventDefault();

        const newIndex = index + direction;

        if (newIndex < 0 || newIndex >= formData.stops.length) return;

        const newStops = [...formData.stops];
        [newStops[index], newStops[newIndex]] = [newStops[newIndex], newStops[index]];

        setFormData(prev => ({
            ...prev,
            stops: newStops
        }));
    };

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
                                <h3 className="col-span-2 text-lg font-medium">Trip Details</h3>
                                <div className="space-y-2">
                                    <Label>Trip Type <span className='text-red-500'>*</span></Label>
                                    <Select
                                        value={formData.serviceType}
                                        onValueChange={(v) => {
                                            handleInputChange('serviceType', v);
                                            // Reset vehicleId and packageId when service type changes to ensure valid selection
                                            handleInputChange('vehicleId', '');
                                            if (v === 'Hourly Packages' || v === 'Day Packages') {
                                                handleInputChange('packageId', '');
                                            }
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


                                {/* Show vehicle selection only if not hourly packages or if package is selected */}
                                {formData.serviceType !== 'Hourly Packages' || formData.packageId ? (
                                    <div className="space-y-2">
                                        <Label>Vehicle Type<span className='text-red-500'>*</span></Label>
                                        <Select
                                            value={formData.vehicleId || ""} // Ensure this is not an empty string
                                            onValueChange={async (v) => {
                                                const selectedVehicle = filteredVehicles.find(vehicle => vehicle.vehicleId === v);

                                                // Update all related fields at once
                                                setFormData(prev => {
                                                    const newState = {
                                                        ...prev,
                                                        vehicleId: v,
                                                        vehicleType: selectedVehicle?.type || '',
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
                                ) : null}
                                </div>


                                {/* Show vehicle type only if vehicle selection is visible */}
                                {/* {(formData.serviceType !== 'Hourly Packages' || formData.packageId) && (
                                    formData.vehicleId ? (
                                        <div className="pt-2">
                                            <Label>Vehicle Type</Label>
                                            <Input
                                                type="text"
                                                value={formData.vehicleType || "Unknown"}
                                                disabled
                                                className="mt-1 w-full h-12 px-3 border rounded-md bg-gray-100 text-gray-700"
                                            />
                                        </div>
                                    ) : (
                                        <div className="pt-2">
                                            <Label>Vehicle Type</Label>
                                            <Input
                                                type="text"
                                                value="No vehicle selected"
                                                disabled
                                                className="mt-1 w-full h-12 px-3 border rounded-md bg-gray-100 text-gray-500 italic"
                                            />
                                        </div>
                                    )
                                )} */}



                                {/* Package Selection for Hourly Packages */}
                                {formData.serviceType === 'Hourly Packages' && (
                                    <div className="space-y-2">
                                        <Label>Package Selection <span className='text-red-500'>*</span></Label>
                                        <Select
                                            value={formData.packageId}
                                            onValueChange={async (v) => {
                                                const selectedPackage = allPkgTariffs.find(pkg => pkg.packageId === v);

                                                // Update all related fields at once
                                                setFormData(prev => {
                                                    const newState = {
                                                        ...prev,
                                                        packageId: v,
                                                        dayOrHour: selectedPackage?.noOfHours || '',
                                                        distanceLimit: selectedPackage?.distanceLimit || 0,
                                                        price: selectedPackage?.price || 0,
                                                        extraPrice: selectedPackage?.extraPrice || 0,
                                                        extraPricePerKm: selectedPackage?.extraPrice || 0,
                                                        vehicleId: '' // Reset vehicle selection when package changes
                                                    };
                                                    return newState;
                                                });
                                            }}
                                        >
                                            <SelectTrigger className="h-12">
                                                <SelectValue placeholder="Select a package" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {allPkgTariffs
                                                    .filter((pkg, index, self) =>
                                                        // Remove duplicates based on hours and distance only
                                                        index === self.findIndex(p =>
                                                            p.noOfHours === pkg.noOfHours &&
                                                            p.distanceLimit === pkg.distanceLimit &&
                                                            p.status === true &&
                                                            p.createdBy === 'Admin'
                                                        )
                                                    )
                                                    .map(pkg => (
                                                        <SelectItem key={pkg.packageId} value={pkg.packageId}>
                                                            {pkg.noOfHours} {Number(pkg.noOfHours) > 1 ? "Hours" : "Hour"} {pkg.distanceLimit} Km - ₹{pkg.price}
                                                        </SelectItem>
                                                    ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )}

                                 <div className="grid grid-cols-2 gap-4">
                                <h3 className="col-span-2 text-lg font-medium">Customer Details</h3>
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
                                </div>
                                  <div className="grid grid-cols-2 gap-4">
                                <h3 className="col-span-2 text-lg font-medium">Location Details</h3>
                                <div className="space-y-2">
                                    
                                    <Label>Pickup Location <span className="text-red-500">*</span></Label>
                                    <LocationAutocomplete
                                        onSelect={handleLocationSelectFromGoogle}
                                        onChange={(e) => handleInputChange("pickup", e.target.value)}
                                        getValue={formData.pickup}
                                    />
                                    {formData.serviceType !== 'Hourly Packages' && (
                                        <Button
                                            variant="link"
                                            onClick={handleAddStop}
                                            disabled={formData.stops.length >= MAX_STOPS}
                                            className="text-blue-500 text-sm mt-1 hover:underline flex items-center p-0"
                                        >
                                            <Plus className="w-4 h-4 mr-1" /> Add Stop
                                        </Button>
                                    )}
                                </div>

                                {formData.serviceType !== 'Hourly Packages' && formData.stops.map((stop: any, index: any) => (
                                    <div key={index} className="mb-3 flex items-center gap-2">
                                        <div className="flex-1">
                                            <Label className="text-sm text-gray-600">Stop {index + 1}</Label>
                                            <LocationAutocomplete
                                                onSelect={(value) => handleStopChange(index, value)}
                                                onChange={(e) => handleStopChange(index, e.target.value)}
                                                getValue={stop}
                                            />
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={(e) => handleMoveStop(index, -1, e)}
                                            disabled={index === 0}
                                            className="text-gray-600 hover:text-gray-800"
                                        >
                                            <ArrowUp className="w-4 h-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={(e) => handleMoveStop(index, 1, e)}
                                            disabled={index === formData.stops.length - 1}
                                            className="text-gray-600 hover:text-gray-800"
                                        >
                                            <ArrowDown className="w-4 h-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={(e) => handleRemoveStop(index, e)}
                                            className="text-red-500 hover:text-red-700"
                                        >
                                            <Trash className="w-4 h-4" />
                                        </Button>
                                    </div>
                                ))}

                                {formData.serviceType !== "Day Packages" && formData.serviceType !== "Hourly Packages" && (
                                    <div className="space-y-2">
                                        <Label>Drop Location <span className="text-red-500">*</span></Label>
                                        <LocationAutocomplete
                                            onSelect={handleLocationSelectToGoogle}
                                            onChange={(e) => handleInputChange("drop", e.target.value)}
                                            getValue={formData.drop}
                                        />
                                    </div>
                                )}
                                </div>
                                 
                                <div className="grid grid-cols-2 gap-4">
                                <h3 className="col-span-2 text-lg font-medium">Pickup Date & Time Details</h3>
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

                                {/* Pricing Details */}
                                <div className="col-span-2 mt-4 pt-4">
                                    <h3 className="text-lg font-medium">Pricing Details</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Amount per Km</Label>
                                            <Input
                                                type="number"
                                                value={formData.pricePerKm || ''}
                                                onChange={e => handleInputChange('pricePerKm', e.target.value)}
                                                className="h-12"
                                            />
                                        </div>
                                        {/* <div className="space-y-2">
                                            <Label>Extra Amount per Km</Label>
                                            <Input
                                                type="number"
                                                value={formData.extraPricePerKm || ''}
                                                onChange={e => handleInputChange('extraPricePerKm', e.target.value)}
                                                className="h-12"
                                            />
                                        </div> */}
                                        <div className="space-y-2">
                                            <Label>Driver Beta</Label>
                                            <Input
                                                type="number"
                                                value={formData.driverBeta || ''}
                                                onChange={e => handleInputChange('driverBeta', e.target.value)}
                                                className="h-12"
                                            />
                                        </div>
                                        {/* <div className="space-y-2">
                                            <Label>Extra Driver Beta</Label>
                                            <Input
                                                type="number"
                                                value={formData.extraDriverBeta || ''}
                                                onChange={e => handleInputChange('extraDriverBeta', e.target.value)}
                                                className="h-12"
                                            />
                                        </div> */}
                                        <div className="space-y-2">
                                            <Label>Hill Charge</Label>
                                            <Input
                                                type="number"
                                                value={formData.hill || ''}
                                                onChange={e => handleInputChange('hill', e.target.value)}
                                                className="h-12"
                                            />
                                        </div>
                                        {/* <div className="space-y-2">
                                            <Label>Extra Hill Charge</Label>
                                            <Input
                                                type="number"
                                                value={formData.extraHill || ''}
                                                onChange={e => handleInputChange('extraHill', e.target.value)}
                                                className="h-12"
                                            />
                                        </div> */}
                                        <div className="space-y-2">
                                            <Label>Permit Charge</Label>
                                            <Input
                                                type="number"
                                                value={formData.permitCharge || ''}
                                                onChange={e => handleInputChange('permitCharge', e.target.value)}
                                                className="h-12"
                                            />
                                        </div>
                                        {/* <div className="space-y-2">
                                            <Label>Extra Permit Charge</Label>
                                            <Input
                                                type="number"
                                                value={formData.extraPermitCharge || ''}
                                                onChange={e => handleInputChange('extraPermitCharge', e.target.value)}
                                                className="h-12"
                                            />
                                        </div> */}
                                    </div>
                                </div>

                             
                        
                        </div>
                        
                    )}

                    <div className="flex justify-end gap-4 mt-8">
                             <Button
                                type="button"
                                onClick={handleNextStep}
                                disabled={isAnyLoading}
                            >
                                Check Fare
                            </Button>
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
            
            {/* Fair Calculation Popup */}
            {fareData && (
                <FairCalculationPopup 
                    isOpen={showFareCalculation}
                    onClose={() => setShowFareCalculation(false)}
                    fareData={fareData}
                    createdBy={createdBy}
                />
            )}
        </Card>
    );
}