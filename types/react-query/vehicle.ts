 export interface VehicleUseState{
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
    vehicleId: string;
    tenantId: string;
    name: string;
    type: string;
    fuelType: string;
    isActive: boolean;
    imageUrl: string | File | undefined;
    seats: number;
    bags: number;
    order: null | any; // Replace `any` with a specific type if needed
    driverBeta: number;
    createdAt: string;
  }