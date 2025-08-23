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
  fetchNotification: (templateId: string) => Promise<void>;
  createNotification: (data: CreateCustomNotificationRequest) => Promise<void>;
  updateNotification: (templateId: string, data: UpdateCustomNotificationRequest) => Promise<void>;
  deleteNotification: (templateId: string) => Promise<void>;
  sendNotification: (templateId: string) => Promise<void>;
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
          const response = await axios.get("/v1/notifications/custom");
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

      fetchNotification: async (templateId: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await axios.get(`/v1/notifications/custom/${templateId}`);
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
          let requestData: any;
          let headers: any = {};

          if (data.image) {
            // Use FormData for multipart/form-data
            const formData = new FormData();
            formData.append('title', data.title);
            formData.append('message', data.message);
            formData.append('target', data.target || 'customer');
            
            if (data.type) formData.append('type', data.type);
            if (data.route) formData.append('route', data.route);
            if (data.image) formData.append('image', data.image);
            if (data.particularIds && data.particularIds.length > 0) {
              data.particularIds.forEach(id => formData.append('particularIds[]', id));
            }
            if (data.targetAudience) formData.append('targetAudience', data.targetAudience);
            if (data.targetCustomerIds && data.targetCustomerIds.length > 0) {
              data.targetCustomerIds.forEach(id => formData.append('targetCustomerIds[]', id));
            }
            if (data.scheduledAt) formData.append('scheduledAt', data.scheduledAt);
            if (data.time) formData.append('time', data.time);

            requestData = formData;
            headers['Content-Type'] = 'multipart/form-data';
          } else {
            // Use JSON for application/json
            requestData = {
              title: data.title,
              message: data.message,
              target: data.target || 'customer',
              type: data.type,
              route: data.route,
              particularIds: data.particularIds,
              targetAudience: data.targetAudience,
              targetCustomerIds: data.targetCustomerIds,
              scheduledAt: data.scheduledAt,
              time: data.time,
            };
            headers['Content-Type'] = 'application/json';
          }

          const response = await axios.post("/v1/notifications/custom", requestData, { headers });

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

      updateNotification: async (templateId: string, data: UpdateCustomNotificationRequest) => {
        set({ isLoading: true, error: null });
        try {
          let requestData: any;
          let headers: any = {};

          if (data.image) {
            // Use FormData for multipart/form-data
            const formData = new FormData();
            formData.append('templateId', templateId);
            
            if (data.title) formData.append('title', data.title);
            if (data.message) formData.append('message', data.message);
            if (data.target) formData.append('target', data.target);
            if (data.type) formData.append('type', data.type);
            if (data.route) formData.append('route', data.route);
            if (data.image) formData.append('image', data.image);
            if (data.particularIds && data.particularIds.length > 0) {
              data.particularIds.forEach(id => formData.append('particularIds[]', id));
            }
            if (data.targetAudience) formData.append('targetAudience', data.targetAudience);
            if (data.targetCustomerIds && data.targetCustomerIds.length > 0) {
              data.targetCustomerIds.forEach(id => formData.append('targetCustomerIds[]', id));
            }
            if (data.scheduledAt) formData.append('scheduledAt', data.scheduledAt);
            if (data.time) formData.append('time', data.time);

            requestData = formData;
            headers['Content-Type'] = 'multipart/form-data';
          } else {
            // Use JSON for application/json
            requestData = {
              templateId,
              title: data.title,
              message: data.message,
              target: data.target,
              type: data.type,
              route: data.route,
              particularIds: data.particularIds,
              targetAudience: data.targetAudience,
              targetCustomerIds: data.targetCustomerIds,
              scheduledAt: data.scheduledAt,
              time: data.time,
            };
            headers['Content-Type'] = 'application/json';
          }

          const response = await axios.put(`/v1/notifications/custom/${templateId}`, requestData, { headers });

          set((state) => ({
            notifications: state.notifications.map(n => 
              n.templateId === templateId ? response.data.data : n
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

      deleteNotification: async (templateId: string) => {
        set({ isLoading: true, error: null });
        try {
          await axios.delete(`/v1/notifications/custom/${templateId}`);
          set((state) => ({
            notifications: state.notifications.filter(n => n.templateId !== templateId),
            currentNotification: state.currentNotification?.templateId === templateId ? null : state.currentNotification,
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

      sendNotification: async (templateId: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await axios.post(`/v1/notifications/custom/${templateId}/send`, {
            templateId
          });
          set((state) => ({
            notifications: state.notifications.map(n => 
              n.templateId === templateId ? response.data.data : n
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
