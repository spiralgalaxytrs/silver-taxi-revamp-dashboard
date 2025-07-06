import { create } from "zustand";
import { persist } from "zustand/middleware";
import axios, { AxiosError } from "../lib/http-common";

interface CalculationResult {
    distance: number;
    price: number | null;
}

interface DistancePriceState {
    calculationResult: CalculationResult | null;
    error: string | null;
    isLoading: boolean;
    message: string | null;
    calculateDistanceAndPrice: (tariffId: string, pickupLocation: string, dropLocation: string) => Promise<void>;
}

export const useDistancePriceStore = create<DistancePriceState>()(
    persist(
        (set) => ({
            calculationResult: null,
            error: null,
            isLoading: false,
            message: null,

            calculateDistanceAndPrice: async (tariffId, pickupLocation, dropLocation) => {
                set({ isLoading: true, error: null });
                try {
                    const response = await axios.post("/v1/distance-price", { tariffId, pickupLocation, dropLocation });
                    set({
                        calculationResult: response.data.cals,
                        isLoading: false,
                    });
                } catch (error) {
                    const axiosError = error as AxiosError<{ message: string }>;
                    set({
                        message: axiosError.response?.data?.message || "An error occurred",
                        error: axiosError.response?.data?.message || "An error occurred",
                        isLoading: false,
                    });
                }
            },
        }),
        { name: "distance-price-store" }
    )
);

export type { CalculationResult };