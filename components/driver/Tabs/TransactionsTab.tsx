import React, { useState } from "react";
import { DriverTransaction, walletColumns } from "app/admin/drivers/view/[id]/walletColumns";
import { Button } from "components/ui/button";
import { Activity } from "lucide-react";
import { Card } from "components/ui/card";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import * as Popover from "@radix-ui/react-popover";
import { Input } from "components/ui/input";
import { Label } from "components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogClose,
  DialogHeader,
  DialogTitle,
} from "components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "components/ui/select";
import {
  MRT_ColumnDef,
  MaterialReactTable
} from 'material-react-table';
import { useDriverTransactions } from "hooks/react-query/useWallet";
import { RefreshCcw } from "lucide-react";
import { StatsCard } from "./StatsCard";

interface TransactionsTabProps {
  walletTransactions: DriverTransaction[];
  editedDriver: any;
  adjustmentAmount: string;
  setAdjustmentAmount: (value: string) => void;
  adjustmentRemarks: string;
  setAdjustmentRemarks: (value: string) => void;
  adjustmentType: string;
  setAdjustmentType: (value: string) => void;
  adjustmentReason: string;
  setAdjustmentReason: (value: string) => void;
  localError: string;
  remarkError: string;
  walletMessage: string;
  isLoading: boolean;
  handleSubmit: () => void;
  handleClose: () => void;
}

