import { create } from "zustand";
import { persist } from "zustand/middleware";
import axios, { AxiosError } from "../lib/http-common";
import { ErrorResponse } from "types/auth";

interface SpecialPackage {
  permitId?: string;
  adminId?: string;
  origin: string;
  destination: string;
  noOfPermits: number;
  createdAt?: string;
}
interface FetchSpecialPackage {
  permitId: string;
  adminId?: string;
  origin: string;
  destination: string;
  noOfPermits: number;
  createdAt?: string;
}

interface SpecialPackageState {
  specialPackage: FetchSpecialPackage[];
  currentPackage: FetchSpecialPackage | null;
  error: string | null;
  statusCode: number | null;
  message: string | null;
  isLoading: boolean;
  fetchSpecialPackage: () => Promise<void>;
  fetchPackageById: (id: string) => Promise<void>;
  createPackage: (permitData: Partial<SpecialPackage[]>) => Promise<void>;
  updatePackage: (id: string, permitData: Partial<SpecialPackage[]>) => Promise<void>;
  deletePackage: (id: string) => Promise<void>;
  bulkDeleteSpecialPackage: (permitsId: string[]) => Promise<void>;
}

export const useSpecialPackageStore = create<SpecialPackageState>()(
  persist(
    (set) => ({
      specialPackage: [],
      currentPackage: null,
      error: null,
      statusCode: null,
      message: null,
      isLoading: false,

      fetchSpecialPackage: async () => {
        set({ isLoading: true, error: null });
        try {
          const response = await axios.get("/v1/permit-charges/");
          set({
            specialPackage: response.data.data,
            isLoading: false,
            message: response.data.message,
            statusCode: response.status
          });
        } catch (error) {
          const axiosError = error as AxiosError<ErrorResponse>;
          set({
            specialPackage: [],
            error: axiosError.response?.data?.message,
            isLoading: false,
            message: axiosError.response?.data?.message,
            statusCode: axiosError.response?.status
          });
        }
      },

      fetchPackageById: async (id) => {
        set({ isLoading: true, error: null });
        try {
          const response = await axios.get(`/v1/permit-charges/${id}`);
          set({
            currentPackage: response.data.data,
            isLoading: false,
            message: response.data.message,
            statusCode: response.status
          });
        } catch (error) {
          const axiosError = error as AxiosError<ErrorResponse>;
          set({
            currentPackage: null,
            error: axiosError.response?.data?.message,
            message: axiosError.response?.data?.message,
            isLoading: false,
            statusCode: axiosError.response?.status
          });
        }
      },

      createPackage: async (permitData) => {
        set({ isLoading: true, error: null });
        try {
          const response = await axios.post("/v1/permit-charges/", { permitData });
          set((state) => ({
            specialPackage: [...state.specialPackage, response.data.data],
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
        }
      },

      updatePackage: async (id, [permitData]) => {
        set({ isLoading: true, error: null });
        try {
          const { origin, destination, noOfPermits } = permitData || {};
          const response = await axios.put(`/v1/permit-charges/${id}`, { origin, destination, noOfPermits });
          set((state) => ({
            specialPackage: state.specialPackage.map((permit) =>
              permit.permitId === id ? { ...permit, ...response.data.data } : permit
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
            isLoading: false,
            statusCode: axiosError.response?.status
          });
        }
      },

      deletePackage: async (id) => {
        set({ isLoading: true, error: null });
        try {
          await axios.delete(`/v1/permit-charges/${id}`);
          set((state) => ({
            specialPackage: state.specialPackage.filter((permit) => permit.permitId !== id),
            isLoading: false,
            message: "SpecialPackage entry deleted successfully",
            statusCode: 200
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

      bulkDeleteSpecialPackage: async (permitsId: string[]) => {
        set({ isLoading: true, error: null });
        try {
          // Adjust the endpoint if necessary so that it maps to the correct backend route.
          const response = await axios.delete(`/v1/permit-charges/`, { data: { permitsId } });
          set((state) => ({
            specialPackage: state.specialPackage.filter((permit) => permit.permitId !== permit.permitId),
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
    { name: "permit-charges-store" }
  )
);

export type { SpecialPackage, FetchSpecialPackage }; 