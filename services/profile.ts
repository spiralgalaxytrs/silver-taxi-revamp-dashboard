import axios from "lib/http-common";
import type { CompanyProfile, Profile } from "types/react-query/profile";

// 📥 Get admin profile
export const getAdminProfile = async (): Promise<Profile> => {
  const res = await axios.get("/v1/company-profile");
  return res.data.data[0];
};

// 📥 Get vendor profile
export const getVendorProfile = async (): Promise<Profile> => {
  const res = await axios.get("/v1/company-profile/vendor");
  return res.data.data[0];
};

// 📥 Get profile by ID
export const getProfileById = async (id: string): Promise<Profile> => {
  const res = await axios.get(`/v1/company-profile/${id}`);
  return res.data.data;
};

// ➕ Create new profile
export const createProfile = async (data: CompanyProfile): Promise<Profile> => {
  const image = new FormData();
  if (data.logo && data.logo instanceof File) {
    image.append("image", data.logo);
    const imageRes = await axios.post("/v1/image-upload", image);
    data.logo = imageRes.data.data;
  }
  const res = await axios.post("/v1/company-profile", data);
  return res.data.data;
};

// 🔁 Update profile
export const updateProfile = async (
  id: string,
  data: CompanyProfile
): Promise<Profile> => {
  if (data.logo && data.logo instanceof File) {
    const image = new FormData();
    image.append("image", data.logo);
    const imageRes = await axios.post("/v1/image-upload", image);
    data.logo = imageRes.data.data;
  }
  const res = await axios.put(`/v1/company-profile/${id}`, data);
  return res.data.data;
};

// ❌ Delete profile
export const deleteProfile = async (id: string): Promise<void> => {
  await axios.delete(`/v1/company-profile/${id}`);
};
