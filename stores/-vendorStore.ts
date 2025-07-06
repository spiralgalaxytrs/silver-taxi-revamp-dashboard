import { create } from "zustand";
import { persist } from "zustand/middleware";
import axios, { AxiosError } from "../lib/http-common";
import { ErrorResponse } from "types/auth";

interface Vendor {
  vendorId?: string;
  name: string;
  phone: string;
  email: string;
  password: string;
  remark: string;
  walletId: string;
  isLogin: boolean;
  totalEarnings: number;
  wallet: {
    walletId: string;
    balance: number;
    startAmount: number;
    minusAmount: number;
    plusAmount: number;
    totalAmount: string;
    currency: string;
    vendorId: string;
    createdAt: string;
  };
  createdAt: string;
}

interface wallet {
  transactionId: string;
  initiatedBy: string;
  initiatedTo: string;
  type: string;
  date: string;
  vendorId: string;
  // driverId: string;
  amount: number;
  createdAt: string;
  updatedAt: string;
}

interface VendorState {
  vendors: Vendor[];
  vendor: Vendor | null;
  walletsAmount: number | null;
  // wallets: wallet[];
  error: string | null;
  statusCode: number | null;
  message: string | null;
  isLoading: boolean;
  fetchVendors: () => Promise<void>;
  fetchVendorWalletAmount: () => Promise<void>;
  fetchVendorById: (id: string) => Promise<void>;
  createVendor: (vendorData: Partial<Vendor>) => Promise<void>;
  updateVendor: (id: string, vendorData: Partial<Vendor>) => Promise<void>;
  deleteVendor: (id: string | undefined) => Promise<void>;
  bulkDeleteVendors: (vendorIds: string[]) => Promise<void>;
  toggleVendorStatus: (id: string, status: boolean) => Promise<void>;
  addVendorWallet: (id: string, amount: number, remark: string) => Promise<void>;
  minusVendorWallet: (id: string, amount: number, remark: string) => Promise<void>;
}

export const useVendorStore = create<VendorState>()(
  persist(
    (set) => ({
      vendors: [],
      vendor: null,
      walletsAmount: null,
      error: null,
      statusCode: null,
      message: null,
      isLoading: false,

      fetchVendors: async () => {
        set({ isLoading: true, error: null });
        try {
          const response = await axios.get("/v1/vendors");
          set({
            vendors: response.data.data,
            isLoading: false,
            message: response.data.message,
            statusCode: response.status,
          });
        } catch (error) {
          const axiosError = error as AxiosError<ErrorResponse>;
          set({
            vendors: [],
            message: axiosError.response?.data?.message,
            error: axiosError.response?.data?.message,
            isLoading: false,
          });
        }
      },

      fetchVendorWalletAmount: async () => {
        set({ isLoading: true, error: null });
        try {
          const response = await axios.get(`/v1/vendors/wallet-amount`);
          set({
            walletsAmount: response.data.data,
            isLoading: false,
            message: response.data.message,
            statusCode: response.status,
          });
        } catch (error) {
          const axiosError = error as AxiosError<ErrorResponse>;
          set({
            walletsAmount: null,
            message: axiosError.response?.data?.message,
            isLoading: false,
          });
        }
      },

      fetchVendorById: async (id) => {
        set({ isLoading: true, error: null });
        try {
          const response = await axios.get(`/v1/vendors/${id}`);
          set({
            vendor: response.data.data,
            isLoading: false,
            message: response.data.message,
            statusCode: response.status,
          });
        } catch (error) {
          const axiosError = error as AxiosError<ErrorResponse>;
          set({
            vendor: null,
            message: axiosError.response?.data?.message,
            error: axiosError.response?.data?.message,
            isLoading: false,
          });
        }
      },

      createVendor: async (vendorData) => {
        set({ isLoading: true, error: null });
        try {
          const response = await axios.post(`/v1/vendors`, vendorData);
          set((state) => ({
            vendors: [...state.vendors, response.data.data],
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
          });
        }
      },

      toggleVendorStatus: async (id: string, status: boolean) => {
        set({ isLoading: true, error: null });
        try {
          const response = await axios.put(`/v1/vendors/toggle-changes/${id}`, { status });
          set((state) => ({
            vendors: state.vendors.map((vendor) => {
              if (vendor.vendorId === id) {
                return { ...vendor, isLogin: status };
              }
              return vendor;
            }),
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
          });
        }
      },
      updateVendor: async (id, vendorData) => {
        set({ isLoading: true, error: null });
        try {
          const response = await axios.put(`/v1/vendors/${id}`, vendorData);
          set((state) => ({
            vendors: state.vendors.map((vendor) =>
              vendor.vendorId === id ? { ...vendor, ...response.data.data } : vendor
            ),
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
          });
        }
      },

      deleteVendor: async (id) => {
        set({ isLoading: true, error: null });
        try {
          await axios.delete(`/v1/vendors/${id}`);
          set((state) => ({
            vendors: state.vendors.filter((vendor) => vendor.vendorId !== id),
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

      addVendorWallet: async (id: string, amount: number, remark: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await axios.post(`/v1/vendors/wallet/add/${id}`, { amount, remark });
          set((state) => ({
            vendors: state.vendors.map((vendor) =>
              vendor.vendorId === id ? { ...vendor, wallet: response.data.data } : vendor
            ),
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
          });
        }
      },

      minusVendorWallet: async (id: string, amount: number, remark: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await axios.post(`/v1/vendors/wallet/minus/${id}`, { amount, remark });
          set((state) => ({
            vendors: state.vendors.map((vendor) =>
              vendor.vendorId === id ? { ...vendor, wallet: response.data.data } : vendor
            ),
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
          });
        }
      },

      bulkDeleteVendors: async (vendorIds: string[]) => {
        set({ isLoading: true, error: null });
        try {
          await axios.delete(`/v1/vendors`, { data: { vendorIds } });
          set((state) => ({
            vendors: state.vendors.filter((vendor) => !vendorIds.includes(vendor.vendorId || '')),
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
    { name: "vendor-store" }
  )
);

export type { Vendor };
