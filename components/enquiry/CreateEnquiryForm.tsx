"use client"

import { useState, useEffect } from 'react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { useEnquiryStore } from '../../stores/-enquiryStore'
import { useServiceStore } from "stores/-serviceStore";
import { useRouter } from 'next/navigation'
import { getMinDateTime, getMaxDateTime } from '../../lib/date-restrict'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '../ui/select'
import { toast } from 'sonner'
import { Card, CardContent } from '../ui/card'
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
import LocationAutocomplete from '../localtion/LocationAutocomplete'
import PhoneInput from 'react-phone-input-2'
import {
    useCreateEnquiry,
    useUpdateEnquiry,
    useEnquiries
} from 'hooks/react-query/useEnquiry'
import {
    useServices
} from 'hooks/react-query/useServices'


interface CreateEnquiryFormProps {
    onSubmit: (data: any) => void
    id?: string // Optional ID for update
    createdBy: string;
}

type formData = {
    id?: string
    name: string
    email: string
    phone: string
    pickup: string
    drop: string
    pickupDateTime: string
    dropDate?: string | null
    serviceId: string
    type: 'Manual' | 'Website' | 'App'
    createdBy: "Admin" | "Vendor"
}

export function CreateEnquiryForm({ onSubmit, id, createdBy }: CreateEnquiryFormProps) {
    const router = useRouter()
    // const { createEnquiry, updateEnquiry, isLoading, error, message, enquiries, fetchEnquiries } = useEnquiryStore()
    const {
        data: enquiries = [],
        isLoading: isEnquiriesLoading,
        refetch: enquiryRefetch
    } = useEnquiries()

    const {
        mutate: createEnquiry,
        isPending: isCreatingEnquiry,
    } = useCreateEnquiry()

    const {
        mutate: updateEnquiry,
        isPending: isUpdatingEnquiry,
    } = useUpdateEnquiry()

    const {
        data: services = [],
        isLoading: isServicesLoading,
        refetch: serviceRefetch
    } = useServices()

    const [serviceType, setServiceType] = useState('')
    const [subServiceType, setSubServiceType] = useState('')
    const [isFormDirty, setIsFormDirty] = useState(false);
    const [showUnsavedChangesDialog, setShowUnsavedChangesDialog] = useState(false);
    const [pendingNavigation, setPendingNavigation] = useState<() => void>(() => { });
    // const { fetchServices, services } = useServiceStore();
    const [serId, setSerId] = useState<string>("")
    const [initSer, initSetSer] = useState<string>("")

    useEffect(() => {
        const filtered = services.filter(service => service.name === "One way");
        initSetSer(filtered[0]?.serviceId || "");
    }, [])

    const [formData, setFormData] = useState<formData>({
        name: '',
        email: '',
        phone: '',
        pickup: '',
        drop: '',
        pickupDateTime: '',
        createdBy: createdBy as "Admin" | "Vendor",
        dropDate: null,
        serviceId: initSer, // Default service ID
        type: 'Manual' as 'Manual' | 'Website' | 'App'
    })

    const handlePhoneChange = (name: keyof formData, value: any) => {
        setFormData((prev) => {
            return {
                ...prev,
                [name]: value.replace(/[^0-9]/g, "").slice(0, 10)
            }
        })
    }

    useEffect(() => {
        if (id) {
            // If there is an ID, fetch the existing data to update
            const enquiry = enquiries.find(enquiry => enquiry.enquiryId === id)
            if (enquiry) {
                setFormData({
                    ...enquiry,
                    pickupDateTime: enquiry.pickupDateTime,
                    dropDate: enquiry.dropDate ? enquiry.dropDate : null
                })
                setServiceType(enquiry.name)
            }
        }
    }, [id, enquiries])

    useEffect(() => {
        const initialData = {
            name: '',
            email: '',
            phone: '',
            pickup: '',
            drop: '',
            pickupDateTime: '',
            dropDate: null,
            serviceId: initSer, // Default service ID
            type: 'Manual' as 'Manual' | 'Website' | 'App'
        };

        const currentData = formData;
        setIsFormDirty(JSON.stringify(initialData) !== JSON.stringify(formData));
    }, [formData]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        try {
            if (id) {
                updateEnquiry(
                    { id, data: formData },
                    {
                        onSuccess: () => {
                            toast.success("Enquiry updated successfully", {
                                style: { backgroundColor: "#009F7F", color: "#fff" },
                            });
                            setTimeout(() => {
                                router.push(`/${createdBy === "Admin" ? "admin" : "vendor"}/enquiry`);
                            }, 1500);
                        },
                        onError: (error: any) => {
                            toast.error(error?.response?.data?.message || "Failed to update enquiry", {
                                style: { backgroundColor: "#FF0000", color: "#fff" },
                            });
                        },
                    }
                );
            } else {
                createEnquiry(formData, {
                    onSuccess: () => {
                        toast.success("Enquiry created successfully", {
                            style: { backgroundColor: "#009F7F", color: "#fff" },
                        });
                        setTimeout(() => {
                            router.push(`/${createdBy === "Admin" ? "admin" : "vendor"}/enquiry`);
                        }, 1500);
                    },
                    onError: (error: any) => {
                        toast.error(error?.response?.data?.message || "Failed to create enquiry", {
                            style: { backgroundColor: "#FF0000", color: "#fff" },
                        });
                    },
                });
            }
        } catch (err) {
            toast.error("Unexpected server error", {
                style: { backgroundColor: "#FF0000", color: "#fff" },
            });
            console.error(err);
        }
    }

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
            setPendingNavigation(() => () => router.push(`/${createdBy === "Admin" ? "admin" : "vendor"}/enquiry`));
        } else {
            router.push(`/${createdBy === "Admin" ? "admin" : "vendor"}/enquiry`);
        }
    };

    // Add navigation confirmation handler
    const handleConfirmNavigation = () => {
        setIsFormDirty(false);
        setShowUnsavedChangesDialog(false);
        pendingNavigation();
    };

    const handleLocationSelectFromGoogle = (address: string) => {
        setFormData({ ...formData, pickup: address });
    }

    const handleLocationSelectToGoogle = (address: string) => {
        setFormData({ ...formData, drop: address });
    }

    return (
        <div>
            <Card className='rounded-none'>
                <div className="flex justify-between items-center p-6 pt-2 pb-6">
                    <h2 className="text-3xl font-bold tracking-tight">
                        {id ? 'Edit Enquiry' : 'Create New Enquiry'}
                    </h2>
                    <Button onClick={handleClose} variant="outline">
                        Close
                    </Button>
                </div>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-4 mt-4">
                            <div className="grid grid-cols-2 gap-4">
                                {/* Service Selection */}
                                <div className="space-y-2">
                                    <Label>Service Type <span className='text-red-500'>*</span></Label>
                                    <Select
                                        onValueChange={(value) => {
                                            const selected = services.find(service => service.serviceId === value);
                                            if (selected && selected.serviceId) {
                                                setServiceType(selected.name); // or selected.serviceType
                                                setFormData({ ...formData, serviceId: selected.serviceId });
                                            }
                                        }}
                                        value={formData.serviceId}
                                    >
                                        <SelectTrigger className="h-12">
                                            <SelectValue placeholder="Select service type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {services
                                                .filter(service => service.name !== "Day Packages")
                                                .map(service => (
                                                    <SelectItem key={service.serviceId} value={service.serviceId || ""}>
                                                        {service.name}
                                                    </SelectItem>
                                                ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Package Type (Conditional) */}
                                {/* {serviceType === 'ser-3' && (
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
                                {/* {serviceType === 'ser-4' && (
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

                                {/* Customer Details */}
                                <div className="space-y-2">
                                    <Label>Customer Name <span className='text-red-500'>*</span></Label>
                                    <Input
                                        required
                                        value={formData.name || ''}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="h-12"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Email</Label>
                                    <Input
                                        value={formData.email || ''}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="h-12"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Mobile Number <span className='text-red-500'>*</span></Label>
                                    <PhoneInput
                                        value={formData.phone}
                                        placeholder="Enter phone number"
                                        country="in" // Default country code (India)
                                        onChange={(phone: string, country: { dialCode: string }) => {
                                            // Get the country code dynamically based on selected country
                                            const countryCode = country.dialCode
                                            const actualNumber = phone.substring(countryCode.length)

                                            // Format the phone number as "countryCode phoneNumber"
                                            const formattedPhone = `${countryCode} ${actualNumber}`;
                                            setFormData({ ...formData, phone: formattedPhone });
                                        }}
                                        inputStyle={{
                                            width: "100%",
                                            height: "50px",
                                            border: "1px solid #ccc",
                                            borderRadius: "4px",
                                        }}
                                    />
                                </div>

                                {/* Location Details */}
                                <div className="space-y-2">
                                    <Label>Pickup Location <span className='text-red-500'>*</span></Label>
                                    <LocationAutocomplete
                                        onSelect={handleLocationSelectFromGoogle}
                                        onChange={e => setFormData({ ...formData, pickup: e.target.value })}
                                        getValue={formData.pickup}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Drop Location <span className='text-red-500'>*</span></Label>
                                    <LocationAutocomplete
                                        onSelect={handleLocationSelectToGoogle}
                                        onChange={e => setFormData({ ...formData, drop: e.target.value })}
                                        getValue={formData.drop}
                                    />
                                </div>

                                {/* Date/Time Pickers */}
                                <div className="space-y-2">
                                    <Label>Pickup Date/Time <span className='text-red-500'>*</span></Label>
                                    <Input
                                        required
                                        type="datetime-local"
                                        value={
                                            formData.pickupDateTime
                                                ? String(formData.pickupDateTime).slice(0, 16)
                                                : ''
                                        }
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            if (value < getMinDateTime() || value > getMaxDateTime()) {
                                                toast.error("You cannot select a past time", {
                                                    duration: 2000,
                                                    closeButton: true,
                                                    position: "top-right",
                                                    icon: "🚫",
                                                    style: {
                                                        borderRadius: "10px",
                                                        padding: "20px",
                                                    }
                                                });
                                                return;
                                            }
                                            setFormData({ ...formData, pickupDateTime: value });
                                        }}
                                        className="h-12"
                                        min={getMinDateTime()}
                                        max={getMaxDateTime()}
                                    />
                                </div>

                                {serviceType === 'Round trip' && (
                                    <div className="space-y-2">
                                        <Label>Return Date</Label>
                                        <Input
                                            type="date"
                                            value={
                                                formData.dropDate
                                                    ? formData.dropDate
                                                    : ''
                                            }
                                            onChange={(e) => setFormData({ ...formData, dropDate: e.target.value })}
                                            className="h-12"
                                        />
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex justify-end">
                            <Button
                                type="submit"
                                disabled={isUpdatingEnquiry || isCreatingEnquiry}
                                className="px-6 py-2"
                            >
                                {isUpdatingEnquiry || isCreatingEnquiry ? (id ? 'Updating...' : 'Creating...') : (id ? 'Update Enquiry' : 'Create Enquiry')}
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
            </Card>
        </div>
    )
}
