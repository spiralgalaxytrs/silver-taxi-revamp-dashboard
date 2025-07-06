import { useMutation } from "@tanstack/react-query";
import { uploadImage } from "services/imageUpload";

// 🧩 React Query mutation for image upload
export const useImageUpload = () =>
  useMutation({
    mutationFn: uploadImage,
  });
