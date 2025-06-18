import { create } from "zustand";
import { persist } from "zustand/middleware";
import axios, { AxiosError } from "../lib/http-common";

interface Enquiry {
    enquiryId?: string
    name: string
    email: string
    phone: string
    pickupDate: string;
    pickupTime: string;
    dropDate?: string | null;
    pickup: string;
    drop: string;
    serviceId: string;
    serviceName: "Round Trip" | "One Way" | "Airport Pickup" | "Airport Drop" | "Day Packages" | "Hourly Packages";
    type: "Website" | "App" | "Manual";
    status: "Current" | "Future" | "Fake" | "Booked";
    createdBy: "Admin" | "Vendor";
    createdAt: string;
}

interface ErrorResponse {
    message: string;
    success: boolean;
}

interface EnquiryState {
    enquiries: Enquiry[];
    enquiry: any| null;
    error: string | null;
    statusCode: number | null;
    message: string | null;
    isLoading: boolean;
    fetchEnquiries: () => Promise<void>;
    fetchVendorEnquiries: () => Promise<void>;
    fetchEnquiryById: (id: string) => Promise<void>;
    createEnquiry: (newEnquiry: Partial<Enquiry>) => Promise<void>;
    updateEnquiry: (id: string, enquiryData: Partial<Enquiry>) => Promise<void>;
    deleteEnquiry: (id: string) => Promise<void>;
    toggleChanges: (id: string | undefined, status: string) => Promise<void>;
    bulkDeleteEnquiries: (enquiryIds: string[]) => Promise<void>;
}

