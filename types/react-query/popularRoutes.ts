 export interface PopularRoutes {
    routeId: string;
    adminId?: string;
    from: string;
    to: string;
    fromImage: File | string;
    toImage: File | string;
    price: string;
    status: boolean;
}