"use client"

import React, { useState } from 'react'
import { Label } from 'components/ui/label';
import { 
    Dialog,
    DialogContent,
    DialogTrigger,
    DialogTitle
} from "components/ui/dialog"
import { Button } from "components/ui/button"
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"
import { CreditCard, AlertCircle } from "lucide-react"

interface BankDetailsPopupProps {
    trigger: React.ReactNode;
    data: Record<string, any>;
    title?: string;
    isLoading?: boolean;
    allowedFields?: string[]; // Whitelist of fields to show
    excludedFields?: string[]; // Blacklist of fields to hide
}

export function BankDetailsPopup({ 
    trigger, 
    data, 
    title = 'Bank Details', 
    isLoading = false,
    allowedFields,
    excludedFields = ['vendorId', 'id', 'createdAt', 'updatedAt', 'isLogin', 'totalEarnings']
}: BankDetailsPopupProps) {
    const [open, setOpen] = useState(false)

    // Filter out empty, null, undefined values and apply field restrictions
    const filteredData = Object.entries(data || {}).filter(([key, value]) => {
        // Skip if value is empty, null, or undefined
        if (value === null || value === undefined || value === '') return false;
        
        // For strings, skip if just dashes or empty
        if (typeof value === 'string' && (value.trim() === '' || value === '-')) return false;
        
        // If allowedFields is provided, only show those fields (whitelist)
        if (allowedFields && allowedFields.length > 0) {
            return allowedFields.includes(key);
        }
        
        // If excludedFields is provided, hide those fields (blacklist)
        if (excludedFields && excludedFields.length > 0) {
            return !excludedFields.includes(key);
        }
        
        return true;
    });

    const hasBankData = filteredData.length > 0;

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger}
            </DialogTrigger>
            <DialogContent 
                className="w-[500px] max-h-[60vh] overflow-y-auto rounded-lg p-6"
                onInteractOutside={(e) => e.preventDefault()}
            >
                <VisuallyHidden>
                    <DialogTitle>{title}</DialogTitle>
                </VisuallyHidden>
                
                <div className="grid gap-4">
                    <div className="flex items-center justify-center gap-2 mb-4">
                        <CreditCard className="h-6 w-6 text-primary" />
                        <h4 className="text-xl font-semibold text-center">{title}</h4>
                    </div>
                    
                    {isLoading ? (
                        <div className="flex items-center justify-center py-8">
                            <div className="text-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                                <p className="text-muted-foreground">Loading bank details...</p>
                            </div>
                        </div>
                    ) : !hasBankData ? (
                        <div className="flex items-center justify-center py-8">
                            <div className="text-center">
                                <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                                <p className="text-muted-foreground text-lg font-medium">No Bank Details Available</p>
                                <p className="text-sm text-muted-foreground mt-1">
                                    This vendor hasn't provided any bank details yet.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="grid gap-3">
                            {filteredData.map(([key, value]) => (
                                <div key={key} className="grid grid-cols-3 items-center gap-4 p-3 bg-gray-50 rounded-lg">
                                    <Label className="capitalize font-medium text-sm text-gray-700">
                                        {key.replace(/([A-Z])/g, ' $1').trim()}
                                    </Label>
                                    <div className="col-span-2 text-sm text-gray-900 font-mono">
                                        {value}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}
