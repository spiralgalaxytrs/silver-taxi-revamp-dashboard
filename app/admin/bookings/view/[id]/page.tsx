'use client';
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from 'components/ui/tabs';
import { Card, CardContent, CardFooter, CardHeader } from 'components/ui/card';
import { Label } from 'components/ui/label';
import { Button } from 'components/ui/button';
import { Input } from 'components/ui/input';
import { Eye, Edit, X, Loader2, Info, Plus, TriangleAlert, Edit2, Wallet } from 'lucide-react';
import { useParams } from 'next/navigation';
import { useFetchBookingById, useManualBookingComplete, useUpdateBooking } from 'hooks/react-query/useBooking';
import { toast } from 'sonner';
import TooltipComponent from 'components/others/TooltipComponent';
import { Booking } from 'types/react-query/booking';
import { Dialog, DialogTrigger, DialogContent } from 'components/ui/dialog';
import { formatForDateTimeLocal, isLocalDateTime } from 'lib/dateFunctions';
import { AlertDialog, AlertDialogContent, AlertDialogTrigger, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from 'components/ui/alert-dialog';

// Formatters
const formatCurrency = (value: number | null | undefined) => `₹${value?.toLocaleString() || '0'}`;
const formatDistance = (value: number | null | undefined) => `${value || 0} km`;
const formatDateTime = (dateString: string | null | undefined) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour12: true,
    hour: 'numeric',
    minute: 'numeric',
  });
};

const ImagePreview = ({ src, alt }: { src?: string | null; alt: string }) => {
  if (!src) return <div className="text-gray-400 text-sm py-4">No image available</div>;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <div className="relative group cursor-pointer">
          <img
            src={src}
            alt={alt}
            className="w-full h-24 object-contain rounded-md border border-gray-200"
          />
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
            <Eye className="w-5 h-5 text-white" />
          </div>
        </div>
      </DialogTrigger>
      <DialogContent className="fixed top-2/4 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-white rounded-lg shadow-lg p-0">
        <img src={src} alt={alt} className="w-full h-full object-contain rounded-lg" />
      </DialogContent>
    </Dialog>
  );
};

const capitalizeLabel = (key: string) => {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (str) => str.toUpperCase());
};

