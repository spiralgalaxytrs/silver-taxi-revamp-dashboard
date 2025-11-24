'use client';
import React, { useState, useEffect } from 'react';
import { Button } from 'components/ui/button';
import { Input } from 'components/ui/input';
import { toast } from 'sonner';
import { Edit2, Save, XCircle } from 'lucide-react';
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

// Map-based state instead of array
type KeysMap = Record<string, ConfigKeyInput>;

const ConfigKeysPopup: React.FC<ConfigKeysPopupProps> = ({ isOpen, onClose }) => {
    const { data: configKeysData, isLoading } = useConfigKeys();
    const { mutate: storeConfigKeys, isPending } = useStoreConfigKeys();

    const [isEditing, setIsEditing] = useState(false);
    const [localKeys, setLocalKeys] = useState<KeysMap>({});

    const defaultKeys: ConfigKeyInput[] = [
        {
            keyName: 'google_map_key',
            keyValue: '',
            isPublic: false,
            description: 'Google Maps API Key',
        },
        {
            keyName: 'razorpay_key',
            keyValue: '',
            isPublic: false,
            description: 'Razorpay API Key',
        },
        {
            keyName: 'razorpay_key_secret',
            keyValue: '',
            isPublic: false,
            description: 'Razorpay API Secret',
        },
    ];

    useEffect(() => {
        if (configKeysData?.data && configKeysData.data.length > 0) {
            const map: KeysMap = {};
            configKeysData.data.forEach((key) => {
                map[key.keyName] = {
                    keyName: key.keyName,
                    keyValue: key.keyValue,
                    isPublic: key.isPublic,
                    description: key.description || '',
                };
            });
            setLocalKeys(map);
        } else {
            const map: KeysMap = {};
            defaultKeys.forEach((key) => {
                map[key.keyName] = key;
            });
            setLocalKeys(map);
        }
    }, [configKeysData]);

    const handleSaveAll = () => {
        // Validate
        const values = Object.values(localKeys);
        const hasEmptyNames = values.some((k) => !k.keyName.trim());
        const hasEmptyValues = values.some((k) => !k.keyValue.trim());

        if (hasEmptyNames || hasEmptyValues) {
            toast.error('Please fill in all key names and values');
            return;
        }

        storeConfigKeys(
            { keys: values },
            {
                onSuccess: () => {
                    toast.success('Config keys saved successfully', {
                        style: { background: '#009F7F', color: '#fff' },
                    });
                    setIsEditing(false);
                    onClose();
                },
                onError: (error: any) => {
                    toast.error('Failed to save config keys', {
                        style: { backgroundColor: '#FF0000', color: '#fff' },
                    });
                },
            }
        );
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        if (configKeysData?.data && configKeysData.data.length > 0) {
            const map: KeysMap = {};
            configKeysData.data.forEach((key) => {
                map[key.keyName] = {
                    keyName: key.keyName,
                    keyValue: key.keyValue,
                    isPublic: key.isPublic,
                    description: key.description || '',
                };
            });
            setLocalKeys(map);
        } else {
            const map: KeysMap = {};
            defaultKeys.forEach((key) => {
                map[key.keyName] = key;
            });
            setLocalKeys(map);
        }
    };

    const handleChange = (name: string, value: string) => {
        setLocalKeys((prev) => ({
            ...prev,
            [name]: { ...prev[name], keyValue: value },
        }));
    };

    const handleClose = () => {
        setIsEditing(false);
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={() => {}}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto [&>button]:hidden">
                <DialogHeader>
                    <div className="flex items-center justify-between">
                        <DialogTitle className="text-2xl font-bold">
                            API Keys Configuration
                        </DialogTitle>
                        {!isEditing ? (
                            <Button
                                onClick={() => setIsEditing(true)}
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
                                <Button variant="outline" onClick={handleCancelEdit}>
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
                                <h3 className="text-lg font-semibold text-gray-800 mb-3">
                                    Google Map Key
                                </h3>
                                {isEditing ? (
                                    <Input
                                        value={localKeys['google_map_key']?.keyValue || ''}
                                        onChange={(e) =>
                                            handleChange('google_map_key', e.target.value)
                                        }
                                        placeholder="Enter Google Maps API Key"
                                        className="w-full"
                                    />
                                ) : (
                                    <div className="text-gray-600">
                                        {localKeys['google_map_key']?.keyValue || 'Not set'}
                                    </div>
                                )}
                            </div>

                            {/* Razorpay Keys */}
                            <div className="border border-gray-200 rounded-lg p-4">
                                <h3 className="text-lg font-semibold text-gray-800 mb-3">
                                    Payment Keys
                                </h3>
                                {isEditing ? (
                                    <div className="space-y-4">
                                        <Input
                                            value={localKeys['razorpay_key']?.keyValue || ''}
                                            onChange={(e) =>
                                                handleChange('razorpay_key', e.target.value)
                                            }
                                            placeholder="Enter Razorpay API Key"
                                            className="w-full"
                                        />
                                        <Input
                                            value={localKeys['razorpay_key_secret']?.keyValue || ''}
                                            onChange={(e) =>
                                                handleChange(
                                                    'razorpay_key_secret',
                                                    e.target.value
                                                )
                                            }
                                            placeholder="Enter Razorpay API Secret"
                                            className="w-full"
                                        />
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        <div>
                                            <span className="font-medium">Client Key:</span>
                                            <div className="text-gray-600 ml-2">
                                                {localKeys['razorpay_key']?.keyValue || 'Not set'}
                                            </div>
                                        </div>
                                        <div>
                                            <span className="font-medium">Secret Key:</span>
                                            <div className="text-gray-600 ml-2">
                                                {localKeys['razorpay_key_secret']?.keyValue ||
                                                    'Not set'}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={handleClose}>
                        Cancel
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default ConfigKeysPopup;
