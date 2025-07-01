
import React from "react";
import { DataTable } from "components/table/DataTable";
import { Button } from "components/ui/button";
import { Activity } from "lucide-react";
import { Card } from "components/ui/card";
import { columns } from "app/admin/drivers/view/[id]/columns"; // Assuming columns is exported and accessible
import { Loader2 } from "lucide-react";
import * as Popover from "@radix-ui/react-popover";
import { Input } from "components/ui/input";
import { Label } from "components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "components/ui/select";
import { StatsCard } from "./StatsCard";
import { Driver } from "stores/driverStore";
import { toast } from "sonner";

interface BookingsTabProps {
  totalTrips: number;
  editedDriver: Driver | null;
  bookingData: any[];
  handleSort: (columnId: string) => void;
  sortConfig: {
    columnId: string | null;
    direction: "asc" | "desc" | null;
  };
  adjustmentAmount: string;
  setAdjustmentAmount: (value: string) => void;
  adjustmentRemarks: string;
  setAdjustmentRemarks: (value: string) => void;
  adjustmentType: string;
  setAdjustmentType: (value: string) => void;
  adjustmentReason: string;
  setAdjustmentReason: (value: string) => void;
  localError: string;
  walletMessage: string;
  isLoading: boolean;
  handleSubmit: () => void;
  handleClose: () => void;
}

export default function BookingsTab({
  totalTrips,
  editedDriver,
  bookingData,
  handleSort,
  sortConfig,
  adjustmentAmount,
  setAdjustmentAmount,
  adjustmentRemarks,
  setAdjustmentRemarks,
  adjustmentType,
  setAdjustmentType,
  adjustmentReason,
  setAdjustmentReason,
  localError,
  walletMessage,
  isLoading,
  handleSubmit,
  handleClose,
}: BookingsTabProps) {
  const creditReasons = [
    { value: "referral_bonus", label: "Referral Bonus" },
    { value: "manual_credit", label: "Manual Credit" },
  ];

  const debitReasons = [
    { value: "withdrawal", label: "Wallet Withdrawal" },
    { value: "admin_deduction", label: "Admin Deduction" },
  ];

  const handleAdjustmentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setAdjustmentAmount(value);
    if (value === "" || Number(value) <= 0) {
      toast.error("Please enter a positive amount", {
        style: {
          backgroundColor: "#FF0000",
          color: "#fff",
        },
      });
    }
  };

  // Handle Popover open/close to toggle body overflow
  React.useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden"; // Disable background scroll when Popover is open
    return () => {
      document.body.style.overflow = originalOverflow; // Restore original overflow on cleanup
    };
  }, []);

  return (
    <div className="relative p-12 py-20">
      <div className="grid gap-5 md:grid-cols-3 lg:grid-cols-3">
        <StatsCard
          count={totalTrips}
          label="Total Trips"
          gradientFrom="emerald"
          gradientTo="teal"
          color="emerald"
        />
        <StatsCard
          count={editedDriver?.totalEarnings || 0}
          label="Total Earned"
          gradientFrom="blue"
          gradientTo="indigo"
          color="blue"
          format="currency"
        />
        <StatsCard
          count={editedDriver?.wallet?.balance ?? 0}
          label="Wallet Balance"
          gradientFrom="purple"
          gradientTo="pink"
          color="purple"
        />
      </div>
      <Popover.Root onOpenChange={handleClose}>
        <Popover.Trigger asChild>
          <Button
            type="button"
            className="absolute top-6 right-6 flex items-center gap-2 group focus:outline-none bg-transparent hover:bg-transparent"
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
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 4v16m8-8H4"
                />
              </svg>
              <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
            </div>
          </Button>
        </Popover.Trigger>
        <Popover.Portal>
          <Popover.Content
            className="w-[400px] p-0 bg-white rounded-xl border border-gray-200 shadow-xl transform transition-all duration-300 ease-in-out data-[state=open]:scale-100 data-[state=open]:opacity-100 data-[state=open]:translate-y-0 data-[state=closed]:scale-95 data-[state=closed]:opacity-0 data-[state=closed]:-translate-y-2 origin-top z-50"
            sideOffset={10}
            align="end"
            side="bottom"
          >
            <div
              className="max-h-[60vh] overflow-y-scroll overscroll-contain p-6 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 scrollbar-rounded scroll-smooth"
              onWheel={(e) => e.stopPropagation()} // Prevent scroll event from bubbling to parent
            >
              <div className="flex flex-col gap-4 min-h-[300px]">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-900">Adjust Wallet Balance</h3>
                  <Popover.Close
                    className="text-gray-500 hover:text-gray-700 focus:outline-none"
                    aria-label="Close"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </Popover.Close>
                </div>
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
                        className="h-10 bg-gray-100 font-semibold text-lg text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
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
                      type="number"
                      value={adjustmentAmount}
                      onChange={handleAdjustmentChange}
                      placeholder="Enter amount"
                      className="h-10 text-center border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      min="0"
                    />
                    {localError && <p className="text-sm text-red-500">{localError}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Remarks (Optional)</Label>
                    <Input
                      id="adjustmentRemarks"
                      name="adjustmentRemarks"
                      value={adjustmentRemarks}
                      onChange={(e) => setAdjustmentRemarks(e.target.value)}
                      placeholder="Enter remarks"
                      className="h-10 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <Button
                    onClick={handleSubmit}
                    className="w-full bg-indigo-600 text-white hover:bg-indigo-700 h-10 rounded-lg flex items-center justify-center"
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
            </div>
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
      <div className="flex flex-col gap-4 pt-5">
        <h2 className="text-black text-lg font-bold">Booking History</h2>
        <DataTable
          columns={columns} // Assuming columns is exported and accessible
          data={bookingData}
          onSort={handleSort}
          sortConfig={sortConfig}
        />
      </div>
    </div>
  );
}