import axios from "lib/http-common";
import { Blog } from "types/react-query/blog";

export const getBlogs = async (): Promise<Blog[]> => {
  const res = await axios.get("/v1/blogs");
  return res.data.data;
};

export const getBlogById = async (id: string): Promise<Blog> => {
  const res = await axios.get(`/v1/blogs/${id}`);
  return res.data.data;
};

export const createBlog = async (blogData: any): Promise<Blog> => {
  const formData = new FormData();

  if (blogData.coverImage && blogData.coverImage instanceof File) {
    formData.append("image", blogData.coverImage);
    const imageUpload = await axios.post("/v1/image-upload", formData);
    blogData.coverImage = imageUpload.data.data;
  }

  const response = await axios.post("/v1/blogs", blogData);
  return response.data.data;
};

export const updateBlog = async ({
  id,
  data,
}: {
  id: string;
  data: any;
}): Promise<Blog> => {
  if (data.coverImage && data.coverImage instanceof File) {
    const formData = new FormData();
    formData.append("image", data.coverImage);
    const imageUpload = await axios.post("/v1/image-upload", formData);
    data.coverImage = imageUpload.data.data;
  }

  const response = await axios.put(`/v1/blogs/${id}`, data);
  return response.data.data;
};

export const deleteBlog = async (id: string): Promise<void> => {
  await axios.delete(`/v1/blogs/${id}`);
};
