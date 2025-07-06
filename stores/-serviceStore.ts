import { create } from "zustand";
import { persist } from "zustand/middleware";
import axios, { AxiosError } from "../lib/http-common";
import { ErrorResponse, ServiceState } from "../types/service";

export const useServiceStore = create<ServiceState>()(
    persist(
        (set) => ({
            services: [],
            activeServices: [],
            service: null,
            error: null,
            statusCode: null,
            message: null,
            isLoading: false,

            fetchServices: async () => {
                set({ isLoading: true, error: null });
                try {
                    const response = await axios.get("/v1/services");
                    set({
                        services: response.data.data,
                        isLoading: false,
                        message: response.data.message,
                        statusCode: response.status
                    });
                } catch (error) {
                    const axiosError = error as AxiosError<ErrorResponse>;
                    set({
                        services: [],
                        error: axiosError.response?.data?.message,
                        isLoading: false,
                        statusCode: axiosError.response?.status,
                        message: axiosError.response?.data?.message
                    });
                }
            },

            fetchVendorServices: async () => {
                set({ isLoading: true, error: null });
                try {
                    const response = await axios.get("/v1/services/vendor");
                    set({
                        services: response.data.data,
                        isLoading: false,
                        message: response.data.message,
                        statusCode: response.status
                    });
                } catch (error) {
                    const axiosError = error as AxiosError<ErrorResponse>;
                    set({
                        services: [],
                        error: axiosError.response?.data?.message,
                        isLoading: false,
                        statusCode: axiosError.response?.status,
                        message: axiosError.response?.data?.message
                    });
                }
            },

            fetchActiveServices: async () => {
                set({ isLoading: true, error: null });
                try {
                    const response = await axios.get("/v1/services/active");
                    set({
                        activeServices: response.data.data,
                        isLoading: false,
                        message: response.data.message,
                        statusCode: response.status
                    });
                } catch (error) {
                    const axiosError = error as AxiosError<ErrorResponse>;
                    set({
                        activeServices: [],
                        error: axiosError.response?.data?.message,
                        isLoading: false,
                        statusCode: axiosError.response?.status,
                        message: axiosError.response?.data?.message
                    });
                }
            },
            fetchServiceById: async (id) => {
                set({ isLoading: true, error: null });
                try {
                    const response = await axios.get(`/v1/services/${id}`);
                    set({
                        service: response.data.data,
                        isLoading: false,
                        message: response.data.message,
                        statusCode: response.status
                    });
                } catch (error) {
                    const axiosError = error as AxiosError<ErrorResponse>;
                    set({
                        service: null,
                        error: axiosError.response?.data?.message,
                        isLoading: false,
                        statusCode: axiosError.response?.status,
                        message: axiosError.response?.data?.message
                    });
                }
            },
            fetchServiceByName: async (name) => {
                set({ isLoading: true, error: null });
                try {
                    const response = await axios.get(`/v1/services/by-name?name=${name}`);
                    set({
                        service: response.data.data,
                        isLoading: false,
                        message: response.data.message,
                        statusCode: response.status
                    });
                } catch (error) {
                    const axiosError = error as AxiosError<ErrorResponse>;
                    set({
                        service: null,
                        error: axiosError.response?.data?.message,
                        isLoading: false,
                        statusCode: axiosError.response?.status,
                        message: axiosError.response?.data?.message
                    });
                }
            },

            // createService: async (serviceData) => {
            //     set({ isLoading: true, error: null });
            //     try {
            //         const response = await axios.post("/v1/services", serviceData);
            //         set({
            //             service: response.data.data,
            //             isLoading: false,
            //             message: response.data.message,
            //             statusCode: response.status
            //         });
            //     } catch (error) {
            //         const axiosError = error as AxiosError<ErrorResponse>;
            //         set({
            //             error: axiosError.response?.data?.message,
            //             isLoading: false,
            //             statusCode: axiosError.response?.status,
            //             message: axiosError.response?.data?.message
            //         });
            //     }
            // },

            updateService: async (id, serviceData) => {
                set({ isLoading: true, error: null });
                try {
                    const response = await axios.put(`/v1/services/${id}`, serviceData);
                    set({
                        service: response.data.data,
                        isLoading: false,
                        message: response.data.message,
                        statusCode: response.status
                    });
                } catch (error) {
                    const axiosError = error as AxiosError<ErrorResponse>;
                    console.error("Update Service Error:", axiosError);
                    set({
                        error: axiosError.response?.data?.message,
                        isLoading: false,
                        statusCode: axiosError.response?.status,
                        message: axiosError.response?.data?.message
                    });
                }
            },
            deleteService: async (id) => {
                set({ isLoading: true, error: null });
                try {
                    await axios.delete(`/v1/services/${id}`);
                    set((state) => ({
                        services: state.services.filter((service) => service.serviceId !== id),
                        isLoading: false
                    }));
                } catch (error) {
                    const axiosError = error as AxiosError<ErrorResponse>;
                    set({
                        error: axiosError.response?.data?.message,
                        isLoading: false,
                        statusCode: axiosError.response?.status,
                        message: axiosError.response?.data?.message
                    });
                }
            }
        }),
        { name: "service-store" }
    ),

)
