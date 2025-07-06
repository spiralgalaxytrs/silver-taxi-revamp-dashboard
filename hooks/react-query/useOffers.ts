import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getOffers,
  createOffer,
  updateOffer,
  deleteOffer,
  toggleOfferStatus,
  bulkDeleteOffers,
} from "services/offers";

export const useOffers = () => {
  return useQuery({
    queryKey: ["offers"],
    queryFn: getOffers,
  });
};

export const useCreateOffer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createOffer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["offers"] });
    },
  });
};

export const useUpdateOffer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateOffer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["offers"] });
    },
  });
};

export const useDeleteOffer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteOffer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["offers"] });
    },
  });
};

export const useToggleOfferStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: toggleOfferStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["offers"] });
    },
  });
};

export const useBulkDeleteOffers = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: bulkDeleteOffers,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["offers"] });
    },
  });
};
