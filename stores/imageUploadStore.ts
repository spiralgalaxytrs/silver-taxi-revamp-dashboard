import { create } from "zustand";
import axios, { AxiosError } from "../lib/http-common";
import { ErrorResponse } from "types/auth";

interface ImageUploadState {
    imageUrl: string;
    isLoading: boolean;
    error: string | null;
    statusCode: number | null;
    message: string | null;
    uploadImage: (image: File) => Promise<void>;
}


export const useImageUploadStore = create<ImageUploadState>((set) => ({
    imageUrl: "",
    isLoading: false,
    error: null,
    statusCode: null,
    message: null,
    uploadImage: async (image: File) => {

        set({ isLoading: true, error: null, imageUrl: "" });

        const formData = new FormData();

        formData.append("image", image);

        try {
            const response = await axios.post("/v1/image-upload", formData);
            set({
                imageUrl: response.data.data,
                statusCode: response.status,
                message: response.data.message,
                isLoading: false
            });
        } catch (error) {
            const axiosError = error as AxiosError<ErrorResponse>;
            set({
                imageUrl: "",
                statusCode: axiosError.response?.status,
                message: axiosError.response?.data?.message,
                isLoading: false
            });
        }
    },
}));

