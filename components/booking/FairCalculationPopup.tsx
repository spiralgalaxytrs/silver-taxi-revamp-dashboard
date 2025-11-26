import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { X, Info, User, Phone, MapPin, Calendar, Briefcase, Car, Wallet, Route } from 'lucide-react';
import { useVehicleById } from 'hooks/react-query/useVehicle';
import { useCreateBooking } from 'hooks/react-query/useBooking';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

// Define the type for ServiceType
type ServiceType = "One way" | "Round trip" | "Airport Pickup" | "Airport Drop" | "Day Packages" | "Hourly Packages";

interface FareBreakdown {
  normalFare: {
    distance: number;
    pricePerKm: number;
    driverBeta: number;
    toll: number;
    hill: number;
    permitCharge: number;
    estimatedAmount: number;
    finalAmount: number;
    days?: number;
    minKm?: number;
  };
  modifiedFare?: {
    distance: number;
    pricePerKm: number;
    driverBeta: number;
    toll: number;
    hill: number;
    permitCharge: number;
    estimatedAmount: number;
    finalAmount: number;
    days?: number;
    minKm?: number;
  };
}

interface FairCalculationPopupProps {
  isOpen: boolean;
  onClose: () => void;
  createdBy: string;
  fareData: {
    name?: string;
    phone?: string;
    email?: string | null;
    distance: number;
    duration: string;
    estimatedAmount: number;
    finalAmount: number;
    fareBreakdown: FareBreakdown;
    taxAmount: number;
    taxPercentage: number;
    convenienceFee: number;
    days?: number;
    minKm?: number | string;
    extraMinKm?: number | string;
    toll?: number;
    extraToll?: number;
    hill?: number;
    extraHill?: number;
    permitCharge?: number;
    extraPermitCharge?: number;
    driverBeta?: number;
    extraDriverBeta?: number;
    pricePerKm?: number;
    extraPricePerKm?: number;
    pickup?: string;
    drop?: string;
    pickupDateTime?: string;
    dropDate?: string | null;
    vehicleType?: string;
    serviceType?: ServiceType;
    vehicleId?: string;
    serviceId?: string;
    enquiryId?: string | null;
    offerId?: string | null;
    packageId?: string;
    packageType?: string;
    status?: string;
    type?: string;
    paymentMethod?: string;
    paymentStatus?: string;
    advanceAmount?: number;
    discountAmount?: number;
    upPaidAmount?: number;
    price?: number;
    extraPrice?: number;
    distanceLimit?: number;
    createdBy?: string;
    stops?: Array<any> | string[];
    breakFareDetails?: any;
    [key: string]: any; // Allow additional fields from API response
  } | null;
}

