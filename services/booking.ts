import axios from "lib/http-common";
import {
  Booking, GetBookingsParams,
  BookingsResponse, RecentBookingsResponse,
  DashboardDataResponse, GetDashboardDataParams
} from "types/react-query/booking";

// Get all bookings with pagination, search, and filtering
export const fetchBookings = async (params?: GetBookingsParams): Promise<BookingsResponse> => {
  const response = await axios.get("/v1/bookings", {
    params: {
      ...(params?.page && { page: params.page }),
      ...(params?.limit && { limit: params.limit }),
      ...(params?.search && { search: params.search }),
      ...(params?.status && { status: params.status }),
      ...(params?.isContacted && { isContacted: params.isContacted }),
      ...(params?.sortBy && { sortBy: params.sortBy }),
      ...(params?.sortOrder && { sortOrder: params.sortOrder }),
    },
  });
  return response.data.data;
};

export const fetchRecentBookings = async (params?: GetBookingsParams): Promise<RecentBookingsResponse> => {
  const response = await axios.get("/v1/bookings/recent", {
    params: {
      ...(params?.page && { page: params.page }),
      ...(params?.limit && { limit: params.limit }),
      ...(params?.sortBy && { sortBy: params.sortBy }),
      ...(params?.sortOrder && { sortOrder: params.sortOrder }),
    },
  });
  return response.data.data;
};

export const fetchDashboardData = async (params?: GetDashboardDataParams): Promise<DashboardDataResponse> => {
  const response = await axios.get("/v1/bookings/dashboard", {
    params: {
      ...(params?.areaChart && { areaChart: params.areaChart }),
      ...(params?.barChart && { barChart: params.barChart }),
      ...(params?.topDrivers && { sortBy: params.topDrivers }),
    },
  });
  console.log("dashboard data >> ", response.data.data);
  return response.data.data;
};

// Get vendor bookings
export const fetchVendorBookings = async () => {
  const response = await axios.get("/v1/bookings/vendor");
  return response.data.data;
};

// Get vendor bookings
export const fetchVendorBookingsById = async (vendorId: string) => {
  const response = await axios.get(`/v1/bookings/vendor/${vendorId}`);
  return response.data.data;
};

// Get Driver bookings
export const fetchDriverBookings = async (driverId: string) => {
  const response = await axios.get(`/v1/bookings/driver/${driverId}`);
  return response.data.data;
};

// Get booking by ID
export const fetchBookingById = async (id: string) => {
  const response = await axios.get(`/v1/bookings/${id}`);
  return response.data.data;
};

// Create a booking
export const createBooking = async (data: Partial<any>) => {
  const response = await axios.post(`/v1/bookings`, data);
  return response.data.data;
};

// Update a booking
export const updateBooking = async (id: string, data: Partial<Booking>) => {
  const response = await axios.put(`/v1/bookings/${id}`, data);
  return response.data.data;
};

// manually complete a booking
export const manualBookingComplete = async (id: string, data: Partial<Booking>) => {
  const response = await axios.post(`/v1/bookings/manual-complete/${id}`, data);
  return response.data.data;
};

// Delete a booking
export const deleteBooking = async (id: string) => {
  const response = await axios.delete(`/v1/bookings/${id}`);
  return response.data;
};

// Bulk delete
export const bulkDeleteBookings = async (bookingIds: string[]) => {
  const response = await axios.delete(`/v1/bookings`, {
    data: { bookingIds },
  });
  return response.data;
};

// Assign a driver
export const assignDriver = async ({
  bookingId,
  driverId,
}: {
  bookingId: string;
  driverId: string;
}) => {
  const response = await axios.post(`/v1/bookings/assign-driver`, {
    bookingId,
    driverId,
  });
  return response.data;
};

// Assign All drivers
export const assignAllDriver = async ({ id }: { id: string; }) => {
  const response = await axios.post(`/v1/bookings/${id}/assign-driver`);
  return response.data;
};

// Toggle trip status
export const toggleTripStatus = async (id: string, status: string) => {
  const response = await axios.post(`/v1/bookings/toggle-changes/${id}`, {
    status,
  });
  return response.data;
};

// Toggle payment method
export const togglePaymentMethod = async (id: string, method: string) => {
  const response = await axios.post(`/v1/bookings/toggle-changes/${id}`, {
    paymentMethod: method,
  });
  return response.data;
};

// Toggle contact status
export const toggleContactStatus = async (id: string, status: boolean) => {
  const response = await axios.post(`/v1/bookings/toggle-changes/${id}`, {
    contacted: status,
  });
  return response.data;
};

// Toggle payment status
export const togglePaymentStatus = async (id: string, status: string) => {
  const response = await axios.post(`/v1/bookings/toggle-changes/${id}`, {
    paymentStatus: status,
  });
  return response.data;
};
