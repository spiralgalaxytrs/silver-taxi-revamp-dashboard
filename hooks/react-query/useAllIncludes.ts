import {
  useQuery,
  useMutation,
  useQueryClient,
  useInfiniteQuery,
} from "@tanstack/react-query";
import {
  getAllIncludes,
  getIncludeById,
  createInclude,
  updateInclude,
  deleteInclude,
  bulkDeleteIncludes,
} from "services/allIncludes";
import { AllIncludes } from "types/react-query/allIncludes";

export const useAllIncludes = () => {
  return useQuery<AllIncludes[]>({
    queryKey: ["all-includes"],
    queryFn: getAllIncludes,
  });
};

export const useIncludeById = (id: string) => {
  return useQuery<AllIncludes>({
    queryKey: ["include", id],
    queryFn: () => getIncludeById(id),
    enabled: !!id,
  });
};

export const useCreateInclude = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createInclude,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-includes"] });
    },
  });
};

export const useUpdateInclude = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<AllIncludes> }) =>
      updateInclude(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-includes"] });
    },
  });
};

export const useDeleteInclude = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteInclude,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-includes"] });
    },
  });
};

export const useBulkDeleteIncludes = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: bulkDeleteIncludes,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-includes"] });
    },
  });
};
