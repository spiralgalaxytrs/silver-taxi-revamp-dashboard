import axios from "lib/http-common";
import { Enquiry } from "types/react-query/enquiry";

export const getEnquiries = async (): Promise<Enquiry[]> => {
  const res = await axios.get("/v1/enquiries");
  return res.data.data;
};

export const getVendorEnquiries = async (): Promise<Enquiry[]> => {
  const res = await axios.get("/v1/enquiries/vendor");
  return res.data.data;
};

export const getEnquiryById = async (id: string): Promise<Enquiry> => {
  const res = await axios.get(`/v1/enquiries/${id}`);
  return res.data.data;
};

export const createEnquiry = async (data: Partial<Enquiry>): Promise<Enquiry> => {
  const res = await axios.post("/v1/enquiries", data);
  return res.data.data;
};

export const updateEnquiry = async ({
  id,
  data,
}: {
  id: string;
  data: Partial<Enquiry>;
}): Promise<Enquiry> => {
  const res = await axios.put(`/v1/enquiries/${id}`, data);
  return res.data.data;
};

export const deleteEnquiry = async (id: string): Promise<void> => {
  await axios.delete(`/v1/enquiries/${id}`);
};

export const toggleStatus = async ({
  id,
  status,
}: {
  id: string;
  status: Enquiry["status"];
}): Promise<void> => {
  await axios.post(`/v1/enquiries/toggle-changes/${id}`, { status });
};

export const bulkDeleteEnquiries = async (enquiryIds: string[]): Promise<void> => {
  await axios.delete(`/v1/enquiries/`, { data: { enquiryIds } });
};
