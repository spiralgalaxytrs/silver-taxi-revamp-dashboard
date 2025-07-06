export interface IpTracking {
  id: number;
  tenantId: string;
  ipAddressId?: string | null;
  ipAddress: string;
  visitTime: string;
  ipRange?: string;
  userAgent?: string;
  pageVisited?: string;
  visitsToday: number;
  totalVisits: number;
  lastLogin: string;
}
