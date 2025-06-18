"use client"

import React, { useState } from 'react'
import { Label } from 'components/ui/label';
import { 
    Dialog,
    DialogContent,
    DialogTrigger,
    DialogTitle
} from "components/ui/dialog"
import { format, toZonedTime } from 'date-fns-tz';
import { Button } from "components/ui/button"
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"

interface DetailsPopupProps {
    trigger: React.ReactNode;
    data: Record<string, any>;
    title?: string;
    width?: string;
    size?: string;
}

export function DetailsPopup({ trigger, data, title = 'Details', width, size = 'max-h-[80vh]' }: DetailsPopupProps) {
    const [open, setOpen] = useState(false)

    const formatDate = (dateString: string) => {
        if (!dateString) {
            return '';
        }
    
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
            return '';
        }
    
      const timeZone = 'UTC'; 
      const zonedDate = toZonedTime(date, timeZone);
    
      const includesTime = dateString
    
        return (
            <div className="space-y-1">
                <div>{format(zonedDate, 'dd MMM yyyy', { timeZone })}</div>
                {includesTime && (
                    <div className="text-sm text-muted-foreground">
                        {format(zonedDate, 'hh:mm a', { timeZone })}
                    </div>
                )}
            </div>
        );
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
    
            {/* <Button
              variant="ghost"
              size="sm" 
              className="absolute right-6 top-6 h-8 w-8 p-1 rounded-full"
              onClick={() => setOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button> */}
            
            <div className="grid gap-4">
              <h4 className="text-2xl font-semibold text-center mb-4">{title}</h4>
              <div className="grid gap-4">
                {Object.entries(data).map(([key, value]) => (
                  <div key={key} className="grid grid-cols-3 items-center gap-4">
                    <Label className="capitalize font-medium text-base">{key}</Label>
                    <div className="col-span-2 text-base text-muted-foreground">
                      {key.toLowerCase().includes('date') ? formatDate(value) : value}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </DialogContent>
        </Dialog>
    )
}
