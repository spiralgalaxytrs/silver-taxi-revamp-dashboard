import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getIpTrackings,
  deleteIpAddress,
  bulkDeleteIpAddresses,
} from "services/ipTracking";

// 🔍 Fetch all IP trackings
export const useIpTrackings = () =>
  useQuery({
    queryKey: ["ip-trackings"],
    queryFn: getIpTrackings,
  });

// ❌ Delete single IP
export const useDeleteIpAddress = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteIpAddress,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ip-trackings"] });
    },
  });
};

// ❌❌ Bulk delete IPs
export const useBulkDeleteIpAddresses = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: bulkDeleteIpAddresses,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ip-trackings"] });
    },
  });
};
