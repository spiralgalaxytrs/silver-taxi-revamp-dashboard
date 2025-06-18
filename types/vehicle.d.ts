export interface VehicleState {
    vehicles: Vehicle[];
    vehicle: Vehicle | null;
    error: string | null;
    message: string | null;
    statusCode: number | null;
    isLoading: boolean;
    fetchVehicles: () => Promise<void>;
    fetchVehicleById: (id: string) => Promise<void>;
    createVehicle: (vehicleData: Partial<Vehicle>) => Promise<void>;
    updateVehicle: (id: string, vehicleData: Partial<Vehicle>) => Promise<void>;
    deleteVehicle: (id: string) => Promise<void>;
    vehicleToggleChange: (id:string,status:boolean) => Promise<void>;
    fetchActiveVehicles: () => Promise<void>;
  };

  export interface ErrorResponse {
    message: string;
  }

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