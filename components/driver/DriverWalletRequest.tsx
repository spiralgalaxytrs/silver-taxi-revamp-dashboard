import React, { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "components/ui/dialog";
import { Button } from "components/ui/button";
import { Input } from "components/ui/input";
import { Label } from "components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "components/ui/select";
import { useAllDriverWalletRequests, useApproveOrRejectDriverWalletRequest } from "hooks/react-query/useDriver";
import { Loader2, Wallet, CheckCircle, XCircle } from "lucide-react";
import { Badge } from "components/ui/badge";
import { toast } from "sonner";
import type { DriverWalletRequest } from "types/react-query/driver";

export default function DriverWalletRequest() {
    const [open, setOpen] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState<DriverWalletRequest | null>(null);
    const [actionDialogOpen, setActionDialogOpen] = useState(false);
    const [status, setStatus] = useState<"approved" | "rejected">("approved");
    const [remark, setRemark] = useState("");
    const [paymentMethod, setPaymentMethod] = useState<"Bank" | "UPI" | "Cash" | "Other">("Bank");
    const [tnxPaymentId, setTnxPaymentId] = useState("");

    const { data: walletRequests, isLoading, refetch } = useAllDriverWalletRequests();
    const {
        mutate: approveOrRejectDriverWalletRequest,
        isPending
    } = useApproveOrRejectDriverWalletRequest();

    // Calculate pending requests count
    const pendingRequestsCount = walletRequests?.filter(request => request.status === "pending").length || 0;

    const handleActionClick = (request: DriverWalletRequest) => {
        setSelectedRequest(request);
        setActionDialogOpen(true);
        setStatus("approved");
        setRemark("");
        setPaymentMethod("Bank");
        setTnxPaymentId("");
    };

    const handleSave = () => {
        if (!selectedRequest) return;

        if (status === "approved" && selectedRequest.type === "withdraw") {
            if (!paymentMethod || !tnxPaymentId || !remark.trim()) {
                toast.error("Please fill in all required fields", {
                    style: {
                        backgroundColor: "#FF0000",
                        color: "#fff",
                    },
                });
                return;
            }
        } else if (!remark.trim()) {
            toast.error("Please enter a remark", {
                style: {
                    backgroundColor: "#FF0000",
                    color: "#fff",
                },
            });
            return;
        }

        const payload: any = {
            id: selectedRequest.driverId,
            walletId: selectedRequest.walletId,
            requestId: selectedRequest.requestId,
            status,
            type: selectedRequest.type,
            remark,
        };

        if (status === "approved" && selectedRequest.type === "withdraw") {
            payload.paymentMethod = paymentMethod;
            payload.tnxPaymentId = tnxPaymentId;
        }

        approveOrRejectDriverWalletRequest({ id: selectedRequest.driverId, data: payload }, {
            onSuccess: () => {
                setActionDialogOpen(false);
                setSelectedRequest(null);
                toast.success(`Request ${status} successfully`, {
                    style: {
                        backgroundColor: "#009F7F",
                        color: "#fff",
                    },
                });
                refetch();
            },
            onError: (error: any) => {
                toast.error(error?.response?.data?.message || `Failed to ${status} request`, {
                    style: {
                        backgroundColor: "#FF0000",
                        color: "#fff",
                    },
                });
            },
        });
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "approved":
                return <Badge className="bg-green-100 text-green-800">Approved</Badge>;
            case "rejected":
                return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
            default:
                return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
        }
    };

    const getTypeBadge = (type: string) => {
        switch (type) {
            case "add":
                return <Badge className="bg-blue-100 text-blue-800">Add</Badge>;
            case "withdraw":
                return <Badge className="bg-purple-100 text-purple-800">Withdraw</Badge>;
            default:
                return <Badge>{type}</Badge>;
        }
    };

    return (
        <>
            {/* Icon Button with Notification Badge */}
            <Button variant="outline" className="flex items-center gap-2 relative" onClick={() => setOpen(true)}>
                <div className="relative">
                    <Wallet className="w-5 h-5" />
                    {pendingRequestsCount > 0 && (
                        <div className="absolute -top-5 right-4 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                            {pendingRequestsCount > 99 ? '99+' : pendingRequestsCount}
                        </div>
                    )}
                </div>
                <span className="text-sm">Requests</span>
            </Button>

            {/* Main Dialog */}
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="max-w-6xl max-h-[80vh] overflow-hidden scrollbar-hide">
                    <DialogHeader>
                        <DialogTitle>Driver Wallet Requests</DialogTitle>
                        <DialogDescription>Manage driver wallet requests - approve or reject them.</DialogDescription>
                    </DialogHeader>

                    {/* Table */}
                    <div className="overflow-auto max-h-[60vh] scrollbar-hide">
                        {isLoading ? (
                            <div className="flex items-center justify-center py-8">
                                <Loader2 className="h-8 w-8 animate-spin" />
                                <span className="ml-2">Loading wallet requests...</span>
                            </div>
                        ) : walletRequests && walletRequests.length > 0 ? (
                            <table className="w-full border-collapse border border-gray-200">
                                <thead className="bg-gray-50 sticky top-0">
                                    <tr>
                                        <th className="border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-700">Driver</th>
                                        <th className="border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-700">Type</th>
                                        <th className="border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-700">Amount</th>
                                        <th className="border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-700">Status</th>
                                        <th className="border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-700">Reason</th>
                                        <th className="border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-700">Remark</th>
                                        <th className="border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-700">Date</th>
                                        <th className="border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-700">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {walletRequests.map((request: DriverWalletRequest) => (
                                        <tr key={request.requestId || request.driverId} className="hover:bg-gray-50">
                                            <td className="border border-gray-200 px-4 py-3 text-sm">
                                                <div>
                                                    <div className="font-medium">{request.name || "N/A"}</div>
                                                    <div className="text-gray-500 text-xs">ID: {request.driverId}</div>
                                                    {request.phone && (
                                                        <div className="text-gray-500 text-xs">Phone: {request.phone}</div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="border border-gray-200 px-4 py-3 text-sm">
                                                {getTypeBadge(request.type)}
                                            </td>
                                            <td className="border border-gray-200 px-4 py-3 text-sm font-medium">
                                                ₹{request.amount.toLocaleString()}
                                            </td>
                                            <td className="border border-gray-200 px-4 py-3 text-sm">
                                                {getStatusBadge(request.status)}
                                            </td>
                                            <td className="border border-gray-200 px-4 py-3 text-sm text-gray-600">
                                                {request.reason || request.description || "N/A"}
                                            </td>
                                            <td className="border border-gray-200 px-4 py-3 text-sm">
                                                {request.remark || "-"}
                                            </td>
                                            <td className="border border-gray-200 px-4 py-3 text-sm">
                                                {request.createdAt ? new Date(request.createdAt).toLocaleDateString() : "N/A"}
                                            </td>
                                            <td className="border border-gray-200 px-4 py-3 text-sm">
                                                {request.status === "pending" ? (
                                                    <div className="flex space-x-2">
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="text-green-600 border-green-600 hover:bg-green-50"
                                                            onClick={() => handleActionClick(request)}
                                                        >
                                                            <CheckCircle className="h-4 w-4 mr-1" />
                                                            Approve
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="text-red-600 border-red-600 hover:bg-red-50"
                                                            onClick={() => handleActionClick(request)}
                                                        >
                                                            <XCircle className="h-4 w-4 mr-1" />
                                                            Reject
                                                        </Button>
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-400">Processed</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <div className="text-center py-8 text-gray-500">
                                No wallet requests found
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            {/* Action Dialog */}
            <Dialog open={actionDialogOpen} onOpenChange={setActionDialogOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>
                            {status === "approved" ? "Approve" : "Reject"} Wallet Request
                        </DialogTitle>
                        <DialogDescription asChild>
                            {selectedRequest && (
                                <div className="mt-2 p-3 bg-gray-50 rounded">
                                    <div><strong>Driver:</strong> {selectedRequest.name || "N/A"}</div>
                                    <div><strong>Type:</strong> {selectedRequest.type}</div>
                                    <div><strong>Amount:</strong> ₹{selectedRequest.amount.toLocaleString()}</div>
                                    {selectedRequest.reason && (
                                        <div><strong>Reason:</strong> {selectedRequest.reason}</div>
                                    )}
                                </div>
                            )}
                        </DialogDescription>
                    </DialogHeader>

                    {/* Status */}
                    <div className="space-y-2">
                        <Label>Action <span className="text-red-500">*</span></Label>
                        <Select value={status} onValueChange={(v) => setStatus(v as "approved" | "rejected")}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select action" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="approved">Approve</SelectItem>
                                <SelectItem value="rejected">Reject</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Payment Fields for withdraw approval */}
                    {status === "approved" && selectedRequest?.type === "withdraw" && (
                        <>
                            <div className="space-y-2">
                                <Label>Payment Method <span className="text-red-500">*</span></Label>
                                <Select value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as "Bank" | "UPI" | "Cash" | "Other")}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select payment method" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Bank">Bank Transfer</SelectItem>
                                        <SelectItem value="UPI">UPI</SelectItem>
                                        <SelectItem value="Cash">Cash</SelectItem>
                                        <SelectItem value="Other">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Transaction Payment ID <span className="text-red-500">*</span></Label>
                                <Input
                                    value={tnxPaymentId}
                                    onChange={(e) => setTnxPaymentId(e.target.value)}
                                    placeholder="Enter transaction ID"
                                />
                            </div>
                        </>
                    )}

                    {/* Remark */}
                    <div className="space-y-2">
                        <Label>Remark <span className="text-red-500">*</span></Label>
                        <Input
                            value={remark}
                            onChange={(e) => setRemark(e.target.value)}
                            placeholder="Enter remark"
                        />
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setActionDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSave}
                            disabled={isPending}
                            className={status === "approved" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"}
                        >
                            {status === "approved" ? "Approve" : "Reject"}
                            {isPending && "..."}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
