import { create } from "zustand";
import { persist } from "zustand/middleware";
import axios, { AxiosError } from "../lib/http-common";
import { ErrorResponse } from "types/auth";

interface IpTracking {
  id: number;
  tenantId: string;
  ipAddressId?: string | null;
  ipAddress: string;
  visitTime: string;
  ipRange?: string;
  userAgent?: string;
  pageVisited?: string;
  visitsToday: number;
  totalVisits: number;
  lastLogin: string;

}

interface IpTrackingState {
  ipTrackings: IpTracking[];
  ipTracking: IpTracking | null;
  error: string | null;
  statusCode: number | null;
  message: string | null;
  isLoading: boolean;
  fetchIpTrackings: () => Promise<void>;
  deleteIp: (ipAddress: string) => Promise<void>;
  multiDeleteIp: (ipAddress: string[]) => Promise<void>;
}

export const useIpTrackingStore = create<IpTrackingState>()(
  persist(
    (set) => ({
      ipTrackings: [],
      ipTracking: null,
      error: null,
      statusCode: null,
      message: null,
      isLoading: false,

      fetchIpTrackings: async () => {
        set({ isLoading: true, error: null });
        try {
          const response = await axios.get("/v1/ip-tracking");
          
          set({
            ipTrackings: response.data.data,
            isLoading: false,
            message: response.data.message,
            statusCode: response.status
          });
        } catch (error) {
          const axiosError = error as AxiosError<ErrorResponse>;
          set({
            ipTrackings: [],
            error: axiosError.response?.data?.message,
            isLoading: false,
            message: axiosError.response?.data?.message
          });
        }
      },

      deleteIp: async (ipAddress) => {
        set({ isLoading: true, error: null });
        try {
          await axios.delete(`/v1/ip-tracking/`, { data: ipAddress });
          set((state) => ({
            ipTrackings: state.ipTrackings.filter((ipTracking) => ipTracking.ipAddress !== ipAddress),
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

      multiDeleteIp: async (ipAddress) => {
        set({ isLoading: true, error: null });
        try {
          const response = await axios.delete(`/v1/customers/`, { data: { ipAddress } });
          set((state) => ({
            ipTrackings: state.ipTrackings.filter((ipTracking) => !ipAddress.includes(ipTracking.ipAddress || "")),
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
    { name: "ip-store" }
  )
);

export type { IpTracking };