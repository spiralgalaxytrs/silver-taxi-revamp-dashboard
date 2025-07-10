import axios from "lib/http-common";
import { Booking } from "types/react-query/booking";

// Get all bookings
export const fetchBookings = async () => {
  const response = await axios.get("/v1/bookings");
  return response.data.data;
};

// Get vendor bookings
export const fetchVendorBookings = async () => {
  const response = await axios.get("/v1/bookings/vendor");
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
export const createBooking = async (data: Partial<Booking>) => {
  const response = await axios.post(`/v1/bookings`, data);
  return response.data.data;
};

// Update a booking
export const updateBooking = async (id: string, data: Partial<Booking>) => {
  const response = await axios.put(`/v1/bookings/${id}`, data);
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

// Toggle payment status
export const togglePaymentStatus = async (id: string, status: string) => {
  const response = await axios.post(`/v1/bookings/toggle-changes/${id}`, {
    paymentStatus: status,
  });
  return response.data;
};
