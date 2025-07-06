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
import { useOfferStore } from 'stores/-offerStore';
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Book } from 'lucide-react';

interface OfferPopupProps {
    trigger: React.ReactNode;
    id: string;
    title?: string;
    width?: string;
    size?: string;
}

interface OfferDetails {
    [key: string]: any;
}

export function OfferPopup({ trigger, id, title = 'Offer Details', width, size = 'max-h-[80vh]' }: OfferPopupProps) {
    const { offers } = useOfferStore();
    const [open, setOpen] = useState(false);
    const [offerDetails, setOfferDetails] = useState<OfferDetails | null>(null);
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
            fetchOfferDetails(id);
        }
    }, [open, id]);

    const fetchOfferDetails = async (id: string) => {
        setLoading(true);
        setError(null);
        try {
            const offer = offers.find((offer) => offer.offerId === id);
            if (offer) {
                const formattedOffer = {
                    "Offer Id": offer.offerId || '-',
                    "Name": offer.offerName || '-',
                    "Description": offer.description || '-',
                    "Keywords": offer.keywords || '-',
                    "Offer Type": offer.type || '-',
                    "Offer Value": (offer.type === "Percentage" ? (`${offer.value}%`) : (`₹${offer.value}`))|| '-',
                    "Category": offer.category || '-',
                    "Start Date": formatDate(String(offer.startDate || "-")) || '-',
                    "End Date": formatDate(String(offer.endDate || "-")) || '-',
                    "Claimed Count": offer.claimedCount || '-',
                    "Offer Status": offer.status ? "Active" : "Inactive",
                    "Created At": formatDate(offer.createdAt || '') || '-',
                    "Banner Image": offer.bannerImage || '-',
                };
                setOfferDetails(formattedOffer);
            } else {
                setError("Offer not found");
            }
        } catch (error: any){
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

                    {offerDetails && (
                        <div className="grid gap-4">
                            {Object.entries(offerDetails)
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
                            {Object.keys(offerDetails).length > 0 &&
                                Object.entries(offerDetails).every(
                                    ([_, value]) =>
                                        value === null ||
                                        value === undefined ||
                                        (typeof value === "number" && value <= 0) ||
                                        (typeof value === "string" && (value.trim() === '' || value === '-'))
                                ) && (
                                    <div className="text-center text-muted-foreground">
                                        No relevant offer details available.
                                    </div>
                                )}
                        </div>
                    )}
                    {!offerDetails && !loading && !error && (
                        <div className="text-center text-muted-foreground">
                            No offer details found.
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}