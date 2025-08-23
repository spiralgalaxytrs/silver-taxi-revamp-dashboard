"use client";

import React from "react";
import Image from "next/image";
import { Loader2 } from "lucide-react";
import { ScrollArea } from "components/ui/scroll-area";
import { Button } from "components/ui/button";
import {
    useVendorPageNotifications,
    useMarkAsRead,
    useMarkAllAsReadVendor,
} from "hooks/react-query/useNotification";

const NotificationsPage = () => {
    const {
        data,
        isLoading,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
    } = useVendorPageNotifications();

    const { mutateAsync: markAsRead } = useMarkAsRead();
    const { mutateAsync: markAllAsReadVendor } = useMarkAllAsReadVendor();

    // Flatten all pages of notifications
    const notifications =
        data?.pages.flatMap((page: any) => page.data) ?? [];

    const totalNotifications = data?.pages[0]?.total ?? 0;

    const handleMarkAsRead = async (id: string) => {
        await markAsRead(id);
    };

    const handleMarkAllAsRead = async () => {
        await markAllAsReadVendor();
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Loader2 className="animate-spin" />
            </div>
        );
    }

    return (
        <div className="bg-white">
            <div className="p-6 bg-white min-h-screen">
                <h1 className="text-2xl font-bold mb-4">Notifications</h1>

                {/* Show "Mark all as read" only if unread exist */}
                <div className="flex justify-end mb-4">
                    {notifications.some((n) => !n.read) && (
                        <Button onClick={handleMarkAllAsRead}>Mark all as read</Button>
                    )}
                </div>

                <ScrollArea className="h-auto overflow-y-auto bg-white rounded-lg shadow-md">
                    {notifications.length > 0 ? (
                        notifications.map((notification: any) => (
                            <div
                                key={notification.notificationId}
                                className={`border-b border-gray-200 p-2 hover:bg-gray-50 transition duration-200 ${
                                    notification.read ? "bg-white" : "bg-gray-100"
                                }`}
                                onClick={() => handleMarkAsRead(notification.notificationId)}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="flex-shrink-0">
                                        <Image
                                            src="/img/icon.png"
                                            alt="notification"
                                            width={24}
                                            height={24}
                                            priority
                                        />
                                    </div>
                                    <div className="ml-3 w-full">
                                        <div className="font-semibold text-md text-gray-800">
                                            {notification.title}
                                        </div>
                                        <div className="text-sm text-gray-600">
                                            {notification.description}
                                        </div>
                                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                                            <p>
                                                {new Date(notification.date).toLocaleDateString(
                                                    "en-IN",
                                                    {
                                                        day: "numeric",
                                                        month: "short",
                                                        year: "numeric",
                                                    }
                                                )}
                                            </p>
                                            <p>{notification.time?.toUpperCase()}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="p-4 text-center text-gray-500">
                            No notifications
                        </div>
                    )}

                    {/* Load more button */}
                    {hasNextPage && (
                        <div className="flex justify-center m-3">
                            <Button
                                variant={"outline"}
                                onClick={() => fetchNextPage()}
                                disabled={isFetchingNextPage}
                            >
                                {isFetchingNextPage ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Loading...
                                    </>
                                ) : (
                                    "Load more"
                                )}
                            </Button>
                        </div>
                    )}
                </ScrollArea>
            </div>
        </div>
    );
};

export default NotificationsPage;