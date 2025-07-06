// services/transaction.service.ts
import axios from "../lib/http-common";
import type { Transaction } from "types/react-query/transaction";

export const getTransactions = async (): Promise<Transaction[]> => {
  const res = await axios.get("/v1/payment-transactions/");
  return res.data.data;
};

export const getTransactionById = async (id: string): Promise<Transaction> => {
  const res = await axios.get(`/v1/payment-transactions/${id}`);
  return res.data.data;
};

export const createTransaction = async (
  transaction: Partial<Transaction>
): Promise<Transaction> => {
  const res = await axios.post("/v1/payment-transactions/", transaction);
  return res.data.data;
};

export const updateTransaction = async (
  id: string,
  transaction: Partial<Transaction>
): Promise<Transaction> => {
  const res = await axios.put(`/v1/payment-transactions/${id}`, transaction);
  return res.data.data;
};

export const deleteTransaction = async (id: string): Promise<void> => {
  await axios.delete(`/v1/payment-transactions/${id}`);
};