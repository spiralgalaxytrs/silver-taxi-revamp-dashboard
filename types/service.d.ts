export interface ServiceState {
    services: Service[];
    activeServices: Service[];
    service: Service | null;
    error: string | null;
    statusCode: number | null;
    message: string | null;
    isLoading: boolean;
    fetchServices: () => Promise<void>;
    fetchVendorServices: () => Promise<void>;
    fetchServiceById: (id: string) => Promise<void>;
    fetchServiceByName: (name: string) => Promise<void>;
    // createService: (serviceData: Partial<Service>) => Promise<void>;
    updateService: (id: string, serviceData: Partial<Service>) => Promise<void>;
    deleteService: (id: string) => Promise<void>;
}

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