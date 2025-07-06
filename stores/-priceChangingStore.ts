import { create } from "zustand";
import { persist } from "zustand/middleware";
import axios, { AxiosError } from "../lib/http-common";
import { ErrorResponse } from "types/auth";

interface PriceEntry {
    priceId: string
    fromDate: Date
    toDate: Date
    price: number
}

interface PriceState {
    priceEntries: PriceEntry[]
    priceEntry: PriceEntry | null
    error: string | null;
    statusCode: number | null;
    message: string | null;
    isLoading: boolean;
    fetchEntries: () => Promise<void>
    fetchEntriesById: (serviceId: string) => Promise<void>
    CreateEntry: (data: Partial<PriceEntry>) => Promise<void>
    updateEntry: (id: string, data: Partial<PriceEntry>) => Promise<void>
    deleteEntry: (id: string) => Promise<void>
}

export const usePriceStore = create<PriceState>()(
    persist(
        (set) => ({
            priceEntries: [],
            priceEntry: null,
            error: null,
            statusCode: null,
            message: null,
            isLoading: false,

            fetchEntries: async () => {
                set({ isLoading: true, error: null });
                try {
                    const response = await axios.get("/v1/all-price-changes");
                    set({
                        priceEntries: response.data.data,
                        isLoading: false,
                        message: response.data.message,
                        statusCode: response.status,
                    });
                } catch (error) {
                    const axiosError = error as AxiosError<ErrorResponse>;
                    set({
                        priceEntries: [],
                        statusCode: axiosError.response?.status,
                        message: axiosError.response?.data?.message,
                        error: axiosError.response?.data?.message,
                        isLoading: false,
                    });
                }
            },

            fetchEntriesById: async (serviceId: string) => {
                set({ isLoading: true, error: null });
                try {
                    if (!serviceId) {
                        set({
                            priceEntry: null,
                            isLoading: false,
                            message: "Service ID is required",
                            error: "Service ID is required"
                        });
                        return;
                    }
                    const response = await axios.get(`/v1/all-price-changes/${serviceId}`);
                    set({
                        priceEntry: response.data.data,
                        isLoading: false,
                        message: response.data.message,
                        statusCode: response.status,
                    });
                } catch (error) {
                    const axiosError = error as AxiosError<ErrorResponse>;
                    set({
                        priceEntry: null,
                        statusCode: axiosError.response?.status,
                        message: axiosError.response?.data?.message,
                        error: axiosError.response?.data?.message,
                        isLoading: false,
                    });
                }
            },

            CreateEntry: async (data) => {
                set({ isLoading: true, error: null });
                try {
                    const response = await axios.post(`/v1/all-price-changes`, data);
                    set((state) => ({
                        priceEntries: [...state.priceEntries, response.data.data],
                        isLoading: false,
                        message: response.data.message,
                        statusCode: response.status,
                    }));
                } catch (error) {
                    const axiosError = error as AxiosError<ErrorResponse>;
                    set({
                        priceEntry: null,
                        statusCode: axiosError.response?.status,
                        message: axiosError.response?.data?.message,
                        error: axiosError.response?.data?.message,
                        isLoading: false,
                    });
                }
            },

            updateEntry: async (id, data) => {
                set({ isLoading: true, error: null });
                try {
                    const response = await axios.put(`/v1/all-price-changes/${id}`, data);
                    set((state) => ({
                        priceEntries: state.priceEntries.map((priceEntry) =>
                            priceEntry.priceId === id ? { ...priceEntry, ...response.data.data } : priceEntry
                        ),
                        isLoading: false,
                        message: response.data.message,
                        statusCode: response.status,
                    }));
                } catch (error) {
                    const axiosError = error as AxiosError<ErrorResponse>;
                    set({
                        statusCode: axiosError.response?.status,
                        message: axiosError.response?.data?.message,
                        error: axiosError.response?.data?.message,
                        isLoading: false,
                    });
                }
            },

            deleteEntry: async (id) => {
                set({ isLoading: true, error: null });
                try {
                    await axios.delete(`/v1/all-price-changes/${id}`);
                    set((state) => ({
                        priceEntries: state.priceEntries.filter((priceEntry) => priceEntry.priceId !== id),
                        isLoading: false,
                    }));
                } catch (error) {
                    const axiosError = error as AxiosError<ErrorResponse>;
                    set({
                        statusCode: axiosError.response?.status,
                        message: axiosError.response?.data?.message,
                        error: axiosError.response?.data?.message,
                        isLoading: false,
                    });
                }
            },
        }),
        { name: "price-store" }
    )
);

export type { PriceEntry };