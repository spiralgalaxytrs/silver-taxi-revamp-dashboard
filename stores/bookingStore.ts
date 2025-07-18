import { create } from "zustand";
import { persist } from "zustand/middleware";
import axios, { AxiosError } from "../lib/http-common";
import { ErrorResponse } from "types/auth";


interface Booking {
  bookingId?: string;
  name: string;
  phone: string;
  email: string;
  pickup: string;
  drop: string;
  pickupDateTime: string;
  pickupTime?: string;
  vehicleType: string;
  discountAmount: number | null;
  dropDate: string | null;
  tariffId: string;
  driverId: string | null;
  vendorId: string;
  vehicleId: string | null;
  serviceId: string;
  packageId?: string;
  driverBeta: number | null;
  toll: number | null;
  hill: number | null;
  permitCharge: number | null;
  taxPercentage: number | null;
  taxAmount: number | null;
  price?: number | null;
  extraPrice?: number | null;
  distanceLimit?: number | null;
  distance: number | null;
  estimatedAmount: number | null;
  finalAmount: number | null;
  advanceAmount: number | null;
  upPaidAmount: number | null;
  offerId?: string | null;
  offerName?: string;
  pricePerKm: number | null;
  duration: string | null;
  paymentMethod: "UPI" | "Bank" | "Cash" | "Card";
  type: "Website" | "App" | "Manual";
  paymentStatus: "Unpaid" | "Paid" | "Partial Paid";
  serviceType: "One way" | "Round trip" | "Airport Pickup" | "Airport Drop" | "Day Packages" | "Hourly Packages";
  vehicleName: string;
  amount: number | null;
  bookingDate: string;
  status: "Completed" | "Cancelled" | "Not-Started" | "Started";
  createdBy: "Admin" | "Vendor";
  createdAt?: string | null;
  offers: Record<string, any>;
  vehicles: Record<string, any>;
  driver: Record<string, any>;


  startOtp: string;
  endOtp: string;
  tripStartedTime?: Date;
  tripCompletedTime?: Date;
  startOdometerImage?: string | null;
  endOdometerImage?: string | null;
  startOdometerValue?: number;
  endOdometerValue?: number;
  driverCharges?: any;
  driverAccepted?: "accepted" | "rejected" | "pending";
  tripCompletedPrice?: number;
  tripCompletedDuration?: string;
  tripCompletedFinalAmount?: number;
  tripCompletedDistance?: number;
  tripCompletedEstimatedAmount?: number;
  driverDeductionAmount?: number;
  vendorDeductionAmount?: number;
  bookingOrderId?: string;
  bookingPaymentId?: string;
  acceptTime?: Date;
  requestSentTime?: Date;

}

interface BookingState {
  bookings: Booking[];
  booking: Booking | null;
  error: string | null;
  statusCode: number | null;
  message: string | null;
  isLoading: boolean;
  fetchBookings: () => Promise<void>;
  fetchVendorBookings: () => Promise<void>;
  assignDriver: (bookingId: string, driverId: string) => Promise<void>;
  fetchBookingById: (id: string) => Promise<void>;
  createBooking: (bookingData: Partial<Booking>) => Promise<void>;
  updateBooking: (id: string, bookingData: Partial<Booking>) => Promise<void>;
  deleteBooking: (id: string | undefined) => Promise<void>;
  togglePaymentType: (id: string | undefined, status: string) => Promise<void>;
  toggleTripStatus: (id: string | undefined, status: string) => Promise<void>;
  togglePaymentStatus: (id: string | undefined, status: string) => Promise<void>;
  bulkDeleteBookings: (bookingIds: string[]) => Promise<void>;
}

