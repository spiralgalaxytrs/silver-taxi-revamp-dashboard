import { create } from "zustand";
import { persist } from "zustand/middleware";
import axios, { AxiosError } from "../lib/http-common";
import { ErrorResponse, TariffState, TariffUseState } from "types/tariff";

export const useTariffStore = create<TariffState>()(
    persist(
        (set) => ({
            tariffs: [],
            multipleTariffs: [],
            packageTariffs: [],
            pkgTariffs: [],
            packageTariff: null,
            tariff: null,
            error: null,
            statusCode: null,
            message: null,
            isLoading: false,

            // Fetch all tariffs
            fetchTariffs: async () => {
                set({ isLoading: true, error: null });
                try {
                    const response = await axios.get("/v1/tariffs");
                    set({
                        tariffs: response.data.data,
                        isLoading: false,
                        message: response.data.message,
                        statusCode: response.status
                    });
                } catch (error) {
                    const axiosError = error as AxiosError<ErrorResponse>;
                    set({
                        tariffs:[],
                        error: axiosError.response?.data?.message,
                        isLoading: false,
                        message: axiosError.response?.data?.message
                    });
                }
            },

            fetchActiveTariffs: async () => {
                set({ isLoading: true, error: null });
                try {
                    const response = await axios.get("/v1/tariffs");
                    set({
                        tariffs: response.data.data,
                        isLoading: false,
                        message: response.data.message,
                        statusCode: response.status
                    });
                } catch (error) {
                    const axiosError = error as AxiosError<ErrorResponse>;
                    set({
                        tariffs:[],
                        error: axiosError.response?.data?.message,
                        isLoading: false,
                        message: axiosError.response?.data?.message
                    });
                }
            },

            // Fetch a single tariff by ID
            fetchTariffById: async (id: string) => {
                set({ isLoading: true, error: null });
                try {
                    const response = await axios.get(`/v1/tariffs/${id}`);
                    set({
                        tariff: response.data.data,
                        isLoading: false,
                        message: response.data.message,
                        statusCode: response.status
                    });
                } catch (error) {
                    const axiosError = error as AxiosError<ErrorResponse>;
                    set({
                        tariff:[],
                        message: axiosError.response?.data?.message,
                        error: axiosError.response?.data?.message,
                        isLoading: false,
                    });
                }
            },

            // Fetch a single tariff by vehicle ID
            fetchTariffByVehicleId: async (vehicleId: string, serviceId: string, createdBy: string) => {
                set({ isLoading: true, error: null, statusCode: null });
                try {
                    const response = await axios.get(`/v1/tariffs/vehicle/${vehicleId}/service/${serviceId}/createdBy/${createdBy}`);
                    set({
                        tariff: response.data.data,
                        isLoading: false,
                        message: response.data.message,
                        statusCode: response.status
                    });
                } catch (error) {
                    const axiosError = error as AxiosError<ErrorResponse>;
                    if (axiosError.response?.status === 404) {
                        // If no tariff found, set tariff to null but don't show error
                        set({
                            tariff: null,
                            isLoading: false,
                            statusCode: 404
                        });
                    } else {
                        set({
                            tariff:[],
                            message: axiosError.response?.data?.message,
                            error: axiosError.response?.data?.message,
                            isLoading: false,
                        });
                    }
                }
            },

            // Create a new tariff
            createTariff: async (newTariff: Partial<TariffUseState>) => {
                set({ isLoading: true, error: null });
                try {
                    const response = await axios.post("/v1/tariffs", newTariff);
                    set({
                        tariff: response.data.data,
                        isLoading: false,
                        statusCode: response.status,
                        message: response.data.message
                    });
                    return response.data;
                } catch (error) {
                    const { response: errorResponse } = error as AxiosError<ErrorResponse>;
                    set({
                        message: errorResponse?.data?.message,
                        error: errorResponse?.data?.message,
                        isLoading: false,
                        statusCode: errorResponse?.status
                    });
                    throw error;
                }
            },

            // Update an existing tariff
            updateTariff: async (id: string, tariffData: Partial<TariffUseState>) => {
                set({ isLoading: true, error: null });
                try {
                    const response = await axios.put(`/v1/tariffs/${id}`, tariffData);
                    set((state) => ({
                        tariffs: state.tariffs.map((t) =>
                            t.id === id ? response.data.data : t
                        ),
                        tariff: response.data.data,
                        isLoading: false,
                        message: response.data.message,
                        statusCode: response.status
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

            // Delete a tariff
            deleteTariff: async (id: string) => {
                set({ isLoading: true, error: null });
                try {
                    await axios.delete(`/v1/tariffs/${id}`);
                    set((state) => ({
                        tariffs: state.tariffs.filter((tariff) => tariff.tariffId !== id),
                        isLoading: false
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

            
            fetchPackageTariffByVehicleId: async (vehicleId: string, serviceId: string, type: string) => {
                set({ isLoading: true, error: null });
                try {
                    const response = await axios.get(`/v1/services/packages/vehicle/${vehicleId}/service/${serviceId}/${type}`);
                    set({
                        packageTariffs: response.data.data,
                        isLoading: false,
                        message: response.data.message,
                        statusCode: response.status
                    });
                } catch (error) {
                    const axiosError = error as AxiosError<ErrorResponse>;
                    set({
                        packageTariffs:[],
                        error: axiosError.response?.data?.message,
                        message: axiosError.response?.data?.message,
                        isLoading: false,
                    });
                }
            },

            fetchPackageTariffs: async (type: string) => {
                set({ isLoading: true, error: null });
                try {
                    const response = await axios.get(`/v1/services/packages/${type}`);
                    set({
                        pkgTariffs: response.data.data,
                        isLoading: false,
                        message: response.data.message,
                        statusCode: response.status
                    });
                } catch (error) {
                    const axiosError = error as AxiosError<ErrorResponse>;
                    set({
                        pkgTariffs:[],
                        error: axiosError.response?.data?.message,
                        isLoading: false,
                        message: axiosError.response?.data?.message
                    });
                }
            },


            //  Package Tariff 
            createPackageTariff: async (newPackageTariff:any) => {
                set({ isLoading: true, error: null });
                try {
                    const response = await axios.post("/v1/services/packages/", newPackageTariff);
                    set({
                        tariff: response.data.data,
                        isLoading: false,
                        statusCode: response.status,
                        message: response.data.message
                    });
                    return response.data;
                } catch (error) {
                    const { response: errorResponse } = error as AxiosError<ErrorResponse>;
                    set({
                        message: errorResponse?.data?.message,
                        error: errorResponse?.data?.message,
                        isLoading: false,
                        statusCode: errorResponse?.status
                    });
                    throw error;
                }
            },

            updatePackageTariff: async (id: string, tariffPackageData:any) => {
                set({ isLoading: true, error: null });
                try {
                    const response = await axios.put(`/v1/services/packages/${id}`, tariffPackageData);
                    set((state) => ({
                        tariffs: state.tariffs.map((t) =>
                            t.id === id ? response.data.data : t
                        ),
                        tariff: response.data.data,
                        isLoading: false,
                        message: response.data.message,
                        statusCode: response.status
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

            deletePackageTariff: async (id: string) => {
                set({ isLoading: true, error: null });
                try {
                    await axios.delete(`/v1/services/packages/${id}`);
                    set((state) => ({
                        tariffs: state.tariffs.filter((tariff) => tariff.tariffId !== id),
                        isLoading: false
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
        { name: "tariff-store" }
    )
);
