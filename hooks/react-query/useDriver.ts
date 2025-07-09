import {
  useQuery,
  useMutation,
  useQueryClient,
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
  expiryCheck,
} from "services/driver";

// 🚚 Get all drivers
export const useDrivers = ({ enabled = true }) =>
  useQuery({
    queryKey: ["drivers"],
    queryFn: getDrivers,
    enabled,
  });

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

// ⌛ Expiry Check (license, RC, pollution, etc.)
export const useDriverExpiryCheck = (id: string) =>
  useQuery({
    queryKey: ["driver-expiry", id],
    queryFn: () => expiryCheck(id),
    enabled: !!id,
  });
