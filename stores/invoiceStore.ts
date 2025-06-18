import { create } from "zustand";
import { persist } from "zustand/middleware";
import axios, { AxiosError } from "../lib/http-common";
import { ErrorResponse } from "types/auth";

interface Invoice {
    invoiceId?: string;
    bookingId: string;
    companyId?: string;
    invoiceNo?: string;
    invoiceDate: string;
    name: string;
    phone: string;
    email: string;
    serviceType: string;
    vehicleType: string;
    totalKm?: number;
    pricePerKm?: number;
    travelTime?: string;
    address?: string;
    totalAmount: number;
    otherCharges?: Record<string, number>;
    paymentDetails?: string | any;
    createdBy: "Admin" | "Vendor";
    status: "Partial Paid" | "Paid" | "Unpaid";
    booking?: any;
    companyProfile?: any;
    createdAt?: string;
    pickup?: string;
    drop?: string;
    note?: string;
    GSTNumber?: string;
    offerId?: string | null;
}

interface InvoiceState {
    invoices: Invoice[];
    invoice: Invoice | null;
    error: string | null;
    statusCode: number | null;
    message: string | null;
    isLoading: boolean;
    fetchInvoices: () => Promise<void>;
    fetchInvoiceById: (id: string) => Promise<void>;
    createInvoice: (invoiceData: Partial<Invoice>) => Promise<void>;
    updateInvoice: (id: string, invoiceData: Partial<Invoice>) => Promise<void>;
    deleteInvoice: (id: string) => Promise<void>;
    fetchVendorInvoices: () => Promise<void>;
    fetchAdminInvoices: () => Promise<void>;
    multiDeleteInvoice: (invoiceIds: string[]) => Promise<void>;
}

export const useInvoiceStore = create<InvoiceState>()(
    persist(
        (set) => ({
            invoices: [],
            invoice: null,
            error: null,
            statusCode: null,
            message: null,
            isLoading: false,

            fetchInvoices: async () => {
                set({ isLoading: true, error: null });
                try {
                    const response = await axios.get("/v1/invoices");
                    set({
                        invoices: response.data.data,
                        isLoading: false,
                        message: response.data.message,
                        statusCode: response.status
                    });
                } catch (error) {
                    const axiosError = error as AxiosError<ErrorResponse>;
                    set({
                        invoices:[],
                        error: axiosError.response?.data?.message,
                        isLoading: false,
                        message: axiosError.response?.data?.message
                    });
                }
            },

            fetchInvoiceById: async (id) => {
                set({ isLoading: true, error: null });
                try {
                    const response = await axios.get(`/v1/invoices/${id}`);
                    set({
                        invoice: response.data.data,
                        isLoading: false,
                        message: response.data.message,
                        statusCode: response.status
                    });
                } catch (error) {
                    const axiosError = error as AxiosError<ErrorResponse>;
                    set({
                        invoice:null,
                        message: axiosError.response?.data?.message,
                        error: axiosError.response?.data?.message,
                        isLoading: false
                    });
                }
            },

            createInvoice: async (invoiceData) => {
                set({ isLoading: true, error: null });
                try {
                    const response = await axios.post('/v1/invoices/', invoiceData);
                    set((state) => ({
                        invoices: [...state.invoices, response.data.data],
                        isLoading: false,
                        message: response.data.message,
                        statusCode: response.status
                    }));
                } catch (error) {
                    const axiosError = error as AxiosError<ErrorResponse>;
                    const errorMessage = axiosError.response?.data?.message
                    set({
                        error: errorMessage,
                        isLoading: false,
                        message: errorMessage, // Store the error message for later use
                        statusCode: axiosError.response?.status || 400
                    });
                    // throw new Error(errorMessage);
                }
            },

            updateInvoice: async (id, invoiceData) => {
                set({ isLoading: true, error: null });
                try {
                    const response = await axios.put(`/v1/invoices/${id}`, invoiceData);
                    set((state) => ({
                        invoices: state.invoices.map((invoice) =>
                            invoice.invoiceId === id ? { ...invoice, ...response.data.data } : invoice
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
                        isLoading: false
                    });
                }
            },

            deleteInvoice: async (id) => {
                set({ isLoading: true, error: null });
                try {
                    await axios.delete(`/v1/invoices/${id}`);
                    set((state) => ({
                        invoices: state.invoices.filter((invoice) => invoice.invoiceId !== id),
                        isLoading: false
                    }));
                } catch (error) {
                    const axiosError = error as AxiosError<ErrorResponse>;
                    set({
                        message: axiosError.response?.data?.message,
                        error: axiosError.response?.data?.message,
                        isLoading: false
                    });
                }
            },

            fetchVendorInvoices: async () => {
                set({ isLoading: true, error: null });
                try {
                    const response = await axios.get("/v1/invoices/vendor");
                    set({
                        invoices: response.data.data,
                        isLoading: false,
                        message: response.data.message,
                        statusCode: response.status
                    });
                } catch (error) {
                    const axiosError = error as AxiosError<ErrorResponse>;
                    set({
                        invoices:[],
                        message: axiosError.response?.data?.message,
                        error: axiosError.response?.data?.message,
                        isLoading: false
                    });
                }
            },

            fetchAdminInvoices: async () => {
                set({ isLoading: true, error: null });
                try {
                    const response = await axios.get("/v1/invoices/admin");
                    set({
                        invoices: response.data.data,
                        isLoading: false,
                        message: response.data.message,
                        statusCode: response.status
                    });
                } catch (error) {
                    const axiosError = error as AxiosError<ErrorResponse>;
                    set({
                        invoices:[],
                        message: axiosError.response?.data?.message,
                        error: axiosError.response?.data?.message,
                        isLoading: false
                    });
                }
            },

            multiDeleteInvoice: async (invoiceIds) => {
                set({ isLoading: true, error: null });
                try {
                    const response = await axios.delete(`/v1/invoices/`, { data: { invoiceIds } });
                    set((state) => ({
                        invoices: state.invoices.filter((invoice) => !invoiceIds.includes(invoice.invoiceId || "")),
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
        { name: "invoice-store" }
    )
);

export type { Invoice };















