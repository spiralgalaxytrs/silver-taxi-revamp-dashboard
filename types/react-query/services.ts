export interface Service {
    serviceId?: string | null | undefined;
    name: string;
    tax: {
        IGST: number;
        CGST: number;
        SGST: number;
    };
    isActive: boolean;
    minKm: number;
    vendorCommission: number;
    driverCommission: number;
    city?: string[];
    createdAt?: string;
    include?: string;
    exclude?: string;
}


export interface ErrorResponse {
    message: string;
}