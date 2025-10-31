"use client"

import React, { useEffect } from 'react';
import { Label } from 'components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogTrigger,
    DialogTitle
} from "components/ui/dialog";
import { Button } from "components/ui/button";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { useOffersById } from "hooks/react-query/useOffers";

interface OfferPopupProps {
    trigger: React.ReactNode;
    id: string;
    title?: string;
    width?: string;
    size?: string;
}

interface OfferData {
    offerName?: string;
    description?: string;
    keywords?: string;
    type?: string;
    value?: number;
    category?: string;
    startDate?: string | Date;
    endDate?: string | Date;
    usedCount?: number;
    status?: boolean;
    bannerImage?: string;
}

type OfferDetails = Record<string, string | number | boolean>;

export function OfferPopup({ trigger, id, title = 'Offer Details' }: OfferPopupProps) {
    const { data: offer, isLoading, error } = useOffersById(id);
    const [open, setOpen] = React.useState(false);

    const formatDate = (dateString: string): string => {
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return dateString;
            return date.toLocaleDateString('en-IN', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            });
        } catch (error) {
            return dateString;
        }
    };

    const getOfferDetails = (): OfferDetails => {
        if (!offer || !Array.isArray(offer) || offer.length === 0) return {};

        const offerData = offer[0] as OfferData; 

        return {
            "Name": offerData.offerName || '-',
            "Description": offerData.description || '-',
            "Keywords": offerData.keywords || '-',
            "Offer Type": offerData.type || '-',
            "Offer Value": offerData.type === "Percentage" 
                ? `${offerData.value}%` 
                : `₹${offerData.value}`,
            "Category": offerData.category || '-',
            "Start Date": offerData.startDate ? formatDate(String(offerData.startDate)) : '-',
            "End Date": offerData.endDate ? formatDate(String(offerData.endDate)) : '-',
            "Claimed Count": offerData.usedCount?.toString() || '0',
            "Status": offerData.status ? "Active" : "Inactive",
            ...(offerData.bannerImage && { "Banner Image": offerData.bannerImage })
        };
    };

    const offerDetails = getOfferDetails();

   const renderOfferDetailItem = (key: string, value: unknown): React.ReactNode => {
  let displayValue: React.ReactNode = "-"; // default fallback

  // Handle different value types safely
  if (key === "Banner Image" && typeof value === "string") {
    displayValue = (
      <img
        src={value}
        alt="Offer Banner"
        className="max-w-[200px] h-auto rounded-md"
      />
    );
  } else if (typeof value === "string" || typeof value === "number") {
    displayValue = String(value);
  } else if (typeof value === "boolean") {
    displayValue = value ? "Yes" : "No";
  } else if (React.isValidElement(value)) {
    displayValue = value;
  } else if (Array.isArray(value)) {
    displayValue = value.join(", ");
  } else if (value && typeof value === "object") {
    displayValue = JSON.stringify(value);
  }

  return (
    <div key={key} className="grid grid-cols-3 items-center gap-4">
      <Label className="capitalize font-medium text-base">{key}</Label>
      <div className="col-span-2 text-base text-muted-foreground">
        {displayValue}
      </div>
    </div>
  );
};

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {React.cloneElement(trigger as React.ReactElement, {
                    onClick: (e: React.MouseEvent) => {
                        e.stopPropagation();
                        const originalOnClick = (trigger as React.ReactElement).props.onClick;
                        if (originalOnClick) originalOnClick(e);
                    }
                })}
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
                    
                    {isLoading && <div>Loading offer details...</div>}
                    
                    {error && (
                        <div className="text-red-500 text-center">
                            Failed to load offer details. Please try again.
                        </div>
                    )}

                    {!isLoading && !error && Object.keys(offerDetails).length > 0 && (
                        <div className="grid gap-4">
                            {Object.entries(offerDetails).map(([key, value]) => 
                                renderOfferDetailItem(key, value)
                            )}
                        </div>
                    )}

                    {!isLoading && !error && Object.keys(offerDetails).length === 0 && (
                        <div className="text-center text-muted-foreground">
                            No offer details available.
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}