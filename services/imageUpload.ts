import axios from "lib/http-common";

// 📤 Upload image to server and return URL
export const uploadImage = async (image: File): Promise<string> => {
  const formData = new FormData();
  formData.append("image", image);

  const res = await axios.post("/v1/image-upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return res.data.data as string;
};
