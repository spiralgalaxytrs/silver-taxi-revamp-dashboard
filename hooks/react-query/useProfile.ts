import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAdminProfile,
  getVendorProfile,
  getProfileById,
  createProfile,
  updateProfile,
  deleteProfile,
} from "services/profile";
import type { CompanyProfile } from "types/react-query/profile";

// 📥 Get admin profile
export const useAdminProfile = () =>
  useQuery({
    queryKey: ["admin-profile"],
    queryFn: getAdminProfile,
  });

// 📥 Get vendor profile
export const useVendorProfile = () =>
  useQuery({
    queryKey: ["vendor-profile"],
    queryFn: getVendorProfile,
  });

// 📥 Get profile by ID
export const useProfileById = (id: string) =>
  useQuery({
    queryKey: ["profile", id],
    queryFn: () => getProfileById(id),
    enabled: !!id,
  });

// ➕ Create profile
export const useCreateProfile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-profile"] });
    },
  });
};

// 🔁 Update profile
export const useUpdateProfile = (id: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CompanyProfile) => updateProfile(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-profile"] });
    },
  });
};

// ❌ Delete profile
export const useDeleteProfile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteProfile,
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: ["admin-profile"] });
    },
  });
};
