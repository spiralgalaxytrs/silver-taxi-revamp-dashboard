import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    getNotifications,
    getVendorNotifications,
    getPageNotifications,
    getVendorPageNotifications,
    markAsRead,
    markAllAsRead,
    markAllAsReadVendor,
} from "services/notification";

// 🔍 Fetch all notifications
export const useNotifications = () =>
    useQuery({
        queryKey: ["notifications"],
        queryFn: getNotifications,
    });

// 🔍 Fetch all vendor notifications
export const useVendorNotifications = () =>
    useQuery({
        queryKey: ["vendor-notifications"],
        queryFn: getVendorNotifications,
    });

// 📄 Fetch paginated notifications
export const usePageNotifications = (offset: number) =>
    useQuery({
        queryKey: ["page-notifications", offset],
        queryFn: () => getPageNotifications(offset),
    });

// 📄 Fetch paginated vendor notifications
export const useVendorPageNotifications = (offset: number) =>
    useQuery({
        queryKey: ["vendor-page-notifications", offset],
        queryFn: () => getVendorPageNotifications(offset),
    });

// ✅ Mark a single notification as read
export const useMarkAsRead = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: markAsRead,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["notifications"] });
            queryClient.invalidateQueries({ queryKey: ["vendor-notifications"] });
        },
    });
};

// ✅ Mark all as read (admin)
export const useMarkAllAsRead = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: markAllAsRead,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["notifications"] });
        },
    });
};

// ✅ Mark all as read (vendor)
export const useMarkAllAsReadVendor = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: markAllAsReadVendor,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["vendor-notifications"] });
        },
    });
};
