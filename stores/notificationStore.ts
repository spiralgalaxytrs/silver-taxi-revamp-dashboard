import { create } from "zustand";
import { persist } from "zustand/middleware";
import axios, { AxiosError } from "../lib/http-common";

type Notification = {
    id: string;
    title: string;
    description: string;
    date: string;
    read: boolean;
    type: string; // e.g., 'Booking', 'Vendor', 'Enquiry'
};

interface NotificationState {
    notifications: Notification[];
    pageNotifications: Notification[];
    totalNotifications: number;
    offset: number;
    unreadCount: number;
    isLoading: boolean;
    error: string | null;
    addNotification: (notification: Notification) => void;
    markAsRead: (id: string) => void;
    markAllAsRead: () => void;
    markAllAsReadVendor: () => void;
    fetchNotifications: () => Promise<void>;
    fetchPageNotifications: () => Promise<void>;
    fetchVendorNotifications: () => Promise<void>;
    fetchVendorPageNotifications: () => Promise<void>;
}

export const useNotificationStore = create<NotificationState>()(
    persist(
        (set, get) => ({
            notifications: [],
            pageNotifications: [],
            totalNotifications: 0,
            offset: 0,
            unreadCount: 0,
            isLoading: false,
            error: null,

            addNotification: (notification: Notification) => {
                set((state) => ({
                    notifications: [notification, ...state.notifications],
                    unreadCount: state.notifications.filter(n => !n.read).length + 1,
                }));
            },

            markAsRead: async (id: string) => {
                set({ isLoading: true, error: null });
                try {
                    const response = await axios.put(`/v1/notifications/read/${id}`);
                    set((state) => ({
                        isLoading: false,
                        error: null,
                        notifications: state.notifications.map(n =>
                            n.id === id ? { ...n, read: true } : n
                        ),
                        unreadCount: state.notifications.filter(n => !n.read && n.id !== id).length,
                    }));
                } catch (error) {
                    set({ error: 'Failed to mark notification as read', isLoading: false });
                }
            },

            markAllAsRead: async () => {
                set({ isLoading: true, error: null });
                try {
                    const response = await axios.put('/v1/notifications/read-all');
                    set((state) => ({
                        isLoading: false,
                        error: null,
                        notifications: state.notifications.map(n => ({ ...n, read: true })),
                        unreadCount: 0,
                    }));
                } catch (error) {
                    set({ error: 'Failed to mark all notifications as read', isLoading: false });
                }
            },


            markAllAsReadVendor: async () => {
                set({ isLoading: true, error: null });
                try {
                    const response = await axios.put('/v1/notifications/vendor/read-all');
                    set((state) => ({
                        isLoading: false,
                        error: null,
                        notifications: state.notifications.map(n => ({ ...n, read: true })),
                        unreadCount: 0,
                    }));
                } catch (error) {
                    set({ error: 'Failed to mark all notifications as read', isLoading: false });
                }
            },

            fetchNotifications: async () => {
                set({ isLoading: true, error: null });
                try {
                    const response = await axios.get(`/v1/notifications`);
                    const data = response.data.data;
                    set({
                        notifications: data || [],
                        unreadCount: data.filter((n: Notification) => !n.read).length,
                        isLoading: false,
                    });
                } catch (error) {
                    set({
                        notifications: [],
                        unreadCount: 0,
                        error: 'Failed to fetch notifications',
                        isLoading: false,
                    });
                }
            },
            fetchPageNotifications: async () => {
                set({ isLoading: true, error: null });
                try {
                    const offset = get().offset;
                    const response = await axios.get(`/v1/notifications/offset?offset=${offset}`);
                    const data = response.data.data;

                    set((state) => {
                        // If offset is 0, we're starting fresh, so clear existing data
                        const existingData = offset === 0 ? [] : state.pageNotifications;

                        // Combine existing and new data
                        const combinedNotifications = [
                            ...existingData,
                            ...data
                        ];

                        // Remove duplicates by checking unique 'notificationId'
                        const uniqueNotifications = combinedNotifications.filter(
                            (n, index, self) => index === self.findIndex((t) => t.notificationId === n.notificationId)
                        );

                        return {
                            pageNotifications: uniqueNotifications,
                            totalNotifications: response.data.total,
                            offset: response.data.offset,
                            unreadCount: uniqueNotifications.filter((n) => !n.read).length,
                            isLoading: false,
                        };
                    });
                } catch (error) {
                    set({
                        pageNotifications: [],
                        totalNotifications: 0,
                        error: 'Failed to fetch notifications',
                        isLoading: false,
                    });
                }
            },

            fetchVendorNotifications: async () => {
                set({ isLoading: true, error: null });
                try {
                    const response = await axios.get(`/v1/notifications/vendor`);
                    const data = response.data.data;
                    set({
                        notifications: data || [],
                        unreadCount: data.filter((n: Notification) => !n.read).length,
                        isLoading: false,
                    });
                } catch (error) {
                    set({
                        notifications: [],
                        unreadCount: 0,
                        error: 'Failed to fetch notifications',
                        isLoading: false,
                    });
                }
            },
            fetchVendorPageNotifications: async () => {
                set({ isLoading: true, error: null });
                try {
                    const offset = get().offset;
                    const response = await axios.get(`/v1/notifications/vendor/offset?offset=${offset}`);
                    const data = response.data.data;
                    set((state) => ({
                        pageNotifications: [...state.pageNotifications, ...data],
                        totalNotifications: response.data.total,
                        offset: response.data.offset,
                        unreadCount: data.filter((n: Notification) => !n.read).length,
                        isLoading: false,
                    }));

                } catch (error) {
                    set({
                        pageNotifications: [],
                        totalNotifications: 0,
                        error: 'Failed to fetch notifications',
                        isLoading: false,
                    });
                }
            },
        }),
        { name: 'notification-store' }
    )
);