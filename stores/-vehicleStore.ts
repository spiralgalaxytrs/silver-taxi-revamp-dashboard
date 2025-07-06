import { Vehicle } from '../types/tariff';
import { create } from "zustand";
import { persist } from "zustand/middleware";
import axios, { AxiosError } from "../lib/http-common";
import { ErrorResponse, VehicleState } from "types/vehicle";


export const useVehicleStore = create<VehicleState>()(
    persist(
        (set) => ({
            vehicles: [],
            vehicle: null,
            error: null,
            statusCode: null,
            message: null,
            isLoading: false,

            // Fetch all vehicles
            fetchVehicles: async () => {
                set({ isLoading: true, error: null });
                try {
                    const response = await axios.get("/v1/vehicles");
                    set({
                        vehicles: response.data.data,
                        isLoading: false,
                        message: response.data.message,
                        statusCode: response.status
                    });
                } catch (error) {
                    const axiosError = error as AxiosError<ErrorResponse>;
                    set({
                        vehicles:[],
                        error: axiosError.response?.data?.message,
                        isLoading: false,
                        message: axiosError.response?.data?.message
                    });
                }
            },
            fetchActiveVehicles: async () => {
                set({ isLoading: true, error: null });
                try {
                    const response = await axios.get("/v1/vehicles/active");
                    set({
                        vehicles: response.data.data,
                        isLoading: false,
                        message: response.data.message,
                        statusCode: response.status
                    });
                } catch (error) {
                    const axiosError = error as AxiosError<ErrorResponse>;
                    set({
                        vehicles:[],
                        error: axiosError.response?.data?.message,
                        isLoading: false,
                        message: axiosError.response?.data?.message
                    });
                }
            },

            // Fetch a single vehicle by ID
            fetchVehicleById: async (id: string) => {
                set({ isLoading: true, error: null });
                try {
                    const response = await axios.get(`/v1/vehicles/${id}`);
                    set({
                        vehicle: response.data.data,
                        isLoading: false,
                        message: response.data.message,
                        statusCode: response.status
                    });
                } catch (error) {
                    const axiosError = error as AxiosError<ErrorResponse>;
                    set({
                        vehicle:[],
                        message: axiosError.response?.data?.message,
                        error: axiosError.response?.data?.message,
                        isLoading: false,
                    });
                }
            },

            vehicleToggleChange: async (id: string, status: boolean) => {
                set({ isLoading: true, error: null })
                try {
                    const response = await axios.post(`/v1/toggles-change/vehicle`, { id, status });
                    set((state) => ({
                        vehicles: state.vehicles.map((v) =>
                            v.vehicleId === id ? { ...v, isActive: !status } : v
                        ),
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

            // Create a new vehicle
            createVehicle: async (vehicleData: Partial<VehicleState>) => {
                set({ isLoading: true, error: null });
                try {
                    const formData = new FormData();
                    Object.entries(vehicleData).forEach(([key, value]) => {
                        if (value !== null && value !== undefined) {
                            if (key === 'imageUrl' && value instanceof File) {
                                formData.append('imageUrl', value);
                            } else if (value instanceof Date) {
                                formData.append(key, value.toISOString());
                            } else {
                                formData.append(key, String(value));
                            }
                        }
                    });

                    // Log formData content
                    // for (let pair of formData.entries()) {
                    //     console.log(pair[0], pair[1]);  // Ensure imageUrl exists
                    // }
                    const response = await axios.post("/v1/vehicles", formData, {
                        headers: {
                            'Content-Type': 'multipart/form-data',
                        },
                    });
                    set((state) => ({
                        vehicles: [...state.vehicles, response.data.data],
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

            // Update an existing vehicle
            updateVehicle: async (id: string, vehicleData: Vehicle) => {
                set({ isLoading: true, error: null });
                try {
                    if (vehicleData && vehicleData.imageUrl && typeof vehicleData.imageUrl === 'string') {
                        const response = await axios.put(`/v1/vehicles/${id}`, vehicleData);
                        set({
                            vehicle: response.data.data,
                            isLoading: false,
                            message: response.data.message,
                            statusCode: response.status,
                        });
                        return;
                    }

                    const image = new FormData();
                    
                    if (vehicleData.imageUrl && vehicleData.imageUrl instanceof File) {
                        image.append('image', vehicleData.imageUrl);
                    }
                    await axios.post("/v1/image-upload", image)
                        .then(async (res) => {
                            vehicleData.imageUrl = res.data.data;
                            const response = await axios.put(`/v1/vehicles/${id}`, vehicleData);
                            set({
                                vehicle: response.data.data,
                                isLoading: false,
                                message: response.data.message,
                                statusCode: response.status,
                            });
                        })
                        .catch((err) => {
                            set({
                                error: err.response?.data?.message,
                                isLoading: false,
                                statusCode: err.response?.status,
                                message: err.response?.data?.message,
                            });
                        });
                } catch (error) {
                    const axiosError = error as AxiosError<ErrorResponse>;
                    set({
                        message: axiosError.response?.data?.message,
                        error: axiosError.response?.data?.message,
                        isLoading: false,
                    });
                }
            },

            // Delete a vehicle
            deleteVehicle: async (id: string) => {
                set({ isLoading: true, error: null });
                try {
                    const response = await axios.delete(`/v1/vehicles/${id}`);
                    set((state) => ({
                        vehicles: state.vehicles.filter((v) => v.vehicleId !== id),
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
        }),
        { name: "vehicle-store" }
    )
);
