import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
import {
    getUnReadNotifications,
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
        queryFn: getUnReadNotifications,
    });

// 🔍 Fetch all vendor notifications
export const useVendorNotifications = () =>
    useQuery({
        queryKey: ["vendor-notifications"],
        queryFn: getVendorNotifications,
    });

// 📄 Fetch paginated notifications
export const usePageNotifications = () =>
    useInfiniteQuery({
        queryKey: ["page-notifications"],
        queryFn: ({ pageParam = 0 }) => getPageNotifications(pageParam),
        getNextPageParam: (lastPage) => {
            if (lastPage.offset >= lastPage.total) return undefined;
            return lastPage.offset;
        },
        initialPageParam: 0,
    });

// 📄 Fetch paginated vendor notifications
export const useVendorPageNotifications = () =>
    useInfiniteQuery({
        queryKey: ["vendor-page-notifications"],
        queryFn: ({ pageParam = 0 }) => getVendorPageNotifications(pageParam),
        getNextPageParam: (lastPage) => {
            if (lastPage.offset >= lastPage.total) return undefined;
            return lastPage.offset;
        },
        initialPageParam: 0,
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
