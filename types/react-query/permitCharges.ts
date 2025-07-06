 export interface SpecialPackage {
  permitId?: string;
  adminId?: string;
  origin: string;
  destination: string;
  noOfPermits: number;
  createdAt?: string;
}
export interface FetchSpecialPackage {
  permitId: string;
  adminId?: string;
  origin: string;
  destination: string;
  noOfPermits: number;
  createdAt?: string;
}