export interface VehiclePrices {
  type: string | "Suv" | "Innova" | "Sedan",
  price: number
}

 export interface AllIncludes {
  includeId: string;
  adminId: string;
  origin: string;
  destination: string;
  tollPrice: number;
  hillPrice: number;
  Km: number;
  vehicles: VehiclePrices[];
  createdAt?: string;
} 