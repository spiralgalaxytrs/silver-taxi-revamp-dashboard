export interface wallet {
  transactionId: string;
  initiatedBy: string;
  initiatedTo: string;
  type: string;
  date: string;
  vendorId: string;
  // driverId: string;
  amount: number;
  createdAt: Date | string;
  updatedAt: string;
}

export interface WalletTransaction {
  transactionId: string;
  driverId?: string;
  vendorId?: string;
  initiatedBy: string;
  initiatedTo: string;
  type: string;
  amount: number;
  date: string;
  reason?: string;
  remark: string;
  description: string
  createdAt:Date | string;
  ownedBy?: "Vendor" | "Driver";

  walletId?: string;
  isShow?: boolean;

  tnxOrderId?: string;
  tnxPaymentId?: string;
  tnxPaymentStatus?: "Pending" | "Success" | "Failed";
  tnxPaymentMethod?: string;
  tnxPaymentAmount?: number;
  tnxPaymentTime?: Date;

  fareBreakdown?: any;
  status?: "Paid" | "Unpaid";

};

export interface ErrorResponse {
  message: string;
  success: boolean;
}