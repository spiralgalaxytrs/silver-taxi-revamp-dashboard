"use client";

import React, { useEffect, useState } from 'react';
import { Bell } from 'lucide-react';
import { Button } from 'components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from 'components/ui/dropdown-menu';
import { ScrollArea } from 'components/ui/scroll-area';
import { useNotificationStore } from 'stores/notificationStore';
import { useSocket } from 'providers/websocket/SocketProvider';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';


const notificationImage = {
    logo: "/img/icon.png",
    admin: "/img/admin.png",
    vendor: "/img/vendor.png",
    driver: "/img/driver.png",
    customer: "/img/customer.png",
}
export function NotificationCenter({ createdBy }: { createdBy: string }) {
    const { socket, isConnected } = useSocket();
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const {
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        fetchNotifications,
        addNotification,
        fetchVendorNotifications,
        markAllAsReadVendor
    } = useNotificationStore();
    const [data, setData] = useState<any[]>(notifications);

    useEffect(() => {
        if (!socket || !isConnected) return;

        // Listen for incoming notifications
        socket.on('notification', (notification: any) => {
            addNotification(notification)
            toast.info(notification.title, {
                duration: 5000,
                position: "top-right",
                icon: <Bell className="h-5 w-5" />,
                style: {
                    backgroundColor: "#F1F5F9",
                    color: "#009F7F",
                    borderRadius: "10px",
                    border: "1px solid #009F7F",
                    padding: "18px",
                    fontSize: "16px",
                    fontWeight: "bold",
                }
            })
        });

        // Clean up on unmount
        return () => {
            socket.off('notification');
        };
    }, [socket, isConnected]);

    // Sync data state with notifications from the store
    useEffect(() => {
        const notificationData = notifications.map((notification: any) => ({
            ...notification,
            date: new Date(notification.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
        }));
        setData(notificationData);
    }, [notifications]);

    // Fetch notifications on mount
    useEffect(() => {
        if (createdBy === 'vendor') {
            fetchVendorNotifications();
        } else {
            fetchNotifications();
        }
    }, [fetchNotifications, fetchVendorNotifications]);

    const handleViewAllNotifications = () => {
        router.push(`/${createdBy}/notifications`);
        setIsOpen(false);
    };


    return (
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
            <DropdownMenuTrigger asChild >
                <Button variant="ghost" className="relative">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <span className="absolute top-0 right-0 h-4 w-4 rounded-full bg-red-500 text-xs text-white flex items-center justify-center">
                            {unreadCount}
                        </span>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-[500px]">
                <DropdownMenuLabel className="flex justify-between items-center">
                    <h1 className="text-lg font-bold">Notifications</h1>
                    {unreadCount > 0 && (
                        <Button onClick={() => {
                            if (createdBy === 'vendor') {
                                markAllAsReadVendor();
                            } else {
                                markAllAsRead();
                            }
                        }}>
                            Mark all as read
                        </Button>
                    )}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <ScrollArea className="h-[600px] overflow-y-auto">

                    {data.slice(0, 8).map((notification) => (
                        <button
                            key={notification.notificationId}
                            onClick={() => markAsRead(notification.notificationId)}
                            className="w-full text-left"
                        >
                            <DropdownMenuItem className={`flex items-center justify-between p-4 rounded-lg w-full ${notification.read ? 'bg-white' : 'bg-gray-100'}`}>
                                <div className="flex items-start gap-3 w-full">
                                    <Image src={notificationImage.logo} alt="notification" width={24} height={24} />
                                    <div className="w-full">
                                        <div className="mb-1">
                                            <span className="font-bold text-md">{notification.title}</span>
                                            <span className="text-sm text-gray-800">- {notification.description}</span>
                                        </div>

                                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                                            <p>{notification.date}</p>
                                            <p>{notification.time.toUpperCase()}</p>
                                        </div>
                                    </div>
                                </div>
                            </DropdownMenuItem>
                        </button>
                    ))}

                    {data.length === 0 && (
                        <DropdownMenuItem className="p-4 text-center text-gray-500">
                            No notifications
                        </DropdownMenuItem>
                    )}

                    {data.length > 8 && <div className="flex justify-center m-3">
                        <Button variant={"outline"} onClick={handleViewAllNotifications}>View all notifications</Button>
                    </div>}
                </ScrollArea>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

export default NotificationCenter;
