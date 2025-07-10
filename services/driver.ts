import axios from "lib/http-common";
import type { Driver, wallet, ExpiryStatus } from "types/react-query/driver";

export const getDrivers = async (): Promise<Driver[]> => {
  const res = await axios.get("/v1/drivers");
  return res.data.data;
};

export const getDriverById = async (id: string): Promise<Driver> => {
  const res = await axios.get(`/v1/drivers/${id}`);
  return res.data.data;
};

export const getActiveDrivers = async (): Promise<Driver[]> => {
  const res = await axios.get("/v1/drivers/active");
  return res.data.data;
};

export const getDriverWallet = async (id: string): Promise<wallet[]> => {
  const res = await axios.get(`/v1/drivers/wallet/${id}`);
  return res.data.data;
};

export const createDriver = async (driverData: any): Promise<Driver> => {
  const form = new FormData();
  Object.entries(driverData).forEach(([k, v]) => {
    if (v != null) {
      if (k === "licenseImage" && v instanceof File) {
        form.append("licenseImage", v);
      } else if (v instanceof Date) {
        form.append(k, v.toISOString());
      } else {
        form.append(k, String(v));
      }
    }
  });

  const res = await axios.post("/v1/drivers", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return res.data.data;
};

export const updateDriver = async ({
  id,
  data,
}: {
  id: string;
  data: Partial<Driver>;
}): Promise<Driver> => {
  const res = await axios.put(`/v1/drivers/${id}`, data);
  return res.data.data;
};

export const deleteDriver = async (id: string): Promise<void> => {
  await axios.delete(`/v1/drivers/${id}`);
};

export const bulkDeleteDrivers = async (driverIds: string[]): Promise<void> => {
  await axios.delete("/v1/drivers", {
    data: { driverIds },
  });
};

export const toggleDriverStatus = async ({
  id,
  status,
}: {
  id: string;
  status: boolean;
}): Promise<any> => {
  const res = await axios.post(`/v1/toggles-change/driver`, { id, status });
  return res.data.data;
};


export const adjustDriverWallet = async ({
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
      ? `/v1/drivers/wallet/add/${id}`
      : `/v1/drivers/wallet/minus/${id}`;
  const res = await axios.post(url, {
    id,
    amount,
    remark,
    adjustmentReason,
    type,
  });
  return res.data.data;
};

export const verificationStatus = async ({
  id,
  data,
}: {
  id: string;
  data: any;
}): Promise<Driver> => {
  const res = await axios.put(`/v1/drivers/verification/${id}`, data);
  return res.data.updatedFields;
};

export const expiryCheck = async (id: string): Promise<ExpiryStatus> => {
  const res = await axios.get(`/v1/drivers/expiry-check/${id}`);
  return res.data.data;
};
