import axios from "lib/http-common";
import { PopularRoutes } from "types/react-query/popularRoutes";

// 📥 Upload Image
const uploadImage = async (image: File): Promise<string> => {
  const formData = new FormData();
  formData.append("image", image);
  const res = await axios.post("/v1/image-upload", formData);
  return res.data.data;
};

// 📄 Get all popular routes
export const getPopularRoutes = async (): Promise<PopularRoutes[]> => {
  const res = await axios.get("/v1/popular-routes/");
  return res.data.data;
};

// 📄 Get single route by ID
export const getPopularRouteById = async (id: string): Promise<PopularRoutes> => {
  const res = await axios.get(`/v1/popular-routes/${id}`);
  return res.data.data;
};

// ➕ Create route
export const createPopularRoute = async (data: Partial<PopularRoutes>) => {
  if (data.fromImage instanceof File) data.fromImage = await uploadImage(data.fromImage);
  if (data.toImage instanceof File) data.toImage = await uploadImage(data.toImage);
  const res = await axios.post("/v1/popular-routes", data);
  return res.data.data;
};

// ✏️ Update route
export const updatePopularRoute = async ({ id, data }: { id: string; data: Partial<PopularRoutes> }) => {
  if (data.fromImage instanceof File) data.fromImage = await uploadImage(data.fromImage);
  if (data.toImage instanceof File) data.toImage = await uploadImage(data.toImage);
  const res = await axios.put(`/v1/popular-routes/${id}`, data);
  return res.data.data;
};

// ❌ Delete one route
export const deletePopularRoute = async (id: string) => {
  return axios.delete(`/v1/popular-routes/${id}`);
};

// ❌ Delete multiple
export const multiDeletePopularRoutes = async (ids: string[]) => {
  return axios.delete("/v1/popular-routes/", { data: { popularRouteIds: ids } });
};
