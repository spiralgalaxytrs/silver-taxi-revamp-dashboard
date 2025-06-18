import { create } from "zustand";
import { persist } from "zustand/middleware";
import axios, { AxiosError } from "../lib/http-common";

type Transaction = {
    transactionId: string;
    bankReferenceId: string;
    senderId: string;
    senderName: string;
    receiverId: string;
    receiverName: string;
    paymentMethod: string;
    transactionType: string;
    transactionAmount: number;
    senderContact: number;
    receiverContact: number;
    status: string;
    createdAt: string;
};

interface ErrorResponse {
    message: string;
    success: boolean;
}

interface TransactionState {
    transactions: Transaction[];
    transaction: Transaction | null;
    error: string | null;
    statusCode: number | null;
    message: string | null;
    isLoading: boolean;
    fetchTransactions: () => Promise<void>;
    fetchTransactionById: (id: string) => Promise<void>;
    createTransaction: (newTransaction: Partial<Transaction>) => Promise<void>;
    updateTransaction: (id: string, transaction: Partial<Transaction>) => Promise<void>;
    deleteTransaction: (id: string) => Promise<void>;
}

export const useTransactionStore = create<TransactionState>()(
    persist(
        (set) => ({
            transactions: [],
            transaction: null,
            error: null,
            statusCode: null,
            message: null,
            isLoading: false,

            fetchTransactions: async () => {
                set({ isLoading: true, error: null });
                try {
                    const response = await axios.get("/v1/payment-transactions/");
                    set({
                        transactions: response.data.data,
                        isLoading: false,
                        message: response.data.message,
                        statusCode: response.status,
                    });
                } catch (error) {
                    const axiosError = error as AxiosError<ErrorResponse>;
                    set({
                        transactions:[],
                        error: axiosError.response?.data?.message,
                        isLoading: false,
                        message: axiosError.response?.data?.message,
                    });
                }
            },

            fetchTransactionById: async (id) => {
                set({ isLoading: true, error: null });
                try {
                    const response = await axios.get(`/v1/payment-transactions/${id}`);
                    set({
                        transaction: response.data.data,
                        isLoading: false,
                        message: response.data.message,
                        statusCode: response.status,
                    });
                } catch (error) {
                    const axiosError = error as AxiosError<ErrorResponse>;
                    set({
                        transaction:null,
                        message: axiosError.response?.data?.message,
                        error: axiosError.response?.data?.message,
                        isLoading: false,
                    });
                }
            },

            createTransaction: async (newTransaction) => {
                set({ isLoading: true, error: null });
                try {
                    const response = await axios.post("/v1/payment-transactions/", newTransaction);
                    set((state) => ({
                        transactions: [...state.transactions, response.data.data],
                        isLoading: false,
                        message: response.data.message,
                        statusCode: response.status,
                    }));
                } catch (error) {
                    const axiosError = error as AxiosError<ErrorResponse>;
                    set({
                        message: axiosError.response?.data?.message,
                        error: axiosError.response?.data?.message,
                        isLoading: false,
                        statusCode: axiosError.response?.status,
                    });
                }
            },

            updateTransaction: async (id, transaction: Partial<Transaction>) => {
                set({ isLoading: true, error: null });
                try {
                    const response = await axios.put(`/v1/payment-transactions/${id}`, transaction);
                    set((state) => ({
                        transactions: [...state.transactions, response.data.data],
                        isLoading: false,
                        message: response.data.message,
                        statusCode: response.status,
                    }));
                } catch (error) {
                    const axiosError = error as AxiosError<ErrorResponse>;
                    set({
                        message: axiosError.response?.data?.message,
                        error: axiosError.response?.data?.message,
                        isLoading: false,
                        statusCode: axiosError.response?.status,
                    });
                }
            },

            deleteTransaction: async (id) => {
                set({ isLoading: true, error: null });
                try {
                    await axios.delete(`/v1/payment-transactions/${id}`);
                    set((state) => ({
                        transactions: state.transactions.filter(
                            (transaction) => transaction.transactionId !== id
                        ),
                        isLoading: false,
                    }));
                } catch (error) {
                    const axiosError = error as AxiosError<ErrorResponse>;
                    set({
                        message: axiosError.response?.data?.message,
                        error: axiosError.response?.data?.message,
                        isLoading: false,
                    });
                }
            },
        }),
        { name: "transaction-store" }
    )
);

export type { Transaction };
