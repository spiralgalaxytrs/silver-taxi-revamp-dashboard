import axios from "lib/http-common";
import { Invoice } from "types/react-query/invoice";

export const getInvoices = async (): Promise<Invoice[]> => {
  const res = await axios.get("/v1/invoices");
  return res.data.data;
};

export const getInvoiceById = async (id: string): Promise<Invoice> => {
  const res = await axios.get(`/v1/invoices/${id}`);
  return res.data.data;
};

export const getVendorInvoices = async (): Promise<Invoice[]> => {
  const res = await axios.get("/v1/invoices/vendor");
  return res.data.data;
};

export const getAdminInvoices = async (): Promise<Invoice[]> => {
  const res = await axios.get("/v1/invoices/admin");
  return res.data.data;
};

export const createInvoice = async (data: Partial<Invoice>): Promise<Invoice> => {
  const res = await axios.post("/v1/invoices", data);
  return res.data.data;
};

export const updateInvoice = async ({
  id,
  data,
}: {
  id: string;
  data: Partial<Invoice>;
}): Promise<Invoice> => {
  const res = await axios.put(`/v1/invoices/${id}`, data);
  return res.data.data;
};

export const deleteInvoice = async (id: string): Promise<void> => {
  await axios.delete(`/v1/invoices/${id}`);
};

export const multiDeleteInvoice = async (invoiceIds: string[]): Promise<void> => {
  await axios.delete("/v1/invoices", {
    data: { invoiceIds },
  });
};
