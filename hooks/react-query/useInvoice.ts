import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import {
  getInvoices,
  getInvoiceById,
  getVendorInvoices,
  getAdminInvoices,
  createInvoice,
  updateInvoice,
  deleteInvoice,
  multiDeleteInvoice,
} from "services/invoice";
import { GetInvoicesParams } from "types/react-query/invoice";

export const useInvoices = (params?: GetInvoicesParams & { enabled?: boolean }) => {
  const { enabled = true, ...queryParams } = params || {};
  return useQuery({
    queryKey: ["invoices", queryParams],
    queryFn: () => getInvoices(queryParams),
    enabled,
    placeholderData: keepPreviousData,
  });
};

export const useInvoiceById = (id: string) =>
  useQuery({
    queryKey: ["invoice", id],
    queryFn: () => getInvoiceById(id),
    enabled: !!id,
  });

export const useVendorInvoices = () =>
  useQuery({
    queryKey: ["invoices", "vendor"],
    queryFn: getVendorInvoices,
  });

export const useAdminInvoices = () =>
  useQuery({
    queryKey: ["invoices", "admin"],
    queryFn: getAdminInvoices,
  });

export const useCreateInvoice = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createInvoice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
    },
  });
};

export const useUpdateInvoice = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateInvoice,
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      queryClient.invalidateQueries({ queryKey: ["invoice", id] });
    },
  });
};

export const useDeleteInvoice = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteInvoice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
    },
  });
};

export const useMultiDeleteInvoice = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: multiDeleteInvoice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
    },
  });
};