export default function TransactionsTab({
  walletTransactions,
  editedDriver,
  adjustmentAmount,
  setAdjustmentAmount,
  adjustmentRemarks,
  setAdjustmentRemarks,
  adjustmentType,
  setAdjustmentType,
  adjustmentReason,
  setAdjustmentReason,
  localError,
  remarkError,
  walletMessage,
  isLoading,
  handleSubmit,
  handleClose,
}: TransactionsTabProps) {

  const [isSpinning, setIsSpinning] = useState(false)


  const {
    data: driverTransactions = [],
    isPending: isLoadingTransactions,
    refetch
  } = useDriverTransactions(editedDriver.driverId as string || "");


  const creditReasons = [
    { value: "referral_bonus", label: "Referral Bonus" },
    { value: "manual_credit", label: "Manual Credit" },
  ];

  const debitReasons = [
    { value: "withdrawal", label: "Wallet Withdrawal" },
    { value: "admin_deduction", label: "Admin Deduction" },
  ];

  const handleAdjustmentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    const sanitizedValue = rawValue.replace(/\D/g, "");
    setAdjustmentAmount(sanitizedValue);
    if (sanitizedValue === "" || Number(sanitizedValue) <= 0) {
      toast.error("Please enter a positive amount", {
        style: {
          backgroundColor: "#FF0000",
          color: "#fff",
        },
      });
    }
  };


  const handleRefetch = async () => {
    setIsSpinning(true);
    try {
      await refetch(); // wait for the refetch to complete
    } finally {
      // stop spinning after short delay to allow animation to play out
      setTimeout(() => setIsSpinning(false), 500);
    }
  };





  return (
    <React.Fragment>
      <div>
        <div className="flex items-center justify-between">
          <h2 className="text-black text-lg font-bold">Wallet Transactions</h2>
          <Dialog onOpenChange={handleClose} >
            <DialogTrigger asChild>
              <Button
                type="button"
                className="flex items-center gap-2 group bg-transparent hover:bg-transparent my-2"
              >
                <span className="text-sm font-semibold text-gray-700 group-hover:text-indigo-600 transition-colors duration-300">
                  Adjust Wallet Balance
                </span>
                <div className="relative w-8 h-8 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center overflow-hidden">
                  <svg
                    className="w-4 h-4 text-white group-hover:scale-110 transition-transform duration-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                  </svg>
                  <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
                </div>
              </Button>
            </DialogTrigger>

            <DialogContent className="w-full max-w-lg rounded-xl">
              <div className="p-6 overflow-y-auto max-h-[80vh] space-y-4 scrollbar-hide">
                <DialogHeader className="flex justify-between items-center">
                  <DialogTitle className="text-lg font-semibold text-gray-900">Adjust Wallet Balance</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Current Balance</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="walletAmount"
                        name="walletAmount"
                        type="number"
                        value={editedDriver?.wallet?.balance ?? 0}
                        disabled
                        className="h-10 bg-gray-100 font-semibold text-lg text-gray-900 border border-gray-300 rounded-lg"
                      />
                      <span className="text-xl font-bold text-gray-900">₹</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Adjustment Type</Label>
                    <Select
                      value={adjustmentType}
                      onValueChange={(value) => {
                        setAdjustmentType(value);
                        setAdjustmentReason("");
                      }}
                    >
                      <SelectTrigger className="h-10 border-gray-300 focus:ring-2 focus:ring-indigo-500">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="add">Add to Wallet</SelectItem>
                        <SelectItem value="subtract">Take from Wallet</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {adjustmentType && (
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">Reason</Label>
                      <Select value={adjustmentReason} onValueChange={setAdjustmentReason}>
                        <SelectTrigger className="h-10 border-gray-300 focus:ring-2 focus:ring-indigo-500">
                          <SelectValue placeholder="Select reason" />
                        </SelectTrigger>
                        <SelectContent>
                          {(adjustmentType === "add" ? creditReasons : debitReasons).map((reason) => (
                            <SelectItem key={reason.value} value={reason.value}>
                              {reason.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Amount</Label>
                    <Input
                      id="adjustmentAmount"
                      name="adjustmentAmount"
                      type="text"
                      value={adjustmentAmount}
                      onChange={handleAdjustmentChange}
                      placeholder="Enter amount"
                      className="h-10 text-center border-gray-300 rounded-lg"
                      min="0"
                    />
                    {localError && <p className="text-sm text-red-500">{localError}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Remarks </Label>
                    <Input
                      id="adjustmentRemarks"
                      name="adjustmentRemarks"
                      value={adjustmentRemarks}
                      onChange={(e) => setAdjustmentRemarks(e.target.value)}
                      placeholder="Enter remarks"
                      className="h-10 border-gray-300 rounded-lg"
                    />
                  </div>
                  {remarkError && <p className="text-sm text-red-500">{remarkError}</p>}


                  <Button
                    onClick={handleSubmit}
                    className="w-full bg-indigo-600 text-white hover:bg-indigo-700 h-10 rounded-lg"
                    disabled={isLoading || !!localError}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      "Apply Adjustment"
                    )}
                  </Button>

                  {walletMessage && (
                    <p className="text-sm text-green-500 text-center">{walletMessage}</p>
                  )}
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 my-3">
          <StatsCard
            count={editedDriver?.wallet?.balance ?? 0}
            label="Wallet Balance"
            gradientFrom="purple"
            gradientTo="pink"
            color="purple"
          />
        </div>
        <MaterialReactTable
          columns={walletColumns as MRT_ColumnDef<any>[]}
          data={walletTransactions as any}
          positionGlobalFilter="left"
          enableSorting
          enableHiding={false}
          enableDensityToggle={false}
          enableColumnPinning={false}
          initialState={{
            density: 'compact',
            pagination: { pageIndex: 0, pageSize: 10 },
            showGlobalFilter: true,
            columnPinning: { right: ["actions"] },
          }}
          muiSearchTextFieldProps={{
            placeholder: 'Search ...',
            variant: 'outlined',
            fullWidth: true, // 🔥 Makes the search bar take full width
            sx: {
              minWidth: '600px', // Adjust width as needed
              marginLeft: '16px',
            },
          }}
          muiToolbarAlertBannerProps={{
            sx: {
              justifyContent: 'flex-start', // Aligns search left
            },
          }}
          renderTopToolbarCustomActions={() => (
            <div className="flex flex-1 justify-end items-center">
              {/* 🔁 Refresh Button */}
              <Button
                variant={"ghost"}
                onClick={handleRefetch}
                className="text-gray-600 hover:text-primary transition p-0 m-0 hover:bg-transparent hover:shadow-none"
                title="Refresh Data"
              >
                <RefreshCcw className={`w-5 h-5 ${isSpinning ? 'animate-spin-smooth ' : ''}`} />
              </Button>
            </div>
          )}
        />
      </div>
    </React.Fragment>
  );
}