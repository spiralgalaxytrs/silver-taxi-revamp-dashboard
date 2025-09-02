import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchVendorTransactions,
  fetchDriverTransactions,
  fetchAllVendorTransactions,
  fetchAllDriverTransactions,
  fetchVendorTransactionsByVendor,
  fetchVendorWalletAmount,
  vendorTransactionsReasonAdd
} from 'services/wallet';

// Fetch transactions of a specific vendor by ID
export const useVendorTransactions = (vendorId: string) => {
  return useQuery({
    queryKey: ['wallet-transactions', 'vendor', vendorId],
    queryFn: () => fetchVendorTransactions(vendorId),
    enabled: !!vendorId,
  });
};

// Fetch transactions of a specific vendor by ID
export const useVendorWalletAmount = () => {
  return useQuery({
    queryKey: ['wallet-amount', 'vendor'],
    queryFn: fetchVendorWalletAmount,
  });
};

// Fetch transactions of a specific driver by ID
export const useDriverTransactions = (driverId: string) => {
  return useQuery({
    queryKey: ['wallet-transactions', 'driver', driverId],
    queryFn: () => fetchDriverTransactions(driverId),
    enabled: !!driverId,
  });
};

// Fetch all vendor wallet transactions
export const useAllVendorTransactions = () => {
  return useQuery({
    queryKey: ['wallet-transactions', 'vendor-all'],
    queryFn: fetchAllVendorTransactions,
  });
};

// Fetch all vendor wallet transactions by vendor
export const useVendorTransactionsByVendor = () => {
  return useQuery({
    queryKey: ['wallet-transactions', 'vendor-history'],
    queryFn: fetchVendorTransactionsByVendor,
  });
};

// Fetch all vendor wallet transactions by vendor
export const useVendorTransactionsReasonAdd = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      vendorTransactionsReasonAdd(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wallet-transactions"] });
    }
  });
}

// Fetch all driver wallet transactions
export const useAllDriverTransactions = () => {
  return useQuery({
    queryKey: ['wallet-transactions', 'driver-all'],
    queryFn: fetchAllDriverTransactions,
  });
};
