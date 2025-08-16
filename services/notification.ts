// services/notifications.ts
import axios from "lib/http-common";
import type { Notification, PaginatedResponse } from "types/react-query/notification";

// 📥 Fetch all notifications
export const getUnReadNotifications = async (): Promise<Notification[]> => {
  const res = await axios.get("/v1/notifications");
  return res.data.data;
};

// 📥 Fetch paginated notifications
export const getPageNotifications = async (offset: number): Promise<PaginatedResponse> => {
  const res = await axios.get(`/v1/notifications/offset?offset=${offset}`);
  return res.data;
};

// 📥 Fetch all vendor notifications
export const getVendorNotifications = async (): Promise<Notification[]> => {
  const res = await axios.get("/v1/notifications/vendor");
  return res.data.data;
};

// 📥 Fetch paginated vendor notifications
export const getVendorPageNotifications = async (offset: number): Promise<PaginatedResponse> => {
  const res = await axios.get(`/v1/notifications/vendor/offset?offset=${offset}`);
  return res.data;
};

// ✅ Mark as read
export const markAsRead = async (id: string): Promise<void> => {
  await axios.put(`/v1/notifications/read/${id}`);
};

// ✅ Mark all as read (admin)
export const markAllAsRead = async (): Promise<void> => {
  await axios.put("/v1/notifications/read-all");
};

// ✅ Mark all as read (vendor)
export const markAllAsReadVendor = async (): Promise<void> => {
  await axios.put("/v1/notifications/vendor/read-all");
};
