import axios from 'lib/http-common';
import { WalletTransaction } from 'types/react-query/wallet';

export const fetchVendorTransactions = async (vendorId: string): Promise<WalletTransaction[]> => {
  const res = await axios.get(`/v1/vendors/wallet/${vendorId}/transactions`);
  return res.data.data;
};

export const fetchDriverTransactions = async (driverId: string): Promise<WalletTransaction[]> => {
  const res = await axios.get(`/v1/drivers/wallet/${driverId}/transactions`);
  return res.data.data;
};

export const fetchAllVendorTransactions = async (): Promise<WalletTransaction[]> => {
  const res = await axios.get(`/v1/vendors/wallet/transactions`);
  return res.data.data;
};

export const fetchAllDriverTransactions = async (): Promise<WalletTransaction[]> => {
  const res = await axios.get(`/v1/drivers/wallet/transactions`);
  return res.data.data;
};
