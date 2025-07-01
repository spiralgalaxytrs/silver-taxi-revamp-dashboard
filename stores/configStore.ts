import { create } from "zustand";
import axios, { AxiosError } from "../lib/http-common";

interface CRUD {
    isC: boolean;
    isR: boolean;
    isU: boolean; isD: boolean
};

interface PermissionConfig {
    isDashBoard: boolean;
    isEnquiry: CRUD | boolean;
    isBooking: CRUD | boolean;
    isCustomers: CRUD | boolean;
    isDrivers: CRUD | boolean;
    isVendors: CRUD | boolean;
    isAvailableService: {
        isOneWay: boolean;
        isRoundTrip: boolean;
        isAirportPickup: boolean;
        isAirportDrop: boolean;
        isDayPackage: boolean;
        isHourlyPackage: boolean;
    };
    isService: CRUD | boolean;
    isServicePricing: CRUD | boolean;
    isVehicles: CRUD | boolean;
    isAllIncludes: CRUD | boolean;
    isCompanyProfile: CRUD | boolean;
    isInvoice: CRUD | boolean;
    isBlog: CRUD | boolean;
    isDynamicRoutes: CRUD | boolean;
    isPopularRoutes: CRUD | boolean;
    isOffers: CRUD | boolean;
    isPaymentTransaction: CRUD | boolean;
};

interface ConfigState {
    config: PermissionConfig | null;
    error: string | null;
    statusCode: number | null;
    message: string | null;
    isLoading: boolean;
    fetchConfig: () => Promise<any>;
};

export const useConfig = create<ConfigState>((set) => ({
    config: null,
    error: null,
    statusCode: null,
    message: null,
    isLoading: false,
    fetchConfig: async () => {
        try {
            set({ isLoading: true });
            const response = await axios.get("v1/tenant/config");
            const data = response.data.data.data;
            
            set({
                config: data
            });

            return data;
        } catch (error) {
            const err = error as AxiosError;
            set({ error: err.message, statusCode: err.response?.status });
        } finally {
            set({
                isLoading: false
            });
        }
    },
}));


