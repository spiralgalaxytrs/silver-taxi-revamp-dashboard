import { create } from "zustand";
import { persist } from "zustand/middleware";
import axios, { AxiosError } from "../lib/http-common";
import { CompanyProfile, Profile } from "types/profile";
import { ErrorResponse } from "types/auth";

interface ProfileState {
    profile: Profile | null;
    error: string | null;
    isLoading: boolean;
    message: string | null;
    statusCode: number | null;
    fetchProfile: () => Promise<void>;
    fetchVendorProfile: () => Promise<void>;
    fetchProfileById: (id: string) => Promise<void>;
    createProfile: (profileData: CompanyProfile) => Promise<void>;
    updateProfile: (id: string, profileData: CompanyProfile) => Promise<void>;
    deleteProfile: (id: string) => Promise<void>;
}

export const useProfileStore = create<ProfileState>()(
    persist(
        (set) => ({
            profile: null,
            error: null,
            isLoading: false,
            message: null,
            statusCode: null,

            fetchProfile: async () => {
                set({ isLoading: true, error: null });
                try {
                    const response = await axios.get("/v1/company-profile");
                    set({
                        profile: response.data.data[0],
                        isLoading: false,
                        message: response.data.message,
                        statusCode: response.status,
                    });

                } catch (error) {
                    const axiosError = error as AxiosError<ErrorResponse>;
                    set({
                        profile:null,
                        error: axiosError.response?.data?.message,
                        isLoading: false,
                        statusCode: axiosError.response?.status,
                        message: axiosError.response?.data?.message,
                    });
                }
            },

            fetchVendorProfile: async () => {
                set({ isLoading: true, error: null });
                try {
                    const response = await axios.get("/v1/company-profile/vendor");
                    set({
                        profile: response.data.data[0],
                        isLoading: false,
                        message: response.data.message,
                        statusCode: response.status,
                    });

                } catch (error) {
                    const axiosError = error as AxiosError<ErrorResponse>;
                    set({
                        profile:null,
                        error: axiosError.response?.data?.message,
                        isLoading: false,
                        statusCode: axiosError.response?.status,
                        message: axiosError.response?.data?.message,
                    });
                }
            },

            fetchProfileById: async (id: string) => {
                set({ isLoading: true, error: null });
                try {
                    const response = await axios.get(`/v1/company-profile/${id}`);
                    set({
                        profile: response.data.data,
                        isLoading: false,
                        message: response.data.message,
                        statusCode: response.status,
                    });
                } catch (error) {
                    const axiosError = error as AxiosError<ErrorResponse>;
                    set({
                        profile:null,
                        error: axiosError.response?.data?.message,
                        isLoading: false,
                        statusCode: axiosError.response?.status,
                        message: axiosError.response?.data?.message,
                    });
                }
            },

            createProfile: async (profileData) => {
                set({ isLoading: true, error: null });
                try {
                    const image = new FormData();
                    if (profileData.logo && profileData.logo instanceof File) {
                        image.append('image', profileData.logo);
                    }
                    await axios.post("/v1/image-upload", image)
                        .then(async (res) => {
                            profileData.logo = res.data.data;
                            const response = await axios.post("/v1/company-profile", profileData)
                            console.log("Profile created successfully", response.data);
                            set({
                                profile: response.data.data,
                                isLoading: false,
                                message: response.data.message,
                                statusCode: response.status,
                            });
                        })
                        .catch((err) => {
                            console.error("Error uploading image:", err);
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
                        error: axiosError.response?.data?.message,
                        isLoading: false,
                        statusCode: axiosError.response?.status,
                        message: axiosError.response?.data?.message,
                    });
                }
            },

            updateProfile: async (id: string, profileData: CompanyProfile) => {
                set({ isLoading: true, error: null });
                try {
                    if (profileData && profileData.logo && typeof profileData.logo === 'string') {
                        const response = await axios.put(`/v1/company-profile/${id}`, profileData);
                        set({
                            profile: response.data.data,
                            isLoading: false,
                            message: response.data.message,
                            statusCode: response.status,
                        });
                        return;
                    }

                    const image = new FormData();
                    if (profileData.logo && profileData.logo instanceof File) {
                        image.append('image', profileData.logo);
                    }
                    await axios.post("/v1/image-upload", image)
                        .then(async (res) => {
                            profileData.logo = res.data.data;
                            const response = await axios.put(`/v1/company-profile/${id}`, profileData);
                            set({
                                profile: response.data.data,
                                isLoading: false,
                                message: response.data.message,
                                statusCode: response.status,
                            });
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
                        error: axiosError.response?.data?.message,
                        isLoading: false,
                        statusCode: axiosError.response?.status,
                        message: axiosError.response?.data?.message,
                    });
                }
            },

            deleteProfile: async (id: string) => {
                set({ isLoading: true, error: null });
                try {
                    await axios.delete(`/v1/company-profile/${id}`);
                    set({
                        profile: null,
                        isLoading: false,
                        message: "Profile deleted successfully",
                        statusCode: 200,
                    });
                } catch (error) {
                    const axiosError = error as AxiosError<ErrorResponse>;
                    set({
                        error: axiosError.response?.data?.message,
                        isLoading: false,
                        statusCode: axiosError.response?.status,
                        message: axiosError.response?.data?.message,
                    });
                }
            },
        }),
        { name: "profile-store" }
    )
); 