export default function BookingDetailsPage() {
  const { id: bookingId } = useParams<{ id: string }>();
  const [editMode, setEditMode] = useState<'before' | 'after' | null>(null);
  const [formData, setFormData] = useState<Booking | null>(null);
  const [driverCharges, setDriverCharges] = useState<Record<string, number>>({
    "Hill": 0,
    "Toll": 0,
    "Pet Charge": 0,
    "Permit Charge": 0,
    "Parking Charge": 0,
    "Waiting Charge": 0,
  });
  const [extraCharges, setExtraCharges] = useState<Record<string, number>>({});

  const [newChargeKey, setNewChargeKey] = useState('');
  const [newChargeValue, setNewChargeValue] = useState('');
  const [isManualCompleted, setIsManualCompleted] = useState(false);
 
  const { data: booking, isLoading } = useFetchBookingById(bookingId || "");
  const { mutateAsync: updateBooking } = useUpdateBooking();
  const { mutateAsync: manualBookingComplete, isPending: isManualCompletePending } = useManualBookingComplete();

  useEffect(() => {
    if (!booking) return;

    // Defensive copying to avoid mutating query cache
    setFormData({ ...booking });

    // Ensure driverCharges is an object
    setDriverCharges(booking.driverCharges ?? {
      "Hill": 0,
      "Toll": 0,
      "Pet Charge": 0,
      "Permit Charge": 0,
      "Parking Charge": 0,
      "Waiting Charge": 0,
    });

    // Ensure extraCharges is an object
    setExtraCharges(booking.extraCharges ?? {});
  }, [booking]);

  // Field groupings
  const basicInfoFields = [
    { key: 'bookingId', label: 'Booking ID' },
    { key: 'name', label: 'Name' },
    { key: 'phone', label: 'Phone' },
    // { key: 'email', label: 'Email' },
    { key: 'serviceType', label: 'Service Type' },
    { key: 'pickupDateTime', label: 'Pickup Date & Time', format: formatDateTime },
    { key: 'dropDate', label: 'Drop Date', format: formatDateTime },
    { key: 'pickup', label: 'Pickup Location' },
    { key: 'stops', label: 'Stops' },
    { key: 'drop', label: 'Drop Location' },
    { key: 'paymentMethod', label: 'Payment Method' },
    { key: 'paymentStatus', label: 'Payment Status' },
    { key: 'vehicleType', label: 'Vehicle Type' },
    { key: 'createdBy', label: 'Created By' },
    { key: 'createdAt', label: 'Created Date & Time', format: formatDateTime },
    { key: 'status', label: 'Trip Status' },
    { key: 'taxPercentage', label: 'Tax Percentage', suffix: '%' },
    { key: 'tripStartedTime', label: 'Trip Start Date & Time', format: formatDateTime },
    { key: 'tripCompletedTime', label: 'Trip Completed Date & Time', format: formatDateTime },
  ];

  const estimationFareFields = [
    { key: "distance", label: "Distance", suffix: "Km" },
    { key: "minKm", label: "Minimum Km" },
    { key: "duration", label: "Duration" },
    { key: "days", label: "No of Days" },
    { key: "pricePerKm", label: "Price Per Km", format: formatCurrency },
    { key: "driverBeta", label: "Driver Beta", format: formatCurrency },
    { key: "hill", label: "Hill", format: formatCurrency },
    { key: "permitCharge", label: "Permit Charge", format: formatCurrency },
    { key: "toll", label: "Toll", format: formatCurrency },
    { key: "finalAmount", label: "Final Amount", format: formatCurrency, isTotal: true },
  ];

  const modifiedFareFields = [
    { key: "distance", label: "Distance", suffix: "Km" },
    { key: "minKm", label: "Minimum Km" },
    { key: "duration", label: "Duration" },
    { key: "days", label: "No of Days" },
    { key: "pricePerKm", label: "Price Per Km", format: formatCurrency },
    { key: "driverBeta", label: "Driver Beta", format: formatCurrency },
    { key: "hill", label: "Hill", format: formatCurrency },
    { key: "permitCharge", label: "Permit Charge", format: formatCurrency },
    { key: "extraToll", label: "Toll", format: formatCurrency },
    { key: "finalAmount", label: "Final Amount", format: formatCurrency, isTotal: true },
  ];



  const renderFareBlock = (title: string, data: any, fields: any[], className = "") => {
    if (!data) return null;

    return (
      <div className={`rounded-lg p-4 ${className}`}>
        <div className="flex items-center gap-2 mb-3">
          <Wallet className="w-4 h-4 text-gray-700" />
          <h3 className="text-sm font-semibold text-gray-800">{title}</h3>
        </div>

        <div className="space-y-1.5 text-xs text-gray-700">
          {fields.map((field) => {
            const value = data[field.key];
            if (!value && !field.isTotal) return null;

            const isTotal = field.isTotal;

            return (
              <div
                key={field.key}
                className={`flex justify-between ${isTotal ? "border-t border-gray-300 pt-2 mt-2 text-xl font-semibold text-gray-900" : "text-lg"
                  }`}
              >
                <span className={`${isTotal ? "font-semibold" : "text-gray-600"}`}>{field.label}</span>
                <span className={`${isTotal ? "font-bold" : "font-medium"}`}>
                  {field.format ? field.format(value) : value}
                  {field.suffix ? field.suffix : ""}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };


  const afterTripFields = [
    { key: 'tripCompletedDistance', label: 'Total Km', format: formatDistance },
    { key: 'pricePerKm', label: 'Per Km', format: formatCurrency },
    { key: 'tripCompletedDriverBeta', label: 'Driver Beta', format: formatCurrency },
    { key: 'tripCompletedDuration', label: 'Total Duration' },
    { key: 'tripCompletedEstimatedAmount', label: 'Km Base Fare', format: formatCurrency },
    { key: 'tripCompletedTaxAmount', label: 'Tax Amount', format: formatCurrency },
    { key: 'statePermit', label: 'State Permit', format: formatCurrency, optional: true },
    { key: 'tollCharges', label: 'Toll Charges', format: formatCurrency, optional: true },
    { key: 'hillCharges', label: 'Hill Charges', format: formatCurrency, optional: true },
    { key: 'discountAmount', label: 'Discount Amount', format: formatCurrency },
    { key: 'tripCompletedFinalAmount', label: 'Total Amount', format: formatCurrency },
  ];

  const nonEditableAfterFields = [
    'tripCompletedDistance', 'pricePerKm', 'tripCompletedDuration',
    'tripCompletedEstimatedAmount',
    "tripCompletedDriverBeta",
    'tripCompletedFinalAmount', 'tripCompletedTaxAmount',
    'discountAmount'
  ];

  // Fields that are editable in manual completion mode
  const manualCompletionEditableFields = [
    'startOdometerValue',
    'endOdometerValue',
    'tripCompletedDriverBeta',
    'tripCompletedDuration',
    'tripCompletedEstimatedAmount',
    'tripCompletedTaxAmount',
    'discountAmount',
    'tripCompletedFinalAmount',
  ];

  const calculateEstimatedFare = (distance: number) => {
    if (!formData) return 0;
    return distance * (formData.pricePerKm || 0);
  };


  const calculateTotalAmount = (estimatedFare: number, taxAmount: number, driverBeta: number, charges = driverCharges, extraCharge = extraCharges) => {
    const chargesSum = Object.values(charges).reduce(
      (sum, charge) => sum + (Number(charge) || 0),
      0
    );

    const extraChargesSum = Object.values(extraCharge).reduce(
      (sum, charge) => sum + (Number(charge) || 0),
      0
    );
    const convenienceFee = booking.convenienceFee || 0;
    const advanceAmount = booking.advanceAmount || 0;
    const discountAmount = booking.discountAmount || 0;
    return estimatedFare + chargesSum + taxAmount + driverBeta + extraChargesSum + convenienceFee - (advanceAmount + discountAmount);
  };

  const handleEdit = (section: 'before' | 'after') => {
    setEditMode(section);
  };

  const handleSave = async () => {
    try {
      // console.log('Extra charges:', extraCharges);
      if (formData && bookingId) {
        const data = {
          ...formData,
          driverCharges,
          extraCharges,
          isManualCompleted: isManualCompleted,
          tripCompletedFinalAmount: Number(formData.tripCompletedFinalAmount) || 0,
        }

        updateBooking({ id: bookingId, data }, {
          onSuccess: () => {
            toast.success('Details updated successfully', {
              style: {
                backgroundColor: "#009F7F",
                color: "#fff",
              },
            });
            setEditMode(null);
            // Reset manual completion mode after successful save
            if (isManualCompleted) {
              setIsManualCompleted(false);
            }
          },
          onError: (error: any) => {
            toast.error(error?.response?.data?.message || 'Failed to update details', {
              style: {
                backgroundColor: "#FF0000",
                color: "#fff",
              },
            });
          }
        });

      }
    } catch (error: any) {
      console.error('Error updating booking:', error);
      toast.error(error?.response?.data?.message || 'Failed to update details', {
        style: {
          backgroundColor: "#FF0000",
          color: "#fff",
        },
      });
    }
  };

  const handleManualCompletionSave = async () => {
    try {
      // console.log('Extra charges:', extraCharges);
      if (formData && bookingId) {
        const data = {
          startOdometerValue: formData.startOdometerValue,
          endOdometerValue: formData.endOdometerValue,
          tripStartedTime: formData.tripStartedTime,
          tripCompletedTime: formData.tripCompletedTime,
          isManualCompleted: true,
          driverCharges: driverCharges,
          extraCharges: extraCharges,
        }

        manualBookingComplete({ id: bookingId, data }, {
          onSuccess: () => {
            toast.success('Details updated successfully', {
              style: {
                backgroundColor: "#009F7F",
                color: "#fff",
              },
            });
            setEditMode(null);
            // Reset manual completion mode after successful save
            if (isManualCompleted) {
              setIsManualCompleted(false);
            }
          },
          onError: (error: any) => {
            toast.error(error?.response?.data?.message || 'Failed to update details', {
              style: {
                backgroundColor: "#FF0000",
                color: "#fff",
              },
            });
          }
        });

      }
    } catch (error: any) {
      console.error('Error updating booking:', error);
      toast.error(error?.response?.data?.message || 'Failed to update details', {
        style: {
          backgroundColor: "#FF0000",
          color: "#fff",
        },
      });
    }
  };

  const handleCancel = () => {
    if (booking) {
      setFormData(booking);
      setDriverCharges(booking?.driverCharges || {});
      setExtraCharges(booking?.extraCharges || {});
    }
    setEditMode(null);
    // Reset manual completion mode
    setIsManualCompleted(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    if (!formData) return;

    const value = e.target.value;
    const parsedValue =
      field.includes('Distance') || field.includes('Amount') || field.includes('Charge') || field.includes('Value') || field.includes('startOdometer') || field.includes('endOdometer')
        ? Number(value) || 0
        : value;

    console.log("Field:", field, "Value:", parsedValue);
    setFormData((prev) => {
      if (!prev) return prev;

      const updated = { ...prev, [field]: parsedValue };

      // Handle calculations for both edit mode and manual completion mode
      if (editMode === 'after' || isManualCompleted) {
        // If tripCompletedDistance is updated:
        updated.tripCompletedDistance = (updated.endOdometerValue || 0) - (updated.startOdometerValue || 0);
        const distance = field === 'tripCompletedDistance' ? parsedValue : updated.tripCompletedDistance;
        const estimatedFare = Number(distance) * (updated.pricePerKm || 0);
        const taxAmount = Number(((estimatedFare * Number(updated.taxPercentage || 0)) / 100).toFixed(0));

        // Always recalculate tripCompletedEstimatedAmount if distance changes:
        updated.tripCompletedEstimatedAmount = estimatedFare;
        updated.tripCompletedTaxAmount = taxAmount > 0 ? taxAmount : updated.tripCompletedTaxAmount || 0;
        const driverBeta = Number(updated.tripCompletedDriverBeta) || 0;

        // Always recalculate tripCompletedFinalAmount fresh:
        const totalFinal = calculateTotalAmount(estimatedFare, taxAmount, driverBeta || 0, driverCharges, extraCharges);
        updated.tripCompletedFinalAmount = totalFinal;
      }

      return updated;
    });
  };


  const handleDriverChargeChange = (key: string, value: string) => {
    const newValue = value.replace(/[^0-9.]/g, ''); // Allow only numbers and decimal point
    const parsedValue = Number(newValue) || 0;

    // Update driverCharges first
    setDriverCharges(prev => {
      const newCharges = { ...prev, [key]: parsedValue };

      // Then update formData based on the new charges
      setFormData(prevForm => {
        if (!prevForm) return prevForm;

        const estimatedFare = prevForm.tripCompletedEstimatedAmount ||
          calculateEstimatedFare(prevForm.tripCompletedDistance || 0);
        const taxAmount = Number(((estimatedFare * Number(prevForm.taxPercentage || 0)) / 100).toFixed(0));
        const driverBeta = Number(prevForm.tripCompletedDriverBeta) || 0;
        const totalFinal = calculateTotalAmount(estimatedFare, taxAmount, driverBeta, newCharges, extraCharges);

        return {
          ...prevForm,
          driverCharges: newCharges,
          tripCompletedFinalAmount: totalFinal
        };
      });

      return newCharges;
    });
  };


  const handleExtraChargeChange = (key: string, value: string) => {
    const newValue = value.replace(/[^0-9.]/g, ''); // Allow only numbers and decimal point
    const parsedValue = Number(newValue) || 0;

    // Update driverCharges first
    setExtraCharges(prev => {
      const newCharges = { ...prev, [key]: Number(parsedValue) };

      // Then update formData based on the new charges
      setFormData(prevForm => {
        if (!prevForm) return prevForm;

        const estimatedFare = prevForm.tripCompletedEstimatedAmount ||
          calculateEstimatedFare(prevForm.tripCompletedDistance || 0);
        const taxAmount = Number(((estimatedFare * Number(prevForm.taxPercentage || 0)) / 100).toFixed(0));
        const driverBeta = Number(prevForm.driverBeta) || 0;
        const totalFinal = calculateTotalAmount(estimatedFare, taxAmount, driverBeta, driverCharges, newCharges);

        return {
          ...prevForm,
          extraCharges: newCharges,
          tripCompletedFinalAmount: totalFinal
        };
      });

      return newCharges;
    });
  };

  const handleAddExtraCharge = () => {
    if (!newChargeKey.trim()) return;

    const value = newChargeValue.replace(/[^0-9.]/g, ''); // Allow only numbers and decimal point
    const parsedValue = Number(value) || 0;

    setExtraCharges(prev => {
      const newCharges = {
        ...prev,
        [newChargeKey]: Number(parsedValue),
      };

      // Update formData
      setFormData(prevForm => {
        if (!prevForm) return prevForm;

        const estimatedFare =
          prevForm.tripCompletedEstimatedAmount ||
          calculateEstimatedFare(prevForm.tripCompletedDistance || 0);
        const taxAmount = Number(
          ((estimatedFare * Number(prevForm.taxPercentage || 0)) / 100).toFixed(0)
        );
        const driverBeta = Number(prevForm.driverBeta) || 0;
        const totalFinal = calculateTotalAmount(
          estimatedFare,
          taxAmount,
          driverBeta,
          driverCharges,
          newCharges
        );

        return {
          ...prevForm,
          extraCharges: newCharges,
          tripCompletedFinalAmount: totalFinal,
        };
      });

      return newCharges;
    });

    // Reset the input fields
    setNewChargeKey('');
    setNewChargeValue('');
  };

  const handleDeleteExtraCharge = (key: string) => {
    setExtraCharges((prev) => {
      const newCharges = { ...prev };
      delete newCharges[key];

      // Update formData after deletion
      setFormData((prevForm) => {
        if (!prevForm) return prevForm;

        const estimatedFare =
          prevForm.tripCompletedEstimatedAmount ||
          calculateEstimatedFare(prevForm.tripCompletedDistance || 0);

        const taxAmount = Number(
          ((estimatedFare * Number(prevForm.taxPercentage || 0)) / 100).toFixed(0)
        );

        const driverBeta = Number(prevForm.driverBeta) || 0;

        const totalFinal = calculateTotalAmount(
          estimatedFare,
          taxAmount,
          driverBeta,
          driverCharges,
          newCharges
        );

        return {
          ...prevForm,
          extraCharges: newCharges,
          tripCompletedFinalAmount: totalFinal,
        };
      });

      return newCharges;
    });
  };


  const calculateCommissionTax = () => {

    const adminCommission = booking?.adminCommission || 0;
    const commissionTax = (adminCommission * 18) / 100;

    return commissionTax;
  }


  const renderField = (field: any, section: 'basic' | 'before' | 'after' | 'calculation') => {

    if (field.key === "remainingAmount" && section === 'before') {
      return (
        <div key={field.key} className="space-y-1">
          <Label className="text-sm text-gray-600">{field.label}</Label>
          <div className="font-medium">
            {formatCurrency((booking?.finalAmount || 0) - (booking?.advanceAmount || 0))}
          </div>
        </div>
      )
    }

    const value = formData?.[field.key as keyof Booking] ?? booking?.[field.key as keyof Booking];

    if (field.optional && !value) return null;

    if (field.isImage) {
      return (
        <div key={field.key} className="space-y-1">
          <Label className="text-sm text-gray-600">{field.label}</Label>
          <ImagePreview src={value as string} alt={field.label} />
        </div>
      );
    }

    // Check if field is editable in normal edit mode
    const isEditable = !(
      section === 'after' &&
      editMode === 'after' &&
      nonEditableAfterFields.includes(field.key)
    );

    // Check if field is editable in manual completion mode
    const isManualCompletionEditable = isManualCompleted && manualCompletionEditableFields.includes(field.key);

    // Field is editable if it's in normal edit mode OR manual completion mode
    const shouldShowInput = ((section === 'before' || section === 'after') && editMode === section && isEditable) || isManualCompletionEditable;

    if (field.key === "pricePerKm") {
      return (
        <div key={field.key} className="space-y-1">
          <Label className="text-sm text-gray-600">{field.label}</Label>
          <div className="font-medium">
            {formData?.extraPricePerKm ?
              <p>{value} + {formData?.extraPricePerKm}</p>
              : <p>{value}</p>
            }
          </div>
        </div>
      )
    }

    if (field.key === "pickupDateTime") {
      return (
        <div key={field.key} className="space-y-1">
          <Label className="text-sm text-gray-600">{field.label}</Label>
          <div className="font-medium">
            {value ? isLocalDateTime({ dateTime: value }) : '-'}
          </div>
        </div>
      )
    }

    return (
      <div key={field.key} className="space-y-1">
        <Label className="text-sm text-gray-600">{field.label}</Label>
        {shouldShowInput ? (
          <Input
            value={value || ''}
            onChange={(e) => handleChange(e, field.key)}
            type={field.key.includes('Amount') || field.key.includes('Charge') || field.key.includes('Distance') || field.key.includes('Value') ? 'number' : 'text'}
            min={field.key.includes('Distance') || field.key.includes('Amount') || field.key.includes('Charge') || field.key.includes('Value') ? 0 : undefined}
          />
        ) : (
          <div className="font-medium">
            {field.format ? field.format(value) : value || '-'}
            {field.suffix && value ? field.suffix : ''}
          </div>
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!booking) return <div className="text-center py-8">Booking not found</div>;

  const isBeforeDisabled = booking?.status !== 'Booking Confirmed' || booking?.status !== "Reassign";
  const isAfterDisabled = booking?.endOdometerValue === 0 || booking?.endOdometerValue === null || booking?.status === 'Completed' || booking?.status === 'Manual Completed';

  console.log("tripStartedTime >> ", formData?.tripStartedTime);
  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon">
          {/* Back button icon would go here */}
        </Button>
        {/* <h1 className="text-2xl font-bold text-gray-800">Trip Details</h1> */}
      </div>

      <Tabs defaultValue="details">
        <TabsList className="grid grid-cols-2 gap-2 mb-6">
          <TabsTrigger className="tabs-trigger" value="details">
            Trip Details
          </TabsTrigger>
          {/* <TabsTrigger className="tabs-trigger" value="activity">
            Activity
          </TabsTrigger> */}
        </TabsList>

        <TabsContent value="details">
          {/* Basic Information Card (Full Width) */}
          <Card className={`bg-white rounded-lg border ${isManualCompleted ? 'border-orange-300 bg-orange-50' : 'border-gray-200'} mb-6`}>
            <CardHeader className="pb-4 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-800">Basic Information</h2>
                {isManualCompleted && (
                  <div className="flex items-center gap-2 text-orange-600">
                    <TriangleAlert className="w-4 h-4" />
                    <span className="text-sm font-medium">Manual Completion Mode Active</span>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4">
              {basicInfoFields.map((field) => renderField(field, 'basic'))}
            </CardContent>
            {<CardFooter className='justify-end'>
              <div className="flex justify-end gap-2">
                {isManualCompleted ? (
                  <>
                    <Button variant="outline" onClick={handleCancel}>
                      Cancel
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button>
                          Save Manual Completion
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Confirm Manual Booking</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to confirm this manual booking?
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={handleManualCompletionSave}>
                            Confirm
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </>
                ) : (
                  <>
                    {(
                      booking?.status === 'Started'
                      || booking?.status === 'Completed'
                      || booking?.status === 'Manual Completed'
                    ) &&
                      <Button variant="outline" onClick={() => {
                        setIsManualCompleted(!isManualCompleted)
                        if (isManualCompleted) {
                          handleEdit('after')
                        }
                      }
                      }>
                        <TriangleAlert className='w-4 h-4 text-red-500' />
                        Manual Complete
                      </Button>}
                  </>
                )}
              </div>
            </CardFooter>}
          </Card>

          {/* Before/After Trip Cards (Side by Side) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Before Trip Card */}
            <Card className="bg-white rounded-lg border border-gray-200">
              <div className="flex justify-between items-center p-4 border-b">
                <h2 className="text-lg font-semibold text-gray-800">Before Trip Details</h2>
              </div>
              <CardContent className="p-4 space-y-4">
                {renderFareBlock("Estimation Fare", booking?.normalFare, estimationFareFields, "bg-neutral-100")}

                {booking?.modifiedFare &&
                  renderFareBlock("Admin Fare", booking?.modifiedFare, modifiedFareFields, "bg-indigo-100")}
              </CardContent>
            </Card>

            {/* After Trip Card */}
            {isManualCompletePending ?
              <div className="flex items-center justify-center h-screen bg-gray-50">
                <Loader2 className="w-12 h-12 animate-spin text-primary" />
              </div> :
              < Card className={`bg-white rounded-lg border ${isManualCompleted ? 'border-orange-300 bg-orange-50' : 'border-gray-200'}`}>
                <div className="flex justify-between items-center p-4 border-b">
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-semibold text-gray-800">After Trip Details</h2>
                    {isManualCompleted && (
                      <div className="flex items-center gap-1 text-orange-600">
                        <TriangleAlert className="w-3 h-3" />
                        <span className="text-xs font-medium">Manual Mode</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {editMode === 'after' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleCancel}
                        className="text-red-500 hover:text-red-600"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                    {booking?.createdBy !== 'Vendor' &&
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          handleEdit('after')
                        }}
                        disabled={isAfterDisabled}
                        className={isAfterDisabled ? 'text-gray-400' : 'text-blue-600 hover:text-blue-700'}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>}
                  </div>
                </div>
                <CardContent className="p-4 space-y-4">
                  {/* OTP and Odometer Sections */}
                  < div className="grid grid-cols-2 gap-4" >
                    <div className="space-y-1">
                      <Label className="text-sm text-gray-600">Start OTP</Label>
                      <div className="font-medium">{booking?.startOtp ?? '-'}</div>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-sm text-gray-600">End OTP</Label>
                      <div className="font-medium">{booking?.endOtp ?? '-'}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label className="text-sm text-gray-600">Start Odometer Value</Label>
                      {isManualCompleted ?
                        (<Input
                          type="text"
                          value={formData?.startOdometerValue}
                          onChange={(e) => handleChange(e, 'startOdometerValue')}
                          className="w-full"
                        />)
                        : <div className="font-medium">{booking?.startOdometerValue ?? '-'}</div>
                      }
                    </div>
                    <div className="space-y-1">
                      <Label className="text-sm text-gray-600">End Odometer Value</Label>
                      {isManualCompleted ?
                        (<Input
                          type="text"
                          value={formData?.endOdometerValue}
                          onChange={(e) => handleChange(e, 'endOdometerValue')}
                          className="w-full"
                        />)
                        : <div className="font-medium">{booking?.endOdometerValue ?? '-'}</div>
                      }
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label className="text-sm text-gray-600">Start Odometer</Label>
                      <ImagePreview src={booking?.startOdometerImage ?? ''} alt="Start Odometer" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-sm text-gray-600">End Odometer</Label>
                      <ImagePreview src={booking?.endOdometerImage ?? ''} alt="End Odometer" />
                    </div>
                  </div>

                  {isManualCompleted ? (
                    <React.Fragment>
                      <div className="space-y-1">
                        <Label className="text-sm text-gray-600">Trip Completed Distance</Label>
                        <div className="font-medium">{formData?.tripCompletedDistance ?? '-'}</div>
                      </div>
                      <div className="space-y-2 w-1/2">
                        <Label className="text-sm text-gray-600">Trip Start Date&Time</Label>
                        <Input
                          type="datetime-local"
                          value={
                            formatForDateTimeLocal(formData?.tripStartedTime || booking?.tripStartedTime)
                          }
                          onChange={(e) => handleChange(e, "tripStartedTime")}
                        />
                      </div>
                      <div className="space-y-2 w-1/2">
                        <Label className="text-sm text-gray-600">Trip End Date&Time</Label>
                        <Input
                          type="datetime-local"
                          value={
                            formatForDateTimeLocal(formData?.tripCompletedTime || booking?.tripCompletedTime)
                          }
                          onChange={(e) => handleChange(e, 'tripCompletedTime')}
                        />
                      </div>

                      <div className="space-y-2 w-1/2">
                        <Label className="text-sm text-gray-600">Driver Charges</Label>

                        {Object.entries(driverCharges).map(([key, value]) => (
                          <div key={key} className="flex justify-center items-center gap-2">
                            <span className="text-sm font-medium w-1/2">{capitalizeLabel(key)}</span>
                            <Input
                              value={value}
                              onChange={(e) => handleDriverChargeChange(key, e.target.value)}
                              type="text"
                              placeholder="Amount"
                              className="flex-1"
                              min={0}
                            />
                          </div>
                        ))}
                      </div>

                      <div className="space-y-2 w-2/3">
                        <Label className="text-sm text-gray-600">Extra Charges</Label>

                        {/* Add New Extra Charge Inputs */}
                        <div className="flex gap-2 mb-2">
                          <Input
                            value={newChargeKey}
                            onChange={(e) => setNewChargeKey(e.target.value)}
                            placeholder="Label"
                            className="w-1/2"
                          />
                          <Input
                            value={newChargeValue}
                            onChange={(e) => setNewChargeValue(e.target.value)}
                            type="text"
                            placeholder="Amount"
                            className="w-1/3"
                            min={0}
                          />
                          <Button
                            variant="secondary"
                            onClick={handleAddExtraCharge}
                          >
                            <Plus className="w-4 h-4 text-white" />
                          </Button>
                        </div>

                        {/* Existing Extra Charges List */}
                        {Object.entries(extraCharges).filter(([key, value]) => Number(value) > 0).map(([key, value]) => (
                          <div key={key} className="flex justify-center items-center gap-2">
                            <span className="text-sm font-medium w-1/2">{capitalizeLabel(key)}</span>
                            <Input
                              value={value}
                              onChange={(e) => handleExtraChargeChange(key, e.target.value)}
                              type="text"
                              placeholder="Amount"
                              className="flex-1"
                              min={0}
                            />
                            <Button
                              variant="destructive"
                              onClick={() => handleDeleteExtraCharge(key)}
                            >
                              <X className="w-4 h-4 text-white" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </React.Fragment>
                  ) : (

                    <div>
                      {afterTripFields.map((field) => renderField(field, 'after'))}

                      {/* Driver Charges Section */}
                      {(editMode === 'after' || isManualCompleted) ? (
                        <div className="space-y-2 w-1/2">
                          <Label className="text-sm text-gray-600">Driver Charges</Label>
                          {Object.entries(driverCharges).filter(([key, value]) => Number(value) > 0).map(([key, value]) => (
                            <div key={key} className="flex justify-center items-center gap-2">
                              <span className="text-sm font-medium w-1/2">{capitalizeLabel(key)}</span>
                              <Input
                                value={value}
                                onChange={(e) => handleDriverChargeChange(key, e.target.value)}
                                type="text"
                                placeholder="Amount"
                                className="flex-1"
                                min={0}
                              />
                            </div>
                          ))}
                        </div>
                      ) : (
                        <>
                          {Object.keys(driverCharges).length > 0 && (
                            <div className="space-y-2 w-1/2">
                              <Label className="text-sm"><span className=' text-sm font-semibold'> Driver Charges : </span></Label>
                              {Object.entries(driverCharges).filter(([key, value]) => Number(value) > 0).map(([key, value]) => (
                                <div key={key} className="flex justify-between items-center gap-2 ">
                                  <span className="text-sm font-medium">{capitalizeLabel(key)}</span>
                                  <span className="text-sm font-medium">
                                    {formatCurrency(Number(value) || 0)}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </>
                      )}

                      {(editMode === 'after') ? (
                        <div className="space-y-2 w-2/3">
                          <Label className="text-sm text-gray-600">Extra Charges</Label>

                          {/* Add New Extra Charge Inputs */}
                          <div className="flex gap-2 mb-2">
                            <Input
                              value={newChargeKey}
                              onChange={(e) => setNewChargeKey(e.target.value)}
                              placeholder="Label"
                              className="w-1/2"
                            />
                            <Input
                              value={newChargeValue}
                              onChange={(e) => setNewChargeValue(e.target.value)}
                              type="text"
                              placeholder="Amount"
                              className="w-1/3"
                              min={0}
                            />
                            <Button
                              variant="secondary"
                              onClick={handleAddExtraCharge}
                            >
                              <Plus className="w-4 h-4 text-white" />
                            </Button>
                          </div>

                          {/* Existing Extra Charges List */}
                          {Object.entries(extraCharges).filter(([key, value]) => Number(value) > 0).map(([key, value]) => (
                            <div key={key} className="flex justify-center items-center gap-2">
                              <span className="text-sm font-medium w-1/2">{capitalizeLabel(key)}</span>
                              <Input
                                value={value}
                                onChange={(e) => handleExtraChargeChange(key, e.target.value)}
                                type="text"
                                placeholder="Amount"
                                className="flex-1"
                                min={0}
                              />
                              <Button
                                variant="destructive"
                                onClick={() => handleDeleteExtraCharge(key)}
                              >
                                <X className="w-4 h-4 text-white" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <>
                          {Object.keys(extraCharges).length > 0 && (
                            <div className="space-y-2 w-1/2">
                              <Label className="text-sm">
                                <span className="text-sm font-semibold">Extra Charges:</span>
                              </Label>
                              {Object.entries(extraCharges).filter(([key, value]) => Number(value) > 0).map(([key, value]) => (
                                <div key={key} className="flex justify-between items-center gap-2">
                                  <span className="text-sm font-medium">{capitalizeLabel(key)}</span>
                                  <span className="text-sm font-medium">
                                    {formatCurrency(Number(value) || 0)}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </>
                      )}

                      {editMode === 'after' && (
                        <div className="flex justify-end space-x-2 pt-4">
                          <Button variant="outline" onClick={handleCancel}>
                            Cancel
                          </Button>
                          <Button onClick={handleSave}>Save Changes</Button>
                        </div>
                      )}
                    </div>)
                  }

                </CardContent>
              </Card>}
          </div>

          {/* Trip Calculation Card (Full Width) */}
          {(booking.tripCompletedFinalAmount > 0 && isManualCompleted == false) && (
            <div className=' rounded-lg flex flex-col items-center gap-6'>

              {/* Trip Summary */}
              <Card className="bg-white border border-gray-200 w-2/3">
                <CardHeader className="pb-4 border-b text-center">
                  <h2 className="text-lg font-semibold text-gray-800">Trip Summary</h2>
                </CardHeader>
                <CardContent>
                  <div className="w-full mx-auto p-4 rounded-lg">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Total Distance</span>
                        <span>{formatDistance(formData?.tripCompletedDistance || booking?.tripCompletedDistance)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Per KM Price</span>
                        <span>{formatCurrency(Number(formData?.pricePerKm || booking?.pricePerKm) + Number(formData?.extraPricePerKm || booking?.extraPricePerKm))}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Km Price</span>
                        <span>{formatCurrency(formData?.tripCompletedEstimatedAmount || booking?.tripCompletedEstimatedAmount)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Driver Beta</span>
                        <span>{formatCurrency(formData?.tripCompletedDriverBeta || booking?.tripCompletedDriverBeta || 0)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>GST ({booking?.taxPercentage || 0}%)</span>
                        <span>{formatCurrency(booking?.tripCompletedTaxAmount)}</span>
                      </div>

                      {/* Driver Charges */}
                      {Object.entries(driverCharges)
                        .filter(([_, value]) => Number(value) > 0)
                        .map(([key, value]) => (
                          <div key={key} className="flex justify-between">
                            <span>{capitalizeLabel(key)}</span>
                            <span>{formatCurrency(Number(value) || 0)}</span>
                          </div>
                        ))}

                      {/* Extra Charges */}
                      {Object.entries(extraCharges)
                        .filter(([_, value]) => Number(value) > 0)
                        .map(([key, value]) => (
                          <div key={key} className="flex justify-between">
                            <span>{capitalizeLabel(key)}</span>
                            <span>{formatCurrency(Number(value) || 0)}</span>
                          </div>
                        ))}

                      <div className="flex justify-between">
                        <span>Platform Fee</span>
                        <span>{formatCurrency(formData?.convenienceFee || 0)}</span>
                      </div>

                      {/* Total Amount */}
                      <div className="border-t-4 border-double border-gray-400 pt-2">
                        <div className="flex justify-between font-bold">
                          <span>Total Amount</span>
                          <span>{formatCurrency(formData?.tripCompletedFinalAmount || booking?.tripCompletedFinalAmount || 0)}</span>
                        </div>
                      </div>

                      {booking?.advanceAmount > 0 && (
                        <div className="flex justify-between">
                          <span>Advance Amount</span>
                          <span className="text-red-500">- {formatCurrency(booking?.advanceAmount)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Deduction For Driver */}
              <Card className="bg-white border border-gray-200 w-2/3">
                <CardHeader className="pb-4 border-b text-center">
                  <h2 className="text-lg font-semibold text-gray-800">Deduction From Driver</h2>
                </CardHeader>
                <CardContent>
                  <div className="w-full mx-auto p-4 rounded-lg space-y-2">
                    <div className="flex justify-between">
                      <span>Trip Total Amount</span>
                      <span>{formatCurrency(booking?.tripCompletedFinalAmount || 0)}</span>
                    </div>
                    <div className="flex justify-between text-red-500">
                      {booking.createdBy === 'Vendor' ?
                        <span>Vendor Earnings</span> :
                        <span>Admin Commission Amount</span>
                      }
                      <span>- {formatCurrency(Number(booking?.driverDeductionAmount))}</span>
                    </div>
                    <div className="border-t-4 border-double border-gray-400 pt-2">
                      <div className="flex justify-between font-bold">
                        <span>Driver Total</span>
                        <span>
                          {formatCurrency((booking?.tripCompletedFinalAmount || 0) - (Number(booking?.driverDeductionAmount) || 0))}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Admin | Vendor Earnings */}
              {booking?.createdBy === 'Vendor' ?
                (
                  <>
                    <Card className="bg-white border border-gray-200 w-2/3">
                      <CardHeader className="pb-4 border-b text-center">
                        <h2 className="text-lg font-semibold text-gray-800">
                          Vendor Earnings
                        </h2>
                      </CardHeader>
                      <CardContent>
                        <div className="w-full mx-auto p-4 rounded-lg space-y-2">
                          {/* <div className="flex justify-between">
                            <span>GST ({booking?.taxPercentage || 0}%)</span>
                            <span>{formatCurrency(booking?.tripCompletedTaxAmount)}</span>
                          </div> */}
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-1">
                              <span>vendor Commission</span>
                              {
                                booking?.driverCommissionBreakup?.commissionPercentage > 0 &&
                                <span>{`(${booking?.driverCommissionBreakup?.commissionPercentage}%)`}</span>
                              }
                            </div>
                            <span>{formatCurrency(Number(booking?.driverCommissionBreakup?.commissionAmount))}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Extra Per Km Charge</span>
                            <span>{formatCurrency(booking?.driverCommissionBreakup?.extraPerKmCharge)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Extra Driver Beta</span>
                            <span>{formatCurrency(booking?.extraDriverBeta)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Extra Hill</span>
                            <span>{formatCurrency(booking?.extraHill)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Extra Permit</span>
                            <span>{formatCurrency(booking?.extraPermitCharge)}</span>
                          </div>
                          {booking?.tripCompletedTaxAmount > 0 && <div className="flex justify-between">
                            <span>GST ({booking?.taxPercentage || 0}%)</span>
                            <span>{formatCurrency(booking?.tripCompletedTaxAmount)}</span>
                          </div>}
                          <div className="flex justify-between">
                            <span>Platform Fee</span>
                            <span>{formatCurrency(booking?.convenienceFee)}</span>
                          </div>

                          <div className="flex justify-between text-red-500">
                            <span>Admin Earnings</span>
                            <span>- {formatCurrency(Number(booking?.driverDeductionAmount) - Number(booking?.vendorCommission))}</span>
                          </div>

                          <div className="border-t-4 border-double border-gray-400 pt-2">
                            <div className="flex justify-between font-bold">
                              <span>Total Amount</span>
                              <span>{formatCurrency(Number(booking?.vendorCommission))}</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="bg-white border border-gray-200 w-2/3">
                      <CardHeader className="pb-4 border-b text-center">
                        <h2 className="text-lg font-semibold text-gray-800">
                          Admin Earnings
                        </h2>
                      </CardHeader>
                      <CardContent>
                        <div className="w-full mx-auto p-4 rounded-lg space-y-2">
                          {booking?.tripCompletedTaxAmount > 0 && <div className="flex justify-between">
                            <span>GST ({booking?.taxPercentage || 0}%)</span>
                            <span>{formatCurrency(booking?.tripCompletedTaxAmount)}</span>
                          </div>}
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-1">
                              <span>Admin Commission</span>
                              {
                                Number(booking?.vendorCommissionBreakup?.adminCommissionPercentage) > 0 &&
                                <span>{`(${booking?.vendorCommissionBreakup?.adminCommissionPercentage}%)`}</span>
                              }
                            </div>
                            <span>{formatCurrency(Number(booking?.vendorCommissionBreakup?.adminCommission))}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-1">
                              <span>Vendor Extra Charge Commission</span>
                              <span>(10%)</span>
                            </div>
                            <span>{formatCurrency(Number(booking?.vendorCommissionBreakup?.extraPriceAdminCommission))}</span>
                          </div>
                          {/* <div className="flex justify-between">
                            <span>Extra Driver Beta</span>
                            <span>{formatCurrency(booking?.extraDriverBeta)}</span>
                          </div> */}
                          <div className="flex justify-between">
                            <span>Platform Fee</span>
                            <span>{formatCurrency(booking?.convenienceFee)}</span>
                          </div>

                          <div className="border-t-4 border-double border-gray-400 pt-2">
                            <div className="flex justify-between font-bold">
                              <span>Total Amount</span>
                              <span>{formatCurrency(Number(booking?.driverDeductionAmount) - Number(booking?.vendorCommission))}</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )
                : (<Card className="bg-white border border-gray-200 w-2/3">
                  <CardHeader className="pb-4 border-b text-center">
                    <h2 className="text-lg font-semibold text-gray-800">
                      Admin Earnings
                    </h2>
                  </CardHeader>
                  <CardContent>
                    <div className="w-full mx-auto p-4 rounded-lg space-y-2">
                      <div className="flex justify-between">
                        <span>GST ({booking?.taxPercentage || 0}%)</span>
                        <span>{formatCurrency(booking?.tripCompletedTaxAmount)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-1">
                          <span>Admin Commission</span>
                          <TooltipComponent name={`Commission Tax Amount = ${calculateCommissionTax()} `}>
                            <Info className="w-4 h-4" />
                          </TooltipComponent>
                        </div>
                        <span>{formatCurrency(Number(booking?.driverCommissionBreakup?.commissionAmount))}</span>
                      </div>
                      {booking?.convenienceFee && (
                        <div className="flex justify-between">
                          <span>Platform Fee</span>
                          <span>{formatCurrency(booking?.convenienceFee)}</span>
                        </div>
                      )}

                      {/* Extra Charges */}
                      {Object.entries(extraCharges)
                        .filter(([_, value]) => Number(value) > 0)
                        .map(([key, value]) => (
                          <div key={key} className="flex justify-between">
                            <span>{capitalizeLabel(key)}</span>
                            <span>{formatCurrency(Number(value) || 0)}</span>
                          </div>
                        ))}

                      <div className="border-t-4 border-double border-gray-400 pt-2">
                        <div className="flex justify-between font-bold">
                          <span>Total Amount</span>
                          <span>{formatCurrency(Number(booking?.driverDeductionAmount))}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>)}
            </div>
          )}

        </TabsContent>

        <TabsContent value="activity">
          <Card className="bg-white rounded-lg border border-gray-200">
            <CardHeader className="border-b">
              <h2 className="text-lg font-semibold text-gray-800">Activity Log</h2>
            </CardHeader>
            <CardContent className="p-4">
              <div className="text-center text-gray-500 py-8">No activity available</div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

    </div >
  );
}