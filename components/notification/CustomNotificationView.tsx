"use client";

import React from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "components/ui/popover";
import { Card, CardContent, CardHeader, CardTitle } from "components/ui/card";
import { Badge } from "components/ui/badge";
import { Button } from "components/ui/button";
import { Eye, Users, Calendar, Tag, Route, Database, ImageIcon, X } from "lucide-react";
import { format } from "date-fns";
import type { CustomNotification } from "types/react-query/customNotification";

interface CustomNotificationViewProps {
  notification: CustomNotification;
  children?: React.ReactNode;
}

export default function CustomNotificationView({
  notification,
  children,
}: CustomNotificationViewProps) {
  const [open, setOpen] = React.useState(false);

  const getTargetBadge = (target: string) => {
    const variants = {
      customer: "default",
      driver: "secondary",
      vendor: "outline",
      none: "destructive",
    } as const;

    return (
      <Badge variant={variants[target as keyof typeof variants] || "default"}>
        <Users className="w-3 h-3 mr-1" />
        {target.charAt(0).toUpperCase() + target.slice(1)}
      </Badge>
    );
  };

  const getStatusBadge = (status: boolean) => {
    return (
      <Badge variant={status ? "default" : "secondary"}>
        {status ? "Active" : "Inactive"}
      </Badge>
    );
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {children || (
          <Button variant="ghost" size="sm">
            <Eye className="w-4 h-4" />
          </Button>
        )}
      </PopoverTrigger>
      <PopoverContent className="w-96 max-h-[80vh] overflow-y-auto" align="end" side="left">
        <Card className="border-0 shadow-none">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold">
                Notification Details
              </CardTitle>
              <div className="flex items-center gap-2">
                {/* {getStatusBadge(notification.status)} */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setOpen(false)}
                  className="h-6 w-6 p-0"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Title */}
            <div>
              <h3 className="font-medium text-sm text-gray-500 mb-1">Title</h3>
              <p className="text-sm">{notification.title}</p>
            </div>

            {/* Message */}
            <div>
              <h3 className="font-medium text-sm text-gray-500 mb-1">Message</h3>
              <p className="text-sm text-gray-700">{notification.message}</p>
            </div>

            {/* Target */}
            <div>
              <h3 className="font-medium text-sm text-gray-500 mb-1">Target</h3>
              {getTargetBadge(notification.target || 'none')}
            </div>

            {/* Type */}
            {/* {notification.type && (
              <div>
                <h3 className="font-medium text-sm text-gray-500 mb-1 flex items-center">
                  <Tag className="w-3 h-3 mr-1" />
                  Type
                </h3>
                <p className="text-sm">{notification.type}</p>
              </div>
            )} */}

            {/* Route */}
            {/* {notification.route && (
              <div>
                <h3 className="font-medium text-sm text-gray-500 mb-1 flex items-center">
                  <Route className="w-3 h-3 mr-1" />
                  Route
                </h3>
                <p className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                  {notification.route}
                </p>
              </div>
            )} */}

            {/* Data */}
            {/* {notification.data && Object.keys(notification.data).length > 0 && (
              <div>
                <h3 className="font-medium text-sm text-gray-500 mb-1 flex items-center">
                  <Database className="w-3 h-3 mr-1" />
                  Additional Data
                </h3>
                <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto max-h-20">
                  {JSON.stringify(notification.data, null, 2)}
                </pre>
              </div>
            )} */}

            {/* Particular IDs */}
            {notification.particularIds && notification.particularIds.length > 0 && (
              <div>
                <h3 className="font-medium text-sm text-gray-500 mb-1">Specific IDs</h3>
                <div className="flex flex-wrap gap-1">
                  {notification.particularIds.map((id, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {id}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Image */}
            {notification.image && (
              <div>
                <h3 className="font-medium text-sm text-gray-500 mb-1 flex items-center">
                  <ImageIcon className="w-3 h-3 mr-1" />
                  Notification Image
                </h3>
                <div className="mt-2">
                  <img
                    src={notification.image}
                    alt="Notification"
                    className="w-24 h-24 object-cover rounded-lg border"
                  />
                </div>
              </div>
            )}

            {/* Admin ID */}
            {/* <div>
              <h3 className="font-medium text-sm text-gray-500 mb-1">Admin ID</h3>
              <p className="text-sm font-mono">{notification.adminId}</p>
            </div> */}
          </CardContent>
        </Card>
      </PopoverContent>
    </Popover>
  );
}
