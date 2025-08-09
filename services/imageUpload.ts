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


export const getTableColumnVisibility = async (table: string) => {
  const res = await axios.get(`/v1/column-visibility/${table}`);
  return res.data.data as any;
}

export const updateTableColumnVisibility = async (table: string, data: any) => {
  const res = await axios.post(`/v1/column-visibility/${table}`, data);
  return res.data.data as any;
}
