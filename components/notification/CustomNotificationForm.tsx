"use client";

import React, { useState, useEffect } from "react";
import { Button } from "components/ui/button";
import { Input } from "components/ui/input";
import { Label } from "components/ui/label";
import { Textarea } from "components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "components/ui/card";
import { Badge } from "components/ui/badge";
import { X, Upload, Image as ImageIcon, Users } from "lucide-react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "components/ui/select";
import { ParticularIdsSelection } from "./ParticularIdsSelection";
import { useCustomers } from "hooks/react-query/useCustomer";
import { useDrivers } from "hooks/react-query/useDriver";
import { useVendors } from "hooks/react-query/useVendor";
import type { CustomNotification, CreateCustomNotificationRequest, UpdateCustomNotificationRequest } from "types/react-query/customNotification";

interface CustomNotificationFormProps {
  notification?: CustomNotification;
  onSubmit: (data: CreateCustomNotificationRequest | UpdateCustomNotificationRequest) => void;
  isLoading?: boolean;
  isEdit?: boolean;
}

export default function CustomNotificationForm({
  notification,
  onSubmit,
  isLoading = false,
  isEdit = false,
}: CustomNotificationFormProps) {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [target, setTarget] = useState<'vendor' | 'driver' | 'customer' | 'none'>('customer');
  const [type, setType] = useState("");
  const [route, setRoute] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [particularIds, setParticularIds] = useState<string[]>([]);
  const [targetAudience, setTargetAudience] = useState("all");
  const [targetCustomerIds, setTargetCustomerIds] = useState<string[]>([]);
  const [scheduledAt, setScheduledAt] = useState("");
  const [time, setTime] = useState("");

  // Fetch data based on target
  const {
    data: customers = [],
    isLoading: isCustomersLoading,
    isError: isCustomersError,
  } = useCustomers();

  const {
    data: drivers = [],
    isLoading: isDriversLoading,
    isError: isDriversError,
  } = useDrivers({ enabled: target === 'driver' });

  const {
    data: vendors = [],
    isLoading: isVendorsLoading,
    isError: isVendorsError,
  } = useVendors();

  useEffect(() => {
    if (notification) {
      setTitle(notification.title);
      setMessage(notification.message);
      setTarget(notification.target || 'customer');
      setType(notification.type || "");
      setRoute(notification.route || "");
      setParticularIds(notification.particularIds || []);
      setTime(notification.time || "");
      
      // Extract data from notification.data if it exists
      if (notification.data && typeof notification.data === 'object') {
        setTargetAudience(notification.data.targetAudience || "all");
        setTargetCustomerIds(notification.data.targetCustomerIds || []);
        setScheduledAt(notification.data.scheduledAt || "");
      }
      
      // Set image preview from notification.image if available
      if (notification.image) {
        setImagePreview(notification.image);
      }
    }
  }, [notification]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size should be less than 5MB");
        return;
      }
      setImage(file);
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImage(null);
    setImagePreview(null);
  };

  const handleSelectParticularIds = (ids: string[]) => {
    setParticularIds(ids);
  };

  const handleSelectAllParticularIds = () => {
    setParticularIds([]); // Empty array means "all"
  };

  const removeParticularId = (id: string) => {
    setParticularIds(particularIds.filter(pid => pid !== id));
  };

  const addTargetCustomerId = () => {
    if (targetCustomerIds.length > 0) {
      setTargetCustomerIds([...targetCustomerIds]);
    }
  };

  const removeTargetCustomerId = (id: string) => {
    setTargetCustomerIds(targetCustomerIds.filter(cid => cid !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }
    
    if (!message.trim()) {
      toast.error("Message is required");
      return;
    }

    if (isEdit) {
      // For edit mode, include templateId
      const formData: UpdateCustomNotificationRequest = {
        templateId: notification?.templateId || '',
        title: title.trim(),
        message: message.trim(),
        target,
        type: type.trim() || undefined,
        route: route.trim() || undefined,
        image: image || undefined,
        particularIds: particularIds.length > 0 ? particularIds : undefined,
        targetAudience: targetAudience || undefined,
        targetCustomerIds: targetCustomerIds.length > 0 ? targetCustomerIds : undefined,
        scheduledAt: scheduledAt.trim() || undefined,
        time: time.trim() || undefined,
      };
      onSubmit(formData);
    } else {
      // For create mode
      const formData: CreateCustomNotificationRequest = {
        title: title.trim(),
        message: message.trim(),
        target,
        type: type.trim() || undefined,
        route: route.trim() || undefined,
        image: image || undefined,
        particularIds: particularIds.length > 0 ? particularIds : undefined,
        targetAudience: targetAudience || undefined,
        targetCustomerIds: targetCustomerIds.length > 0 ? targetCustomerIds : undefined,
        scheduledAt: scheduledAt.trim() || undefined,
        time: time.trim() || undefined,
      };
      onSubmit(formData);
    }
  };

  const getItemsForTarget = () => {
    switch (target) {
      case 'customer':
        return customers;
      case 'driver':
        return drivers;
      case 'vendor':
        return vendors;
      default:
        return [];
    }
  };

  const getLoadingState = () => {
    switch (target) {
      case 'customer':
        return isCustomersLoading;
      case 'driver':
        return isDriversLoading;
      case 'vendor':
        return isVendorsLoading;
      default:
        return false;
    }
  };

  const getErrorState = () => {
    switch (target) {
      case 'customer':
        return isCustomersError;
      case 'driver':
        return isDriversError;
      case 'vendor':
        return isVendorsError;
      default:
        return false;
    }
  };

  const getSelectedParticularNames = () => {
    if (particularIds.length === 0) return "Select Particular IDs";
    if (particularIds.length === 1) return "1 selected";
    return `${particularIds.length} selected`;
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">
          {isEdit ? "Edit Notification" : "Create New Notification"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Notification Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter notification title"
              required
            />
          </div>

          {/* Message */}
          <div className="space-y-2">
            <Label htmlFor="message">Notification Message *</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enter notification message"
              rows={4}
              required
            />
          </div>

          {/* Target */}
          <div className="space-y-2">
            <Label htmlFor="target">Target Audience *</Label>
            <Select value={target} onValueChange={(value: 'vendor' | 'driver' | 'customer' | 'none') => setTarget(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select target audience" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="customer">All Customers</SelectItem>
                <SelectItem value="driver">All Drivers</SelectItem>
                <SelectItem value="vendor">All Vendors</SelectItem>
                {/* <SelectItem value="none">None</SelectItem> */}
              </SelectContent>
            </Select>
          </div>

          {/* Type */}
          {/* <div className="space-y-2">
            <Label htmlFor="type">Notification Type</Label>
            <Input
              id="type"
              value={type}
              onChange={(e) => setType(e.target.value)}
              placeholder="Enter notification type (optional)"
            />
          </div> */}

          {/* Route */}
          {/* <div className="space-y-2">
            <Label htmlFor="route">Route</Label>
            <Input
              id="route"
              value={route}
              onChange={(e) => setRoute(e.target.value)}
              placeholder="Enter route (optional)"
            />
          </div> */}

          {/* Target Audience */}
          {/* <div className="space-y-2">
            <Label htmlFor="targetAudience">Target Audience Type</Label>
            <Select value={targetAudience} onValueChange={setTargetAudience}>
              <SelectTrigger>
                <SelectValue placeholder="Select target audience type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Users</SelectItem>
                <SelectItem value="specific">Specific Users</SelectItem>
              </SelectContent>
            </Select>
          </div> */}

          {/* Target Customer IDs */}
          {/* {targetAudience === "specific" && target === "customer" && (
            <div className="space-y-2">
              <Label>Target Customer IDs</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {targetCustomerIds.map((id, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {id}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeTargetCustomerId(id)}
                      className="h-auto p-0 ml-1"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            </div>
          )} */}
{/* 
          {target !== 'none' && (
            <div className="space-y-2">
              <Label>Particular IDs (Optional)</Label>
              <ParticularIdsSelection
                trigger={
                  <Button variant="outline" className="w-full justify-start">
                    <Users className="w-4 h-4 mr-2" />
                    {getSelectedParticularNames()}
                  </Button>
                }
                onSelectIds={handleSelectParticularIds}
                selectAll={handleSelectAllParticularIds}
                title={`Select Particular ${target.charAt(0).toUpperCase() + target.slice(1)} IDs`}
                selectedIds={particularIds}
                target={target}
                items={getItemsForTarget()}
                isLoading={getLoadingState()}
                isError={getErrorState()}
              />
              
              {particularIds.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {particularIds.map((id, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {id}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeParticularId(id)}
                        className="h-auto p-0 ml-1"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          )} */}

          {/* Scheduled At */}
          {/* <div className="space-y-2">
            <Label htmlFor="scheduledAt">Scheduled At</Label>
            <Input
              id="scheduledAt"
              type="datetime-local"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
              placeholder="Schedule notification (optional)"
            />
          </div> */}

          {/* Time */}
          {/* <div className="space-y-2">
            <Label htmlFor="time">Time</Label>
            <Input
              id="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              placeholder="Enter time (optional)"
            />
          </div> */}

          {/* Image Upload */}
          <div className="space-y-2">
            <Label>Notification Image (Optional)</Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              {imagePreview ? (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="max-w-full h-48 object-cover rounded-lg mx-auto"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={removeImage}
                    className="absolute top-2 right-2"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto" />
                  <div>
                    <Button type="button" variant="outline" asChild>
                      <Label htmlFor="image-upload" className="cursor-pointer">
                        <ImageIcon className="w-4 h-4 mr-2" />
                        Choose Image
                      </Label>
                    </Button>
                    <input
                      id="image-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                      aria-label="Upload notification image"
                    />
                  </div>
                  <p className="text-sm text-gray-500">
                    PNG, JPG, GIF up to 5MB
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : isEdit ? "Update Notification" : "Create Notification"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
