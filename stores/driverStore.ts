import { create } from "zustand";
import { persist } from "zustand/middleware";
import axios, { AxiosError } from "../lib/http-common";

interface Driver {
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
    totalEarnings:number;
    vehicleId?: string;
    isActive: boolean | null;
    remark?: string;
    walletAmount: number;
    walletId?: string;
    wallet?: {
        balance: number;
        walletId: string;
        currency: string;
    };
    createdAt: string;
    updatedAt: string;
    plusAmount?: number;
    minusAmount?: number;
    totalAmount?: number;
    startAmount?: number;
}

interface wallet {
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


interface ErrorResponse {
    message: string;
    success: boolean;
}

// const useDriverStore = create((set) => ({
//     drivers: [],
//     fetchDrivers: async () => {
//       const response = await axios.get("/api/drivers");
//       set({ drivers: response.data });
//     },
//     getActiveDrivers: () => {
//       const state = useDriverStore.getState();
//       return state.drivers.filter((driver) => driver.status === "active");
//     },
//   }));

interface DriverState {
    drivers: Driver[];
    driver: Driver | null;
    wallets: wallet[];
    activeDrivers: Driver[];
    error: string | null;
    statusCode: number | null;
    message: string | null;
    isLoading: boolean;
    fetchDrivers: () => Promise<void>;
    fetchDriverById: (id: string) => Promise<void>;
    createDriver: (newDriver: Partial<Driver>) => Promise<void>;
    updateDriver: (id: string, driverData: Partial<Driver>) => Promise<void>;
    deleteDriver: (id: string) => Promise<void>;
    getActiveDrivers: () => Promise<void>;
    getDriverWallet: (id: string) => Promise<void>;
    addDriverWallet: (id: string, amount: number,remark: string) => Promise<void>;
    minusDriverWallet: (id: string, amount: number, remark: string) => Promise<void>;
    multiDeleteDrivers: (driverIds: string[]) => Promise<void>;
    toggleDriverStatus: (id: string, status: boolean) => Promise<void>;
}

export const useDriverStore = create<DriverState>()(
    persist(
        (set) => ({
            drivers: [],
            activeDrivers: [],
            driver: null,
            wallets: [],
            transactions: [],
            error: null,
            statusCode: null,
            message: null,
            isLoading: false,
            
            fetchDrivers: async () => {
                set({ isLoading: true, error: null });
                try {
                    const response = await axios.get("/v1/drivers");

                    set({
                        drivers: response.data.data,
                        isLoading: false,
                        message: response.data.message,
                        statusCode: response.status,
                    });

                } catch (error) {
                    const axiosError = error as AxiosError<ErrorResponse>;
                    set({
                        drivers:[],
                        error: axiosError.response?.data?.message,
                        isLoading: false,
                        message: axiosError.response?.data?.message,
                    });
                }
            },

            fetchDriverById: async (id) => {
                set({ isLoading: true, error: null });
                try {
                    const response = await axios.get(`/v1/drivers/${id}`);
                    set({
                        driver: response.data.data,
                        isLoading: false,
                        message: response.data.message,
                        statusCode: response.status,
                    });
                } catch (error) {
                    const axiosError = error as AxiosError<ErrorResponse>;
                    set({
                        driver:null,
                        message: axiosError.response?.data?.message,
                        error: axiosError.response?.data?.message,
                        isLoading: false,
                    });
                }
            },

            createDriver: async (newDriver) => {
                set({ isLoading: true, error: null });
                try {
                    const formData = new FormData();
                    Object.entries(newDriver).forEach(([key, value]) => {
                        if (value !== null && value !== undefined) {
                            if (key === 'licenseImage' && value instanceof File) {
                                formData.append('licenseImage', value);
                            } else if (value instanceof Date) {
                                formData.append(key, value.toISOString());
                            } else {
                                formData.append(key, String(value));
                            }
                        }
                    });

                    const response = await axios.post("/v1/drivers/", formData, {
                        headers: {
                            'Content-Type': 'multipart/form-data',
                        },
                    });

                    set((state) => ({
                        drivers: [...state.drivers, response.data.data],
                        isLoading: false,
                        message: response.data.message,
                        statusCode: response.status,
                    }));
                } catch (error) {
                    const axiosError = error as AxiosError<ErrorResponse>;
                    set({
                        message: axiosError.response?.data?.message,
                        error: axiosError.response?.data?.message,
                        isLoading: false,
                        statusCode: axiosError.response?.status,
                    });
                }
            },

            updateDriver: async (id, driverData: Partial<Driver>) => {
                set({ isLoading: true, error: null });
                try {
                    const response = await axios.put(`/v1/drivers/${id}`, driverData);
                    const updatedDriver = response.data.data;
                    set((state) => ({
                        drivers: state.drivers.map((driver) =>
                            driver.driverId === id ? updatedDriver : driver
                        ),
                        isLoading: false,
                        message: response.data.message,
                        statusCode: response.status,
                    }));
                } catch (error) {
                    const axiosError = error as AxiosError<ErrorResponse>;
                    set({
                        message: axiosError.response?.data?.message,
                        error: axiosError.response?.data?.message,
                        isLoading: false,
                    });
                }
            },

            deleteDriver: async (id) => {
                set({ isLoading: true, error: null });
                try {
                    await axios.delete(`/v1/drivers/${id}`);
                    set((state) => ({
                        drivers: state.drivers.filter((driver) => driver.driverId !== id),
                        isLoading: false,
                    }));
                } catch (error) {
                    const axiosError = error as AxiosError<ErrorResponse>;
                    set({
                        message: axiosError.response?.data?.message,
                        error: axiosError.response?.data?.message,
                        isLoading: false,
                    });
                }
            },

            getActiveDrivers: async () => {
                set({ isLoading: true, error: null });
                try {
                    const response = await axios.get("/v1/drivers/active");
                    set({
                        activeDrivers: response.data.data,
                        isLoading: false,
                        message: response.data.message,
                        statusCode: response.status,
                    });
                } catch (error) {
                    const axiosError = error as AxiosError<ErrorResponse>;
                    set({
                        activeDrivers:[],
                        message: axiosError.response?.data?.message,
                        error: axiosError.response?.data?.message,
                        isLoading: false,
                    });
                }
            },

            getDriverWallet: async (id) => {
                set({ isLoading: true, error: null });
                try {
                    const response = await axios.get(`/v1/drivers/wallet/${id}`);
                    set({
                        wallets: { ...response.data.data },
                        isLoading: false,
                        message: response.data.message,
                        statusCode: response.status,
                    });
                } catch (error) {
                    const axiosError = error as AxiosError<ErrorResponse>;
                    set({
                        wallets:[],
                        message: axiosError.response?.data?.message,
                        error: axiosError.response?.data?.message,
                        isLoading: false,
                    });
                }
            },

            addDriverWallet: async (id, amount, remark) => {
                set({ isLoading: true, error: null });
                try {
                    const response = await axios.post(`/v1/drivers/wallet/add/${id}`, { amount, remark });
                    set((state) => ({
                        drivers: state.drivers.map((driver) =>
                            driver.driverId === id ? { ...driver, wallet: response.data.data } : driver
                        ),
                        isLoading: false,
                        message: response.data.message,
                        statusCode: response.status,
                    }));
                } catch (error) {
                    const axiosError = error as AxiosError<ErrorResponse>;
                    set({
                        message: axiosError.response?.data?.message,
                        error: axiosError.response?.data?.message,
                        isLoading: false,
                    });
                }
            },

            minusDriverWallet: async (id, amount, remark) => {
                set({ isLoading: true, error: null });
                try {
                    const response = await axios.post(`/v1/drivers/wallet/minus/${id}`, { amount, remark});
                    set((state) => ({
                        drivers: state.drivers.map((driver) =>
                            driver.driverId === id ? { ...driver, wallet: response.data.data } : driver
                        ),
                        isLoading: false,
                        message: response.data.message,
                        statusCode: response.status,
                    }));
                } catch (error) {
                    const axiosError = error as AxiosError<ErrorResponse>;
                    set({
                        message: axiosError.response?.data?.message,
                        error: axiosError.response?.data?.message,
                        isLoading: false,
                    });
                }
            },

            multiDeleteDrivers: async (driverIds) => {
                set({ isLoading: true, error: null });
                try {
                    await axios.delete("/v1/drivers/", { data: { driverIds } });
                    set((state) => ({
                        drivers: state.drivers.filter((driver) => !driverIds.includes(driver.driverId!)),
                        isLoading: false,
                    }));
                } catch (error) {
                    const axiosError = error as AxiosError<ErrorResponse>;
                    set({
                        message: axiosError.response?.data?.message,
                        error: axiosError.response?.data?.message,
                        isLoading: false,
                    });
                }
            },

            toggleDriverStatus: async (id, status) => {
                set({ isLoading: true, error: null });
                try {
                    const response = await axios.post("/v1/toggles-change/driver", { id, status });
                    const { data } = response;

                    if (data.success) {
                        set((state) => ({
                            drivers: state.drivers.map((driver) =>
                                driver.driverId === id
                                    ? { ...driver, isActive: data.data.newStatus }
                                    : driver
                            ),
                            isLoading: false,
                            message: data.message,
                            statusCode: response.status,
                        }));
                    } else {
                        set({
                            error: data.message || "Failed to toggle driver status.",
                            isLoading: false,
                            message: data.message || "Failed to toggle driver status.",
                        });
                    }
                } catch (error) {
                    const axiosError = error as AxiosError<ErrorResponse>;
                    set({
                        error: axiosError.response?.data?.message || "An error occurred.",
                        isLoading: false,
                        message: axiosError.response?.data?.message || "An error occurred.",
                    });
                }
            }
        }),
        { name: "driver-store" }
    )
);

export type { Driver };