export function FairCalculationPopup({ isOpen, onClose, fareData, createdBy }: FairCalculationPopupProps) {
  const formatCurrency = (value: number | null | undefined) => `₹${value?.toLocaleString() || '0'}`;
  const router = useRouter();
  if (!fareData) return null;

  const { fareBreakdown, distance, duration, days, minKm } = fareData;
  const normalFare = fareBreakdown.normalFare;
  const modifiedFare = fareBreakdown.modifiedFare;

  // console.log("fareData >>>>>", fareData);

  const { data: vehicle = null } = useVehicleById(fareData.vehicleId || "");

  const { mutate: createBooking, isPending: isCreatePending } = useCreateBooking();


  const handleSubmit = () => {
    try {
      // Map all fields from fare-calculation response to booking/create payload
      // The fareData already contains all fields from the API response
      const bookingPayload: any = {
        ...fareData,
        // Ensure stops are properly formatted
        stops: Array.isArray(fareData.stops)
          ? fareData.stops.map((stop: any) => typeof stop === 'string' ? stop : stop?.stop || stop?.location || stop)
          : [],
        // Ensure all numeric fields are numbers
        distance: Number(fareData.distance) || 0,
        estimatedAmount: Number(fareData.estimatedAmount) || 0,
        finalAmount: Number(fareData.finalAmount) || 0,
        upPaidAmount: Number(fareData.upPaidAmount) || fareData.finalAmount || 0,
        discountAmount: Number(fareData.discountAmount) || 0,
        advanceAmount: Number(fareData.advanceAmount) || 0,
        price: Number(fareData.estimatedAmount) || 0,
        extraPrice: Number(fareData.extraPricePerKm) || 0,
        extraPricePerKm: Number(fareData.extraPricePerKm) || 0,
        pricePerKm: Number(fareData.pricePerKm) || 0,
        driverBeta: Number(fareData.driverBeta) || 0,
        extraDriverBeta: Number(fareData.extraDriverBeta) || 0,
        hill: Number(fareData.hill) || 0,
        extraHill: Number(fareData.extraHill) || 0,
        permitCharge: Number(fareData.permitCharge) || 0,
        extraPermitCharge: Number(fareData.extraPermitCharge) || 0,
        toll: Number(fareData.toll) || 0,
        extraToll: Number(fareData.extraToll) || 0,
        taxAmount: Number(fareData.taxAmount) || 0,
        taxPercentage: Number(fareData.taxPercentage) || 0,
        convenienceFee: Number(fareData.convenienceFee) || 0,
        days: fareData.days || null,
        minKm: fareData.minKm || null,
        // Ensure breakFareDetails/fareBreakdown is included
        breakFareDetails: fareData.fareBreakdown || {},
        fareBreakdown: fareData.fareBreakdown || {},
      };

      // Remove undefined or null values to clean up payload
      Object.keys(bookingPayload).forEach(key => {
        if (bookingPayload[key] === undefined || bookingPayload[key] === null || bookingPayload[key] === '') {
          if (key !== 'enquiryId' && key !== 'offerId' && key !== 'dropDate' && key !== 'email') {
            delete bookingPayload[key];
          }
        }
      });

      createBooking(bookingPayload, {
        onSuccess: (data: any) => {
          toast.success(data?.message || 'Booking created successfully', {
            style: {
              backgroundColor: "#009F7F",
              color: "#fff",
            },
          });
          onClose();
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
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to save booking", {
        style: {
          backgroundColor: "#FF0000",
          color: "#fff",
        },
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-5xl max-h-[95vh] p-0 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex-shrink-0 border-b px-6 py-4">
          <div className="flex justify-between items-center">
            <DialogTitle className="text-xl font-semibold">Fare Calculation</DialogTitle>
          </div>
          <div className="flex justify-between items-center gap-4 mt-4">
            <div className="flex flex-col px-3 gap-1 bg-blue-100 p-2 rounded-lg flex-1">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-blue-600" />
                <p className="text-xs font-medium text-gray-600">Customer Name</p>
              </div>
              <p className="text-sm text-gray-800 font-medium">{fareData.name || 'Not specified'}</p>
            </div>
            <div className="flex flex-col px-3 gap-1 bg-violet-100 p-2 rounded-lg flex-1">
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-violet-600" />
                <p className="text-xs font-medium text-gray-600">Phone Number</p>
              </div>
              <p className="text-sm text-gray-800 font-medium">{fareData.phone?.split(" ").pop() || 'Not specified'}</p>
            </div>
          </div>
        </div>

        {/* Main Content - Scrollable */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="space-y-4">
            {/* Trip Details */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <line x1="16" y1="17" x2="8" y2="17"></line>
                  <polyline points="10 9 9 9 8 9"></polyline>
                </svg>
                Trip Details
              </h3>
              <div className="bg-white p-4 rounded-lg border border-gray-100">
                <div className="grid grid-cols-2 gap-3">
                  {/* Pickup Location */}
                  <div className="flex items-start gap-2 p-2 bg-blue-50 rounded-lg">
                    <MapPin className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-500">Pickup Location</p>
                      <p className="text-sm text-gray-800 truncate">{fareData.pickup || 'Not specified'}</p>
                    </div>
                  </div>

                  {/* Drop Location */}
                  <div className="flex items-start gap-2 p-2 bg-green-50 rounded-lg">
                    <MapPin className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-500">Drop Location</p>
                      <p className="text-sm text-gray-800 truncate">{fareData.drop || 'Not specified'}</p>
                    </div>
                  </div>

                  {/* Stop Locations */}
                  {fareData.stops && fareData.stops.length > 0 && (
                    fareData.stops.map((item: string, index: number) => (
                      <div key={index} className="flex items-start gap-2 p-2 bg-blue-50 rounded-lg col-span-2">
                        <Route className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-gray-500">Stop {index + 1}</p>
                          <p className="text-sm text-gray-800 truncate">
                            {item ? item : "Not specified"}
                          </p>
                        </div>
                      </div>
                    ))
                  )}

                  {/* Date & Time */}
                  <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                    <Calendar className="h-4 w-4 text-purple-600 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-500">Date & Time</p>
                      <p className="text-sm text-gray-800">
                        {fareData.pickupDateTime ? new Date(fareData.pickupDateTime).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        }) + ' • ' + new Date(fareData.pickupDateTime).toLocaleTimeString('en-IN', {
                          hour: '2-digit',
                          minute: '2-digit',
                          hour12: true
                        }) : 'Not specified'}
                      </p>
                    </div>
                  </div>

                  {fareData.dropDate && fareData.serviceType === "Round trip" && (
                    <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                      <Calendar className="h-4 w-4 text-purple-600 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-500">Drop Date</p>
                        <p className="text-sm text-gray-800">
                          {new Date(fareData.dropDate).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Service Type */}
                  <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                    <Briefcase className="h-4 w-4 text-amber-600 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-500">Service Type</p>
                      <p className="text-sm text-gray-800 capitalize">{fareData.serviceType?.toLowerCase() || 'standard'}</p>
                    </div>
                  </div>

                  {/* Vehicle Type */}
                  <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                    <Car className="h-4 w-4 text-indigo-600 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-500">Vehicle</p>
                      <p className="text-sm text-gray-800">{vehicle?.name || fareData.vehicleType || 'Standard'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Fare Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Normal Fare */}
              <div className="space-y-2 bg-neutral-100 rounded-lg p-3">
                <h3 className="text-sm font-semibold flex items-center gap-2 mb-3">
                  <Wallet className="w-4 h-4" />
                  <span>Estimation Fare</span>
                </h3>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Distance</span>
                    <span className="font-medium">{fareData.fareBreakdown?.normalFare?.distance}Km</span>
                  </div>
                  {((fareData?.fareBreakdown?.normalFare?.minKm || 0) > 0) && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Minimum Km</span>
                      <span className="font-medium">
                        {fareData.serviceType === "Round trip" && (fareData?.days || 0) > 1
                          ? `${fareData?.minKm || 0} Km × ${fareData?.days || 0} days`
                          : `${fareData?.minKm || 0} Km`}
                      </span>
                    </div>
                  )}
                  {fareData?.duration && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Duration</span>
                      <span className="font-medium">{fareData?.duration || "1 Hour 30 Minutes"}</span>
                    </div>
                  )}
                  {(fareData?.fareBreakdown?.normalFare?.days || 0) > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">No of Days</span>
                      <span className="font-medium">{fareData?.fareBreakdown?.normalFare?.days || 0}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600">Price Per Km</span>
                    <span className="font-medium">{formatCurrency(fareData?.fareBreakdown?.normalFare?.pricePerKm)}</span>
                  </div>
                  {(fareData?.driverBeta || 0) > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Driver Beta</span>
                      <span className="font-medium">
                        {fareData.serviceType === "Round trip" && (fareData?.days || 0) > 1
                          ? `${formatCurrency((fareData?.driverBeta || 0) / (fareData?.days || 1))} × ${fareData?.days || 1} days`
                          : formatCurrency(fareData?.driverBeta || 0)}
                      </span>
                    </div>
                  )}
                  {fareData?.fareBreakdown?.normalFare?.hill > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Hill</span>
                      <span className="font-medium">{formatCurrency(fareData?.fareBreakdown?.normalFare?.hill)}</span>
                    </div>
                  )}
                  {fareData?.fareBreakdown?.normalFare?.permitCharge > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Permit Charge</span>
                      <span className="font-medium">{formatCurrency(fareData?.fareBreakdown?.normalFare?.permitCharge)}</span>
                    </div>
                  )}
                  {(fareData?.toll || 0) > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Toll</span>
                      <span className="font-medium">{formatCurrency(fareData?.toll || 0)}</span>
                    </div>
                  )}
                  <div className="flex justify-between border-t border-gray-300 pt-1.5 mt-2">
                    <span className="text-sm font-semibold text-gray-800">Final Amount</span>
                    <span className="text-sm font-bold text-gray-900">{formatCurrency(fareData?.fareBreakdown?.normalFare?.finalAmount)}</span>
                  </div>
                </div>
              </div>

              {/* Modified Fare */}
              {(fareData?.fareBreakdown?.modifiedFare
                // && [
                //   fareData?.extraDriverBeta,
                //   fareData?.extraPermitCharge,
                //   fareData?.extraToll,
                //   fareData?.extraHill
                // ].some(v => v ? v > 0 : false)
              ) && (
                  <div className="space-y-2 bg-indigo-100 rounded-lg p-3">
                    <h3 className="text-sm font-semibold flex items-center gap-2 mb-3">
                      <Wallet className="w-4 h-4" />
                      <span>Admin Fare</span>
                    </h3>
                    <div className="space-y-1.5 text-xs">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Distance</span>
                        <span className="font-medium">{fareData?.fareBreakdown?.modifiedFare?.distance || 0}Km</span>
                      </div>
                      {((fareData?.fareBreakdown?.modifiedFare?.minKm || 0) > 0) && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Minimum Km</span>
                          <span className="font-medium">
                            {fareData.serviceType === "Round trip" && (fareData?.days || 0) > 1
                              ? `${fareData?.fareBreakdown?.modifiedFare?.minKm || 0} Km × ${fareData?.days || 0} days`
                              : `${fareData?.fareBreakdown?.modifiedFare?.minKm || 0} Km`}
                          </span>
                        </div>
                      )}
                      {fareData?.duration && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Duration</span>
                          <span className="font-medium">{fareData?.duration || "1 Hour 30 Minutes"}</span>
                        </div>
                      )}
                      {(fareData?.fareBreakdown?.modifiedFare?.days || 0) > 0 && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">No of Days</span>
                          <span className="font-medium">{fareData?.fareBreakdown?.modifiedFare?.days || 0}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-gray-600">Price Per Km</span>
                        <span className="font-medium">{formatCurrency(fareData?.fareBreakdown?.modifiedFare?.pricePerKm || 0)}</span>
                      </div>
                      {(fareData?.fareBreakdown?.modifiedFare?.driverBeta || 0) > 0 && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Driver Beta</span>
                          <span className="font-medium">
                            {fareData.serviceType === "Round trip" && (fareData?.days || 0) > 1
                              ? `${formatCurrency((fareData?.fareBreakdown?.modifiedFare?.driverBeta || 0) / (fareData?.days || 1))} × ${fareData?.days || 1} days`
                              : formatCurrency(fareData?.fareBreakdown?.modifiedFare?.driverBeta || 0)}
                          </span>
                        </div>
                      )}
                      {fareData?.fareBreakdown?.modifiedFare?.hill > 0 && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Hill</span>
                          <span className="font-medium">{formatCurrency(fareData?.fareBreakdown?.modifiedFare?.hill)}</span>
                        </div>
                      )}
                      {fareData?.fareBreakdown?.modifiedFare?.permitCharge > 0 && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Permit Charge</span>
                          <span className="font-medium">{formatCurrency(fareData?.fareBreakdown?.modifiedFare?.permitCharge)}</span>
                        </div>
                      )}
                      {(fareData?.extraToll || 0) > 0 && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Toll</span>
                          <span className="font-medium">{formatCurrency(fareData?.extraToll || 0)}</span>
                        </div>
                      )}
                      <div className="flex justify-between border-t border-gray-300 pt-1.5 mt-2">
                        <span className="text-sm font-semibold text-gray-800">Final Amount</span>
                        <span className="text-sm font-bold text-gray-900">{formatCurrency(fareData?.fareBreakdown?.modifiedFare?.finalAmount || 0)}</span>
                      </div>
                    </div>
                  </div>
                )}
            </div>
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="flex-shrink-0 border-t bg-white p-4">
          <div className="flex flex-row w-full justify-between items-center gap-3">
            <Button
              variant="outline"
              size="lg"
              className="flex-1 h-11"
              onClick={onClose}
              disabled={isCreatePending}
            >
              Cancel
            </Button>
            <Button
              variant="default"
              size="lg"
              className="flex-1 h-11 bg-green-600 hover:bg-green-700"
              onClick={handleSubmit}
              disabled={isCreatePending}
            >
              {isCreatePending ? 'Creating...' : 'Create Booking'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default FairCalculationPopup;