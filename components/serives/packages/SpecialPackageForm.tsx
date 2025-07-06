"use client"

import React, { useEffect, useState } from 'react';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from "components/ui/card";
import { toast } from 'sonner';
import { useSpecialPackageStore } from 'stores/-PermitChargesStore';
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogFooter
} from 'components/ui/alert-dialog'
import { Plus, Trash2 } from 'lucide-react';

interface SpecialPackageFormProps {
    id?: string;
}

interface PackageData {
    origin: string;
    destination: string;
    noOfPermits: number; // Update this line
    permitId?: string;
    adminId?: string; // Stored as string in form, converted to number on submit
}

export function SpecialPackageForm({ id }: { id?: string }) {
    const router = useRouter();
    const { createPackage, updatePackage, fetchPackageById, currentPackage, isLoading, error } = useSpecialPackageStore();
    const [isFormDirty, setIsFormDirty] = useState(false);
    const [showUnsavedChangesDialog, setShowUnsavedChangesDialog] = useState(false);
    const [pendingNavigation, setPendingNavigation] = useState<() => void>(() => { });

    const [formData, setFormData] = useState<PackageData[]>([
        { origin: '', destination: '', noOfPermits: 0 }
    ]);

    useEffect(() => {
        if (id) {
            const fetchData = async () => {
                try {
                    await fetchPackageById(id);
                    const data = useSpecialPackageStore.getState().currentPackage;
                    if (data) {
                        // Assuming currentPackage is an array of objects
                        setFormData([{
                            origin: data.origin,
                            destination: data.destination,
                            noOfPermits: data.noOfPermits || 0
                        }]);
                    }
                } catch (err) {
                    toast.error("Failed to fetch package details");
                }
            };
            fetchData();
        }
    }, [id]);

    useEffect(() => {
        const initialData = [{ origin: '', destination: '', noOfPermits: 0 }];
        setIsFormDirty(JSON.stringify(initialData) !== JSON.stringify(formData));
    }, [formData]);

    const handleInputChange = (index: number, field: keyof PackageData, value: string) => {
        setFormData(prev => {
            const newData = [...prev];
            newData[index] = { ...newData[index], [field]: value };
            return newData;
        });
    };

    const addPackage = () => {
        setFormData(prev => [...prev, { origin: '', destination: '', noOfPermits: 0 }]);
    };

    const removePackage = (index: number) => {
        setFormData(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const submitData: PackageData[] = formData.map(pkg => ({
            origin: pkg.origin,
            destination: pkg.destination,
            noOfPermits: pkg.noOfPermits || 0,
            permitId: '',
            adminId: ''
        }));

        try {
            if (id) {
                await updatePackage(id, submitData);
            } else {
                await createPackage(submitData);
            }
            const status = useSpecialPackageStore.getState().statusCode;
            const message = useSpecialPackageStore.getState().message;
            if (status === 200 || status === 201) {
                toast.success(message, {
                    style: {
                        backgroundColor: "#009F7F",
                        color: "#fff",
                    },
                });
                await new Promise(resolve => setTimeout(resolve, 2000));
                router.push(`/admin/special-packages`);
            } else {
                toast.error(message, {
                    style: {
                        backgroundColor: "#FF0000",
                        color: "#fff",
                    },
                });
            }
        } catch (err) {
            toast.error(error || "Failed to save booking", {
                style: {
                    backgroundColor: "#FF0000",
                    color: "#fff",
                },
            });
        }
    };

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

    const handleClose = () => {
        if (isFormDirty) {
            setShowUnsavedChangesDialog(true);
            setPendingNavigation(() => () => router.push('/admin/special-packages'));
        } else {
            router.push('/admin/special-packages');
        }
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
                        <div className="space-y-4 mt-4">
                            {formData.map((pkg, index) => (
                                <div key={index} className="grid grid-cols-4 gap-4 items-end">
                                    <div className="space-y-2">
                                        <Label htmlFor={`origin-${index}`}>Origin <span className="text-red-500">*</span></Label>
                                        <Input
                                            required
                                            id={`origin-${index}`}
                                            placeholder="Enter Origin"
                                            value={pkg.origin}
                                            onChange={(e) => handleInputChange(index, 'origin', e.target.value)}
                                            className="h-12"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor={`destination-${index}`}>Destination <span className="text-red-500">*</span></Label>
                                        <Input
                                            required
                                            id={`destination-${index}`}
                                            placeholder="Enter Destination"
                                            value={pkg.destination}
                                            onChange={(e) => handleInputChange(index, 'destination', e.target.value)}
                                            className="h-12"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor={`numberOfStates-${index}`}>Number of States <span className="text-red-500">*</span></Label>
                                        <Input
                                            required
                                            type="number"
                                            id={`numberOfStates-${index}`}
                                            placeholder="Enter Number of State Permits"
                                            value={pkg.noOfPermits}
                                            onChange={(e) => handleInputChange(index, 'noOfPermits', e.target.value)}
                                            className="h-12"
                                        />
                                    </div>
                                    {formData.length > 1 && (
                                        <Button
                                            type="button"
                                            variant="destructive"
                                            onClick={() => removePackage(index)}
                                            className="h-12 w-12"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>
                            ))}
                            {id ? null : (
                                <Button type="button" onClick={addPackage} className="mt-4 rounded-sm flex justify-center">
                                    <Plus className="h-4 w-4" />
                                </Button>
                            )}
                        </div>
                        <div className="flex justify-end">
                            <Button type="submit" disabled={isLoading} className="px-6 py-2">
                                {isLoading ? (id ? 'Updating...' : 'Creating...') : (id ? 'Update Packages' : 'Create Packages')}
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
                            <AlertDialogAction onClick={() => {
                                setIsFormDirty(false);
                                setShowUnsavedChangesDialog(false);
                                pendingNavigation();
                            }}>
                                Leave
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </Card>
        </div>
    );
}