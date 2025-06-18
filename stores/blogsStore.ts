import { create } from "zustand";
import { persist } from "zustand/middleware";
import axios, { AxiosError } from "../lib/http-common";
import { ErrorResponse } from "types/auth";

interface Blog {
    blogId: string;
    title: string;
    description: string;
    coverImage: string;
    url: string;
    htmlContent: string;
    status: boolean;
}

interface BlogState {
    blogs: Blog[];
    blog: Blog | null;
    error: string | null;
    statusCode: number | null;
    message: string | null;
    isLoading: boolean;
    fetchBlogs: () => Promise<void>;
    fetchBlogById: (id: string) => Promise<void>;
    createBlog: (newBlog: any) => Promise<void>;
    updateBlog: (id: string, blogData: any) => Promise<void>;
    deleteBlog: (id: string) => Promise<void>;
}

export const useBlogStore = create<BlogState>()(
    persist(
        (set) => ({
            blogs: [],
            blog: null,
            error: null,
            statusCode: null,
            message: null,
            isLoading: false,

            fetchBlogs: async () => {
                set({ isLoading: true, error: null });
                try {
                    const response = await axios.get("/v1/blogs");
                    set({
                        blogs: response.data.data,
                        isLoading: false,
                        statusCode: response.status,
                    });
                } catch (error) {
                    const axiosError = error as AxiosError<ErrorResponse>;
                    set({
                        blogs: [],
                        message: axiosError.response?.data?.message,
                        error: axiosError.response?.data?.message,
                        isLoading: false,
                    });
                }
            },

            fetchBlogById: async (id) => {
                set({ isLoading: true, error: null });
                try {
                    const response = await axios.get(`/v1/blogs/${id}`);
                    set({
                        blog: response.data.data,
                        isLoading: false,
                        statusCode: response.status,
                    });
                } catch (error) {
                    const axiosError = error as AxiosError<ErrorResponse>;
                    set({
                        blog: null,
                        message: axiosError.response?.data?.message,
                        error: axiosError.response?.data?.message,
                        isLoading: false,
                    });
                }
            },

            createBlog: async (newBlog) => {
                set({ isLoading: true, error: null });
                try {
                    const formData = new FormData();
                    if (newBlog.coverImage && newBlog.coverImage instanceof File) {
                        formData.append("image", newBlog.coverImage);
                        // console.log("newBlog the form data --> ", formData);
                    }
                    await axios.post("/v1/image-upload", formData)
                        .then(async (res) => {
                            newBlog.coverImage = res.data.data ?? "";
                            const response = await axios.post("/v1/blogs", newBlog);
                            set((state) => ({
                                blogs: [...state.blogs, response.data.data],
                                isLoading: false,
                                message: response.data.message,
                                statusCode: response.status,
                            }));
                        })
                        .catch((err) => {
                            set({
                                error: err.response?.data?.message,
                                isLoading: false,
                                statusCode: err.response?.status,
                                message: err.response?.data?.message,
                            });
                        });
                } catch (error) {
                    const axiosError = error as AxiosError<ErrorResponse>;
                    set({
                        message: axiosError.response?.data?.message,
                        error: axiosError.response?.data?.message,
                        isLoading: false,
                    });
                }
            },

            updateBlog: async (id, blogData) => {
                set({ isLoading: true, error: null });
                try {
                    if (blogData && blogData.coverImage && typeof blogData.coverImage === 'string') {
                        const response = await axios.put(`/v1/blogs/${id}`, blogData);
                        set((state) => ({
                            blogs: [...state.blogs.filter((blog) => blog.blogId !== id), response.data.data],
                            isLoading: false,
                            message: response.data.message,
                            statusCode: response.status,
                        }));
                        return;
                    }
                    const formData = new FormData();
                    if (blogData.coverImage && blogData.coverImage instanceof File) {
                        formData.append("image", blogData.coverImage);
                    }
                    await axios.post("/v1/image-upload", formData)
                        .then(async (res) => {
                            blogData.coverImage = res.data.data;
                            const response = await axios.put(`/v1/blogs/${id}`, blogData);
                            set((state) => ({
                                blogs: [...state.blogs.filter((blog) => blog.blogId !== id), response.data.data],
                                isLoading: false,
                                message: response.data.message,
                                statusCode: response.status,
                            }));
                        })
                        .catch((err) => {
                            set({
                                error: err.response?.data?.message,
                                isLoading: false,
                                statusCode: err.response?.status,
                                message: err.response?.data?.message,
                            });
                        });
                } catch (error) {
                    const axiosError = error as AxiosError<ErrorResponse>;
                    set({
                        message: axiosError.response?.data?.message,
                        error: axiosError.response?.data?.message,
                        isLoading: false,
                    });
                }
            },

            deleteBlog: async (id) => {
                set({ isLoading: true, error: null });
                try {
                    await axios.delete(`/v1/blogs/${id}`);
                    set((state) => ({
                        blogs: state.blogs.filter((blog) => blog.blogId !== id),
                        isLoading: false,
                    }));
                } catch (error) {
                    const axiosError = error as AxiosError<ErrorResponse>;
                    set({
                        message: axiosError.response?.data?.message,
                        error: axiosError.response?.data?.message,
                        isLoading: false,
                    });
                }
            },
        }),
        { name: "blog-store" }
    )
);

export type { Blog }; 