export interface VehicleUseState {
  name: string;
  type: string;
  status: string;
  seats: number | undefined;
  bags: number | undefined;
  order: number | undefined;
  imageUrl: string;
  licensePlate: string;
  driverBeta: number | undefined;
}

export interface Vehicle {
  id: number;
  adminId: string;
  vehicleId?: string;
  driverId?: string;
  name: string;
  type: string;
  fuelType?: 'Petrol' | 'Diesel' | 'Electric' | 'Hybrid';
  isActive: boolean;
  imageUrl?: string | null | File;
  seats?: number;
  bags?: number;
  order?: number;
  permitCharge?: number;
  vehicleYear?: number;
  vehicleNumber?: string;
  driverBeta?: number;
  isAdminVehicle?: boolean;
  adminVerified?: "Pending" | "Approved" | "Rejected";
  documentUploaded?: boolean;
  profileVerified?: "pending" | "accepted" | "rejected";
  documentVerified?: "pending" | "accepted" | "rejected";
  remark?: string;
  documentRemark?: string;
  rcBookImageFront?: string;
  //New Changes from here 
  rcFrontVerified?: "pending" | "accepted" | "rejected";
  rcFrontRemark?: string;
  rcBookImageBack?: string;
  rcBackVerified?: "pending" | "accepted" | "rejected";
  rcBackRemark?: string;
  rcExpiryDate?: Date;
  insuranceImage?: string;
  insuranceVerified?: "pending" | "accepted" | "rejected";
  insuranceRemark?: string;
  insuranceExpiryDate?: string;
  pollutionImage?: string;
  pollutionImageVerified?: "pending" | "accepted" | "rejected";
  pollutionImageRemark?: string;
  isUpdated?: boolean;
  vehicleType?: string; // Added vehicleType field
  //  to here.
  pollutionExpiryDate?: string;

  createdAt: Date;
  updatedAt: Date;
}