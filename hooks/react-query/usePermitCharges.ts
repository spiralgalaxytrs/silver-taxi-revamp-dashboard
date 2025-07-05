import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getSpecialPackages,
  getSpecialPackageById,
  createSpecialPackage,
  updateSpecialPackage,
  deleteSpecialPackage,
  bulkDeleteSpecialPackages,
} from "services/permitCharges";
import type { SpecialPackage, FetchSpecialPackage } from "types/react-query/permitCharges";

// 📦 Get all
export const useSpecialPackages = () =>
  useQuery<FetchSpecialPackage[]>({
    queryKey: ["special-packages"],
    queryFn: getSpecialPackages,
  });

// 🔍 Get one
export const useSpecialPackage = (id: string) =>
  useQuery<FetchSpecialPackage>({
    queryKey: ["special-package", id],
    queryFn: () => getSpecialPackageById(id),
    enabled: !!id,
  });

// ➕ Create
export const useCreateSpecialPackage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createSpecialPackage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["special-packages"] });
    },
  });
};

// ✏️ Update
export const useUpdateSpecialPackage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateSpecialPackage,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["special-packages"] });
      queryClient.invalidateQueries({ queryKey: ["special-package", variables.id] });
    },
  });
};

// 🗑️ Delete
export const useDeleteSpecialPackage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteSpecialPackage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["special-packages"] });
    },
  });
};

// 🧹 Bulk delete
export const useBulkDeleteSpecialPackages = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: bulkDeleteSpecialPackages,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["special-packages"] });
    },
  });
};
