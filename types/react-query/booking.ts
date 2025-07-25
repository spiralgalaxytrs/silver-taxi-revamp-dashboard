export interface Booking {
  bookingId?: string;
  name: string;
  phone: string;
  email: string;
  pickup: string;
  drop: string;
  pickupDate: string;
  pickupTime: string;
  vehicleType: string;
  discountAmount: number | null;
  dropDate: string | null;
  tariffId: string;
  driverId: string | null;
  vendorId: string;
  vehicleId: string | null;
  serviceId: string;
  packageId: string;
  driverBeta: number | null;
  toll: number | null;
  hill: number | null;
  permitCharge: number | null;
  taxPercentage: number | null;
  price: number | null;
  extraPrice: number | null;
  distanceLimit: number | null;
  distance: number | null;
  estimatedAmount: number | null;
  finalAmount: number | null;
  advanceAmount: number | null;
  upPaidAmount: number | null;
  offerId?: string | null;
  offerName?: string;
  pricePerKm: number | null;
  duration: string | null;
  paymentMethod: "UPI" | "Bank" | "Cash" | "Card";
  type: "Website" | "App" | "Manual";
  paymentStatus: "Unpaid" | "Paid" | "Partial Paid";
  serviceType: "One way" | "Round trip" | "Airport Pickup" | "Airport Drop" | "Day Packages" | "Hourly Packages";
  vehicleName: string;
  amount: number | null;
  bookingDate: string;
  status: "Completed" | "Cancelled" | "Not-Started" | "Started";
  createdBy: "Admin" | "Vendor";
  createdAt?: string | null;
  offers: Record<string, any>;
  vehicles: Record<string, any>;
  driver: Record<string, any>;

  startOtp: string;
  endOtp: string;
  tripStartedTime?: Date;
  tripCompletedTime?: Date;
  startOdometerImage?: string | null;
  endOdometerImage?: string | null;
  startOdometerValue?: number;
  endOdometerValue?: number;
  driverCharges?: any;
  driverAccepted?: "accepted" | "rejected" | "pending";
  tripCompletedPrice?: number;
  tripCompletedDuration?: string;
  tripCompletedFinalAmount?: number;
  tripCompletedTaxAmount?: number;
  tripCompletedDistance?: number;
  tripCompletedEstimatedAmount?: number;
  driverDeductionAmount?: number;
  vendorDeductionAmount?: number;
  bookingOrderId?: string;
  bookingPaymentId?: string;
  acceptTime?: Date;
  requestSentTime?: Date;

  adminCommission?: number;
  vendorCommission?: number;
}

