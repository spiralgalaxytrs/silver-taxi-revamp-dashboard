// services/offers.ts
import axios from "lib/http-common";

export const getOffers = async () => {
  const { data } = await axios.get("/v1/offers");
  return data.data;
};

export const getOffersById = async (id: string) => {
  const { data } = await axios.get(`/v1/offers/${id}`);
  return data.data;
};

export const createOffer = async (offerData: any) => {
  const formData = new FormData();
  Object.entries(offerData).forEach(([key, value]) => {
    if (value !== null && value !== undefined) {
      if (key === "bannerImage" && value instanceof File) {
        formData.append("bannerImage", value);
      } else if (value instanceof Date) {
        formData.append(key, value.toISOString());
      } else {
        formData.append(key, String(value));
      }
    }
  });
  const { data } = await axios.post("/v1/offers/", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return data.data;
};

export const updateOffer = async ({ id, offerData }: { id: string; offerData: any }) => {
  const { data } = await axios.put(`/v1/offers/${id}`, offerData);
  return data.data;
};

export const deleteOffer = async (id: string) => {
  await axios.delete(`/v1/offers/${id}`);
  return id;
};

export const toggleOfferStatus = async ({ id, status }: { id: string; status: boolean }) => {
  await axios.post(`/v1/offers/toggle-changes/${id}`, { status });
  return { id, status };
};

export const bulkDeleteOffers = async (offerIds: string[]) => {
  await axios.delete(`/v1/offers/`, { data: { offerIds } });
  return offerIds;
};
