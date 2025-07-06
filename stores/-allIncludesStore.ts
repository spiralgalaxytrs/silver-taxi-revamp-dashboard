import { create } from "zustand";
import { persist } from "zustand/middleware";
import axios, { AxiosError } from "../lib/http-common";
import { ErrorResponse } from "types/auth";


export interface VehiclePrices {
  type: string | "Suv" | "Innova" | "Sedan",
  price: number
}

 export interface AllIncludes {
  includeId: string;
  adminId: string;
  origin: string;
  destination: string;
  tollPrice: number;
  hillPrice: number;
  Km: number;
  vehicles: VehiclePrices[];
  createdAt?: string;
} 

interface AllIncludesState {
  allIncludes: AllIncludes[];
  currentInclude: AllIncludes | null;
  error: string | null;
  statusCode: number | null;
  message: string | null;
  isLoading: boolean;
  fetchAllIncludes: () => Promise<void>;
  fetchIncludeById: (id: string) => Promise<void>;
  createInclude: (includeData: Partial<AllIncludes>) => Promise<void>;
  updateInclude: (id: string, includeData: Partial<AllIncludes>) => Promise<void>;
  deleteInclude: (id: string) => Promise<void>;
  bulkDeleteAllIncludes: (includesId: string[]) => Promise<void>;
}

export const useAllIncludesStore = create<AllIncludesState>()(
  persist(
    (set) => ({
      allIncludes: [],
      currentInclude: null,
      error: null,
      statusCode: null,
      message: null,
      isLoading: false,

      fetchAllIncludes: async () => {
        set({ isLoading: true, error: null });
        try {
          const response = await axios.get("/v1/all-includes/");
          set({
            allIncludes: response.data.data,
            isLoading: false,
            message: response.data.message,
            statusCode: response.status
          });
        } catch (error) {
          const axiosError = error as AxiosError<ErrorResponse>;
          set({
            allIncludes:[],
            error: axiosError.response?.data?.message,
            isLoading: false,
            message: axiosError.response?.data?.message
          });
        }
      },

      fetchIncludeById: async (id) => {
        set({ isLoading: true, error: null });  
        try {
          const response = await axios.get(`/v1/all-includes/${id}`);
          set({
            currentInclude: response.data.data,
            isLoading: false,
            message: response.data.message,
            statusCode: response.status
          });
        } catch (error) {
          const axiosError = error as AxiosError<ErrorResponse>;
          set({
            currentInclude:null,
            error: axiosError.response?.data?.message,
            message : axiosError.response?.data?.message,
            isLoading: false
          });
        }
      },

      createInclude: async (includeData) => {
        set({ isLoading: true, error: null });
        try {
            const fdata = {
                ...includeData,
                vehicles: includeData.vehicles || {} // Directly use vehicles object
              };
          
          const response = await axios.post("/v1/all-includes/", fdata);
          set((state) => ({
            allIncludes: [...state.allIncludes, response.data.data],
            isLoading: false,
            message: response.data.message,
            statusCode: response.status
          }));
        } catch (error) {
          const axiosError = error as AxiosError<ErrorResponse>;
          set({
            error: axiosError.response?.data?.message,
            message: axiosError.response?.data?.message,
            isLoading: false,
            statusCode: axiosError.response?.status
          });
          throw error;
        }
      },

      updateInclude: async (id, includeData) => {
        set({ isLoading: true, error: null });
        try {
            const fdata = {
                ...includeData,
                vehicles: includeData.vehicles || {} // Directly use vehicles object
              };

          const response = await axios.put(`/v1/all-includes/${id}`, fdata);
          set((state) => ({
            allIncludes: state.allIncludes.map((include) =>
              include.includeId === id ? { ...include, ...response.data.data } : include
            ),
            isLoading: false,
            message: response.data.message,
            statusCode: response.status
          }));
        } catch (error) {
          const axiosError = error as AxiosError<ErrorResponse>;
          set({
            error: axiosError.response?.data?.message,
            message: axiosError.response?.data?.message,
            isLoading: false
          });
        }
      },

      deleteInclude: async (id) => {
        set({ isLoading: true, error: null });
        try {
          await axios.delete(`/v1/all-includes/${id}`);
          set((state) => ({
            allIncludes: state.allIncludes.filter((include) => include.includeId !== id),
            isLoading: false,
            message: "AllIncludes entry deleted successfully",
            statusCode: 200
          }));
        } catch (error) {
          const axiosError = error as AxiosError<ErrorResponse>;
          set({
            error: axiosError.response?.data?.message,
            message: axiosError.response?.data?.message,
            isLoading: false
          });
        }
      },

      bulkDeleteAllIncludes: async (includesId: string[]) => {
        set({ isLoading: true, error: null });
        try {
          // Adjust the endpoint if necessary so that it maps to the correct backend route.
          const response = await axios.delete(`/v1/all-includes/multi-delete`, { data: { includesId } });
          set((state) => ({
            allIncludes: state.allIncludes.filter((include) => include.includeId !== include.includeId),
            isLoading: false,
            message: response.data.message,
            statusCode: response.status,
          }));
        } catch (error) {
          const axiosError = error as AxiosError<ErrorResponse>;
          set({
            error: axiosError.response?.data?.message,
            message: axiosError.response?.data?.message,
            isLoading: false,
            statusCode: axiosError.response?.status,
          });
        }
      },

    }),
    { name: "all-includes-store" }
  )
);
