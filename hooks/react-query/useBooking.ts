import { useMutation, useQuery } from "@tanstack/react-query";
import {
    createBooking,
    deleteBooking,
    fetchBookingById,
    fetchBookings,
    fetchVendorBookings,
    updateBooking,
    bulkDeleteBookings,
    assignDriver,
    toggleTripStatus,
    togglePaymentStatus,
    togglePaymentMethod
} from "services/booking";
import type { Booking } from "types/react-query/booking";


export const useFetchBookings = () => {
  return useQuery({
    queryKey: ["bookings"],
    queryFn: fetchBookings,
  });
};

export const useFetchVendorBookings = () => {
  return useQuery({
    queryKey: ["vendor-bookings"],
    queryFn: fetchVendorBookings,
  });
};

export const useFetchBookingById = (id: string) => {
  return useQuery({
    queryKey: ["booking", id],
    queryFn: () => fetchBookingById(id),
    enabled: !!id,
  });
};

export const useCreateBooking = () => {
  return useMutation({
    mutationFn: createBooking,
  });
};

export const useUpdateBooking = () => {
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Booking> }) =>
      updateBooking(id, data),
  });
};

export const useDeleteBooking = () => {
  return useMutation({
    mutationFn: deleteBooking,
  });
};

export const useBulkDeleteBookings = () => {
  return useMutation({
    mutationFn: bulkDeleteBookings,
  });
};

export const useAssignDriver = () => {
  return useMutation({
    mutationFn: assignDriver,
  });
};

export const useToggleTripStatus = () => {
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      toggleTripStatus(id, status),
  });
};

export const useTogglePaymentMethod = () => {
  return useMutation({
    mutationFn: ({ id, method }: { id: string; method: string }) =>
      togglePaymentMethod(id, method),
  });
};

export const useTogglePaymentStatus = () => {
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      togglePaymentStatus(id, status),
  });
};
