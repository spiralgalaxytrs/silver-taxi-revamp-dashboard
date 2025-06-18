import { create } from "zustand";
import { persist } from "zustand/middleware";
import axios, { AxiosError } from "../lib/http-common";
import { ErrorResponse } from "types/auth";

interface Offer {
    offerId?: string;
    offerName: string;
    category: string;
    description?: string;
    keywords?: string;
    type: "Percentage" | "Flat";
    value: number;
    status: boolean;
    startDate: Date;
    endDate: Date;
    updatedAt: string;
    claimedCount: number;
    bannerImage?: File | string | undefined;
    createdAt: string;
}

interface OfferState {
    offers: Offer[];
    offer: Offer | null;
    error: string | null;
    isLoading: boolean;
    statusCode: number | null;
    message: string | null;
    fetchOffers: () => Promise<void>;
    createOffer: (offerData: Partial<Offer>) => Promise<void>;
    updateOffer: (id: string, offerData: Partial<Offer>) => Promise<void>;
    deleteOffer: (id: string) => Promise<void>;
    toggleChanges: (id: string | undefined, status: boolean) => Promise<void>;
    multiDeleteOffers: (offerIds: string[]) => Promise<void>;
}

export const useOfferStore = create<OfferState>()(
    persist(
        (set,get) => ({
            offers: [],
            offer: null,
            error: null,
            isLoading: false,
            statusCode: null,
            message: null,
            fetchOffers: async () => {
                set({ isLoading: true, error: null });
                try {
                    const response = await axios.get("/v1/offers/");
                    set({
                        offers: response.data.data,
                        isLoading: false,
                        statusCode: response.status,
                        message: response.data.message,
                    });
                } catch (error) {
                    const axiosError = error as AxiosError<ErrorResponse>;
                    set({
                        offers:[],
                        error: axiosError.response?.data?.message || "An error occurred",
                        isLoading: false,
                        message: axiosError.response?.data?.message,
                    });
                }
            },

            createOffer: async (offerData) => {
                set({ isLoading: true, error: null });
                try {
                    const formData = new FormData();
                    
                    // Handle each field in the offerData
                    Object.entries(offerData).forEach(([key, value]) => {
                        if (value !== null && value !== undefined) {
                            // Special handling for bannerImage file
                            if (key === 'bannerImage' && value instanceof File) {
                                formData.append('bannerImage', value);
                            } 
                            // Handle Date objects
                            else if (value instanceof Date) {
                                formData.append(key, value.toISOString());
                            }
                            // Handle other fields
                            else {
                                formData.append(key, String(value));
                            }
                        }
                    });

                    const response = await axios.post("/v1/offers/", formData, {
                        headers: {
                            'Content-Type': 'multipart/form-data',
                        },
                    });

                    set((state) => ({
                        offers: [...state.offers, response.data.data],
                        isLoading: false,
                        statusCode: response.status,
                        message: response.data.message,
                    }));

                } catch (error) {
                    const axiosError = error as AxiosError<ErrorResponse>;
                    set({
                        error: axiosError.response?.data?.message,
                        isLoading: false,
                        statusCode: axiosError.response?.status,
                        message: axiosError.response?.data?.message,
                    });
                }
            },

            updateOffer: async (id, offerData) => {
                set({ isLoading: true, error: null });
                try {
                    const response = await axios.put(`/v1/offers/${id}`, offerData);
                    set((state) => ({
                        offers: state.offers.map((offer) =>
                            offer.offerId === id ? response.data.data : offer
                        ),
                        isLoading: false,
                        statusCode: response.status,
                        message: response.data.message,
                    }));
                } catch (error) {
                    const axiosError = error as AxiosError<ErrorResponse>;
                    set({
                        error: axiosError.response?.data?.message,
                        isLoading: false,
                        statusCode: axiosError.response?.status,
                        message: axiosError.response?.data?.message,
                    });
                }
            },

            deleteOffer: async (id) => {
                set({ isLoading: true, error: null });
                try {
                    const response = await axios.delete(`/v1/offers/${id}`);
                    set((state) => ({
                        offers: state.offers.filter((offer) => offer.offerId !== id),
                        isLoading: false,
                        statusCode: response.status,
                        message: response.data.message,
                    }));
                } catch (error) {
                    const axiosError = error as AxiosError<ErrorResponse>;
                    set({
                        error: axiosError.response?.data?.message,
                        isLoading: false,
                        statusCode: axiosError.response?.status,
                        message: axiosError.response?.data?.message,
                    });
                }
            },
            toggleChanges: async (id, status) => {
                set({ isLoading: true, error: null });
                try {
                    const response = await axios.post(`/v1/offers/toggle-changes/${id}`, { status });
                    set((state) => ({
                        offers: state.offers.map((offer) =>
                            offer.offerId === id ? { ...offer, status } : offer
                        ),
                        isLoading: false,
                        statusCode: response.status,
                        message: response.data.message,
                    }));
                } catch (error) {
                    const axiosError = error as AxiosError<ErrorResponse>;
                    set({
                        error: axiosError.response?.data?.message || "An error occurred",
                        isLoading: false,
                        message: axiosError.response?.data?.message,
                    });
                    throw error;
                }
            },

            multiDeleteOffers: async (offerIds) => {
                set({ isLoading: true, error: null });
                try {
                    const response = await axios.delete(`/v1/offers/`, { data: { offerIds } });
                    set((state) => ({
                        offers: state.offers.filter((offer) => !offerIds.includes(offer.offerId || "")),
                        isLoading: false,
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
        }),
        { name: "offer-store" }
    )
);

export type { Offer };
