// services/promoCodes.ts
import axios from "lib/http-common";

export const getPromoCodes = async () => {
  const response = await axios.get("/v1/promo-codes");

  console.log("Response from backend:", response.data);

  // This returns only the promoCodes array
  return response.data?.data ?? [];
};



export const getPromoCodesById = async (id: string) => {
  const { data } = await axios.get(`/v1/promo-codes/${id}`);
  return data.data;
};

export const createPromoCode = async (promoCodeData: any) => {
  const formData = new FormData();
  Object.entries(promoCodeData).forEach(([key, value]) => {
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
  const { data } = await axios.post("/v1/promo-codes/", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return data.data;
};

export const updatePromoCode = async ({ id, promoCodeData }: { id: string; promoCodeData: any }) => {
  const { data } = await axios.put(`/v1/promo-codes/${id}`, promoCodeData);
  return data.data;
};

export const deletePromoCode = async (id: string) => {
  await axios.delete(`/v1/promo-codes/${id}`);
  return id;
};

export const togglePromoCodeStatus = async ({ id, status }: { id: string; status: boolean }) => {
  await axios.post(`/v1/promo-codes/toggle-changes/${id}`, { status });
  return { id, status };
};

export const bulkDeletePromoCodes = async (codeIds: string[]) => {
  await axios.delete(`/v1/promo-codes/`, { data: { codeIds } });
  return codeIds;
};
