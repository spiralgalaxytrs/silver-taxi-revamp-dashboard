"use client"

import React, { useEffect, useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from "components/ui/card";
import { toast } from 'sonner';
import { useVehicleStore } from "stores/vehicleStore";
import { useAllIncludesStore } from "stores/allIncludesStore";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogFooter
} from 'components/ui/alert-dialog'

interface AIPackagesFormProps {
  id?: string;
}

export function AIPackagesForm({ id }: AIPackagesFormProps) {
  const router = useRouter();
  const { createInclude, updateInclude, fetchIncludeById, currentInclude, isLoading, error } = useAllIncludesStore();
  const { vehicles, fetchVehicles } = useVehicleStore();
  const [isFormDirty, setIsFormDirty] = useState(false);
  const [showUnsavedChangesDialog, setShowUnsavedChangesDialog] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<() => void>(() => { });

  const [formData, setFormData] = useState({
    origin: '',
    destination: '',
    tollPrice: '',
    hillPrice: '',
    Km: '',
    vehicles: [] as Array<{
      type: string;
      price: number;
    }>
  });

  // Add console log to check available vehicles
  useEffect(() => {
    const loadVehicles = async () => {
      await fetchVehicles();
    };
    loadVehicles();
  }, []);

  useEffect(() => {
    if (id) {
      const fetchData = async () => {
        try {
          await fetchIncludeById(id);
          if (currentInclude) {
            setFormData({
              origin: currentInclude.origin,
              destination: currentInclude.destination,
              tollPrice: currentInclude.tollPrice?.toString() || '',
              hillPrice: currentInclude.hillPrice?.toString() || '',
              Km: currentInclude.Km.toString(),
              vehicles: currentInclude.vehicles.map(vehicle => ({
                type: vehicle.type,
                price: vehicle.price
              })),
            });
          }
        } catch (error) {
          toast.error("Failed to fetch package details");
        }
      };
      fetchData();
    }
  }, [id]);

  useEffect(() => {
    const initialData = {
      origin: '',
      destination: '',
      tollPrice: '',
      hillPrice: '',
      Km: '',
      vehicles: [] as Array<{
        type: string;
        price: number;
      }>
    };

    const currentData = formData;
    setIsFormDirty(JSON.stringify(initialData) !== JSON.stringify(formData));
  }, [formData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Update the vehicle price handler to use availableVehicles
  const handleVehiclePriceChange = (vehicleType: string, price: string) => {
    setFormData(prev => {

      const cleanedPrice = String(price).replace(/[^0-9.]/g, '');
      const existingIndex = prev.vehicles.findIndex(v => v.type === vehicleType);
      const newPrice = Number(cleanedPrice);

      if (existingIndex >= 0) {
        const updatedVehicles = [...prev.vehicles];
        updatedVehicles[existingIndex] = {
          ...updatedVehicles[existingIndex],
          price: newPrice
        };
        return { ...prev, vehicles: updatedVehicles };
      }

      return {
        ...prev,
        vehicles: [...prev.vehicles, {
          type: vehicleType,
          price: newPrice
        }]
      };
    });
  };

  type vehiclsAttributes = {
    type: string,
    price: number
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let vehicles: vehiclsAttributes[] = formData.vehicles.map((vehicle) => ({
      type: vehicle.type,
      price: vehicle.price
    }));
    const submitData = {
      origin: formData.origin,
      destination: formData.destination,
      tollPrice: parseFloat(formData.tollPrice),
      hillPrice: parseFloat(formData.hillPrice),
      Km: parseFloat(formData.Km),
      vehicles: vehicles
    };


    try {
      if (id) {
        await updateInclude(id, submitData);
        const status = useAllIncludesStore.getState().statusCode; // Get the latest status code
        const message = useAllIncludesStore.getState().message;

        if (status === 200 || status === 201) {
          toast.success("Package updated successfully", {
            style: {
              backgroundColor: "#009F7F",
              color: "#fff",
            },
          });
        } else {
          toast.error(message || "An unknown error occurred.", {
            style: {
              backgroundColor: "#FF0000",
              color: "#fff",
            },
          });
        }

        setTimeout(() => router.push('/admin/all-including-packages'), 2000);
      } else {
        await createInclude(submitData);
        const status = useAllIncludesStore.getState().statusCode; // Get the latest status code
        const message = useAllIncludesStore.getState().message;

        if (status === 200 || status === 201) {
          toast.success("Package created successfully", {
            style: {
              backgroundColor: "#009F7F",
              color: "#fff",
            },
          });
        } else {
          toast.error(message || "An unknown error occurred.", {
            style: {
              backgroundColor: "#FF0000",
              color: "#fff",
            },
          });
        }
        setTimeout(() => router.push('/admin/all-including-packages'), 2000);
      }
    } catch (err) {
      toast.error(error || "Failed to save package");
    }
  };

  // Add beforeunload handler
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isFormDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isFormDirty]);

  // Modify handleClose function
  const handleClose = () => {
    if (isFormDirty) {
      setShowUnsavedChangesDialog(true);
      setPendingNavigation(() => () => router.push('/admin/all-including-packages'));
    } else {
      router.push('/admin/all-including-packages');
    }
  };

  // Add navigation confirmation handler
  const handleConfirmNavigation = () => {
    setIsFormDirty(false);
    setShowUnsavedChangesDialog(false);
    pendingNavigation();
  };

  return (
    <div>
      <Card className="rounded-none">
        <div className="flex justify-between items-center p-6 pb-6 pt-2">
          <h2 className="text-3xl font-bold tracking-tight">
            {id ? 'Edit Packages' : 'Create New Packages'}
          </h2>
          <Button onClick={handleClose} variant="outline">
            Close
          </Button>
        </div>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Package details section */}
            <div className="space-y-4 mt-4 ">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="origin">Origin <span className='text-red-500'>*</span></Label>
                  <Input
                    required
                    id="origin"
                    name="origin"
                    placeholder="Enter Origin"
                    value={formData.origin}
                    onChange={handleInputChange}
                    className="h-12"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="destination">Destination <span className='text-red-500'>*</span></Label>
                  <Input
                    required
                    id="destination"
                    name="destination"
                    placeholder="Enter Destination"
                    value={formData.destination}
                    onChange={handleInputChange}
                    className="h-12"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tollPrice">Toll Price</Label>
                  <Input
                    type="number"
                    id="tollPrice"
                    name="tollPrice"
                    placeholder="Enter Toll Price"
                    value={formData.tollPrice}
                    onChange={handleInputChange}
                    className="h-12"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="hillPrice">Hill Price </Label>
                  <Input
                    type="number"
                    id="hillPrice"
                    name="hillPrice"
                    placeholder="Enter Hill Price"
                    value={formData.hillPrice}
                    onChange={handleInputChange}
                    className="h-12"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="Km">Distance (Km) <span className='text-red-500'>*</span></Label>
                  <Input
                    required
                    type="number"
                    id="Km"
                    name="Km"
                    placeholder="Enter Distance in Kilometers"
                    value={formData.Km}
                    onChange={handleInputChange}
                    className="h-12"
                  />
                </div>
              </div>
            </div>

            {/* Vehicle Charges section */}
            <div className="space-y-4">
              <h2 className="text-3xl font-bold tracking-tight">
                Vehicle Permit Charges
              </h2>
              <div className="grid grid-cols-2 gap-4">
                {Array.from(new Set((vehicles || [])
                  .filter(vehicle => vehicle.isActive)
                  .map(vehicle => vehicle.type))) // Get unique vehicle types
                  .map(vehicleType => (
                    <div key={vehicleType} className="space-y-2">
                      <Label>{vehicleType} Charge <span className='text-red-500'>*</span></Label>
                      <Input
                        required
                        type="text"
                        value={formData.vehicles.find(v => v.type === vehicleType)?.price || 0}
                        onChange={(e) => handleVehiclePriceChange(vehicleType, e.target.value)}
                        className="h-12"
                        placeholder={`Enter ${vehicleType} price`}
                      />
                    </div>
                  ))}
              </div>
            </div>

            {/* Submit button */}
            <div className="flex justify-end">
              <Button type="submit" disabled={isLoading} className="px-6 py-2">
                {isLoading ? (id ? 'Updating...' : 'Creating...') : (id ? 'Update Package' : 'Create Package')}
              </Button>
            </div>
          </form>
        </CardContent>
        <AlertDialog open={showUnsavedChangesDialog} onOpenChange={setShowUnsavedChangesDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Unsaved Changes</AlertDialogTitle>
              <AlertDialogDescription>
                You have unsaved changes. Are you sure you want to leave this page?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Stay</AlertDialogCancel>
              <AlertDialogAction onClick={handleConfirmNavigation}>
                Leave
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </Card>
    </div>
  );
}