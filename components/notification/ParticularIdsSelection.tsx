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
import { Check, Loader2, Search, Users } from "lucide-react";
import { Input } from "components/ui/input";
import { Badge } from "components/ui/badge";

interface ParticularIdsSelectionProps {
  trigger: React.ReactNode;
  onSelectIds: (ids: string[]) => void;
  selectAll: () => void;
  title?: string;
  selectedIds?: string[];
  target: 'vendor' | 'driver' | 'customer' | 'none';
  items: any[];
  isLoading: boolean;
  isError: boolean;
}

export function ParticularIdsSelection({
  trigger,
  onSelectIds,
  selectAll,
  title = "Select Particular IDs",
  selectedIds = [],
  target,
  items = [],
  isLoading,
  isError,
}: ParticularIdsSelectionProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSelectAll, setIsSelectAll] = useState(false);
  const [localSelectedIds, setLocalSelectedIds] = useState<string[]>(selectedIds);

  const getItemName = (item: any) => {
    switch (target) {
      case 'customer':
        return item.name || item.customerName || item.customerId || item.id;
      case 'driver':
        return item.name || item.driverName || item.driverId || item.id;
      case 'vendor':
        return item.name || item.vendorName || item.vendorId || item.id;
      default:
        return item.name || item.id;
    }
  };

  const getItemId = (item: any) => {
    switch (target) {
      case 'customer':
        return item.customerId || item.id;
      case 'driver':
        return item.driverId || item.id;
      case 'vendor':
        return item.vendorId || item.id;
      default:
        return item.id;
    }
  };

  const filteredItems = items.filter((item) =>
    getItemName(item).toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectItem = (itemId: string) => {
    setLocalSelectedIds(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
    setIsSelectAll(false);
  };

  const handleSelectAll = () => {
    setIsSelectAll(true);
    setLocalSelectedIds([]);
  };

  const handleConfirm = () => {
    if (isSelectAll) {
      selectAll();
    } else {
      onSelectIds(localSelectedIds);
    }
    setOpen(false);
  };

  const handleCancel = () => {
    setLocalSelectedIds(selectedIds);
    setIsSelectAll(false);
    setOpen(false);
  };

  const getSelectedCount = () => {
    if (isSelectAll) return "All";
    return localSelectedIds.length > 0 ? `${localSelectedIds.length} selected` : "Select";
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogTitle className="flex items-center gap-2">
          <Users className="w-5 h-5" />
          {title}
        </DialogTitle>

        <div className="flex-1 overflow-hidden flex flex-col">
          {/* Search */}
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder={`Search ${target}s...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Select All Button */}
          <div className="mb-4">
            <Button
              type="button"
              variant={isSelectAll ? "default" : "outline"}
              onClick={handleSelectAll}
              className="w-full"
            >
              <Check className="w-4 h-4 mr-2" />
              Select All {target}s
            </Button>
          </div>

          {/* Items List */}
          <div className="flex-1 overflow-y-auto border rounded-lg">
            {isLoading ? (
              <div className="flex items-center justify-center h-32">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
            ) : isError ? (
              <div className="flex items-center justify-center h-32 text-red-500">
                Error loading {target}s
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="flex items-center justify-center h-32 text-gray-500">
                No {target}s found
              </div>
            ) : (
              <div className="p-2 space-y-1">
                {filteredItems.map((item) => {
                  const itemId = getItemId(item);
                  const itemName = getItemName(item);
                  const isSelected = localSelectedIds.includes(itemId);

                  return (
                    <div
                      key={itemId}
                      className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${
                        isSelected ? "bg-primary/10 border border-primary" : "hover:bg-gray-50"
                      }`}
                      onClick={() => handleSelectItem(itemId)}
                    >
                      <div className="flex items-center gap-2">
                        <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                          isSelected ? "bg-primary border-primary" : "border-gray-300"
                        }`}>
                          {isSelected && <Check className="w-3 h-3 text-white" />}
                        </div>
                        <span className="text-sm font-medium">{itemName}</span>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {itemId}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Selected Count */}
          <div className="mt-4 p-2 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">
              {getSelectedCount()} {target}{getSelectedCount() !== "All" && localSelectedIds.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleConfirm}>
            Confirm Selection
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
