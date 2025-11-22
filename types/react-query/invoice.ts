export interface Invoice {
    invoiceId?: string;
    bookingId: string;
    companyId?: string;
    invoiceNo?: string;
    invoiceDate: string;
    name: string;
    phone: string;
    email: string;
    serviceType: string;
    vehicleType: string;
    totalKm?: number;
    pricePerKm?: number;
    travelTime?: string;
    address?: string;
    estimatedAmount?: number;
    advanceAmount?: number;
    totalAmount: number;
    otherCharges?: Record<string, number>;
    paymentDetails?: string | any;
    createdBy: "Admin" | "Vendor";
    status: "Partial Paid" | "Paid" | "Unpaid";
    booking?: any;
    companyProfile?: any;
    createdAt?: string;
    pickup?: string;
    drop?: string;
    note?: string;
    GSTNumber?: string;
    offerId?: string | null;
}

export interface GetInvoicesParams {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    sortBy?: string;
    sortOrder?: string;
}

export interface InvoicesResponse {
    invoices: Invoice[];
    invoicesCount?: {
        total: number;
        partiallyPaid: number;
        paid: number;
        unpaid: number;
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