export const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Month is 0-indexed
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`; // Format as YYYY-MM-DD
};

export const useEnquiryStore = create<EnquiryState>()(
    persist(
        (set,get) => ({
            enquiries: [],
            enquiry: null,
            error: null,
            statusCode: null,
            message: null,
            isLoading: false,

            fetchEnquiries: async () => {
                set({ isLoading: true, error: null });
                try {
                    const response = await axios.get("/v1/enquiries");
                    const transformedData = response.data.data.map((enquiry: any) => ({
                        enquiryId: enquiry.enquiryId,
                        name: enquiry.name,
                        email: enquiry.email,
                        phone: enquiry.phone,
                        pickupDate: enquiry.pickupDateTime,
                        pickupTime: enquiry.pickupDateTime,
                        dropDate: enquiry.dropDate,
                        pickup: enquiry.pickup,
                        drop: enquiry.drop,
                        serviceId: enquiry.serviceId,
                        serviceName: enquiry.services.name,
                        type: enquiry.type,
                        status: enquiry.status,
                        createdBy: enquiry.createdBy,
                        createdAt: enquiry.createdAt,
                    }));
                    set({
                        enquiries: transformedData,
                        isLoading: false,
                        message: response.data.message,
                        statusCode: response.status
                    });
                } catch (error) {
                    const axiosError = error as AxiosError<ErrorResponse>;
                    set({
                        enquiries:[],
                        error: axiosError.response?.data?.message,
                        isLoading: false,
                        message: axiosError.response?.data?.message
                    });
                }
            },

            fetchVendorEnquiries: async () => {
                set({ isLoading: true, error: null });
                try {
                    const response = await axios.get("/v1/enquiries/vendor");
                    const transformedData = response.data.data.map((enquiry: any) => ({
                        enquiryId: enquiry.enquiryId,
                        name: enquiry.name,
                        email: enquiry.email,
                        phone: enquiry.phone,
                        pickupDate: enquiry.pickupDateTime,
                        pickupTime: enquiry.pickupDateTime,
                        dropDate: enquiry.dropDate,
                        pickup: enquiry.pickup,
                        drop: enquiry.drop,
                        serviceId: enquiry.serviceId,
                        serviceName: enquiry.services.name,
                        type: enquiry.type,
                        status: enquiry.status,
                        createdBy: enquiry.createdBy,
                        createdAt: enquiry.createdAt,
                    }));
                    set({
                        enquiries: transformedData,
                        isLoading: false,
                        message: response.data.message,
                        statusCode: response.status
                    });
                } catch (error) {
                    const axiosError = error as AxiosError<ErrorResponse>;
                    set({
                        enquiries:[],
                        error: axiosError.response?.data?.message,
                        isLoading: false,
                        message: axiosError.response?.data?.message
                    });
                }
            },

            fetchEnquiryById: async (id) => {
                set({ isLoading: true, error: null });
                try {
                    const response = await axios.get(`/v1/enquiries/${id}`);
                    // const transformedData = response.data.data.map((enquiry: any) => ({
                    //     enquiryId: enquiry.enquiryId,
                    //     name: enquiry.name,
                    //     email: enquiry.email,
                    //     phone: enquiry.phone,
                    //     pickupDate: enquiry.pickupDateTime,
                    //     pickupTime: enquiry.pickupDateTime,
                    //     dropDate: enquiry.dropDate,
                    //     pickup: enquiry.pickup,
                    //     drop: enquiry.drop,
                    //     serviceId: enquiry.serviceId,
                    //     serviceName: enquiry.services.name,
                    //     type: enquiry.type,
                    //     status: enquiry.status,
                    //     createdBy: enquiry.createdBy,
                    //     createdAt: enquiry.createdAt,
                    // }));
                    set({
                        enquiry: response.data.data,
                        isLoading: false,
                        message: response.data.message,
                        statusCode: response.status
                    });
                } catch (error) {
                    const axiosError = error as AxiosError<ErrorResponse>;
                    set({
                        enquiry:null,
                        message: axiosError.response?.data?.message,
                        error: axiosError.response?.data?.message,
                        isLoading: false,
                    });
                }
            },

            createEnquiry: async (newEnquiry) => {
                set({ isLoading: true, error: null });
                try {
                    const response = await axios.post("/v1/enquiries", newEnquiry);
                    set((state) => ({
                        enquiries: [...state.enquiries, response.data.data],
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
                        statusCode: axiosError.response?.status
                    });
                }
            },

            updateEnquiry: async (id, enquiryData) => {
                set({ isLoading: true, error: null });
                try {
                    const response = await axios.put(`/v1/enquiries/${id}`, enquiryData);
                    const updatedEnquiry = response.data.data;
                    set((state) => ({
                        enquiries: state.enquiries.map((enquiry) =>
                            enquiry.enquiryId === id ? {
                                ...enquiry,
                                ...updatedEnquiry,
                                pickupDate: new Date(updatedEnquiry.pickupDate),
                                dropDate: new Date(updatedEnquiry.dropDate),
                            } : enquiry
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

            deleteEnquiry: async (id) => {
                set({ isLoading: true, error: null });
                try {
                    await axios.delete(`/v1/enquiries/${id}`);
            
                    set((state) => ({
                        enquiries: state.enquiries.filter((enquiry) => enquiry.enquiryId !== id),
                        isLoading: false,
                    }));
                } catch (error) {
                    const axiosError = error as AxiosError<ErrorResponse>;
                    set({
                        message: axiosError.response?.data?.message || "Delete failed",
                        error: axiosError.response?.data?.message || "Delete failed",
                        isLoading: false,
                    });
                }
            },
            

            toggleChanges: async (id, status) => {
                set({ isLoading: true, error: null });
                try {
                    const response = await axios.post(`/v1/enquiries/toggle-changes/${id}`,{status}  );
                    set((state) => ({
                        enquiries: state.enquiries.map((enquiry) =>
                            enquiry.enquiryId === id ? {
                                ...enquiry,
                                status: status as "Current" | "Future" | "Fake"
                            } : enquiry
                        ),
                        isLoading: false,
                        message: "Changes toggled successfully",
                        statusCode: 200
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

            // New bulk delete function using the multiDeleteBookings controller on the backend
            bulkDeleteEnquiries: async (enquiryIds: string[]) => {
                set({ isLoading: true, error: null });
                try {
                    // Adjust the endpoint if necessary so that it maps to the correct backend route.
                    const response = await axios.delete(`/v1/enquiries/`, { data: { enquiryIds } });
                    set((state) => ({
                        enquiries: state.enquiries.filter(
                            (enquiry) => !enquiry.enquiryId || !enquiryIds.includes(enquiry.enquiryId)
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
                        statusCode: axiosError.response?.status,
                    });
                }
            },

        }),
        { name: "enquiry-store" }
    )
);

// Export the Enquiry type for use in other files
export type { Enquiry };