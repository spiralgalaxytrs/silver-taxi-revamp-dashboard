// ✅ services/vendorService.ts
import axios from "lib/http-common";
import { Vendor } from "types/react-query/vendor";

export const getVendors = async (): Promise<Vendor[]> => {
  const res = await axios.get("/v1/vendors");
  return res.data.data;
};

export const getVendorById = async (id: string): Promise<Vendor> => {
  const res = await axios.get(`/v1/vendors/${id}`);
  return res.data.data;
};

export const getVendorWalletAmount = async (): Promise<number> => {
  const res = await axios.get("/v1/vendors/wallet-amount");
  return res.data.data;
};

export const createVendor = async (data: Partial<Vendor>) => {
  const res = await axios.post("/v1/vendors", data);
  return res.data.data;
};

export const updateVendor = async ({ id, data }: { id: string; data: Partial<Vendor> }) => {
  const res = await axios.put(`/v1/vendors/${id}`, data);
  return res.data.data;
};

export const deleteVendor = async (id: string) => {
  return axios.delete(`/v1/vendors/${id}`);
};

export const bulkDeleteVendors = async (vendorIds: string[]) => {
  return axios.delete("/v1/vendors", { data: { vendorIds } });
};

export const toggleVendorStatus = async ({ id, status }: { id: string; status: boolean }) => {
  const res = await axios.put(`/v1/vendors/toggle-changes/${id}`, { status });
  return res.data.data;
};

export const addVendorWallet = async ({ id, amount, remark }: { id: string; amount: number; remark: string }) => {
  const res = await axios.post(`/v1/vendors/wallet/add/${id}`, { amount, remark });
  return res.data.data;
};

export const minusVendorWallet = async ({ id, amount, remark }: { id: string; amount: number; remark: string }) => {
  const res = await axios.post(`/v1/vendors/wallet/minus/${id}`, { amount, remark });
  return res.data.data;
};