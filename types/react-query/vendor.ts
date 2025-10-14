export interface Vendor {
  vendorId?: string;
  name: string;
  phone: string;
  email: string;
  password: string;
  remark: string;
  walletId: string;
  isLogin: boolean;
  totalEarnings: string;
  wallet: {
    walletId: string;
    balance: number;
    startAmount: number;
    minusAmount: number;
    plusAmount: number;
    totalAmount: string;
    currency: string;
    vendorId: string;
    createdAt: string;
  };
  createdAt: string;
  
  website?: string;
  reason?: string;
}

export interface wallet {
    transactionId: string;
    initiatedBy: string;
    initiatedTo: string;
    type: string;
    date: string;
    vendorId: string;
    // driverId: string;
    amount: number;

    status: "Paid" | "Unpaid";

    createdAt: string;
    updatedAt: string;
}
