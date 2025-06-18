export interface CompanyProfile {
    companyId?: string | undefined;
    logo?: File | string | undefined;
    name: string;
    email: string;
    phone: string[];
    address: string;
    GSTNumber: string;
    UPI: {
        id: string;
        number: string;
    };
    whatsappNumber: string[];
    website: string;
    description: string;
    socialLinks: {
        facebook: string;
        twitter: string;
        x: string;
        instagram: string;
        youtube: string;
    };
    driverWalletAmount: number;
    vendorWalletAmount: number;
} 

export interface Profile {
    companyId?: string | undefined;
    logo?: File | string | undefined;
    name: string;
    email: string;
    phone: string[];
    address: string;
    GSTNumber: string;
    UPI: {
        id: string;
        number: string;
    };
    whatsappNumber: string[];
    website: string;
    description: string;
    driverWalletAmount: number;
    vendorWalletAmount: number;
    socialLinks: {
        facebook: string;
        twitter: string;
        x: string;
        instagram: string;
        youtube: string;
    };
} 
