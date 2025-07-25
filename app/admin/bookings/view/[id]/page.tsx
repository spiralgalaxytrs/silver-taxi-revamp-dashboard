'use client';
import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from 'components/ui/tabs';
import { Card, CardContent, CardHeader } from 'components/ui/card';
import { Label } from 'components/ui/label';
import { Button } from 'components/ui/button';
import { Input } from 'components/ui/input';
import { Dialog, DialogContent, DialogTrigger } from 'components/ui/dialog';
import { Eye, Edit, X, Loader2, Info, BookOpen, Plus } from 'lucide-react';
import { useParams } from 'next/navigation';
import { useFetchBookingById, useUpdateBooking } from 'hooks/react-query/useBooking';
import { toast } from 'sonner';
import TooltipComponent from 'components/others/TooltipComponent';
import { Booking } from 'types/react-query/booking';

// Formatters
const formatCurrency = (value: number | null | undefined) => `₹${value?.toLocaleString() || '0'}`;
const formatDistance = (value: number | null | undefined) => `${value || 0} km`;
const formatDateTime = (dateString: string | null | undefined) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleString('en-GB');
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
  const [driverCharges, setDriverCharges] = useState<Record<string, string>>({});
  const [extraCharges, setExtraCharges] = useState<Record<string, string>>({});

  const [newChargeKey, setNewChargeKey] = useState('');
  const [newChargeValue, setNewChargeValue] = useState('');


  const { data: booking, isLoading } = useFetchBookingById(bookingId || "");
  const { mutateAsync: updateBooking } = useUpdateBooking();

  useEffect(() => {
    if (!booking) return;

    // Defensive copying to avoid mutating query cache
    setFormData({ ...booking });

    // Ensure driverCharges is an object
    setDriverCharges(booking.driverCharges ?? {});

    // Ensure extraCharges is an object
    setExtraCharges(booking.extraCharges ?? {});
  }, [booking]);

  // Field groupings
  const basicInfoFields = [
    { key: 'bookingId', label: 'Booking ID' },
    { key: 'name', label: 'Name' },
    { key: 'phone', label: 'Phone' },
    { key: 'email', label: 'Email' },
    { key: 'serviceType', label: 'Service Type' },
    { key: 'pickupDateTime', label: 'Pickup Date & Time', format: formatDateTime },
    { key: 'pickup', label: 'Pickup Location' },
    { key: 'drop', label: 'Drop Location' },
    { key: 'paymentMethod', label: 'Payment Method' },
    { key: 'paymentStatus', label: 'Payment Status' },
    { key: 'vehicleType', label: 'Vehicle Type' },
    { key: 'createdBy', label: 'Created By' },
    { key: 'createdAt', label: 'Created Date & Time', format: formatDateTime },
    { key: 'status', label: 'Trip Status' },
    { key: 'taxPercentage', label: 'Tax Percentage', suffix: '%' },
  ];

  const beforeTripFields = [
    { key: 'distance', label: 'Total Km', format: formatDistance },
    { key: 'pricePerKm', label: 'Per Km', format: formatCurrency },
    { key: 'driverBeta', label: 'Driver Beta', format: formatCurrency },
    { key: 'duration', label: 'Total Duration' },
    { key: 'estimatedAmount', label: 'Estimation Fare', format: formatCurrency },
    { key: 'taxAmount', label: 'Tax Amount', format: formatCurrency },
    { key: 'discountAmount', label: 'Discount Amount', format: formatCurrency },
    { key: 'advanceAmount', label: 'Advance Amount', format: formatCurrency },
    { key: 'statePermit', label: 'State Permit', format: formatCurrency, optional: true },
    { key: 'tollCharges', label: 'Toll Charges', format: formatCurrency, optional: true },
    { key: 'hillCharges', label: 'Hill Charges', format: formatCurrency, optional: true },
    { key: 'finalAmount', label: 'Total Amount', format: formatCurrency },
    { key: 'remainingAmount', label: 'Remaining Amount', format: formatCurrency },
  ];

  const afterTripFields = [
    { key: 'tripCompletedDistance', label: 'Total Km', format: formatDistance },
    { key: 'pricePerKm', label: 'Per Km', format: formatCurrency },
    { key: 'driverBeta', label: 'Driver Beta', format: formatCurrency },
    { key: 'tripCompletedDuration', label: 'Total Duration' },
    { key: 'tripCompletedEstimatedAmount', label: 'Estimation Fare', format: formatCurrency },
    { key: 'tripCompletedTaxAmount', label: 'Tax Amount', format: formatCurrency },
    { key: 'statePermit', label: 'State Permit', format: formatCurrency, optional: true },
    { key: 'tollCharges', label: 'Toll Charges', format: formatCurrency, optional: true },
    { key: 'hillCharges', label: 'Hill Charges', format: formatCurrency, optional: true },
    { key: 'tripCompletedFinalAmount', label: 'Total Amount', format: formatCurrency },
  ];

  const nonEditableAfterFields = [
    'pricePerKm', 'tripCompletedDuration',
    'tripCompletedEstimatedAmount',
    "driverBeta",
    'tripCompletedFinalAmount', 'tripCompletedTaxAmount'
  ];

  const calculateEstimatedFare = (distance: number) => {
    if (!formData) return 0;
    return distance * (formData.pricePerKm || 0);
  };


  const calculateTotalAmount = (estimatedFare: number, taxAmount: number, driverBeta: number, charges = driverCharges, extraCharge = extraCharges) => {
    const chargesSum = Object.values(charges).reduce(
      (sum, charge) => sum + (parseFloat(charge) || 0),
      0
    );

    const extraChargesSum = Object.values(extraCharge).reduce(
      (sum, charge) => sum + (parseFloat(charge) || 0),
      0
    );

    return estimatedFare + chargesSum + taxAmount + driverBeta + extraChargesSum;
  };

  const handleEdit = (section: 'before' | 'after') => {
    setEditMode(section);
  };

  const handleSave = async () => {
    try {
      console.log('Extra charges:', extraCharges);
      if (formData && bookingId) {
        const data = {
          ...formData,
          driverCharges,
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
    }
    setEditMode(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    if (!formData) return;

    const value = e.target.value;
    const parsedValue =
      field.includes('Distance') || field.includes('Amount') || field.includes('Charge')
        ? parseFloat(value) || 0
        : value;

    setFormData((prev) => {
      if (!prev) return prev;

      const updated = { ...prev, [field]: parsedValue };

      if (editMode === 'after') {
        // If tripCompletedDistance is updated:
        const distance = field === 'tripCompletedDistance' ? parsedValue : updated.tripCompletedDistance;
        const estimatedFare = Number(distance) * (updated.pricePerKm || 0);
        const taxAmount = Number(((estimatedFare * Number(updated.taxPercentage || 0)) / 100).toFixed(0));

        // Always recalculate tripCompletedEstimatedAmount if distance changes:
        updated.tripCompletedEstimatedAmount = estimatedFare;
        updated.tripCompletedTaxAmount = taxAmount > 0 ? taxAmount : updated.tripCompletedTaxAmount || 0;
        const driverBeta = Number(updated.driverBeta) || 0;

        // Always recalculate tripCompletedFinalAmount fresh:
        const totalFinal = calculateTotalAmount(estimatedFare, taxAmount, driverBeta || 0, driverCharges);
        updated.tripCompletedFinalAmount = totalFinal;
      }

      return updated;
    });
  };


  const handleDriverChargeChange = (key: string, value: string) => {
    const newValue = value.replace(/[^0-9.]/g, ''); // Allow only numbers and decimal point
    const parsedValue = parseFloat(newValue) || 0;

    // Update driverCharges first
    setDriverCharges(prev => {
      const newCharges = { ...prev, [key]: parsedValue.toString() };

      // Then update formData based on the new charges
      setFormData(prevForm => {
        if (!prevForm) return prevForm;

        const estimatedFare = prevForm.tripCompletedEstimatedAmount ||
          calculateEstimatedFare(prevForm.tripCompletedDistance || 0);
        const taxAmount = Number(((estimatedFare * Number(prevForm.taxPercentage || 0)) / 100).toFixed(0));
        const driverBeta = Number(prevForm.driverBeta) || 0;
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
    const parsedValue = parseFloat(newValue) || 0;

    // Update driverCharges first
    setExtraCharges(prev => {
      const newCharges = { ...prev, [key]: parsedValue.toString() };

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
    const parsedValue = parseFloat(value) || 0;

    setExtraCharges(prev => {
      const newCharges = {
        ...prev,
        [newChargeKey]: parsedValue.toString(),
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



  const calculateCommisionTax = () => {

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

    const isEditable = !(
      section === 'after' &&
      editMode === 'after' &&
      nonEditableAfterFields.includes(field.key)
    );

    return (
      <div key={field.key} className="space-y-1">
        <Label className="text-sm text-gray-600">{field.label}</Label>
        {(section === 'before' || section === 'after') && editMode === section && isEditable ? (
          <Input
            value={value || ''}
            onChange={(e) => handleChange(e, field.key)}
            type={field.key.includes('Amount') || field.key.includes('Charge') || field.key.includes('Distance') ? 'number' : 'text'}
            min={field.key.includes('Distance') || field.key.includes('Amount') || field.key.includes('Charge') ? 0 : undefined}
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

  const isBeforeDisabled = booking?.status === 'Started' || booking?.status === 'Completed';
  const isAfterDisabled = booking?.endOdometerValue === 0 || booking?.endOdometerValue === null || booking?.status === 'Completed';

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon">
          {/* Back button icon would go here */}
        </Button>
        <h1 className="text-2xl font-bold text-gray-800">Trip Details</h1>
      </div>

      <Tabs defaultValue="details">
        <TabsList className="grid grid-cols-2 gap-2 mb-6">
          <TabsTrigger className="tabs-trigger" value="details">
            Trip Details
          </TabsTrigger>
          <TabsTrigger className="tabs-trigger" value="activity">
            Activity
          </TabsTrigger>
        </TabsList>

        <TabsContent value="details">
          {/* Basic Information Card (Full Width) */}
          <Card className="bg-white rounded-lg border border-gray-200 mb-6">
            <CardHeader className="pb-4 border-b">
              <h2 className="text-lg font-semibold text-gray-800">Basic Information</h2>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4">
              {basicInfoFields.map((field) => renderField(field, 'basic'))}
            </CardContent>
          </Card>

          {/* Before/After Trip Cards (Side by Side) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Before Trip Card */}
            <Card className="bg-white rounded-lg border border-gray-200">
              <div className="flex justify-between items-center p-4 border-b">
                <h2 className="text-lg font-semibold text-gray-800">Before Trip Details</h2>
                <div className="flex items-center gap-2">
                  {editMode === 'before' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleCancel}
                      className="text-red-500 hover:text-red-600"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit('before')}
                    disabled={isBeforeDisabled}
                    className={isBeforeDisabled ? 'text-gray-400' : 'text-blue-600 hover:text-blue-700'}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <CardContent className="p-4 space-y-4">
                {beforeTripFields.map((field) => renderField(field, 'before'))}

                {editMode === 'before' && (
                  <div className="flex justify-end space-x-2 pt-4">
                    <Button variant="outline" onClick={handleCancel}>
                      Cancel
                    </Button>
                    <Button onClick={handleSave}>Save Changes</Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* After Trip Card */}
            <Card className="bg-white rounded-lg border border-gray-200">
              <div className="flex justify-between items-center p-4 border-b">
                <h2 className="text-lg font-semibold text-gray-800">After Trip Details</h2>
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
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit('after')}
                    disabled={isAfterDisabled}
                    className={isAfterDisabled ? 'text-gray-400' : 'text-blue-600 hover:text-blue-700'}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <CardContent className="p-4 space-y-4">
                {afterTripFields.map((field) => renderField(field, 'after'))}

                {/* Driver Charges Section */}
                {editMode === 'after' ? (
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
                ) : (
                  <>
                    {Object.keys(driverCharges).length > 0 && (
                      <div className="space-y-2 w-1/2">
                        <Label className="text-sm"><span className=' text-sm font-semibold'> Driver Charges : </span></Label>
                        {Object.entries(driverCharges).map(([key, value]) => (
                          <div key={key} className="flex justify-between items-center gap-2 ">
                            <span className="text-sm font-medium">{capitalizeLabel(key)}</span>
                            <span className="text-sm font-medium">
                              {formatCurrency(parseFloat(value) || 0)}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}

                {editMode === 'after' ? (
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
                    {Object.entries(extraCharges).map(([key, value]) => (
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
                        {Object.entries(extraCharges).map(([key, value]) => (
                          <div key={key} className="flex justify-between items-center gap-2">
                            <span className="text-sm font-medium">{capitalizeLabel(key)}</span>
                            <span className="text-sm font-medium">
                              {formatCurrency(parseFloat(value) || 0)}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}


                {/* OTP and Odometer Sections */}
                < div className="grid grid-cols-2 gap-4" >
                  <div className="space-y-1">
                    <Label className="text-sm text-gray-600">Start OTP</Label>
                    <div className="font-medium">{booking?.startOtp || '-'}</div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-sm text-gray-600">End OTP</Label>
                    <div className="font-medium">{booking?.endOtp || '-'}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label className="text-sm text-gray-600">Start Odometer Value</Label>
                    <div className="font-medium">{booking?.startOdometerValue || '-'}</div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-sm text-gray-600">End Odometer Value</Label>
                    <div className="font-medium">{booking?.endOdometerValue || '-'}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label className="text-sm text-gray-600">Start Odometer</Label>
                    <ImagePreview src={booking?.startOdometerImage || null} alt="Start Odometer" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-sm text-gray-600">End Odometer</Label>
                    <ImagePreview src={booking?.endOdometerImage || null} alt="End Odometer" />
                  </div>
                </div>

                {editMode === 'after' && (
                  <div className="flex justify-end space-x-2 pt-4">
                    <Button variant="outline" onClick={handleCancel}>
                      Cancel
                    </Button>
                    <Button onClick={handleSave}>Save Changes</Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Trip Calculation Card (Full Width) */}
          {booking.tripCompletedFinalAmount > 0 && (
            <Card className="bg-white rounded-lg border border-gray-200">
              <CardHeader className="pb-4 border-b text-center">
                <h2 className="text-lg font-semibold text-gray-800">Trip Summary</h2>
              </CardHeader>
              <CardContent>
                <div className="flex justify-center">
                  <div className="w-full md:w-1/2 bg-gray-50 p-4 rounded-lg">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Total Distance</span>
                        <span>{formatDistance(formData?.tripCompletedDistance || booking?.tripCompletedDistance)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Per KM Price</span>
                        <span>{formatCurrency(formData?.pricePerKm || booking?.pricePerKm)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Base Fare</span>
                        <span>
                          {formatCurrency(formData?.tripCompletedEstimatedAmount || booking?.tripCompletedEstimatedAmount)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Driver Beta</span>
                        <span>{formatCurrency(booking?.driverBeta)}</span>
                      </div>
                      {/* <div className="flex justify-between">
                        <span>Offer Amount</span>
                        <span>{formatCurrency(0)}</span>
                      </div> */}
                      <div className="flex justify-between">
                        <span>GST ({booking?.taxPercentage || 0}%)</span>
                        <span>{formatCurrency(booking?.tripCompletedTaxAmount)}</span>
                      </div>

                      {/* Driver Charges Display */}
                      {Object.entries(driverCharges).map(([key, value]) => (
                        <div key={key} className="flex justify-between">
                          <span>{capitalizeLabel(key)}</span>
                          <span>{formatCurrency(parseFloat(value) || 0)}</span>
                        </div>
                      ))}

                      {Object.entries(extraCharges).map(([key, value]) => (
                        <div key={key} className="flex justify-between">
                          <span>{capitalizeLabel(key)}</span>
                          <span>{formatCurrency(parseFloat(value) || 0)}</span>
                        </div>
                      ))}

                      <div className="border-y border-gray-200 pt-2">
                        <div className="flex justify-between font-bold">
                          <span>Total Amount</span>
                          <span>
                            {formatCurrency(formData?.tripCompletedFinalAmount || booking?.tripCompletedFinalAmount || 0)}
                          </span>
                        </div>
                      </div>

                      {booking?.advanceAmount > 0 && (
                        <div className="flex justify-between">
                          <span>Advance Amount</span>
                          <span className='text-red-500'> {"-"} {formatCurrency(booking?.advanceAmount)}</span>
                        </div>
                      )}

                      {booking?.advanceAmount > 0 && (
                        <div className="flex justify-between font-bold">
                          <span>Remaining Amount</span>
                          <span>
                            {formatCurrency(((booking?.tripCompletedFinalAmount || 0) - (booking?.advanceAmount || 0)))}
                          </span>
                        </div>
                      )}

                      <div className="border-t border-gray-200 pt-2">
                        <br />
                        <h4 className="font-semibold mb-1">{booking?.createdBy}  Amount</h4>
                        <div className="space-y-1">
                          <div className="flex justify-between">
                            <span>GST ({booking?.taxPercentage || 0}%)</span>
                            <span>{formatCurrency(booking?.tripCompletedTaxAmount)}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-1">
                              <span>{booking?.createdBy}  Commission</span>
                              <TooltipComponent name={`Commission Tax Amount = ${calculateCommisionTax()} `}>
                                <Info className="w-4 h-4" />
                              </TooltipComponent>
                            </div>
                            <span>{formatCurrency(Number(booking?.driverDeductionAmount) - Number(booking?.tripCompletedTaxAmount))}</span>
                          </div>

                          <div className="border-t border-b border-gray-200 pt-2">
                            <div className="flex justify-between font-bold">
                              <span>Total Amount</span>
                              <span>{formatCurrency(Number(booking?.driverDeductionAmount))}</span>
                            </div>
                          </div>

                          {booking?.createdBy === "Vendor" && (
                            <>
                              <div className="flex justify-between">
                                <span>Admin Commission</span>
                                <span className='text-red-500'>- {formatCurrency(booking?.adminCommission)}</span>
                              </div>
                              <div className="border-t border-b border-gray-200 pt-2">
                                <div className="flex justify-between font-bold">
                                  <span>Total Amount</span>
                                  <span>{formatCurrency(Number((booking?.driverDeductionAmount) - booking?.adminCommission))}</span>
                                </div>
                              </div>
                            </>
                          )}
                        </div>

                        <br />

                        <h4 className="font-semibold mb-1">Driver Amount</h4>
                        <div className="space-y-1">
                          <div className="flex justify-between">
                            <span>Trip Total Amount</span>
                            <span>{formatCurrency((booking?.tripCompletedFinalAmount || 0))}</span>
                          </div>

                          <div className="flex justify-between text-red-500">
                            <span>{booking?.createdBy} Commission Amount</span>
                            <span>-{formatCurrency(Number(booking?.driverDeductionAmount))}</span>
                          </div>

                          {/* {Object.entries(driverCharges).map(([key, value]) => (
                          <div key={key} className="flex justify-between">
                            <span>{capitalizeLabel(key)}</span>
                            <span>{formatCurrency(parseFloat(value) || 0)}</span>
                          </div>
                        ))} */}

                          <div className="border-t border-gray-200 pt-2">
                            <div className="flex justify-between font-bold">
                              <span>Driver Total</span>
                              <span>
                                {formatCurrency((booking?.tripCompletedFinalAmount || 0) - (Number(booking?.driverDeductionAmount) || 0))}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
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