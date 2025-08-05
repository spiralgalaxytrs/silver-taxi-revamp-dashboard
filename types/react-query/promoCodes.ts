export interface PromoCode {
    id: number;
    adminId: string;
    codeId?: string;
    code: string;
    bannerImage?: string;
    description?: string;
    keywords?: string;
    type: "Flat" | "Percentage";
    category?: "All" | "One way" | "Round trip" | "Airport Pickup" | "Airport Drop" | "Day Packages" | "Hourly Packages";
    value: number;
    minAmount?: number;
    maxDiscount?: number;
    usageLimit?: number;
    usedCount?: number;
    status: boolean;
    startDate: Date;
    endDate: Date;
}