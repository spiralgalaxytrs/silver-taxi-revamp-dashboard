import axios from "lib/http-common";
import type { Customer, CustomerBooking } from "types/react-query/customer";

// 🧾 Fetch all customers
export const getCustomers = async (): Promise<Customer[]> => {
  const res = await axios.get("/v1/customers");
  return res.data.data;
};

// 🧾 Fetch vendor customers
export const getVendorCustomers = async (): Promise<Customer[]> => {
  const res = await axios.get("/v1/customers/vendor");
  return res.data.data;
};

// 🔍 Fetch customer by ID
export const getCustomerById = async (id: string): Promise<Customer> => {
  const res = await axios.get(`/v1/customers/${id}`);
  return res.data.data;
};

// 📦 Fetch customer bookings
export const getCustomerBooking = async (id: string): Promise<CustomerBooking[]> => {
  const res = await axios.get(`/v1/customers/bookings/${id}`);
  return res.data.data.map((booking: any) => ({
    bookingId: booking.bookingId,
    name: booking.name,
    email: booking.email,
    phone: booking.phone,
    serviceType: booking.serviceType,
    pickupDateTime: booking.pickupDateTime,
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
    bookingDate: booking.bookingDate,
    totalAmount: booking.totalAmount,
  }));
};

// 🗑️ Delete customer
export const deleteCustomer = async (id: string) => {
  return axios.delete(`/v1/customers/${id}`);
};

// 🧹 Bulk delete customers
export const multiDeleteCustomers = async (customerIds: string[]) => {
  return axios.delete(`/v1/customers/`, { data: { customerIds } });
};

// ➕ Create customer
export const createCustomer = async (customerData: {
  name: string;
  email?: string;
  phone: string;
  createdBy?: "Admin" | "Vendor";
}) => {
  const res = await axios.post("/v1/customers", customerData);
  return res.data.data;
};
