'use client';
import React, { useState, useEffect } from 'react';
import { Button } from 'components/ui/button';
import { Input } from 'components/ui/input';
import { Label } from 'components/ui/label';
import { Textarea } from 'components/ui/textarea';
import { Switch } from 'components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from 'components/ui/card';
import { X, Edit2, Save, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from 'components/ui/dialog';
import { useConfigKeys, useStoreConfigKeys, ConfigKeyInput } from 'hooks/react-query/useConfigKeys';

interface ConfigKeysPopupProps {
    isOpen: boolean;
    onClose: () => void;
}

const ConfigKeysPopup: React.FC<ConfigKeysPopupProps> = ({ isOpen, onClose }) => {
    const { data: configKeysData, isLoading } = useConfigKeys();
    const { mutate: storeConfigKeys, isPending } = useStoreConfigKeys();
    
    const [isEditing, setIsEditing] = useState(false);
    const [localKeys, setLocalKeys] = useState<ConfigKeyInput[]>([]);

    // Initialize with 2 specific keys
    const defaultKeys: ConfigKeyInput[] = [
        {
            keyName: 'google_map_key',
            keyValue: '',
            isPublic: false,
            description: 'Google Maps API Key'
        },
        {
            keyName: 'razorpay_key',
            keyValue: '',
            isPublic: false,
            description: 'Razorpay API Key'
        },
        {
            keyName: 'razorpay_key_secret',
            keyValue: '',
            isPublic: false,
            description: 'Razorpay API Secret'
        }
    ];

    useEffect(() => {
        if (configKeysData?.data && configKeysData.data.length > 0) {
            // Convert existing data to the format we need
            const formattedKeys = configKeysData.data.map(key => ({
                keyName: key.keyName,
                keyValue: key.keyValue,
                isPublic: key.isPublic,
                description: key.description
            }));
            setLocalKeys(formattedKeys);
        } else {
            // Use default keys if no data exists
            setLocalKeys(defaultKeys);
        }
    }, [configKeysData]);

    const handleEditAll = () => {
        setIsEditing(true);
    };

    const handleSaveAll = () => {
        // Validate keys
        const hasEmptyNames = localKeys.some(key => !key.keyName.trim());
        const hasEmptyValues = localKeys.some(key => !key.keyValue.trim());
        
        if (hasEmptyNames || hasEmptyValues) {
            toast.error('Please fill in all key names and values');
            return;
        }

        storeConfigKeys(
            { keys: localKeys },
            {
                onSuccess: () => {
                    toast.success('Config keys saved successfully', {
                        style: {
                            background: '#009F7F',
                            color: '#fff',
                        },
                    });
                    setIsEditing(false);
                    onClose();
                },
                onError: () => {
                    toast.error('Failed to save config keys', {
                        style: {
                            backgroundColor: "#FF0000",
                            color: "#fff",
                        },
                    });
                },
            }
        );
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        // Reset to original data if needed
        if (configKeysData?.data && configKeysData.data.length > 0) {
            const formattedKeys = configKeysData.data.map(key => ({
                keyName: key.keyName,
                keyValue: key.keyValue,
                isPublic: key.isPublic,
                description: key.description
            }));
            setLocalKeys(formattedKeys);
        } else {
            setLocalKeys(defaultKeys);
        }
    };

    const handleKeyChange = (index: number, field: keyof ConfigKeyInput, value: string | boolean) => {
        setLocalKeys(prev => prev.map((key, i) => 
            i === index ? { ...key, [field]: value } : key
        ));
    };

    const handleClose = () => {
        setIsEditing(false);
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <div className="flex items-center justify-between">
                        <DialogTitle className="text-2xl font-bold">API Keys Configuration</DialogTitle>
                        {!isEditing ? (
                            <Button
                                onClick={handleEditAll}
                                className="bg-blue-600 hover:bg-blue-700"
                            >
                                <Edit2 className="w-4 h-4 mr-2" />
                                Edit All
                            </Button>
                        ) : (
                            <div className="flex items-center space-x-2">
                                <Button
                                    onClick={handleSaveAll}
                                    className="bg-green-600 hover:bg-green-700"
                                    disabled={isPending}
                                >
                                    <Save className="w-4 h-4 mr-2" />
                                    {isPending ? 'Saving...' : 'Save All'}
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={handleCancelEdit}
                                >
                                    <XCircle className="w-4 h-4 mr-2" />
                                    Cancel
                                </Button>
                            </div>
                        )}
                    </div>
                </DialogHeader>
                
                <div className="space-y-6">
                    {isLoading ? (
                        <div className="flex justify-center items-center py-8">
                            <div className="text-gray-500">Loading config keys...</div>
                        </div>
                    ) : (
                        <>
                            {/* Google Map Key */}
                            <div className="border border-gray-200 rounded-lg p-4">
                                <h3 className="text-lg font-semibold text-gray-800 mb-3">Google Map Key</h3>
                                
                                {isEditing ? (
                                    <Input
                                        value={localKeys[0]?.keyValue || ''}
                                        onChange={(e) => handleKeyChange(0, 'keyValue', e.target.value)}
                                        placeholder="Enter Google Maps API Key"
                                        className="w-full"
                                    />
                                ) : (
                                    <div className="text-gray-600">
                                        <span className="font-medium">google_map_key:</span> 
                                        <span className="ml-2">{localKeys[0]?.keyValue || 'Not set'}</span>
                                    </div>
                                )}
                            </div>

                            {/* Payment Keys */}
                            <div className="border border-gray-200 rounded-lg p-4">
                                <h3 className="text-lg font-semibold text-gray-800 mb-3">Payment Key</h3>
                                
                                {isEditing ? (
                                    <div className="space-y-3">
                                        <Input
                                            value={localKeys[1]?.keyValue || ''}
                                            onChange={(e) => handleKeyChange(1, 'keyValue', e.target.value)}
                                            placeholder="Enter Razorpay API Key"
                                            className="w-full"
                                        />
                                        <Input
                                            value={localKeys[2]?.keyValue || ''}
                                            onChange={(e) => handleKeyChange(2, 'keyValue', e.target.value)}
                                            placeholder="Enter Razorpay API Secret"
                                            className="w-full"
                                        />
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        <div className="text-gray-600">
                                            <span className="font-medium">razorpay_key:</span> 
                                            <span className="ml-2">{localKeys[1]?.keyValue || 'Not set'}</span>
                                        </div>
                                        <div className="text-gray-600">
                                            <span className="font-medium">razorpay_key_secret:</span> 
                                            <span className="ml-2">{localKeys[2]?.keyValue || 'Not set'}</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={handleClose}>
                        <X className="w-4 h-4 mr-2" />
                        Close
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default ConfigKeysPopup;
