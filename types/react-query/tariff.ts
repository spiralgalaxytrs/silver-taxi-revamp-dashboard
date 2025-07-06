export interface TariffUseState {
  tariffId?: string;
  serviceId?: string;
  vehicleId?: string;
  noOfHours?: number;
  noOfDays?: number;
  price: number;
  extraPrice: number;
}

// export interface TariffAttributes {
//     tenantId: string;
//     tariffId: string;
//     serviceId: string;
//     vehicleId: string;
//     price: number;
//     minDistance: number;
//     extraKmPrice: number;
//     status: boolean;
//     includes: Includes;
//     includesText: string;
//     excludesText: string;
//     createdAt: string;
//     vehicles: Vehicle;
//     services: Service;
//   }
