import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createBooking,
  deleteBooking,
  fetchBookingById,
  fetchBookings,
  fetchVendorBookings,
  fetchDriverBookings,
  updateBooking,
  bulkDeleteBookings,
  assignDriver,
  assignAllDriver,
  toggleTripStatus,
  togglePaymentStatus,
  togglePaymentMethod,
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

export const useFetchDriverBookings = (id: string) => {
  return useQuery({
    queryKey: ["driver-bookings", id],
    queryFn: () => fetchDriverBookings(id),
    enabled: !!id
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
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createBooking,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
    }
  });
};

export const useUpdateBooking = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Booking> }) =>
      updateBooking(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
    }
  });
};

export const useDeleteBooking = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteBooking,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
    }
  });
};

export const useBulkDeleteBookings = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: bulkDeleteBookings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
    }
  });
};

export const useAssignDriver = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: assignDriver,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
    }
  });
};

export const useAssignAllDriver = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: assignAllDriver,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
    }
  });
};

export const useToggleTripStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      toggleTripStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
    }
  });
};

export const useTogglePaymentMethod = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, method }: { id: string; method: string }) =>
      togglePaymentMethod(id, method),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
    }
  });
};

export const useTogglePaymentStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      togglePaymentStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
    }
  });
};
