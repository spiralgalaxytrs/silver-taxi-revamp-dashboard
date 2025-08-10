import axios from "lib/http-common";
import { Vehicle, VehicleType } from "types/react-query/vehicle";

// 🚘 Get all vehicles
export const getVehicles = async (): Promise<Vehicle[]> => {
  const res = await axios.get("/v1/vehicles");
  return res.data.data;
};

//🚘 Get all vehicle types
export const getVehicleTypes = async (): Promise<VehicleType[]> => {
  const res = await axios.get("/v1/vehicles/types");
  return res.data.data;
};

//🚘 Get all vehicles for admin
export const getVehiclesAdmin = async (): Promise<Vehicle[]> => {
  const res = await axios.get("/v1/vehicles/admin");
  return res.data.data;
};

// 🚘 Get all active vehicles
export const getActiveVehicles = async (): Promise<Vehicle[]> => {
  const res = await axios.get("/v1/vehicles/active");
  return res.data.data;
};

// 🔍 Get vehicle by ID
export const getVehicleById = async (id: string): Promise<Vehicle> => {
  const res = await axios.get(`/v1/vehicles/${id}`);
  return res.data.data;
};

// ⬆️ Toggle vehicle status
export const toggleVehicleStatus = async ({ id, status }: { id: string; status: boolean }) => {
  return axios.post("/v1/toggles-change/vehicle", { id, status });
};

// ➕ Create a new vehicle
export const createVehicle = async (vehicleData: Partial<Vehicle>) => {
  const formData = new FormData();
  Object.entries(vehicleData).forEach(([key, value]) => {
    if (value !== null && value !== undefined) {
      if (key === "imageUrl" && value instanceof File) {
        formData.append("imageUrl", value);
      } else if (value instanceof Date) {
        formData.append(key, value.toISOString());
      } else {
        formData.append(key, String(value));
      }
    }
  });
  const res = await axios.post("/v1/vehicles", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data.data;
};

// ➕ Create a new vehicle type
export const createVehicleTypes = async (name: string): Promise<VehicleType> => {
  const data = { name: name.trim().toLowerCase() };
  const res = await axios.post("/v1/vehicles/types/add", data);
  return res.data.data;
};

// ✏️ Update existing vehicle
export const updateVehicle = async ({ id, vehicleData }: { id: string; vehicleData: Partial<Vehicle> }) => {
  if (vehicleData.imageUrl && typeof vehicleData.imageUrl === "string") {
    const res = await axios.put(`/v1/vehicles/${id}`, vehicleData);
    return res.data.data;
  }

  const imageForm = new FormData();
  if (vehicleData.imageUrl && vehicleData.imageUrl instanceof File) {
    imageForm.append("image", vehicleData.imageUrl);
  }
  const imageUpload = await axios.post("/v1/image-upload", imageForm);
  vehicleData.imageUrl = imageUpload.data.data;

  const res = await axios.put(`/v1/vehicles/${id}`, vehicleData);
  return res.data.data;
};

// ✅ Accept a vehicle type
export const acceptVehicleTypes = async ({ name, acceptedVehicleTypes }: { name: string, acceptedVehicleTypes: string[] }): Promise<VehicleType> => {
  const res = await axios.put(`/v1/vehicles/types/accept/${name}`, { acceptedVehicleTypes });
  return res.data.data;
};

// ❌ Delete a vehicle
export const deleteVehicle = async (id: string) => {
  return axios.delete(`/v1/vehicles/${id}`);
};
