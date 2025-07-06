import axios from "../lib/http-common";
import type { PriceEntry } from "types/react-query/priceChanges";

// Get all price entries
export const getAllPriceEntries = async (): Promise<PriceEntry[]> => {
  const res = await axios.get("/v1/all-price-changes");
  return res.data.data;
};

// Get price entry by serviceId
export const getPriceEntryById = async (serviceId: string): Promise<PriceEntry> => {
  const res = await axios.get(`/v1/all-price-changes/${serviceId}`);
  return res.data.data;
};

// Create price entry
export const createPriceEntry = async (
  data: Partial<PriceEntry>
): Promise<PriceEntry> => {
  const res = await axios.post("/v1/all-price-changes", data);
  return res.data.data;
};

// Update price entry
export const updatePriceEntry = async (
  id: string,
  data: Partial<PriceEntry>
): Promise<PriceEntry> => {
  const res = await axios.put(`/v1/all-price-changes/${id}`, data);
  return res.data.data;
};

// Delete price entry
export const deletePriceEntry = async (id: string): Promise<void> => {
  await axios.delete(`/v1/all-price-changes/${id}`);
};
