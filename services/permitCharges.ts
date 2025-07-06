import axios from "lib/http-common";
import type { SpecialPackage, FetchSpecialPackage } from "types/react-query/permitCharges";

// 🔁 Get all special packages
export const getSpecialPackages = async (): Promise<FetchSpecialPackage[]> => {
  const res = await axios.get("/v1/permit-charges");
  return res.data.data;
};

// 🔍 Get a special package by ID
export const getSpecialPackageById = async (id: string): Promise<FetchSpecialPackage> => {
  const res = await axios.get(`/v1/permit-charges/${id}`);
  return res.data.data;
};

// 🆕 Create new special package
export const createSpecialPackage = async (data: Partial<SpecialPackage>): Promise<FetchSpecialPackage> => {
  const res = await axios.post("/v1/permit-charges", data);
  return res.data.data;
};

// ✏️ Update special package
export const updateSpecialPackage = async ({
  id,
  data,
}: {
  id: string;
  data: Partial<SpecialPackage>;
}): Promise<FetchSpecialPackage> => {
  const res = await axios.put(`/v1/permit-charges/${id}`, data);
  return res.data.data;
};

// 🗑️ Delete one special package
export const deleteSpecialPackage = async (id: string) => {
  const res = await axios.delete(`/v1/permit-charges/${id}`);
  return res.data;
};

// 🧹 Bulk delete special packages
export const bulkDeleteSpecialPackages = async (permitIds: string[]) => {
  const res = await axios.delete(`/v1/permit-charges`, {
    data: { permitsId: permitIds },
  });
  return res.data;
};
