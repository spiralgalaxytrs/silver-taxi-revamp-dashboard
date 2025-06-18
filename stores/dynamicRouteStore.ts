import { create } from "zustand";
import { persist } from "zustand/middleware";
import axios, { AxiosError } from "../lib/http-common";

interface DynamicRoute {
    routeId: string;
    adminId: string;
    title: string;
    link: string;
    status: boolean;
    createdAt: string;
    image: File
}

interface ErrorResponse {
    message: string;
    success: boolean;
}

interface DynamicRouteState {
    routes: DynamicRoute[];
    route: DynamicRoute | null;
    error: string | null;
    statusCode: number | null;
    message: string | null;
    isLoading: boolean;
    fetchRoutes: () => Promise<void>;
    fetchRouteById: (id: string) => Promise<void>;
    createRoute: (newRoute: Partial<DynamicRoute>) => Promise<void>;
    updateRoute: (id: string, routeData: Partial<DynamicRoute>) => Promise<void>;
    deleteRoute: (id: string) => Promise<void>;
    multiDeleteRoutes: (routeIds: string[]) => Promise<void>;
}

export const useDynamicRouteStore = create<DynamicRouteState>()(
    persist(
        (set) => ({
            routes: [],
            route: null,
            error: null,
            statusCode: null,
            message: null,
            isLoading: false,

            fetchRoutes: async () => {
                set({ isLoading: true, error: null });
                try {
                    const response = await axios.get("/v1/dynamic-routes/");
                    set({
                        routes: response.data.data,
                        isLoading: false,
                        message: response.data.message,
                        statusCode: response.status,
                    });
                } catch (error) {
                    const axiosError = error as AxiosError<ErrorResponse>;
                    set({
                        routes:[],
                        error: axiosError.response?.data?.message,
                        isLoading: false,
                        message: axiosError.response?.data?.message,
                    });
                }
            },

            fetchRouteById: async (id) => {
                set({ isLoading: true, error: null });
                try {
                    const response = await axios.get(`/v1/dynamic-routes/${id}`);
                    set({
                        route: response.data.data,
                        isLoading: false,
                        message: response.data.message,
                        statusCode: response.status,
                    });
                } catch (error) {
                    const axiosError = error as AxiosError<ErrorResponse>;
                    set({
                        route:null,
                        message: axiosError.response?.data?.message,
                        error: axiosError.response?.data?.message,
                        isLoading: false,
                    });
                }
            },

            createRoute: async (newRoute) => {
                set({ isLoading: true, error: null });
                try {
                    const image = new FormData();
                    if (newRoute.image && newRoute.image instanceof File) {
                        image.append('image', newRoute.image);
                    }
                    await axios.post("/v1/image-upload", image)
                        .then(async (res) => {
                            newRoute.image = res.data.data;
                            const response = await axios.post("/v1/dynamic-routes", newRoute);
                            set((state) => ({
                                routes: [...state.routes, response.data.data],
                                isLoading: false,
                                message: response.data.message,
                                statusCode: response.status,
                            }));
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
                        statusCode: axiosError.response?.status,
                    });
                }
            },

            updateRoute: async (id, routeData) => {
                set({ isLoading: true, error: null });
                try {
                    if (routeData && routeData.image && typeof routeData.image === "string") {
                        const response = await axios.put(`/v1/dynamic-routes/${id}`, routeData);
                        const updatedRoute = response.data.data;
                        set((state) => ({
                            routes: state.routes.map((route) =>
                                route.routeId === id ? updatedRoute : route
                            ),
                            isLoading: false,
                            message: response.data.message,
                            statusCode: response.status,
                        }));
                        return;
                    }

                    const image = new FormData();
                    if (routeData.image && routeData.image instanceof File) {
                        image.append('image', routeData.image);
                    }
                    await axios.post("/v1/image-upload", image)
                        .then(async (res) => {
                            routeData.image = res.data.data;
                            const response = await axios.put(`/v1/dynamic-routes/${id}`, routeData);
                            set((state) => ({
                                routes: [...state.routes, response.data.data],
                                isLoading: false,
                                message: response.data.message,
                                statusCode: response.status,
                            }));
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

            deleteRoute: async (id) => {
                set({ isLoading: true, error: null });
                try {
                    await axios.delete(`/v1/dynamic-routes/${id}`);
                    set((state) => ({
                        routes: state.routes.filter((route) => route.routeId !== id),
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

            multiDeleteRoutes: async (routeIds) => {
                set({ isLoading: true, error: null });
                try {
                    await axios.delete("/v1/dynamic-routes/", { data: { dynamicRouteIds: routeIds } });
                    set((state) => ({
                        routes: state.routes.filter((route) => !routeIds.includes(route.routeId)),
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
        }),
        { name: "dynamic-route-store" }
    )
);

export type { DynamicRoute };