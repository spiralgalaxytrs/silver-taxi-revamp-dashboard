"use client"

import React, { useState, useEffect } from 'react';
import { Label } from 'components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogTrigger,
    DialogTitle
} from "components/ui/dialog";
import { Button } from "components/ui/button";
// import { useOfferStore } from 'stores/-offerStore';
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { usePromoCodesAll } from 'hooks/react-query/usePromoCodes';

import { Book } from 'lucide-react';

interface PromoCodePopup {
    trigger: React.ReactNode;
    id: string;
    title?: string;
    width?: string;
    size?: string;
}

interface PromoDetails {
    [key: string]: any;
}

export function PromoCodePopup({ trigger, id, title = 'Promo Code Details', width, size = 'max-h-[80vh]' }: PromoCodePopup) {
    // const { offers } = useOfferStore();
    const {
        data: promoCodes = [],
        isPending: isFetchPending,
        isError,
        // error,
    } = usePromoCodesAll();


    const [open, setOpen] = useState(false);
    const [promoCodeDetails, setPromoCodeDetails] = useState<PromoDetails | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Month is 0-indexed
        const day = String(date.getDate()).padStart(2, '0');
        return `${day}-${month}-${year}`;
    };

    const formattedTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString('en-US', { timeZone: "Asia/Kolkata", hour: 'numeric', minute: 'numeric', hour12: true });
    };

    useEffect(() => {
        if (open && id) {
            fetPromoCodeDetails(id);
        }
    }, [open, id]);

    const fetPromoCodeDetails = async (id: string) => {
        setLoading(true);
        try {
            const promos = promoCodes.find((promo: any) => promo.codeId === id);
            if (promos) {
                const formattedPromoCodes = {
                    "Promo Code Id": promos.codeId  || '-',
                    "Name": promos.promoName || '-',
                    "Promo code": promos.code || '-',
                    "Description": promos.description || '-',
                    "Keywords": promos?.keywords || '-',
                    "Promo code Type": promos.type || '-',
                    "Promo code Value": (promos.type === "Percentage" ? (`${promos.value}%`) : (`₹${promos.value}`)) || '-',
                    "Category": promos.category || '-',
                    "Start Date": formatDate(String(promos.startDate || "-")) || '-',
                    "End Date": formatDate(String(promos.endDate || "-")) || '-',
                    "Claimed Count": promos.claimedCount || '-',
                    "Promo code Status": promos.status ? "Active" : "Inactive",
                    "Created At": formatDate(promos.createdAt || '') || '-',
                    "Banner Image": promos.bannerImage || '-',
                };
                setPromoCodeDetails(formattedPromoCodes);
            } else {
                setError("Promo code not found");
            }
        } catch (error: any) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger}
            </DialogTrigger>
            <DialogContent
                className="w-[800px] max-h-[90vh] overflow-y-auto rounded-lg p-8"
                onInteractOutside={(e) => e.preventDefault()}
            >
                <VisuallyHidden>
                    <DialogTitle>{title}</DialogTitle>
                </VisuallyHidden>

                <div className="grid gap-4">
                    <h4 className="text-2xl font-semibold text-center mb-4">{title}</h4>
                    {loading && <div>Loading...</div>}
                    {error && <div className="text-red-500">{error}</div>}

                    {promoCodeDetails && (
                        <div className="grid gap-4">
                            {Object.entries(promoCodeDetails)
                                .filter(([key, value]) => {
                                    // Skip if value is explicitly null or undefined
                                    if (value === null || value === undefined) return false;

                                    // For numbers, only show if greater than 0 (keep your logic)
                                    if (typeof value === "number") return value > 0;

                                    // For strings, only show if not empty or just a dash
                                    if (typeof value === "string") return value.trim() !== '' && value !== '-';

                                    // Include all other non-null/undefined values (e.g., booleans, objects)
                                    return true;
                                })
                                .map(([key, value]) => (
                                    <div key={key} className="grid grid-cols-3 items-center gap-4">
                                        <Label className="capitalize font-medium text-base">{key}</Label>
                                        <div className="col-span-2 text-base text-muted-foreground">
                                            {key === "Banner Image" ? (
                                                <img
                                                    src={value}
                                                    alt="Offer Image"
                                                    className="max-w-[200px] h-auto rounded-md"
                                                />
                                            ) : (
                                                typeof value === "number" ? value.toLocaleString() : value
                                            )}
                                        </div>
                                    </div>
                                ))}
                            {Object.keys(promoCodeDetails).length > 0 &&
                                Object.entries(promoCodeDetails).every(
                                    ([_, value]) =>
                                        value === null ||
                                        value === undefined ||
                                        (typeof value === "number" && value <= 0) ||
                                        (typeof value === "string" && (value.trim() === '' || value === '-'))
                                ) && (
                                    <div className="text-center text-muted-foreground">
                                        No relevant promo code details available.
                                    </div>
                                )}
                        </div>
                    )}
                    {!promoCodeDetails && !loading && !error && (
                        <div className="text-center text-muted-foreground">
                            No promo code details found.
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}