export interface TariffState {
    tariffs: Tariff[];
    packageTariffs: Tariff[];
    packageTariff: Tariff | null;
    pkgTariffs: Tariff | null;
    tariff: Tariff | null;
    error: string | null;
    message: string | null;
    statusCode: number | null;
    isLoading: boolean;
    fetchTariffs: () => Promise<void>;
    fetchTariffById: (id: string) => Promise<void>;
    fetchTariffByVehicleId: (vehicleId: string, serviceId: string, createdBy: string) => Promise<void>;
    fetchPackageTariffByVehicleId: (vehicleId: string, serviceId: string, type: string) => Promise<void>;
    // updateMultipleTariff: (tariffData: Partial<Tariff>) => Promise<void>;
    createTariff: (tariffData: Partial<Tariff>) => Promise<void>;
    // getMultipleTariff: (serviceId: string | undefined) => Promise<void>;
    updateTariff: (id: string, tariffData: Partial<Tariff>) => Promise<void>;
    deleteTariff: (id: string) => Promise<void>;

    // Package Tariff
    fetchPackageTariffs: (type: string) => Promise<void>;
    createPackageTariff: ( newPackageTariff: Partial<Tariff>) => Promise<void>;
    updatePackageTariff: (id: string, tariffPackageData: Partial<Tariff>) => Promise<void>;
    deletePackageTariff: (id: string) => Promise<void>;
};

export interface ErrorResponse {
    message: string;
}

export interface TariffUseState {
  tariffId?: string;
  serviceId?: string;
  vehicleId?: string;
  noOfHours?: number;
  noOfDays?: number;
  price: number;
  extraPrice: number;
  driverBeta: number;
}

export interface Includes {
    hill: boolean;
    toll: boolean;
    statePermit: boolean;
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
  
  export interface Service {
    serviceId: string;
    tenantId: string;
    mainService: string;
    subService: string | null;
    isActive: boolean;
    createdAt: string;
  }
  
  export interface TariffAttributes {
    tenantId: string;
    tariffId: string;
    serviceId: string;
    vehicleId: string;
    price: number;
    minDistance: number;
    extraKmPrice: number;
    status: boolean;
    includes: Includes;
    includesText: string;
    excludesText: string;
    createdAt: string;
    vehicles: Vehicle;
    services: Service;
  }


