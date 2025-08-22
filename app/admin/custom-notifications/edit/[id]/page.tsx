"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import CustomNotificationForm from "components/notification/CustomNotificationForm";
import { useCustomNotification, useUpdateCustomNotification } from "hooks/react-query/useCustomNotification";
import type { UpdateCustomNotificationRequest } from "types/react-query/customNotification";

interface EditCustomNotificationPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function AdminEditCustomNotificationPage({ params }: EditCustomNotificationPageProps) {
  const router = useRouter();
  const resolvedParams = React.use(params);
  const templateId = resolvedParams.id; // This is now the templateId
  const updateMutation = useUpdateCustomNotification();
  
  const {
    data: notificationData,
    isLoading: isLoadingNotification,
    error: notificationError,
  } = useCustomNotification(templateId);

  const handleSubmit = async (data: UpdateCustomNotificationRequest) => {
    try {
      await updateMutation.mutateAsync({ templateId, data });
      toast.success("Notification updated successfully");
      router.push("/admin/custom-notifications");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update notification");
    }
  };

  if (isLoadingNotification) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  if (notificationError || !notificationData?.data) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Notification Not Found</h2>
          <p className="text-gray-600 mb-4">
            The notification you're looking for doesn't exist or has been deleted.
          </p>
          <button
            onClick={() => router.push("/admin/custom-notifications")}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
          >
            Back to Notifications
          </button>
        </div>
      </div>
    );
  }

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
          <h1 className="text-2xl font-bold text-gray-900">Edit Custom Notification</h1>
          <p className="text-gray-600 mt-2">
            Update the notification details and settings
          </p>
        </div>
        
        <CustomNotificationForm
          notification={notificationData.data}
          onSubmit={handleSubmit}
          isLoading={updateMutation.isPending}
          isEdit={true}
        />
      </div>
    </div>
  );
}
