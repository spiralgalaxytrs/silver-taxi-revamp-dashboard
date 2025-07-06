export interface Customer {
    customerId?: string;
    name: string;
    email: string;
    phone: string;
    bookingCount: number;
    totalAmount: number;
    createdBy: "Admin" | "Vendor";
    createdAt: string;
}

export interface CustomerBooking {
    bookingId: string;
    name: string;
    email: string;
    phone: string;
    serviceType: string;
    pickupDate: string;
    pickupTime: string;
    dropDate: string;
    enquiryId?: string | null;
    driverId?: string | null;
    tariffId: string;
    pickup: string;
    drop: string;
    distance: string;
    estimatedAmount: number;
    discountAmount: number;
    offerId?: string | null;
    paymentType: string;
    finalAmount: number;
    createdBy: "Admin" | "Vendor";
    paymentStatus: string;
    status: string;
    type: string;
    createdAt: string;
    bookingDate: string;
    totalAmount: number;
}
