import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    getVendors,
    getVendorById,
    getVendorUPI,
    getVendorWalletAmount,
    createVendor,
    updateVendor,
    deleteVendor,
    bulkDeleteVendors,
    toggleVendorStatus,
    adjustVendorWallet,
} from 'services/vendor';
import type { Vendor } from 'types/react-query/vendor';

export const useVendors = () => {
    return useQuery({
        queryKey: ['vendors'],
        queryFn: getVendors,
    });
};

export const useVendorById = (id: string, enabled = true) => {
    return useQuery({
        queryKey: ['vendor', id],
        queryFn: () => getVendorById(id),
        enabled: !!id && enabled,
    });
};

export const useVendorWalletAmount = () => {
    return useQuery({
        queryKey: ['vendor-wallet-amount'],
        queryFn: getVendorWalletAmount,
    });
};

export const useVendorUPI = (id: string) => {
    return useQuery({
        queryKey: ['vendor-upi', id],
        queryFn: () => getVendorUPI(id),
    });
};

export const useCreateVendor = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: createVendor,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['vendors'] });
        },
    });
};

export const useUpdateVendor = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<Vendor> }) =>
            updateVendor({ id, data }),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['vendors'] });
            queryClient.invalidateQueries({ queryKey: ['vendor', variables.id] });
        },
    });
};

export const useDeleteVendor = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: deleteVendor,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['vendors'] });
        },
    });
};

export const useBulkDeleteVendors = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: bulkDeleteVendors,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['vendors'] });
        },
    });
};

export const useToggleVendorStatus = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, status, reason }: { id: string; status: boolean, reason: string  }) =>
            toggleVendorStatus({ id, status, reason }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['vendors'] });
        },
    });
};

// ➕➖ Adjust Wallet (add or minus)
export const useAdjustWallet = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: adjustVendorWallet,
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["vendors"] });
      queryClient.invalidateQueries({ queryKey: ["vendor-wallet", id] });
    },
  });
};

