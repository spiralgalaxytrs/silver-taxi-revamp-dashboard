import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import {
  getRoutes,
  getRouteById,
  createRoute,
  updateRoute,
  deleteRoute,
  bulkDeleteRoutes,
} from "services/dynamicRoutes";

// 📦 Get all dynamic routes
export const useDynamicRoutes = () =>
  useQuery({
    queryKey: ["dynamic-routes"],
    queryFn: getRoutes,
  });

// 🔍 Get route by ID
export const useDynamicRouteById = (id: string) =>
  useQuery({
    queryKey: ["dynamic-route", id],
    queryFn: () => getRouteById(id),
    enabled: !!id,
  });

// 🆕 Create route
export const useCreateRoute = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createRoute,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dynamic-routes"] });
    },
  });
};

// ✏️ Update route
export const useUpdateRoute = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateRoute,
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["dynamic-routes"] });
      queryClient.invalidateQueries({ queryKey: ["dynamic-route", id] });
    },
  });
};

// 🗑️ Delete route
export const useDeleteRoute = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteRoute,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dynamic-routes"] });
    },
  });
};

// 🧹 Bulk delete routes
export const useBulkDeleteRoutes = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: bulkDeleteRoutes,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dynamic-routes"] });
    },
  });
};