export const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Month is 0-indexed
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`; // Format as YYYY-MM-DD
};

export const useBookingStore = create<BookingState>()(
  persist(
    (set) => ({
      bookings: [],
      booking: null,
      error: null,
      statusCode: null,
      message: null,
      isLoading: false,

      fetchBookings: async () => {
        set({ isLoading: true, error: null });
        try {
          const response = await axios.get("/v1/bookings");
          const transformedData = response.data.data.map((booking: any) => ({
            bookingId: booking.bookingId || booking.id,
            name: booking.name || '-',
            phone: booking.phone || '-',
            email: booking.email || '-',
            pickup: booking.pickup || '',
            drop: booking.drop || '',
            packageId: booking.packageId || '',
            pickupDate: booking.pickupDateTime,
            pickupTime: booking.pickupDateTime,
            dropDate: booking.dropDate,
            tariffId: booking.tariffId,
            driverId: booking.driverId,
            vendorId: booking.vendorId,
            vehicleId: booking.vehicleId,
            serviceId: booking.serviceId,
            driverBeta: booking.driverBeta || 0,
            toll: booking.toll || 0,
            hill: booking.hill || 0,
            permitCharge: booking.permitCharge || 0,
            taxPercentage: booking.taxPercentage || 0,
            createdBy: booking.createdBy,
            offerId: booking.offerId,
            offerName: booking.offerName,
            paymentMethod: booking.paymentMethod,
            paymentStatus: booking.paymentStatus,
            serviceType: booking.serviceType,
            type: booking.type,
            vehicleType: booking.vehicleType,
            estimatedAmount: booking.estimatedAmount || 0,
            finalAmount: booking.finalAmount || 0,
            discountAmount: booking.discountAmount || 0,
            advanceAmount: booking.advanceAmount || 0,
            upPaidAmount: booking.upPaidAmount || 0,
            vehicleName: booking.vehicleName,
            distance: booking.distance,
            amount: booking.amount,
            bookingDate: booking.createdAt,
            status: booking.status,
            tariff: booking.tariff,
            pricePerKm: booking.pricePerKm,
            duration: booking.duration,
            offers: booking.offers,
            vehicles: booking.vehicles,
            driver: booking.driver,
            createdAt: booking.createdAt,
          }));

          set({
            bookings: transformedData,
            isLoading: false,
            message: response.data.message,
            statusCode: response.status
          });


        } catch (error) {
          const axiosError = error as AxiosError<ErrorResponse>;
          set({
            bookings: [],
            error: axiosError.response?.data?.message,
            isLoading: false,
            message: axiosError.response?.data?.message
          });
        }
      },

      fetchVendorBookings: async () => {
        set({ isLoading: true, error: null });
        try {
          const response = await axios.get("/v1/bookings/vendor");
          const transformedData = response.data.data.map((booking: any) => ({
            bookingId: booking.bookingId || booking.id,
            name: booking.name || '-',
            phone: booking.phone || '-',
            email: booking.email || '-',
            pickup: booking.pickup || '',
            drop: booking.drop || '',
            pickupDate: booking.pickupDateTime,
            pickupTime: booking.pickupDateTime,
            dropDate: booking.dropDate,
            tariffId: booking.tariffId,
            driverId: booking.driverId,
            vendorId: booking.vendorId,
            vehicleId: booking.vehicleId,
            serviceId: booking.serviceId,
            driverBeta: booking.driverBeta || 0,
            toll: booking.toll || 0,
            hill: booking.hill || 0,
            permitCharge: booking.permitCharge || 0,
            taxPercentage: booking.taxPercentage || 0,
            createdBy: booking.createdBy,
            offerId: booking.offerId,
            offerName: booking.offerName,
            paymentMethod: booking.paymentMethod,
            paymentStatus: booking.paymentStatus,
            serviceType: booking.serviceType,
            type: booking.type,
            vehicleType: booking.vehicleType,
            estimatedAmount: booking.estimatedAmount || 0,
            finalAmount: booking.finalAmount || 0,
            discountAmount: booking.discountAmount || 0,
            advanceAmount: booking.advanceAmount || 0,
            upPaidAmount: booking.upPaidAmount || 0,
            vehicleName: booking.vehicleName,
            distance: booking.distance,
            amount: booking.amount,
            bookingDate: booking.createdAt,
            status: booking.status,
            tariff: booking.tariff,
            pricePerKm: booking.pricePerKm,
            duration: booking.duration,
            offers: booking.offers,
            vehicles: booking.vehicles,
            driver: booking.driver,
            createdAt: booking.createdAt,
          }));

          set({
            bookings: transformedData,
            isLoading: false,
            message: response.data.message,
            statusCode: response.status
          });


        } catch (error) {
          const axiosError = error as AxiosError<ErrorResponse>;
          set({
            bookings: [],
            error: axiosError.response?.data?.message,
            isLoading: false,
            message: axiosError.response?.data?.message
          });
        }
      },

      // fetchBookingById: async (id) => {
      //   console.log("Hiiiiiiiiii"); 
      //   set({ isLoading: true, error: null });
      //   try {
      //     const response = await axios.get(`/v1/bookings/${id}`);
      //     const transformedData = response.data.data.map((booking: any) => ({
      //       bookingId: booking.bookingId || booking.id,
      //       name: booking.name || '-',
      //       phone: booking.phone || '-',
      //       email: booking.email || '-',
      //       pickup: booking.pickup || '',
      //       drop: booking.drop || '',
      //       pickupDate: booking.pickupDateTime,
      //       pickupTime: booking.pickupDateTime,
      //       dropDate: booking.dropDate,
      //       tariffId: booking.tariffId,
      //       driverId: booking.driverId,
      //       vendorId: booking.vendorId,
      //       vehicleId: booking.vehicleId,
      //       serviceId: booking.serviceId,
      //       driverBeta: booking.driverBeta || 0,
      //       toll: booking.toll || 0,
      //       hill: booking.hill || 0,
      //       permitCharge: booking.permitCharge || 0,
      //       taxPercentage: booking.taxPercentage || 0,
      //       createdBy: booking.createdBy,
      //       offerId: booking.offerId,
      //       offerName: booking.offerName,
      //       paymentMethod: booking.paymentMethod,
      //       paymentStatus: booking.paymentStatus,
      //       serviceType: booking.serviceType,
      //       type: booking.type,
      //       vehicleType: booking.vehicleType,
      //       estimatedAmount: booking.estimatedAmount || 0,
      //       finalAmount: booking.finalAmount || 0,
      //       discountAmount: booking.discountAmount || 0,
      //       advanceAmount: booking.advanceAmount || 0,
      //       upPaidAmount: booking.upPaidAmount || 0,
      //       vehicleName: booking.vehicleName,
      //       distance: booking.distance,
      //       amount: booking.amount,
      //       bookingDate: booking.createdAt,
      //       status: booking.status,
      //       tariff: booking.tariff,
      //       pricePerKm: booking.pricePerKm,
      //       duration : booking.duration,
      //       offers: booking.offers,
      //       vehicles: booking.vehicles,
      //       driver: booking.driver,
      //       createdAt: booking.createdAt,
      //     }));

      //     set({
      //       booking: transformedData,
      //       isLoading: false,
      //       message: response.data.message,
      //       statusCode: response.status
      //     });
      //   } catch (error) {
      //     const axiosError = error as AxiosError<ErrorResponse>;
      //               console.log("Errro", error)

      //     set({
      //       booking: null,
      //       message: axiosError.response?.data?.message,
      //       error: axiosError.response?.data?.message,
      //       isLoading: false
      //     });
      //   }
      // },
      fetchBookingById: async (id) => {
        set({ isLoading: true, error: null });
        try {
          const response = await axios.get(`/v1/bookings/${id}`);
          const booking = response.data.data; // Assuming response.data.data is a single booking object
          const transformedData = {
            bookingId: booking.bookingId || booking.id,
            name: booking.name || '-',
            phone: booking.phone || '-',
            email: booking.email || '-',
            pickup: booking.pickup || '',
            drop: booking.drop || '',
            pickupDateTime: booking.pickupDateTime,
            // pickupTime: booking.pickupDateTime,
            dropDate: booking.dropDate,
            tariffId: booking.tariffId,
            driverId: booking.driverId,
            vendorId: booking.vendorId,
            vehicleId: booking.vehicleId,
            serviceId: booking.serviceId,
            driverBeta: booking.driverBeta || 0,
            toll: booking.toll || 0,
            hill: booking.hill || 0,
            permitCharge: booking.permitCharge || 0,
            taxPercentage: booking.taxPercentage || 0,
            taxAmount: booking.taxAmount || 0,
            createdBy: booking.createdBy,
            offerId: booking.offerId,
            offerName: booking.offerName,
            paymentMethod: booking.paymentMethod,
            paymentStatus: booking.paymentStatus,
            serviceType: booking.serviceType,
            type: booking.type,
            vehicleType: booking.vehicleType,
            estimatedAmount: booking.estimatedAmount || 0,
            finalAmount: booking.finalAmount || 0,
            discountAmount: booking.discountAmount || 0,
            advanceAmount: booking.advanceAmount || 0,
            upPaidAmount: booking.upPaidAmount || 0,
            vehicleName: booking.vehicleName,
            distance: booking.distance,
            amount: booking.amount,
            bookingDate: booking.createdAt,
            status: booking.status,
            tariff: booking.tariff,
            pricePerKm: booking.pricePerKm,
            duration: booking.duration,
            offers: booking.offers,
            vehicles: booking.vehicles,
            driver: booking.driver,
            startOtp: booking.startOtp,
            endOtp: booking.endOtp,
            tripStartedTime: booking.tripStartedTime,
            tripCompletedTime: booking.tripCompletedTime,
            startOdometerImage: booking.startOdometerImage,
            endOdometerImage: booking.endOdometerImage,
            startOdometerValue: booking.startOdometerValue,
            endOdometerValue: booking.endOdometerValue,
            driverCharges: booking.driverCharges,
            driverAccepted: booking.driverAccepted,
            tripCompletedPrice: booking.tripCompletedPrice,
            tripCompletedDuration: booking.tripCompletedDuration,
            tripCompletedFinalAmount: booking.tripCompletedFinalAmount,
            tripCompletedDistance: booking.tripCompletedDistance,
            tripCompletedEstimatedAmount: booking.tripCompletedEstimatedAmount,
            driverDeductionAmount: booking.driverDeductionAmount,
            vendorDeductionAmount: booking.vendorDeductionAmount,
            bookingOrderId: booking.bookingOrderId,
            bookingPaymentId: booking.bookingPaymentId,
            acceptTime: booking.acceptTime,
            requestSentTime: booking.requestSentTime,
            createdAt: booking.createdAt,
          };

          set({
            booking: transformedData,
            isLoading: false,
            message: response.data.message,
            statusCode: response.status,
          });
        } catch (error) {
          const axiosError = error as AxiosError<ErrorResponse>;
          set({
            booking: null,
            message: axiosError.response?.data?.message,
            error: axiosError.response?.data?.message,
            isLoading: false,
          });
        }
      },
      createBooking: async (bookingData) => {
        set({ isLoading: true, error: null });
        try {
          const response = await axios.post(`/v1/bookings`, bookingData)
          set((state) => ({
            bookings: [...state.bookings, response.data.data],
            isLoading: false,
            message: response.data.message,
            statusCode: response.status
          }));
          return response.data;
        } catch (error) {
          const axiosError = error as AxiosError<ErrorResponse>;
          set({
            message: axiosError.response?.data?.message,
            error: axiosError.response?.data?.message,
            isLoading: false,
            statusCode: axiosError.response?.status
          });
          // throw error;
        }
      },

      updateBooking: async (id, bookingData) => {
        console.log("booking data from store ==> ", bookingData);
        set({ isLoading: true, error: null });
        try {
          const response = await axios.put(`/v1/bookings/${id}`, bookingData);
          const updatedBooking = response.data.data;
          set((state) => ({
            bookings: state.bookings.map((booking) =>
              booking.bookingId === id ? {
                ...booking,
                ...updatedBooking,
                pickupDate: new Date(updatedBooking.pickupDate),
                dropDate: new Date(updatedBooking.dropDate),
              } : booking
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

      deleteBooking: async (id) => {
        set({ isLoading: true, error: null });
        try {
          await axios.delete(`/v1/bookings/${id}`);
          set((state) => ({
            bookings: state.bookings.filter((booking) => booking.bookingId !== id),
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

      togglePaymentType: async (id, status) => {
        set({ isLoading: true, error: null });
        try {
          const response = await axios.post(`/v1/bookings/toggle-changes/${id}`, { paymentMethod: status });
          set((state) => ({
            bookings: state.bookings.map((booking) =>
              booking.bookingId === id ? { ...booking, isActive: status } : booking
            ),
            isLoading: false,
            message: response.data.message,
            statusCode: response.status
          }));
        } catch (error) {
          const axiosError = error as AxiosError<ErrorResponse>;
          set({
            error: axiosError.response?.data?.message,
            isLoading: false,
            message: axiosError.response?.data?.message
          });
        }
      },

      toggleTripStatus: async (id, status) => {
        set({ isLoading: true, error: null });
        try {
          const response = await axios.post(`/v1/bookings/toggle-changes/${id}`, { status });
          set((state) => ({
            bookings: state.bookings.map((booking) =>
              booking.bookingId === id ? { ...booking, isActive: status } : booking
            ),
            isLoading: false,
            message: response.data.message,
            statusCode: response.status
          }));
        } catch (error) {
          const axiosError = error as AxiosError<ErrorResponse>;
          set({
            error: axiosError.response?.data?.message,
            isLoading: false,
            message: axiosError.response?.data?.message
          });
        }
      },
      togglePaymentStatus: async (id, status) => {
        set({ isLoading: true, error: null });
        try {
          const response = await axios.post(`/v1/bookings/toggle-changes/${id}`, { paymentStatus: status });
          set((state) => ({
            bookings: state.bookings.map((booking) =>
              booking.bookingId === id ? { ...booking, isActive: status } : booking
            ),
            isLoading: false,
            message: response.data.message,
            statusCode: response.status
          }));
        } catch (error) {
          const axiosError = error as AxiosError<ErrorResponse>;
          set({
            error: axiosError.response?.data?.message,
            isLoading: false,
            message: axiosError.response?.data?.message
          });
        }
      },
      // New bulk delete function using the multiDeleteBookings controller on the backend
      bulkDeleteBookings: async (bookingIds: string[]) => {
        set({ isLoading: true, error: null });
        try {
          // Adjust the endpoint if necessary so that it maps to the correct backend route.
          const response = await axios.delete(`/v1/bookings/`, { data: { bookingIds } });
          set((state) => ({
            bookings: state.bookings.filter(
              (booking) => !booking.bookingId || !bookingIds.includes(booking.bookingId)
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

      assignDriver: async (bookingId: string, driverId: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await axios.post(`/v1/bookings/assign-driver`, { bookingId, driverId });
          set({
            isLoading: false,
            message: response.data.message,
            statusCode: response.status
          });
        } catch (error) {
          const axiosError = error as AxiosError<ErrorResponse>;
          set({
            message: axiosError.response?.data?.message,
            isLoading: false,
            statusCode: axiosError.response?.status
          });
        }
      }

    }),
    { name: "booking-store" }
  )
);

export type { Booking };