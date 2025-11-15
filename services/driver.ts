import axios from "lib/http-common";
import type { Driver, wallet, DriverWalletRequest, DriverActivityLog, GetDriversParams, DriversResponse } from "types/react-query/driver";


export const getDrivers = async (params?: GetDriversParams): Promise<DriversResponse> => {
  const res = await axios.get("/v1/drivers", {
    params: {
      ...(params?.page && { page: params.page }),
      ...(params?.limit && { limit: params.limit }),
      ...(params?.search && { search: params.search }),
      ...(params?.status && { status: params.status }),
      ...(params?.sortBy && { sortBy: params.sortBy }),
      ...(params?.sortOrder && { sortOrder: params.sortOrder }),
      ...(params?.adminId && { adminId: params.adminId }),
    },
  });
  // console.log("res >> ", res.data.data);
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
  reason,
}: {
  id: string;
  status: boolean;
  reason: string;
}): Promise<any> => {
  const res = await axios.post(`/v1/toggles-change/driver`, { id, status, reason });
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




export const approveOrRejectDriverWalletRequest = async ({ id, data }: { id: string, data: any }): Promise<DriverWalletRequest> => {
  const res = await axios.put(`/v1/drivers/wallet/request/${id}`, data);
  return res.data.data;
};

export const getAllDriverWalletRequests = async (): Promise<DriverWalletRequest[]> => {
  const res = await axios.get(`/v1/drivers/wallet/requests`);
  return res.data.data;
};

export const getDriverWalletRequestById = async (id: string): Promise<DriverWalletRequest> => {
  const res = await axios.get(`/v1/drivers/wallet/request/${id}`);
  return res.data.data;
};

export const getDriverActivityLogs = async (id: string): Promise<DriverActivityLog[]> => {
  const res = await axios.get(`/v1/drivers/activity-logs/${id}`);
  return res.data.data;
};

