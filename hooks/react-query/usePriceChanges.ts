import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import {
  getAllPriceEntries,
  getPriceEntryById,
  createPriceEntry,
  updatePriceEntry,
  deletePriceEntry,
} from "services/priceChanges";
import type { PriceEntry } from "types/react-query/priceChanges";

// Fetch all price entries
export const usePriceEntries = () =>
  useQuery({
    queryKey: ["price-entries"],
    queryFn: getAllPriceEntries,
  });

// Fetch single price entry by service ID
export const usePriceEntryById = (serviceId: string) =>
  useQuery({
    queryKey: ["price-entry", serviceId],
    queryFn: () => getPriceEntryById(serviceId),
    enabled: !!serviceId,
  });

// Create price entry
export const useCreatePriceEntry = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createPriceEntry,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["price-entries"] });
    },
  });
};

// Update price entry
export const useUpdatePriceEntry = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<PriceEntry> }) =>
      updatePriceEntry(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["price-entries"] });
    },
  });
};

// Delete price entry
export const useDeletePriceEntry = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deletePriceEntry,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["price-entries"] });
    },
  });
};
