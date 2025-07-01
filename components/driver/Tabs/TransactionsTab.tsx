import React from "react";
import { DataTable } from "components/table/DataTable";
import { DriverTransaction, walletColumns } from "app/admin/drivers/view/[id]/walletColumns";
import { Layout } from "lucide-react";

interface TransactionsTabProps {
  walletTransactions: DriverTransaction[];
  handleSort: (columnId: string) => void;
  sortConfig: {
    columnId: string | null;
    direction: "asc" | "desc" | null;
  };
}

export default function TransactionsTab({
  walletTransactions,
  handleSort,
  sortConfig,
}: TransactionsTabProps) {
  console.log("TransactionsTab props:", { walletTransactions });

  return (
    <div className="flex flex-col gap-4 p-6 ">
      <h2 className="text-black text-lg font-bold">Wallet Transactions</h2>
      {walletTransactions && walletTransactions.length > 0 ? (
        <DataTable
          columns={walletColumns}
          data={walletTransactions}
          onSort={handleSort}
          sortConfig={sortConfig}
        />
      ) : (
        <div className="text-center py-12 border rounded-lg">
          <Layout className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="text-lg font-medium text-gray-900">No Transactions Available</h3>
          <p className="text-sm text-gray-500">
            This driver has no wallet transactions yet.
          </p>
        </div>
      )}
    </div>
  );
}