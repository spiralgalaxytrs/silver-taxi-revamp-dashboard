import { useMutation, useQuery, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import {
  createBooking,
  deleteBooking,
  fetchBookingById,
  fetchBookings,
  fetchVendorBookings,
  fetchDriverBookings,
  updateBooking,
  manualBookingComplete,
  bulkDeleteBookings,
  assignDriver,
  assignAllDriver,
  toggleTripStatus,
  togglePaymentStatus,
  togglePaymentMethod,
  fetchVendorBookingsById,
  toggleContactStatus,
  fetchRecentBookings,
  fetchDashboardData,
} from "services/booking";
import type { Booking, GetBookingsParams, GetDashboardDataParams } from "types/react-query/booking";


export const useFetchBookings = (params?: GetBookingsParams & { enabled?: boolean }) => {
  const { enabled = true, ...queryParams } = params || {};

  return useQuery({
    queryKey: ["bookings", queryParams],
    queryFn: () => fetchBookings(queryParams),
    enabled,
    placeholderData: keepPreviousData
  });
};

export const useFetchRecentBookings = (params?: GetBookingsParams & { enabled?: boolean }) => {
  const { enabled = true, ...queryParams } = params || {};

  return useQuery({
    queryKey: ["recent-bookings", queryParams],
    queryFn: () => fetchRecentBookings(queryParams),
    enabled,
    placeholderData: keepPreviousData
  });
};

export const useFetchDashboardData = (params?: GetDashboardDataParams & { enabled?: boolean }) => {
  const { enabled = true, ...queryParams } = params || {};
  return useQuery({
    queryKey: ["dashboard-data", queryParams],
    queryFn: () => fetchDashboardData(queryParams),
    enabled,
    placeholderData: keepPreviousData
  });
};

export const useFetchVendorBookings = () => {
  return useQuery({
    queryKey: ["vendor-bookings"],
    queryFn: fetchVendorBookings,
  });
};

export const useFetchVendorBookingsById = (id: string) => {
  return useQuery({
    queryKey: ["vendor-bookings", id],
    queryFn: () => fetchVendorBookingsById(id),
    enabled: !!id
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
    onSuccess: (context) => {
      const { bookingId } = context;
      queryClient.invalidateQueries({ queryKey: ["booking", bookingId] });
    }
  });
};
export const useManualBookingComplete = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Booking> }) =>
      manualBookingComplete(id, data),
    onSuccess: (context) => {
      const { bookingId } = context;
      queryClient.invalidateQueries({ queryKey: ["booking", bookingId] });
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


export const useToggleContactStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: { id: string; status: boolean; skipInvalidate?: boolean }) =>
      toggleContactStatus(params.id, params.status),

    onSuccess: (_data, variables) => {
      if (!variables?.skipInvalidate) {
        queryClient.invalidateQueries({ queryKey: ["bookings"] });
      }
    },
  });
};
