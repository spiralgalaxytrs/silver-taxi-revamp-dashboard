import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import {
  getCustomers,
  getVendorCustomers,
  getCustomerById,
  getCustomerBooking,
  deleteCustomer,
  multiDeleteCustomers,
  createCustomer
} from "services/customer";
import type { Customer, CustomerBooking, GetCustomersParams } from "types/react-query/customer";

export const useCustomers = (params?: GetCustomersParams & { enabled?: boolean }) => {
  const { enabled = true, ...queryParams } = params || {};
  return useQuery({
    queryKey: ["customers", queryParams],
    queryFn: () => getCustomers(queryParams),
    enabled,
    placeholderData: keepPreviousData
  });
};

export const useVendorCustomers = () => {
  return useQuery<Customer[]>({
    queryKey: ["vendor-customers"],
    queryFn: getVendorCustomers
  });
};

export const useCustomerById = (id: string) => {
  return useQuery<Customer>({
    queryKey: ["customer", id],
    queryFn: () => getCustomerById(id),
    enabled: !!id
  });
};

export const useCustomerBookings = (id: string) => {
  return useQuery<CustomerBooking[]>({
    queryKey: ["customer-bookings", id],
    queryFn: () => getCustomerBooking(id),
    enabled: !!id
  });
};

export const useDeleteCustomer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteCustomer(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
    }
  });
};

export const useBulkDeleteCustomers = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (ids: string[]) => multiDeleteCustomers(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
    }
  });
};

// ➕ Create customer
export const useCreateCustomer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createCustomer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
    }
  });
};
