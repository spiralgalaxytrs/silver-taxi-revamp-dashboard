import { create } from "zustand";
import { persist } from "zustand/middleware";
import axios, { AxiosError } from "../lib/http-common";

type WalletTransaction = {
    transactionId: string;
    driverId?: string;
    vendorId?: string;
    initiatedBy: string;
    initiatedTo: string;
    ownedBy: "Driver" | "Vendor";
    type: string;
    amount: number;
    status: string;
    date: string;
    remark: string;
    description: string
    createdAt: string;    
};

interface ErrorResponse {
    message: string;
    success: boolean;
}

interface WalletTransactionState {
    vendorTransactions: WalletTransaction[];
    driverTransactions: WalletTransaction[];
    error: string | null;
    statusCode: number | null;
    message: string | null;
    isLoading: boolean;
    fetchVendorTransactions: (vendorId: string) => Promise<void>;
    fetchDriverTransactions: (driverId: string) => Promise<void>;
    fetchAllVendorTransactions: () => Promise<void>;
    fetchAllDriverTransactions: () => Promise<void>;
}

export const useWalletTransactionStore = create<WalletTransactionState>()(
    persist(
        (set) => ({
            vendorTransactions: [],
            driverTransactions: [],
            error: null,
            statusCode: null,
            message: null,
            isLoading: false,

            fetchVendorTransactions: async (vendorId) => {
                set({ isLoading: true, error: null });
                try {
                    const response = await axios.get(`/v1/wallet-transactions/vendor/${vendorId}`);
                    set({
                        vendorTransactions: response.data.data,
                        isLoading: false,
                        message: response.data.message,
                        statusCode: response.status,
                    });
                } catch (error) {
                    const axiosError = error as AxiosError<ErrorResponse>;
                    set({
                        vendorTransactions:[],
                        error: axiosError.response?.data?.message,
                        isLoading: false,
                        message: axiosError.response?.data?.message,
                    });
                }
            },

            fetchDriverTransactions: async (driverId) => {
                set({ isLoading: true, error: null });
                try {
                    const response = await axios.get(`/v1/wallet-transactions/driver/${driverId}`);
                    set({
                        driverTransactions: response.data.data,
                        isLoading: false,
                        message: response.data.message,
                        statusCode: response.status,
                    });
                } catch (error) {
                    const axiosError = error as AxiosError<ErrorResponse>;
                    set({
                        driverTransactions:[],
                        error: axiosError.response?.data?.message,
                        isLoading: false,
                        message: axiosError.response?.data?.message,
                    });
                }
            },

            fetchAllVendorTransactions: async () => {
                set({ isLoading: true, error: null });
                try {
                    const response = await axios.get(`/v1/wallet-transactions/vendor`);
                    set({
                        vendorTransactions: response.data.data,
                        isLoading: false,
                        message: response.data.message,
                        statusCode: response.status,
                    });
                } catch (error) {
                    const axiosError = error as AxiosError<ErrorResponse>;
                    set({
                        vendorTransactions:[],
                        error: axiosError.response?.data?.message,
                        isLoading: false,
                        message: axiosError.response?.data?.message,
                    });
                }
            },

            fetchAllDriverTransactions: async () => {
                set({ isLoading: true, error: null });
                try {
                    const response = await axios.get(`/v1/wallet-transactions/driver`);
                    set({
                        driverTransactions: response.data.data,
                        isLoading: false,
                        message: response.data.message,
                        statusCode: response.status,
                    });
                } catch (error) {
                    const axiosError = error as AxiosError<ErrorResponse>;
                    set({
                        driverTransactions:[],
                        error: axiosError.response?.data?.message,
                        isLoading: false,
                        message: axiosError.response?.data?.message,
                    });
                }
            },
        }),
        { name: "wallet-transaction-store" }
    )
);

export type { WalletTransaction };