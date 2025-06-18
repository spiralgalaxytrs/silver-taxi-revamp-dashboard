"use client";

import React, { useEffect, useState } from 'react';
import { NotificationCenter } from 'components/NotificationCenter';
import { useNotificationStore } from 'stores/notificationStore';
import { ScrollArea } from 'components/ui/scroll-area';
import { Button } from 'components/ui/button';
import Image from 'next/image';
import { Loader2 } from 'lucide-react';

const NotificationsPage = () => {
    const { pageNotifications, markAllAsReadVendor, fetchVendorPageNotifications, totalNotifications, isLoading } = useNotificationStore();
    const [data, setData] = useState<any[]>([]);

    useEffect(() => {
        fetchVendorPageNotifications();
    }, [fetchVendorPageNotifications]);

    useEffect(() => {
        const notificationData = pageNotifications.map((notification: any) => ({
            ...notification,
            date: new Date(notification.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
        }));
        setData(notificationData);
        
    }, [pageNotifications]);

    if (isLoading) {
        return <div className="flex justify-center items-center h-screen">
            <Loader2 className="animate-spin" />
        </div>
    }

    return (
        <div className='bg-white'>
            <div className="p-6 bg-white min-h-screen">
                <h1 className="text-2xl font-bold mb-4">Notifications</h1>
                <div className="flex justify-end mb-4">
                    <Button
                        onClick={markAllAsReadVendor}
                    >
                        Mark all as read
                    </Button>
                </div>
                <ScrollArea className="h-auto overflow-y-auto bg-white rounded-lg shadow-md">
                    {data.length > 0 ? (
                        data.map((notification, index) => (
                            <div key={index} className={`border-b border-gray-200 p-2 hover:bg-gray-50 transition duration-200 ${notification.read ? 'bg-white' : 'bg-gray-100'}`}>
                                <div className="flex items-center gap-3">
                                    <div className="flex-shrink-0">
                                        <Image src="/img/icon.png" alt="notification" width={24} height={24} priority />
                                    </div>
                                    <div className="ml-3 w-full">
                                        <div className="font-semibold text-md text-gray-800">{notification.title}</div>
                                        <div className="text-sm text-gray-600">{notification.description}</div>
                                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                                            <p>{notification.date}</p>
                                            <p>{notification.time.toUpperCase()}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="p-4 text-center text-gray-500">No notifications</div>
                    )}
                    {data.length <= totalNotifications && (
                        <div className="flex justify-center m-3">
                            <Button variant={"outline"} onClick={() => fetchVendorPageNotifications()}>Load more</Button>
                        </div>
                    )}
                </ScrollArea>
            </div>
        </div>
    );
};

export default NotificationsPage;