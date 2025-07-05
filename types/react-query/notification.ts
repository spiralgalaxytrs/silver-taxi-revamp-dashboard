export interface Notification {
    id: string;
    title: string;
    description: string;
    date: string;
    read: boolean;
    type: string; // e.g., 'Booking', 'Vendor', 'Enquiry'
};