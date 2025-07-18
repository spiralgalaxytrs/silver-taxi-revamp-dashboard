import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getVehicles,
  getVehiclesAdmin,
  getVehicleById,
  getActiveVehicles,
  toggleVehicleStatus,
  createVehicle,
  updateVehicle,
  deleteVehicle,
  getVehicleTypes,
  createVehicleTypes
} from "services/vehicle";

// 🚘 All vehicles
export const useVehicles = () =>
  useQuery({
    queryKey: ["vehicles"],
    queryFn: getVehicles,
  });

export const useVehicleTypes = () =>
  useQuery({
    queryKey: ["vehicleTypes"],
    queryFn: getVehicleTypes,
  });

// 🚘 Admin vehicles
export const useVehiclesAdmin = () =>
  useQuery({
    queryKey: ["vehicles", "admin"],
    queryFn: getVehiclesAdmin,
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

export const useCreateVehicleTypes = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createVehicleTypes,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vehicleTypes"] });
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
