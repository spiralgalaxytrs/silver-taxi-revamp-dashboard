import axios from "lib/http-common";
import type { IpTracking } from "types/react-query/ipTracking";

// 📥 Get all IP Trackings
export const getIpTrackings = async (): Promise<IpTracking[]> => {
  const res = await axios.get("/v1/ip-tracking");
  return res.data.data;
};

// 🗑️ Delete single IP address
export const deleteIpAddress = async (ipAddress: string): Promise<void> => {
  await axios.delete("/v1/ip-tracking", { data: ipAddress });
};

// 🧹 Bulk delete IP addresses
export const bulkDeleteIpAddresses = async (ipAddresses: string[]): Promise<void> => {
  await axios.delete("/v1/ip-tracking", {
    data: { ipAddress: ipAddresses },
  });
};
