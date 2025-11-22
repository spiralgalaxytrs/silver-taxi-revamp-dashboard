import axios from "lib/http-common";
import { Invoice, GetInvoicesParams, InvoicesResponse } from "types/react-query/invoice";

export const getInvoices = async (params?: GetInvoicesParams): Promise<InvoicesResponse> => {
  const res = await axios.get("/v1/invoices", {
    params: {
      ...(params?.page && { page: params.page }),
      ...(params?.limit && { limit: params.limit }),
      ...(params?.search && { search: params.search }),
      ...(params?.status && { status: params.status }),
      ...(params?.sortBy && { sortBy: params.sortBy }),
      ...(params?.sortOrder && { sortOrder: params.sortOrder }),
    },
  });
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
