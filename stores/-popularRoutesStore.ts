import { create } from "zustand";
import { persist } from "zustand/middleware";
import axios, { AxiosError } from "../lib/http-common";

interface PopularRoutes {
    routeId: string;
    adminId?: string;
    from: string;
    to: string;
    fromImage: File | string;
    toImage: File | string;
    price: string;
    status: boolean;
}

interface ErrorResponse {
    message: string;
    success: boolean;
}

interface PopularRoutesState {
    routes: PopularRoutes[];
    route: PopularRoutes | null;
    error: string | null;
    statusCode: number | null;
    message: string | null;
    isLoading: boolean;
    fetchPopularRoutes: () => Promise<void>;
    fetchPopularRouteById: (id: string) => Promise<void>;
    createPopularRoute: (newRoute: Partial<PopularRoutes>) => Promise<void>;
    updatePopularRoute: (id: string, routeData: Partial<PopularRoutes>) => Promise<void>;
    deletePopularRoute: (id: string) => Promise<void>;
    multiDeletePopularRoutes: (routeIds: string[]) => Promise<void>;
}

export const usePopularRoutesStore = create<PopularRoutesState>()(
    persist(
        (set) => ({
            routes: [],
            route: null,
            error: null,
            statusCode: null,
            message: null,
            isLoading: false,

            fetchPopularRoutes: async () => {
                set({ isLoading: true, error: null });
                try {
                    const response = await axios.get("/v1/popular-routes/");
                    set({
                        routes: response.data.data,
                        isLoading: false,
                        message: response.data.message,
                        statusCode: response.status,
                    });
                } catch (error) {
                    const axiosError = error as AxiosError<ErrorResponse>;
                    set({
                        routes: [],
                        error: axiosError.response?.data?.message,
                        isLoading: false,
                        message: axiosError.response?.data?.message,
                    });
                }
            },

            fetchPopularRouteById: async (id) => {
                set({ isLoading: true, error: null });
                try {
                    const response = await axios.get(`/v1/popular-routes/${id}`);
                    set({
                        route: response.data.data,
                        isLoading: false,
                        message: response.data.message,
                        statusCode: response.status,
                    });
                } catch (error) {
                    const axiosError = error as AxiosError<ErrorResponse>;
                    set({
                        route: null,
                        message: axiosError.response?.data?.message,
                        error: axiosError.response?.data?.message,
                        isLoading: false,
                    });
                }
            },

            createPopularRoute: async (popularRoute) => {
                set({ isLoading: true, error: null });
                try {

                    // Upload fromImage separately
                    if (popularRoute.fromImage && popularRoute.fromImage instanceof File) {
                        const fromFormData = new FormData();
                        fromFormData.append('image', popularRoute.fromImage); // Ensure key matches backend expectations
                        const fromRes = await axios.post("/v1/image-upload", fromFormData);
                        popularRoute.fromImage = fromRes.data.data ?? null// Update with uploaded image URL
                    }

                    // Upload toImage separately
                    if (popularRoute.toImage && popularRoute.toImage instanceof File) {
                        const toFormData = new FormData();
                        toFormData.append('image', popularRoute.toImage);
                        const toRes = await axios.post("/v1/image-upload", toFormData);
                        popularRoute.toImage = toRes.data.data ?? null;
                    }

                    // Now send the final popularRoute data to create the route
                    const response = await axios.post("/v1/popular-routes", popularRoute);
                    set((state) => ({
                        routes: [...state.routes, response.data.data],
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

            updatePopularRoute: async (id, routeData) => {
                set({ isLoading: true, error: null });
            
                try {            
                    // Upload fromImage separately if it's a File
                    if (routeData.fromImage && routeData.fromImage instanceof File) {
                        const fromFormData = new FormData();
                        fromFormData.append('image', routeData.fromImage);
                        const fromRes = await axios.post("/v1/image-upload", fromFormData);
                        routeData.fromImage = fromRes.data.data ?? null; // Ensure correct field assignment
                    }
            
                    // Upload toImage separately if it's a File
                    if (routeData.toImage && routeData.toImage instanceof File) {
                        const toFormData = new FormData();
                        toFormData.append('image', routeData.toImage);
                        const toRes = await axios.post("/v1/image-upload", toFormData);
                        routeData.toImage = toRes.data.data ?? null; // Ensure correct field assignment
                    }
            
                    // Now send the updated route data
                    const response = await axios.put(`/v1/popular-routes/${id}`, routeData);
                    set((state) => ({
                        routes: state.routes.map((route) =>
                            route.routeId === id ? response.data.data : route
                        ),
                        isLoading: false,
                        message: response.data.message,
                        statusCode: response.status,
                    }));
                } catch (error) {
                    const axiosError = error as AxiosError<ErrorResponse>;
                    console.error("Error updating popular route:", axiosError);
                    set({
                        message: axiosError.response?.data?.message || "Failed to update popular route",
                        error: axiosError.response?.data?.message || "Unknown error",
                        isLoading: false,
                        statusCode: axiosError.response?.status,
                    });
                }
            },
            

            deletePopularRoute: async (id) => {
                set({ isLoading: true, error: null });
                try {
                    await axios.delete(`/v1/popular-routes/${id}`);
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

            multiDeletePopularRoutes: async (routeIds) => {
                set({ isLoading: true, error: null });
                try {
                    await axios.delete("/v1/popular-routes/", { data: { popularRouteIds: routeIds } });
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
        { name: "popular-route-store" }
    )
);

export type { PopularRoutes };