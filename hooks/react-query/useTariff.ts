import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { TariffUseState } from "types/tariff";
import {
    getTariffs,
    getTariffById,
    getTariffByVehicleId,
    createTariff,
    updateTariff,
    deleteTariff,
    getPackageTariffByVehicleId,
    getPackageTariffs,
    createPackageTariff,
    updatePackageTariff,
    deletePackageTariff,
} from "services/tariff";

// 🔍 All Tariffs
export const useTariffs = () =>
    useQuery({ queryKey: ["tariffs"], queryFn: getTariffs });

// 🔍 Get Tariff by ID
export const useTariffById = (id: string) =>
    useQuery({ queryKey: ["tariff", id], queryFn: () => getTariffById(id), enabled: !!id });

// 🔍 Tariff by Vehicle & Service ID
export const useTariffByVehicle = (vehicleId: string, serviceId: string, createdBy: string) =>
    useQuery({
        queryKey: ["tariff", vehicleId, serviceId, createdBy],
        queryFn: () => getTariffByVehicleId(vehicleId, serviceId, createdBy),
        enabled: !!vehicleId && !!serviceId && !!createdBy,
    });

// 🆕 Create Tariff
export const useCreateTariff = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: Partial<TariffUseState>) => createTariff(data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["tariffs"] }),
    });
};

// ✏️ Update Tariff
export const useUpdateTariff = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<TariffUseState> }) => updateTariff({ id, data }),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["tariffs"] }),
    });
};

// 🗑️ Delete Tariff
export const useDeleteTariff = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => deleteTariff(id),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["tariffs"] }),
    });
};

// 📦 Get Package Tariff by Vehicle ID
export const usePackageTariffByVehicle = (vehicleId: string, serviceId: string, type: string) =>
    useQuery({
        queryKey: ["pkgTariffs", vehicleId, serviceId, type],
        queryFn: () => getPackageTariffByVehicleId(vehicleId, serviceId, type),
        enabled: !!vehicleId && !!serviceId && !!type,
    });

// 📦 Get All Package Tariffs
export const usePackageTariffs = (type: string) =>
    useQuery({
        queryKey: ["pkgTariffs", type],
        queryFn: () => getPackageTariffs(type),
        enabled: !!type,
    });

// ➕ Create Package Tariff
export const useCreatePackageTariff = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: any) => createPackageTariff(data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["pkgTariffs"] }),
    });
};

// ✏️ Update Package Tariff
export const useUpdatePackageTariff = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: any }) => updatePackageTariff({ id, data }),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["pkgTariffs"] }),
    });
};

// 🗑️ Delete Package Tariff
export const useDeletePackageTariff = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => deletePackageTariff(id),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["pkgTariffs"] }),
    });
};
