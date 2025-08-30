import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
import {
  getCustomNotifications,
  getPageCustomNotifications,
  getCustomNotification,
  createCustomNotification,
  updateCustomNotification,
  deleteCustomNotification,
  sendCustomNotification,
} from "services/customNotification";
import type {
  CreateCustomNotificationRequest,
  UpdateCustomNotificationRequest,
  SendNotificationRequest,
} from "types/react-query/customNotification";

// 🔍 Fetch all custom notifications
export const useCustomNotifications = () =>
  useQuery({
    queryKey: ["custom-notifications"],
    queryFn: getCustomNotifications,
  });

// 🔍 Fetch paginated custom notifications
export const usePageCustomNotifications = () =>
  useInfiniteQuery({
    queryKey: ["custom-notifications-paginated"],
    queryFn: ({ pageParam = 0 }) => getPageCustomNotifications(pageParam),
    getNextPageParam: (lastPage) => {
      const nextOffset = lastPage.offset + lastPage.data.length;
      return nextOffset < lastPage.total ? nextOffset : undefined;
    },
    initialPageParam: 0,
  });

// 🔍 Fetch single custom notification
export const useCustomNotification = (templateId: string) =>
  useQuery({
    queryKey: ["custom-notification", templateId],
    queryFn: () => getCustomNotification(templateId),
    enabled: !!templateId,
  });

// ➕ Create custom notification
export const useCreateCustomNotification = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateCustomNotificationRequest) => createCustomNotification(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["custom-notifications"] });
      queryClient.invalidateQueries({ queryKey: ["custom-notifications-paginated"] });
    },
  });
};

// ✏️ Update custom notification
export const useUpdateCustomNotification = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ templateId, data }: { templateId: string; data: UpdateCustomNotificationRequest }) =>
      updateCustomNotification(templateId, data),
    onSuccess: (_, { templateId }) => {
      queryClient.invalidateQueries({ queryKey: ["custom-notifications"] });
      queryClient.invalidateQueries({ queryKey: ["custom-notifications-paginated"] });
      queryClient.invalidateQueries({ queryKey: ["custom-notification", templateId] });
    },
  });
};

// 🗑️ Delete custom notification
export const useDeleteCustomNotification = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (templateId: string) => deleteCustomNotification(templateId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["custom-notifications"] });
      queryClient.invalidateQueries({ queryKey: ["custom-notifications-paginated"] });
    },
  });
};

// 📤 Send custom notification
export const useSendCustomNotification = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: SendNotificationRequest) => sendCustomNotification(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["custom-notifications"] });
      queryClient.invalidateQueries({ queryKey: ["custom-notifications-paginated"] });
      queryClient.invalidateQueries({ queryKey: ["custom-notification", variables.templateId] });
    },
  });
};
