"use client";

import React, { useState } from "react";
import { Label } from "components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogTrigger,
    DialogTitle,
    DialogFooter,
} from "components/ui/dialog";
import { Button } from "components/ui/button";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Check, Loader2, Search, Users } from "lucide-react";
import { Input } from "components/ui/input";
import { Badge } from "components/ui/badge";

interface CustomerSelectionPopupProps {
    trigger: React.ReactNode;
    onSelectCustomers: (customerIds: string[]) => void;
    selectAllCustomers: () => void;
    title?: string;
    selectedCustomers?: any[];
    customers: any[];
    isLoading: boolean;
    isError: boolean;
}

export function CustomerSelectionPopup({
    trigger,
    onSelectCustomers,
    selectAllCustomers,
    title = "Select Customers",
    selectedCustomers = [],
    customers = [],
    isLoading,
    isError,
}: CustomerSelectionPopupProps) {
    
    const [selectedCustomerIds, setSelectedCustomerIds] = useState<string[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [isSelectAll, setIsSelectAll] = useState(false);
    const [open, setOpen] = useState(false);

    const filteredCustomers = customers.filter((customer: any) =>
        customer.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.phone?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleSelectCustomer = (customerId: string) => {
        setSelectedCustomerIds(prev => {
            if (prev.includes(customerId)) {
                return prev.filter(id => id !== customerId);
            } else {
                return [...prev, customerId];
            }
        });
        setIsSelectAll(false);
    };

    const handleSelectAll = () => {
        setIsSelectAll(true);
        setSelectedCustomerIds([]);
    };

    const handleConfirm = () => {
        if (isSelectAll) {
            selectAllCustomers();
        } else if (selectedCustomerIds.length > 0) {
            onSelectCustomers(selectedCustomerIds);
        }
        setOpen(false);
        setSelectedCustomerIds([]);
        setIsSelectAll(false);
    };

    const getSelectedCustomerNames = () => {
        if (isSelectAll) return "All Customers";
        if (selectedCustomerIds.length === 0) return "Select Customers";
        if (selectedCustomerIds.length === 1) {
            const customer = customers.find(c => c.customerId === selectedCustomerIds[0]);
            return customer?.name || "1 Customer";
        }
        return `${selectedCustomerIds.length} Customers`;
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger}
            </DialogTrigger>
            <DialogContent
                className="w-full max-w-[600px] max-h-[80vh] overflow-hidden rounded-xl p-0 shadow-lg border-0"
                onInteractOutside={(e) => e.preventDefault()}
            >
                <VisuallyHidden>
                    <DialogTitle>{title}</DialogTitle>
                </VisuallyHidden>

                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="p-6 border-b">
                        <h2 className="text-lg font-semibold mb-4">{title}</h2>
                        
                        {/* Search */}
                        <div className="relative mb-4">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <Input
                                placeholder="Search customers by name, email, or phone..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10"
                            />
                        </div>

                        {/* Select All Button */}
                        <Button
                            variant="outline"
                            onClick={handleSelectAll}
                            className={`w-full mb-2 ${isSelectAll ? 'bg-primary text-primary-foreground' : ''}`}
                        >
                            <Users className="w-4 h-4 mr-2" />
                            Select All Customers
                        </Button>
                    </div>

                    {/* Customer List */}
                    <div className="flex-1 overflow-y-auto p-6">
                        {isLoading ? (
                            <div className="flex items-center justify-center h-32">
                                <Loader2 className="w-6 h-6 animate-spin" />
                            </div>
                        ) : isError ? (
                            <div className="text-center text-red-500">
                                Failed to load customers
                            </div>
                        ) : filteredCustomers.length === 0 ? (
                            <div className="text-center text-gray-500">
                                No customers found
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {filteredCustomers.map((customer: any) => (
                                    <div
                                        key={customer.customerId}
                                        className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-colors ${
                                            selectedCustomerIds.includes(customer.customerId) || isSelectAll
                                                ? 'bg-primary/10 border-primary'
                                                : 'hover:bg-gray-50'
                                        }`}
                                        onClick={() => handleSelectCustomer(customer.customerId)}
                                    >
                                        <div className="flex-1">
                                            <div className="font-medium">{customer.name}</div>
                                            <div className="text-sm text-gray-500">
                                                {customer.email} • {customer.phone}
                                            </div>
                                        </div>
                                        {(selectedCustomerIds.includes(customer.customerId) || isSelectAll) && (
                                            <Check className="w-5 h-5 text-primary" />
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="p-6 border-t">
                        <div className="flex items-center justify-between mb-4">
                            <div className="text-sm text-gray-600">
                                {isSelectAll ? (
                                    "All customers will be selected"
                                ) : (
                                    `${selectedCustomerIds.length} customer(s) selected`
                                )}
                            </div>
                            {selectedCustomerIds.length > 0 && !isSelectAll && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setSelectedCustomerIds([])}
                                >
                                    Clear
                                </Button>
                            )}
                        </div>
                        
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setOpen(false)}>
                                Cancel
                            </Button>
                            <Button 
                                onClick={handleConfirm}
                                disabled={!isSelectAll && selectedCustomerIds.length === 0}
                            >
                                Confirm Selection
                            </Button>
                        </DialogFooter>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
