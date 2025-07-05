// 📁 services/tariff.ts
import axios from "lib/http-common";
import type { TariffUseState } from "types/tariff";

export const getTariffs = async (): Promise<any[]> => {
  const res = await axios.get("/v1/tariffs");
  return res.data.data;
};

export const getTariffById = async (id: string): Promise<any> => {
  const res = await axios.get(`/v1/tariffs/${id}`);
  return res.data.data;
};

export const getTariffByVehicleId = async (vehicleId: string, serviceId: string, createdBy: string): Promise<any | null> => {
  const res = await axios.get(`/v1/tariffs/vehicle/${vehicleId}/service/${serviceId}/createdBy/${createdBy}`);
  return res.data.data;
};

export const createTariff = async (data: Partial<TariffUseState>): Promise<any> => {
  const res = await axios.post("/v1/tariffs", data);
  return res.data.data;
};

export const updateTariff = async ({ id, data }: { id: string; data: Partial<TariffUseState> }): Promise<any> => {
  const res = await axios.put(`/v1/tariffs/${id}`, data);
  return res.data.data;
};

export const deleteTariff = async (id: string): Promise<void> => {
  await axios.delete(`/v1/tariffs/${id}`);
};

export const getPackageTariffByVehicleId = async (vehicleId: string, serviceId: string, type: string): Promise<any[]> => {
  const res = await axios.get(`/v1/services/packages/vehicle/${vehicleId}/service/${serviceId}/${type}`);
  return res.data.data;
};

export const getPackageTariffs = async (type: string): Promise<any[]> => {
  const res = await axios.get(`/v1/services/packages/${type}`);
  return res.data.data;
};

export const createPackageTariff = async (data: any): Promise<any> => {
  const res = await axios.post("/v1/services/packages", data);
  return res.data.data;
};

export const updatePackageTariff = async ({ id, data }: { id: string; data: any }): Promise<any> => {
  const res = await axios.put(`/v1/services/packages/${id}`, data);
  return res.data.data;
};

export const deletePackageTariff = async (id: string): Promise<void> => {
  await axios.delete(`/v1/services/packages/${id}`);
};
