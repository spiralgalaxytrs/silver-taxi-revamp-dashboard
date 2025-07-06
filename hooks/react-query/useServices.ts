import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getServices,
  getVendorServices,
  getActiveServices,
  getServiceById,
  getServiceByName,
  updateService,
  deleteService,
} from "services/services";

export const useServices = () =>
  useQuery({ queryKey: ["services"], queryFn: getServices });

export const useVendorServices = () =>
  useQuery({ queryKey: ["vendor-services"], queryFn: getVendorServices });

export const useActiveServices = () =>
  useQuery({ queryKey: ["active-services"], queryFn: getActiveServices });

export const useServiceById = (id: string) =>
  useQuery({ queryKey: ["service", id], queryFn: () => getServiceById(id), enabled: !!id });

export const useServiceByName = (name: string) =>
  useQuery({ queryKey: ["service-by-name", name], queryFn: () => getServiceByName(name), enabled: !!name });

export const useUpdateService = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateService,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
    },
  });
};

export const useDeleteService = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteService,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
    },
  });
};
