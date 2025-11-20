export interface Booking {
  bookingId?: string;
  name: string;
  phone: string;
  email: string;
  pickup: string;
  drop: string;
  stops: string[];
  pickupDateTime: string;
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
  extraToll: number | null;
  hill: number | null;
  extraHill: number | null;
  permitCharge: number | null;
  extraPermitCharge: number | null;
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
  extraPricePerKm: number | null;
  duration: string | null;
  paymentMethod: "UPI" | "Bank" | "Cash" | "Card";
  type: "Website" | "App" | "Manual";
  paymentStatus: "Unpaid" | "Paid" | "Partial Paid";
  serviceType: "One way" | "Round trip" | "Airport Pickup" | "Airport Drop" | "Day Packages" | "Hourly Packages";
  vehicleName: string;
  amount: number | null;
  bookingDate: string;
  status: "Completed" | "Cancelled" | "Not-Started" | "Started" | "Reassign" | "Manual Completed" | "Booking Confirmed";
  createdBy: "Admin" | "Vendor" | "User";
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
  tripCompletedDriverBeta?: number;
  driverDeductionAmount?: number;
  vendorDeductionAmount?: number;
  bookingOrderId?: string;
  bookingPaymentId?: string;
  acceptTime?: Date;
  requestSentTime?: Date;

  adminCommission?: number;
  vendorCommission?: number;

  geoLocation?: any;
  isContacted?: boolean;

  lastAdminNotifyTime?: Date;

  normalFare?: any;
  modifiedFare?: any;
  driverCommissionBreakup?: any;
  vendorCommissionBreakup?: any;

  commissionTaxPercentage?: number;
  minKm?: number;

  convenienceFee?: number;
}

export interface GetBookingsParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  isContacted?: boolean;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  adminId?: string;
}

export interface BookingsResponse {
  bookings: Booking[];
  bookingsCount: {
    vendor: number;
    bookingConfirmed: number;
    cancelled: number;
    completed: number;
    contacted: number;
    notContacted: number;
    notStarted: number;
    started: number;
  };
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    hasNext: boolean;
    hasPrev: boolean;
    limit: number;
  };
}

