import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getVehicles,
  getVehicleById,
  getActiveVehicles,
  toggleVehicleStatus,
  createVehicle,
  updateVehicle,
  deleteVehicle
} from "services/vehicle";

// 🚘 All vehicles
export const useVehicles = () =>
  useQuery({
    queryKey: ["vehicles"],
    queryFn: getVehicles,
  });

// ✅ Active vehicles
export const useActiveVehicles = () =>
  useQuery({
    queryKey: ["vehicles", "active"],
    queryFn: getActiveVehicles,
  });

// 🔍 Single vehicle
export const useVehicleById = (id: string) =>
  useQuery({
    queryKey: ["vehicles", id],
    queryFn: () => getVehicleById(id),
    enabled: !!id,
  });

// ⬆️ Toggle status
export const useToggleVehicleStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: toggleVehicleStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      queryClient.invalidateQueries({ queryKey: ["vehicles", "active"] });
    },
  });
};

// ➕ Create
export const useCreateVehicle = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createVehicle,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
    },
  });
};

// ✏️ Update
export const useUpdateVehicle = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateVehicle,
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      queryClient.invalidateQueries({ queryKey: ["vehicles", id] });
    },
  });
};

// ❌ Delete
export const useDeleteVehicle = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteVehicle,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
    },
  });
};
