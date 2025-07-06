import axios from "lib/http-common";
import type { DynamicRoute } from "types/react-query/dynamicRoute";

// 🧾 Get all dynamic routes
export const getRoutes = async (): Promise<DynamicRoute[]> => {
  const res = await axios.get("/v1/dynamic-routes");
  return res.data.data;
};

// 🔍 Get a dynamic route by ID
export const getRouteById = async (id: string): Promise<DynamicRoute> => {
  const res = await axios.get(`/v1/dynamic-routes/${id}`);
  return res.data.data;
};

// 🆕 Create a new dynamic route with optional image upload
export const createRoute = async (
  routeData: Partial<DynamicRoute>
): Promise<DynamicRoute> => {
  if (routeData.image && routeData.image instanceof File) {
    const form = new FormData();
    form.append("image", routeData.image);
    const uploadRes = await axios.post("/v1/image-upload", form);
    routeData.image = uploadRes.data.data;
  }

  const res = await axios.post("/v1/dynamic-routes", routeData);
  return res.data.data;
};

// ✏️ Update dynamic route with optional image upload
export const updateRoute = async ({
  id,
  data,
}: {
  id: string;
  data: Partial<DynamicRoute>;
}): Promise<DynamicRoute> => {
  if (data.image && data.image instanceof File) {
    const form = new FormData();
    form.append("image", data.image);
    const uploadRes = await axios.post("/v1/image-upload", form);
    data.image = uploadRes.data.data;
  }

  const res = await axios.put(`/v1/dynamic-routes/${id}`, data);
  return res.data.data;
};

// 🗑️ Delete a single dynamic route
export const deleteRoute = async (id: string): Promise<void> => {
  await axios.delete(`/v1/dynamic-routes/${id}`);
};

// 🧹 Bulk delete dynamic routes
export const bulkDeleteRoutes = async (ids: string[]): Promise<void> => {
  await axios.delete("/v1/dynamic-routes", {
    data: { dynamicRouteIds: ids },
  });
};
