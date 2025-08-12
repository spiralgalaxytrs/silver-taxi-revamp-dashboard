import { useMutation, useQuery } from "@tanstack/react-query";
import { getTableColumnVisibility, updateTableColumnVisibility, uploadImage } from "services/imageUpload";

// 🧩 React Query mutation for image upload
export const useImageUpload = () =>
  useMutation({
    mutationFn: uploadImage,
  });

export const useTableColumnVisibility = (table: string) =>
  useQuery({
    queryKey: ["table-column-visibility", table],
    queryFn: () => getTableColumnVisibility(table),
    enabled: !!table,
  });

export const useUpdateTableColumnVisibility = (table: string) => {
  return useMutation({
    mutationFn: (data: any) => updateTableColumnVisibility(table, data),
  });
}