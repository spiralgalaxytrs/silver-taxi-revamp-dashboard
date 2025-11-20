export interface wallet {
  transactionId: string;
  initiatedBy: string;
  initiatedTo: string;
  type: string;
  date: string;
  vendorId: string;
  // driverId: string;
  amount: number;
  createdAt: string;
  updatedAt: string;
}

export interface WalletTransaction {
    transactionId: string;
    driverId?: string;
    vendorId?: string;
    initiatedBy: string;
    initiatedTo: string;
    ownedBy: "Driver" | "Vendor";
    type: string;
    amount: number;
    status: string;
    date: string;
    reason?: string;
    remark: string;
    description: string
    createdAt: string;
};

export interface ErrorResponse {
    message: string;
    success: boolean;
}