import axios from "lib/http-common";
import { Service } from "types/react-query/services";

export const getServices = async (): Promise<Service[]> => {
  const res = await axios.get("/v1/services");
  return res.data.data;
};

export const getVendorServices = async (): Promise<Service[]> => {
  const res = await axios.get("/v1/services/vendor");
  return res.data.data;
};

export const getActiveServices = async (): Promise<Service[]> => {
  const res = await axios.get("/v1/services/active");
  return res.data.data;
};

export const getServiceById = async (id: string): Promise<Service> => {
  const res = await axios.get(`/v1/services/${id}`);
  return res.data.data;
};

export const getServiceByName = async (name: string): Promise<Service> => {
  const res = await axios.get(`/v1/services/by-name?name=${name}`);
  return res.data.data;
};

export const updateService = async ({ id, data }: { id: string; data: Partial<Service> }) => {
  const res = await axios.put(`/v1/services/${id}`, data);
  return res.data.data;
};

export const deleteService = async (id: string) => {
  const res = await axios.delete(`/v1/services/${id}`);
  return res.data;
};
