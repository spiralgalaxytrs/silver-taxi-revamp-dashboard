import axios from "lib/http-common";
import { AllIncludes } from "types/react-query/allIncludes";

export const getAllIncludes = async (): Promise<AllIncludes[]> => {
  const response = await axios.get("/v1/all-includes/");
  return response.data.data;
};

export const getIncludeById = async (id: string): Promise<AllIncludes> => {
  const response = await axios.get(`/v1/all-includes/${id}`);
  return response.data.data;
};

export const createInclude = async (data: Partial<AllIncludes>): Promise<AllIncludes> => {
  const response = await axios.post("/v1/all-includes/", data);
  return response.data.data;
};

export const updateInclude = async (
  id: string,
  data: Partial<AllIncludes>
): Promise<AllIncludes> => {
  const response = await axios.put(`/v1/all-includes/${id}`, data);
  return response.data.data;
};

export const deleteInclude = async (id: string): Promise<void> => {
  await axios.delete(`/v1/all-includes/${id}`);
};

export const bulkDeleteIncludes = async (includesId: string[]): Promise<void> => {
  await axios.delete(`/v1/all-includes/multi-delete`, {
    data: { includesId },
  });
};
