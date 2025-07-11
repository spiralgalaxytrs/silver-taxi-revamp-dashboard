export interface Driver {
    id: string;
    adminId: string;
    driverId?: string;
    name: string;
    phone: string;
    email?: string;
    address?: string;
    license: string;
    aadharNumber: string;
    licenseValidity: string;
    licenseImage?: File | string | undefined;
    bookingCount?: number;
    assigned?: boolean;
    totalEarnings: number;
    vehicleId?: string;
    vehicle: VehicleAttributes[];
    isActive: boolean | null;
    remark?: string;
    walletAmount: number;
    adminVerified?: "Pending" | "Approved" | "Rejected";
    walletId?: string;
    panCardImage?: string;
    panCardVerified?: "pending" | "accepted" | "rejected";
    panCardRemark?: string;
    aadharImageFront?: string;
    aadharImageBack?: string;
    aadharImageFrontVerified?:  "pending" | "accepted" | "rejected";
    aadharImageBackVerified?:  "pending" | "accepted" | "rejected";
    aadharImageFrontRemark?: string;
    aadharImageBackRemark?: string;
    licenseImageFront?: string;
    licenseImageBack?: string;
    licenseImageFrontVerified?:  "pending" | "accepted" | "rejected";
    licenseImageBackVerified?:  "pending" | "accepted" | "rejected";
    licenseImageFrontRemark?: string;
    licenseImageBackRemark?: string;

    wallet?: {
        balance: number;
        walletId: string;
        currency: string;
    };
    createdAt: string;
    documentVerified?: boolean;
    profileVerified?: boolean;
    documentRemark?: string;



    updatedAt: string;
    plusAmount?: number;
    minusAmount?: number;
    totalAmount?: number;
    startAmount?: number;
}


export interface VehicleAttributes {
    id: number;
    adminId: string;
    tenantId: string;
    vehicleId?: string;
    driverId?: string;
    name: string;
    type: string;
    fuelType?: 'Petrol' | 'Diesel' | 'Electric' | 'Hybrid';
    isActive: boolean;
    imageUrl?: string | null;
    seats?: number;
    bags?: number;
    order?: number;
    vehicleYear?: number;
    vehicleNumber?: string;
    driverBeta?: number;
    isAdminVehicle?: boolean;
    adminVerified?: "Pending" | "Approved" | "Rejected";
    documentUploaded?: boolean;
    profileVerified?: boolean;
    documentVerified?: boolean;
    remark?: string;
    documentRemark?: string;
    rcBookImageFront?: string;
    rcBookImageBack?: string;
    rcExpiryDate?: Date;
    rcFrontVerified?: "pending" | "accepted" | "rejected";
    rcFrontRemark?: string;
    rcBackVerified?: "pending" | "accepted" | "rejected";
    rcBackRemark?: string;
    insuranceImage?: string;
    insuranceExpiryDate?: string;
    insuranceVerified?: "pending" | "accepted" | "rejected";
    insuranceRemark?: string;
    pollutionImage?: string;
    pollutionExpiryDate?: string;
    pollutionImageVerified  ?: "pending" | "accepted" | "rejected";
    pollutionImageRemark?: string;
}

export interface wallet {
    transactionId: string;
    initiatedBy: string;
    initiatedTo: string;
    type: string;
    date: string;
    // vendorId: string;
    driverId: string;
    amount: number;
    createdAt: string;
    updatedAt: string;
}



export interface ExpiryStatus {
    license: {
        expiry: string;
        isExpired: boolean;
    };
    vehicles: Array<{
        id: number;
        vehicleId: string;
        rcBook: {
            expiry: string;
            isExpired: boolean;
        };
        insurance: {
            expiry: string;
            isExpired: boolean;
        };
        pollution: {
            expiry: string;
            isExpired: boolean;
        };
    }>;
}
export interface ErrorResponse {
    message: string;
    success: boolean;
}