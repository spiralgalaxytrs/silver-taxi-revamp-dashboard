// ✅ services/vendorService.ts
import axios from "lib/http-common";
import { Vendor, wallet, GetVendorsParams, GetVendorsResponse } from "types/react-query/vendor";

export const getVendors = async (params?: GetVendorsParams): Promise<GetVendorsResponse> => {
  const res = await axios.get("/v1/vendors", {
    params: {
      ...(params?.page && { page: params.page }),
      ...(params?.limit && { limit: params.limit }),
      ...(params?.search && { search: params.search }),
      ...(params?.sortBy && { sortBy: params.sortBy }),
      ...(params?.sortOrder && { sortOrder: params.sortOrder }),
    },
  });;
  return res.data.data;
};

export const getVendorById = async (id: string): Promise<Vendor> => {
  const res = await axios.get(`/v1/vendors/${id}`);
  return res.data.data;
};


export const getVendorUPI = async (id: string): Promise<Vendor> => {
  const res = await axios.get(`/v1/vendors/bank-details/${id}`);
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

export const toggleVendorStatus = async ({ id, status, reason }: { id: string; status: boolean, reason: string }) => {
  const res = await axios.put(`/v1/vendors/toggle-changes/${id}`, { status, reason });
  return res.data.data;
};

export const adjustVendorWallet = async ({
  id,
  amount,
  remark,
  adjustmentReason,
  type,
}: {
  id: string;
  amount: number;
  remark: string;
  adjustmentReason: string;
  type: "add" | "minus";
}): Promise<wallet> => {
  const url =
    type === "add"
      ? `/v1/vendors/wallet/add/${id}`
      : `/v1/vendors/wallet/minus/${id}`;
  const res = await axios.post(url, {
    id,
    amount,
    remark,
    adjustmentReason,
    type,
  });
  return res.data.data;
};