import { create } from "zustand";
import { persist } from "zustand/middleware";
import axios, { AxiosError } from "../lib/http-common";
import { ErrorResponse } from "types/auth";

interface Customer {
    customerId?: string;
    name: string;
    email: string;
    phone: string;
    bookingCount: number;
    totalAmount: number;
    createdBy: "Admin" | "Vendor";
    createdAt: string;
}

interface CustomerBooking {
    bookingId: string;
    name: string;
    email: string;
    phone: string;
    serviceType: string;
    pickupDate: string;
    pickupTime: string;
    dropDate: string;
    enquiryId?: string | null;
    driverId?: string | null;
    tariffId: string;
    pickup: string;
    drop: string;
    distance: string;
    estimatedAmount: number;
    discountAmount: number;
    offerId?: string | null;
    paymentType: string;
    finalAmount: number;
    createdBy: "Admin" | "Vendor";
    paymentStatus: string;
    status: string;
    type: string;
    createdAt: string;
    bookingDate: string;
    totalAmount: number;
}


interface CustomerState {
    customers: Customer[];
    customerBookings: CustomerBooking[];
    customer: Customer | null;
    statusCode: number | null;
    error: string | null;
    isLoading: boolean;
    message: string | null;
    fetchCustomers: () => Promise<void>;
    fetchVendorCustomers: () => Promise<void>;
    getCustomerById: (id: string) => Promise<void>;
    deleteCustomer: (id: string) => Promise<void>;
    getCustomerBooking: (id: string) => Promise<void>;
    multiDeleteCustomers: (customerIds: string[]) => Promise<void>;
}

export const useCustomerStore = create<CustomerState>()(
    persist(
        (set) => ({
            customers: [],
            customer: null,
            statusCode: null,
            customerBookings: [],
            error: null,
            isLoading: false,
            message: null,

            fetchCustomers: async () => {
                set({ isLoading: true, error: null });
                try {
                    const response = await axios.get("/v1/customers");
                    set({
                        customers: response.data.data,
                        isLoading: false,
                        statusCode: response.status,
                    });
                } catch (error) {
                    const axiosError = error as AxiosError<ErrorResponse>;
                    set({
                        customers: [],
                        message: axiosError.response?.data?.message,
                        error: axiosError.response?.data?.message,
                        isLoading: false,
                    });
                }
            },

            fetchVendorCustomers: async () => {
                set({ isLoading: true, error: null });
                try {
                    const response = await axios.get("/v1/customers/vendor");
                    set({
                        customers: response.data.data,
                        isLoading: false,
                        statusCode: response.status,
                    });
                } catch (error) {
                    const axiosError = error as AxiosError<ErrorResponse>;
                    set({
                        customers: [],
                        message: axiosError.response?.data?.message,
                        error: axiosError.response?.data?.message,
                        isLoading: false,
                    });
                }
            },

            getCustomerById: async (id) => {
                set({ isLoading: true, error: null });
                try {
                    const response = await axios.get(`/v1/customers/${id}`);
                    set({
                        customer: response.data.data,
                        isLoading: false,
                        statusCode: response.status,
                    });
                } catch (error) {
                    const axiosError = error as AxiosError<ErrorResponse>;
                    set({
                        customer: null,
                        message: axiosError.response?.data?.message,
                        error: axiosError.response?.data?.message,
                        isLoading: false,
                    });
                }
            },

            deleteCustomer: async (id) => {
                set({ isLoading: true, error: null });
                try {
                    await axios.delete(`/v1/customers/${id}`);
                    set((state) => ({
                        customers: state.customers.filter((customer) => customer.customerId !== id),
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

            getCustomerBooking: async (id) => {
                set({ isLoading: true, error: null });
                try {
                    const response = await axios.get(`/v1/customers/bookings/${id}`);
                    const receivedData = response.data.data;
                    const customerBookings = receivedData.map((booking: any) => ({
                        bookingId: booking.bookingId,
                        name: booking.name,
                        email: booking.email,
                        phone: booking.phone,
                        serviceType: booking.serviceType,
                        pickupDate: booking.pickupDateTime,
                        pickupTime: booking.pickupDateTime,
                        dropDate: booking.dropDate,
                        enquiryId: booking.enquiryId,
                        driverId: booking.driverId,
                        tariffId: booking.tariffId,
                        pickup: booking.pickup,
                        drop: booking.drop,
                        distance: booking.distance,
                        estimatedAmount: booking.estimatedAmount,
                        discountAmount: booking.discountAmount,
                        offerId: booking.offerId,
                        paymentType: booking.paymentType,
                        finalAmount: booking.finalAmount,
                        createdBy: booking.createdBy,
                        paymentStatus: booking.paymentStatus,
                        status: booking.status,
                        type: booking.type,
                        createdAt: booking.createdAt,
                    }));
                    set({
                        customerBookings: customerBookings,
                        isLoading: false,
                    });
                } catch (error) {
                    const axiosError = error as AxiosError<ErrorResponse>;
                    set({
                        customerBookings:[],
                        message: axiosError.response?.data?.message,
                        error: axiosError.response?.data?.message,
                        isLoading: false,
                    });
                }
            },

            multiDeleteCustomers: async (customerIds) => {
                set({ isLoading: true, error: null });
                try {
                    const response = await axios.delete(`/v1/customers/`, { data: { customerIds } });
                    set((state) => ({
                        customers: state.customers.filter((customer) => !customerIds.includes(customer.customerId || "")),
                        isLoading: false,
                        statusCode: response.status,
                    }));
                } catch (error) {
                    const axiosError = error as AxiosError<ErrorResponse>;
                    set({
                        customers:[],
                        message: axiosError.response?.data?.message,
                        error: axiosError.response?.data?.message,
                        isLoading: false,
                    });
                }
            },
        }),
        { name: "customer-store" }
    )
);

export type { Customer };
