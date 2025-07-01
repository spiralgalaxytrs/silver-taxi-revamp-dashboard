'use client';

import { ReactNode, useEffect } from 'react';
import { createContext, useContext, useState } from 'react';
import { useConfig } from 'stores/configStore';

type CRUD = { isC: boolean; isR: boolean; isU: boolean; isD: boolean };

export type PermissionConfig = {
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
    isIpTracking: CRUD | boolean;
    isPaymentTransaction: CRUD | boolean;
};

interface PermissionContextType {
    permissions: PermissionConfig | null;
    setPermissions: (permissions: PermissionConfig | null) => void;
}

// Create the context with a default value of null
const PermissionContext = createContext<PermissionContextType | null>(null);

// Hook to use permissions context
export const usePermissions = () => {
    const context = useContext(PermissionContext);
    if (!context) {
        throw new Error("usePermissions must be used within a PermissionProvider");
    }
    return context;
};

// PermissionProvider component
export function PermissionProvider({ children }: { children: ReactNode }) {

    const [permissions, setPermissions] = useState<PermissionConfig | null>(null);

    const { fetchConfig } = useConfig();

    useEffect(() => {

        const fetchPermissions = async () => {
            const token = sessionStorage.getItem("token");
            const role = sessionStorage.getItem("role");

            if (token && role) {
                const result = await fetchConfig();
                setPermissions(result);
            }
        }
        fetchPermissions();
    }, [])


    return (
        <PermissionContext.Provider value={{ permissions, setPermissions }}>
            {children}
        </PermissionContext.Provider>
    );
}
