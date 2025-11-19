export interface Enquiry {
  enquiryId?: string;
  name: string;
  email: string;
  phone: string;
  pickupDateTime: string;
  pickupTime: string;
  vehicleId?: string;
  packageId?: string;
  dropDate?: string | null;
  pickup: string;
  drop: string;
  serviceId: string;
  serviceType: "Round Trip" | "One Way" | "Airport Pickup" | "Airport Drop" | "Day Packages" | "Hourly Packages";
  type: "Website" | "App" | "Manual";
  status: "Current" | "Future" | "Fake" | "Booked";
  createdBy: "Admin" | "Vendor";
  createdAt: string;
}

export interface ErrorResponse {
  message: string;
  success: boolean;
}

export interface GetEnquiriesParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}

export interface EnquiriesResponse {
  enquiries: Enquiry[];
  enquiriesCount: {
    total: number;
    today: number;
    manual: number;
    website: number;
  }
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    hasNext: boolean;
    hasPrev: boolean;
    limit: number;
  };
}