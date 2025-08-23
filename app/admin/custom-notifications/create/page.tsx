"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "components/ui/button";
import { ArrowLeft } from "lucide-react";
import CustomNotificationForm from "components/notification/CustomNotificationForm";
import { useCreateCustomNotification } from "hooks/react-query/useCustomNotification";
import type { CreateCustomNotificationRequest } from "types/react-query/customNotification";

export default function AdminCreateCustomNotificationPage() {
  const router = useRouter();
  const createMutation = useCreateCustomNotification();

  const handleSubmit = async (data: CreateCustomNotificationRequest) => {
    try {
      await createMutation.mutateAsync(data);
      toast.success("Notification created successfully");
      router.push("/admin/custom-notifications");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to create notification");
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="outline"
              onClick={() => router.push("/admin/custom-notifications")}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Notifications
            </Button>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Create Custom Notification</h1>
          <p className="text-gray-600 mt-2">
            Create a new custom notification to send to your users
          </p>
        </div>
        
        <CustomNotificationForm
          onSubmit={handleSubmit as any} // Type assertion to fix type mismatch
          isLoading={createMutation.isPending}
          isEdit={false}
        />
      </div>
    </div>
  );
}
