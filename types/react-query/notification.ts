export interface Notification {
    notificationId: string;
    title: string;
    description: string;
    date: string;
    time?: string;
    read: boolean;
    type: string; // e.g., 'Booking', 'Vendor', 'Enquiry'
};

export interface PaginatedResponse {
    success: boolean;
    message: string;
    data: Notification[];
    total: number;
    unReadCount: number;
    offset: number; // backend gives updated offset
};