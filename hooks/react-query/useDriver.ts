import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import {
  getDrivers,
  getDriverById,
  getActiveDrivers,
  getDriverWallet,
  createDriver,
  updateDriver,
  deleteDriver,
  bulkDeleteDrivers,
  toggleDriverStatus,
  adjustDriverWallet,
  verificationStatus,
  approveOrRejectDriverWalletRequest,
  getAllDriverWalletRequests,
  getDriverWalletRequestById,
} from "services/driver";
import type { GetDriversParams } from "types/react-query/driver";

// 🚚 Get all drivers with pagination, search, and filtering
export const useDrivers = (params?: GetDriversParams & { enabled?: boolean }) => {
  const { enabled = true, ...queryParams } = params || {};
  
  return useQuery({
    queryKey: ["drivers", queryParams],
    queryFn: () => getDrivers(queryParams),
    enabled,
    placeholderData: keepPreviousData
  });
};

// 🚚 Get single driver by ID
export const useDriverById = (id: string) =>
  useQuery({
    queryKey: ["driver", id],
    queryFn: () => getDriverById(id),
    enabled: !!id,
  });

// ✅ Create driver
export const useCreateDriver = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createDriver,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["drivers"] });
    },
  });
};

// ✏️ Update driver
export const useUpdateDriver = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateDriver,
    onSuccess: (_, { id }) => { 
      queryClient.invalidateQueries({ queryKey: ["drivers"] });
      queryClient.invalidateQueries({ queryKey: ["driver", id] });
    },
  });
};

// 🗑️ Delete single driver
export const useDeleteDriver = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteDriver,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["drivers"] });
    },
  });
};

// 🧹 Bulk delete
export const useBulkDeleteDrivers = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: bulkDeleteDrivers,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["drivers"] });
    },
  });
};

// ✅ Get Active Drivers
export const useActiveDrivers = () =>
  useQuery({
    queryKey: ["active-drivers"],
    queryFn: getActiveDrivers,
  });

// 🔄 Toggle active/inactive status
export const useToggleDriverStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: toggleDriverStatus,
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["drivers"] });
      queryClient.invalidateQueries({ queryKey: ["driver", id] });
    },
  });
};

// 💰 Get Driver Wallet
export const useDriverWallet = (id: string) =>
  useQuery({
    queryKey: ["driver-wallet", id],
    queryFn: () => getDriverWallet(id),
    enabled: !!id,
  });

// ➕➖ Adjust Wallet (add or minus)
export const useAdjustWallet = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: adjustDriverWallet,
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["drivers"] });
      queryClient.invalidateQueries({ queryKey: ["driver-wallet", id] });
    },
  });
};

// 📄 Verification Status (docs, profile, etc.)
export const useDriverVerification = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: verificationStatus,
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["drivers"] });
      queryClient.invalidateQueries({ queryKey: ["driver", id] });
    },
  });
};




// ✅ Approve or Reject Driver Wallet Request
export const useApproveOrRejectDriverWalletRequest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: approveOrRejectDriverWalletRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["driver-wallet-requests"] });
    },
  });
};

// ✅ Get All Driver Wallet Requests
export const useAllDriverWalletRequests = () => {
  const queryClient = useQueryClient();
  return useQuery({
    queryKey: ["driver-wallet-requests"],
    queryFn: getAllDriverWalletRequests,
  });
};

// ✅ Get Driver Wallet Request By ID
export const useDriverWalletRequestById = (id: string) => {
  const queryClient = useQueryClient();
  return useQuery({
    queryKey: ["driver-wallet-request", id],
    queryFn: () => getDriverWalletRequestById(id),
    enabled: !!id,
  });
};

