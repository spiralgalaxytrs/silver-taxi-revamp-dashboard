export interface Transaction {
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

export interface ErrorResponse {
    message: string;
    success: boolean;
}