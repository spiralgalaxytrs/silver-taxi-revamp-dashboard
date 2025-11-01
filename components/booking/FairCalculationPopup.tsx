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
    hill?: number;
    permitCharge?: number;
    driverBeta?: number;
    extraDriverBeta?: number;
    pricePerKm?: number;
    extraPricePerKm?: number;
    pickup?: string;
    drop?: string;
    pickupDateTime?: string;
    dropDate?: string;
    vehicleType?: string;
    serviceType?: ServiceType; // Updated to use ServiceType
    vehicleId?: string;
    stops?: Array<{ stop?: string }>;
  } | null;
}

export function FairCalculationPopup({ isOpen, onClose, fareData, createdBy }: FairCalculationPopupProps) {
  const formatCurrency = (value: number | null | undefined) => `₹${value?.toLocaleString() || '0'}`;
  const router = useRouter();
  if (!fareData) return null;

  const { fareBreakdown, distance, duration, days, minKm } = fareData;
  const normalFare = fareBreakdown.normalFare;
  const modifiedFare = fareBreakdown.modifiedFare;
 
  console.log("fareData", )

  const { data: vehicle = null } = useVehicleById(fareData.vehicleId || "");

  const { mutate: createBooking, isPending: isCreatePending } = useCreateBooking();


  const handleSubmit = () => {
    try {
      createBooking(fareData, {
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
      <DialogContent className="max-w-md max-h-[80vh] p-0 overflow-hidden flex flex-col">
        <div className="relative flex-1 overflow-y-auto">
          {/* Header */}
          <div>
            <div className="flex justify-between items-center p-6">
              <DialogTitle className="text-xl font-semibold ">Fare Calculation</DialogTitle>
            </div>
            <div className="px-6 py-2 flex justify-between items-center gap-6">
              <div className="flex flex-col items-center px-4 gap-2 bg-blue-200 p-3 rounded-lg w-1/2 shadow-xl">
                <div className="flex items-center gap-2">
                  <User className="h-6 w-6 text-blue-500 rounded-full bg-stone-50 p-1" />
                  <p className="text-sm font-medium text-gray-500">Customer Name</p>
                </div>
                <p className="text-sm text-gray-800">{fareData.name || 'Not specified'}</p>
              </div>
              <div className="flex flex-col items-center px-4 gap-2 bg-violet-200 p-3 rounded-lg w-1/2 shadow-xl">
                <div className="flex items-center gap-2 ">
                  <Phone className="h-6 w-6 text-violet-500 rounded-full bg-stone-50 p-1" />
                  <p className="text-sm font-medium text-gray-500">Phone Number</p>
                </div>
                <p className="text-sm text-gray-800">{fareData.phone?.split(" ").pop() || 'Not specified'}</p>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="p-6 space-y-6">
            {/* Trip Details */}
            <div className="space-y-4 mb-6">
              <h3 className="font-medium flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <line x1="16" y1="17" x2="8" y2="17"></line>
                  <polyline points="10 9 9 9 8 9"></polyline>
                </svg>
                Trip Details
              </h3>
              <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                <div className="space-y-6">
                  {/* Pickup Location */}
                  <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-lg">
                    <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
                      <MapPin className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-500 mb-1">Pickup Location</p>
                      <p className="text-gray-800">{fareData.pickup || 'Not specified'}</p>
                    </div>
                  </div>
                  
                  {/* Stop Location */}
                  {fareData.stops && fareData.stops.length > 0 && (
                    fareData.stops.map((item: { stop?: string }, index: number) => (
                      <div
                        key={index}
                        className="flex items-start gap-4 p-4 bg-blue-50 rounded-lg"
                      >
                        <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
                          <Route className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-500 mb-1">
                            Stop Location {index + 1}
                          </p>
                          <p className="text-gray-800">
                            {item.stop ? (
                              <>
                                {item.stop.split(",")[0]}, {item.stop.split(",")[1]}, {item.stop.split(",")[2]}
                              </>
                            ) : "Not specified"}
                          </p>
                        </div>
                      </div>
                    ))
                  )}

                  {/* Drop Location */}
                  <div className="flex items-start gap-4 p-4 bg-green-50 rounded-lg">
                    <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center text-green-600">
                      <MapPin className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-500 mb-1">Drop Location</p>
                      <p className="text-gray-800">{fareData.drop || 'Not specified'}</p>
                    </div>
                  </div>

                  {/* Trip Details Grid */}
                  <div className="grid grid-cols-1 gap-1">
                    {/* Date & Time */}
                    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                      <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center text-purple-600">
                        <Calendar className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500 mb-1">Date & Time</p>
                        <p className="text-gray-800">
                          {fareData.pickupDateTime ? new Date(fareData.pickupDateTime).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          }) : 'Not specified'}
                          <span className="mx-2">•</span>
                          {fareData.pickupDateTime ? new Date(fareData.pickupDateTime).toLocaleTimeString('en-IN', {
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: true
                          }) : 'Not specified'}
                        </p>
                      </div>
                    </div>

                    {fareData.dropDate && fareData.serviceType === "Round trip" && (
                      <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                        <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center text-purple-600">
                          <Calendar className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500 mb-1">Drop Date</p>
                          <p className="text-gray-800">
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
                    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                      <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-amber-100 flex items-center justify-center text-amber-600">
                        <Briefcase className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500 mb-1">Service Type</p>
                        <p className="text-gray-800 capitalize">{fareData.serviceType?.toLowerCase() || 'standard'}</p>
                      </div>
                    </div>

                    {/* Vehicle Type */}
                    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                      <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600">
                        <Car className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500 mb-1">Vehicle</p>
                        <p className="text-gray-800">{vehicle?.name || 'Standard'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4 bg-neutral-100 shadow-xl rounded-lg p-4">
              <h3 className="font-medium flex items-center gap-3">
                <Wallet className="w-4 h-4" />
                <span>Estimation Fare</span>
              </h3>
              <div className="flex justify-between">
                <span>Distance</span>
                <span>{fareData.fareBreakdown?.normalFare?.distance}Km</span>
              </div>
              <div className="flex justify-between">
                <span>Minimum Km</span>
                <span>
                  {fareData.serviceType === "Round trip" && (fareData?.days || 0) > 1 && (typeof fareData?.minKm === 'number' && fareData?.minKm > 0)
                    ? `${fareData?.minKm || 0} Km * ${fareData?.days || 0} days`
                    : `${typeof fareData?.minKm === 'number' ? fareData?.minKm : 0} Km`}
                </span>
              </div>
              <div className="flex justify-between">
                <span>No of Days</span>
                <span>{fareData?.fareBreakdown?.normalFare?.days || 0}</span>
              </div>
              <div className="flex justify-between">
                <span>Price Per Km</span>
                <span>{formatCurrency(fareData?.fareBreakdown?.normalFare?.pricePerKm)}</span>
              </div>
              <div className="flex justify-between">
                <span>Driver Beta</span>
                <span>
                  {fareData.serviceType === "Round trip" && (fareData?.days || 0) > 1 && (fareData?.driverBeta || 0) > 0
                    ? `${formatCurrency(fareData?.driverBeta || 0)}* ${fareData?.days || 0} days`
                    : `${formatCurrency(fareData?.driverBeta || 0)} `}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Hill</span>
                <span>{formatCurrency(fareData?.fareBreakdown?.normalFare?.hill)}</span>
              </div>
              <div className="flex justify-between">
                <span>Permit Charge</span>
                <span>{formatCurrency(fareData?.fareBreakdown?.normalFare?.permitCharge)}</span>
              </div>
              <div className="flex justify-between border-t border-dashed">
                <span>Final Amount</span>
                <span>{formatCurrency(fareData?.fareBreakdown?.normalFare?.finalAmount)}</span>
              </div>
            </div>

            <div className="space-y-4 bg-indigo-100 shadow-xl rounded-lg p-4">
              <h3 className="font-medium flex items-center gap-3">
                <Wallet className="w-4 h-4" />
                <span>Admin Fare</span>
              </h3>
              <div className="flex justify-between">
                <span>Distance</span>
                <span>{fareData?.fareBreakdown?.modifiedFare?.distance || 0}Km</span>
              </div>
              <div className="flex justify-between">
                <span>Minimum Km</span>
                <span>
                  {fareData.serviceType === "Round trip" && (fareData?.days || 0) > 1 && (typeof fareData?.extraMinKm === 'number' && fareData?.extraMinKm > 0)
                    ? `${fareData?.extraMinKm || 0} Km * ${fareData?.days || 0} days`
                    : `${typeof fareData?.extraMinKm === 'number' ? fareData?.extraMinKm : 0} Km`}
                </span>
              </div>
              <div className="flex justify-between">
                <span>No of Days</span>
                <span>{fareData?.fareBreakdown?.modifiedFare?.days || 0}</span>
              </div>
              <div className="flex justify-between">
                <span>Price Per Km</span>
                <span>{formatCurrency(fareData?.fareBreakdown?.modifiedFare?.pricePerKm || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span>Driver Beta</span>
                <span>
                  {fareData.serviceType === "Round trip" && (fareData?.days || 0) > 1 && (fareData?.extraDriverBeta || 0) > 0
                    ? `${formatCurrency(fareData?.extraDriverBeta || 0)} * ${fareData?.days || 0} days`
                    : `${formatCurrency(fareData?.extraDriverBeta || 0)}`}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Hill</span>
                <span>{formatCurrency(fareData?.fareBreakdown?.modifiedFare?.hill || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span>Permit Charge</span>
                <span>{formatCurrency(fareData?.fareBreakdown?.modifiedFare?.permitCharge || 0)}</span>
              </div>
              <div className="flex justify-between border-t border-dashed">
                <span>Final Amount</span>
                <span>{formatCurrency(fareData?.fareBreakdown?.modifiedFare?.finalAmount || 0)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="sticky bottom-0 bg-white border-t p-4">
          <div className="flex flex-row space-y-1 w-full justify-between items-center gap-2">
            <Button
              variant="outline"
              size="lg"
              className="w-1/2 h-12"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="lg"
              className="w-1/2 h-12"
              onClick={handleSubmit}
            >
              Create Booking
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default FairCalculationPopup;