import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    getVendors,
    getVendorById,
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
        mutationFn: ({ id, status }: { id: string; status: boolean }) =>
            toggleVendorStatus({ id, status }),
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

