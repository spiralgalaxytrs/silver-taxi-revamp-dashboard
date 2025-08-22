import { create } from "zustand";
import { persist } from "zustand/middleware";
import axios from "lib/http-common";
import type { CustomNotification, CreateCustomNotificationRequest, UpdateCustomNotificationRequest } from "types/react-query/customNotification";

interface CustomNotificationState {
  notifications: CustomNotification[];
  currentNotification: CustomNotification | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchNotifications: () => Promise<void>;
  fetchNotification: (id: string) => Promise<void>;
  createNotification: (data: CreateCustomNotificationRequest) => Promise<void>;
  updateNotification: (id: string, data: UpdateCustomNotificationRequest) => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  sendNotification: (id: string) => Promise<void>;
  clearError: () => void;
  setCurrentNotification: (notification: CustomNotification | null) => void;
}

export const useCustomNotificationStore = create<CustomNotificationState>()(
  persist(
    (set, get) => ({
      notifications: [],
      currentNotification: null,
      isLoading: false,
      error: null,

      fetchNotifications: async () => {
        set({ isLoading: true, error: null });
        try {
          const response = await axios.get("/v1/custom-notifications");
          set({
            notifications: response.data.data,
            isLoading: false,
            error: null,
          });
        } catch (error: any) {
          set({
            error: error.response?.data?.message || "Failed to fetch notifications",
            isLoading: false,
          });
        }
      },

      fetchNotification: async (id: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await axios.get(`/v1/custom-notifications/${id}`);
          set({
            currentNotification: response.data.data,
            isLoading: false,
            error: null,
          });
        } catch (error: any) {
          set({
            error: error.response?.data?.message || "Failed to fetch notification",
            isLoading: false,
          });
        }
      },

      createNotification: async (data: CreateCustomNotificationRequest) => {
        set({ isLoading: true, error: null });
        try {
          const formData = new FormData();
          formData.append('title', data.title);
          formData.append('message', data.message);
          formData.append('targetAudience', data.targetAudience);
          
          if (data.image) {
            formData.append('image', data.image);
          }
          
          if (data.customerIds && data.customerIds.length > 0) {
            data.customerIds.forEach(id => formData.append('customerIds[]', id));
          }

          const response = await axios.post("/v1/custom-notifications", formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          });

          set((state) => ({
            notifications: [response.data.data, ...state.notifications],
            isLoading: false,
            error: null,
          }));
        } catch (error: any) {
          set({
            error: error.response?.data?.message || "Failed to create notification",
            isLoading: false,
          });
        }
      },

      updateNotification: async (id: string, data: UpdateCustomNotificationRequest) => {
        set({ isLoading: true, error: null });
        try {
          const formData = new FormData();
          
          if (data.title) formData.append('title', data.title);
          if (data.message) formData.append('message', data.message);
          if (data.targetAudience) formData.append('targetAudience', data.targetAudience);
          if (data.image) formData.append('image', data.image);
          
          if (data.customerIds && data.customerIds.length > 0) {
            data.customerIds.forEach(id => formData.append('customerIds[]', id));
          }

          const response = await axios.put(`/v1/custom-notifications/${id}`, formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          });

          set((state) => ({
            notifications: state.notifications.map(n => 
              n.id === id ? response.data.data : n
            ),
            currentNotification: response.data.data,
            isLoading: false,
            error: null,
          }));
        } catch (error: any) {
          set({
            error: error.response?.data?.message || "Failed to update notification",
            isLoading: false,
          });
        }
      },

      deleteNotification: async (id: string) => {
        set({ isLoading: true, error: null });
        try {
          await axios.delete(`/v1/custom-notifications/${id}`);
          set((state) => ({
            notifications: state.notifications.filter(n => n.id !== id),
            currentNotification: state.currentNotification?.id === id ? null : state.currentNotification,
            isLoading: false,
            error: null,
          }));
        } catch (error: any) {
          set({
            error: error.response?.data?.message || "Failed to delete notification",
            isLoading: false,
          });
        }
      },

      sendNotification: async (id: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await axios.post(`/v1/custom-notifications/${id}/send`);
          set((state) => ({
            notifications: state.notifications.map(n => 
              n.id === id ? response.data.data : n
            ),
            currentNotification: response.data.data,
            isLoading: false,
            error: null,
          }));
        } catch (error: any) {
          set({
            error: error.response?.data?.message || "Failed to send notification",
            isLoading: false,
          });
        }
      },

      clearError: () => set({ error: null }),
      setCurrentNotification: (notification) => set({ currentNotification: notification }),
    }),
    {
      name: "custom-notification-store",
      partialize: (state) => ({
        notifications: state.notifications,
        currentNotification: state.currentNotification,
      }),
    }
  )
);
