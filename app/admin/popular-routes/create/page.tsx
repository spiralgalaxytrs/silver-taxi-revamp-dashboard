"use client"
import { useState } from "react";
import { toast } from "sonner";
import { Upload, MapPin, Route } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from "components/ui/card";
import { Button } from "components/ui/button";
import { Input } from "components/ui/input";
import { Label } from "components/ui/label";
import { usePopularRoutesStore } from "../../../../stores/popularRoutesStore";
import { useRouter } from "next/navigation";
import PopularRoutesForm from "components/popularRoutesForm";

export default function Index() {
  const router = useRouter();
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [price, setPrice] = useState("");
  const [fromImage, setFromImage] = useState<File | string | undefined>(undefined);
  const [toImage, setToImage] = useState<File | string | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { createPopularRoute } = usePopularRoutesStore();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, type: "from" | "to") => {
    const file = e.target.files?.[0];
    if (file) {
      const maxSizeInBytes = 300 * 1024; // 200KB in bytes
      if (file.size > maxSizeInBytes) {
        toast.error("The file is too large. Please choose a smaller one under 200KB", {
          style: {
            backgroundColor: "#FF0000",
            color: "#fff",
          },
        });
        e.target.value = ""; // Reset the input
        return;
      }
      if (type === "from") {
        setFromImage(file);
      } else {
        setToImage(file);
      }
    }
  };

  const handleSaveRoute = async () => {
    // Validate inputs
    if (!from.trim() || !to.trim() || !price.trim()) {
      toast.error("Please fill in all fields.");
      return;
    }

    setIsSubmitting(true); // Manage loading state
    try {
      // Simulating API call since we don't have the actual store implementation

      const formData = {
        from,
        to,
        price,
        fromImage: fromImage,
        toImage: toImage,
      }
      await createPopularRoute(formData);

      const status = usePopularRoutesStore.getState().statusCode;
      const message = usePopularRoutesStore.getState().message;

      if (status === 200 || status === 201) {
        toast.success("Route created successfully!", {
          style: {
            backgroundColor: "#009F7F",
            color: "#fff",
          },
        });
        // Reset state after successful save
        setFrom("");
        setTo("");
        setPrice("");
        setFromImage(undefined);
        setToImage(undefined);
        router.push("/admin/popular-routes");
      } else {
        toast.error(message || "Error creating route!", {
          style: {
            backgroundColor: "#FF0000",
            color: "#fff",
          },
        });
      }
    } catch (error) {
      toast.error("An unexpected error occurred. Please try again.");
      console.error("Error creating route:", error);
    } finally {
      setIsSubmitting(false); // Reset loading state
    }
  };

  return (
    <div className="space-y-6 bg-white p-5 rounded-lg shadow-lg">
      <PopularRoutesForm />
    </div>
  );
}