import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getPromoCodes,
  createPromoCode,
  getPromoCodesById,
  updatePromoCode,
  deletePromoCode,
  togglePromoCodeStatus,
  bulkDeletePromoCodes,
} from "services/promoCodes";

import { toast } from 'sonner';

export const usePromoCodesAll = () => {
  return useQuery({
    queryKey: ["promoCodes"],
    queryFn: getPromoCodes,
  });
};


export const usePromoCodeById = (id: string) => {
  return useQuery({
    queryKey: ["promoCodes", id],
    queryFn: ({ queryKey }) => getPromoCodesById(queryKey[1]),
    enabled: !!id,
  });
};

export const useCreatePromoCode = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createPromoCode,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["promoCodes"] });
    },
  });
};

export const useUpdatePromoCode = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updatePromoCode,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["promoCodes"] });
    },
  });
};

export const useDeletePromoCode = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deletePromoCode,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["promoCodes"] });
    },
  });
};

// export const useTogglePromoCodeStatus = () => {
//   const queryClient = useQueryClient();
//   return useMutation({
//     mutationFn: togglePromoCodeStatus,
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ["promoCodes"] });
//     },
//   });
// };

export const useTogglePromoCodeStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: togglePromoCodeStatus,
    onSuccess: (data) => {
      toast.success("Promo code status updated successfully", {
        style: {
          backgroundColor: "#009F7F",
          color: "#fff",
        },
      });

      // Refetch promo code list if needed
      queryClient.invalidateQueries({ queryKey: ['promoCodes'] });
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || "Failed to update status",
        {
          style: {
            backgroundColor: "#FF0000",
            color: "#fff",
          },
        }
      );
    },
  });
};

export const useBulkDeletePromoCodes = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: bulkDeletePromoCodes,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["promoCodes"] });
    },
  });
};
