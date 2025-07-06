export interface Offer {
    offerId?: string;
    offerName: string;
    category: string;
    description?: string;
    keywords?: string;
    type: "Percentage" | "Flat";
    value: number;
    status: boolean;
    startDate: Date;
    endDate: Date;
    updatedAt: string;
    claimedCount: number;
    bannerImage?: File | string | undefined;
    createdAt: string;
}