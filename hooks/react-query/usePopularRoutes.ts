import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getPopularRoutes,
  getPopularRouteById,
  createPopularRoute,
  updatePopularRoute,
  deletePopularRoute,
  multiDeletePopularRoutes
} from "services/popularRoutes";

// 📄 List all
export const usePopularRoutes = () =>
  useQuery({
    queryKey: ["popular-routes"],
    queryFn: getPopularRoutes,
  });

// 📄 Single by ID
export const usePopularRouteById = (id: string) =>
  useQuery({
    queryKey: ["popular-routes", id],
    queryFn: () => getPopularRouteById(id),
    enabled: !!id,
  });

// ➕ Create
export const useCreatePopularRoute = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createPopularRoute,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["popular-routes"] });
    },
  });
};

// ✏️ Update
export const useUpdatePopularRoute = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updatePopularRoute,
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["popular-routes"] });
      queryClient.invalidateQueries({ queryKey: ["popular-routes", id] });
    },
  });
};

// ❌ Delete one
export const useDeletePopularRoute = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deletePopularRoute,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["popular-routes"] });
    },
  });
};

// ❌ Delete many
export const useMultiDeletePopularRoutes = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: multiDeletePopularRoutes,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["popular-routes"] });
    },
  });
};
