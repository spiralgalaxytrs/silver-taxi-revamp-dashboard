'use client'
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from 'components/ui/card';
import { Input } from 'components/ui/input';
import { Label } from 'components/ui/label';
import { Button } from 'components/ui/button';
import { Upload, X, Plus } from 'lucide-react';
import { useProfileStore } from 'stores/-profileStore';
import { toast } from 'sonner';
import { Textarea } from '../ui/textarea';
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

type ProfileFormProps = {
    id?: string; // Optional ID for update operation
    createdBy: "Admin" | "Vendor";
};

type FormData = {
    logo: File | string | undefined;
    name: string;
    email: string;
    phone: string[];
    address: string;
    GSTNumber: string;
    UPI: { id: string; number: string };
    whatsappNumber: string[];
    website: string;
    description: string;
    driverWalletAmount: number;
    vendorWalletAmount: number;
    socialLinks: { facebook: string; twitter: string; x: string; instagram: string; youtube: string };
}


const ProfileForm = ({ id, createdBy }: ProfileFormProps) => {
    const router = useRouter();
    const { profile, fetchProfileById, createProfile, updateProfile, isLoading, message } = useProfileStore();

    const [logoURL, setLogoURL] = useState<string | null>(null);
    const [formData, setFormData] = useState<FormData>({
        logo: undefined,
        name: '',
        email: '',
        phone: [''],
        address: '',
        GSTNumber: '',
        UPI: { id: '', number: '' },
        whatsappNumber: [''],
        website: '',
        description: '',
        driverWalletAmount: 0,
        vendorWalletAmount: 0,
        socialLinks: { facebook: '', twitter: '', x: '', instagram: '', youtube: '' },
    });

    const [phoneNumber, setPhoneNumber] = useState({
        phone1: '',
        phone2: '',
    });
    const [whatsappNumber, setWhatsappNumber] = useState({
        whatsapp1: '',
        whatsapp2: '',
    });

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        setLogoURL(file ? URL.createObjectURL(file) : null);
        setFormData(prevData => ({ ...prevData, logo: file ?? undefined }));
    };


    const [isFormDirty, setIsFormDirty] = useState(false);
    const [showUnsavedChangesDialog, setShowUnsavedChangesDialog] = useState(false);
    const [pendingNavigation, setPendingNavigation] = useState<() => void>(() => { });

    useEffect(() => {
        if (id) {
            fetchProfileById(id);
        }
    }, [id, fetchProfileById]);

    useEffect(() => {
        if (profile) {
            setLogoURL(profile.logo as string);
            setFormData({
                logo: profile.logo || undefined,
                name: profile.name || '',
                email: profile.email || '',
                phone: profile.phone || [],
                address: profile.address || '',
                GSTNumber: profile.GSTNumber || '',
                UPI: profile.UPI || { id: '', number: '' },
                whatsappNumber: profile.whatsappNumber || [],
                website: profile.website || '',
                description: profile.description || '',
                driverWalletAmount: profile.driverWalletAmount || 0,
                vendorWalletAmount: profile.vendorWalletAmount || 0,
                socialLinks: profile.socialLinks || { facebook: '', twitter: '', X: '', instagram: '', youtube: '' },
            });
            setPhoneNumber({
                phone1: profile.phone?.[0] || '',
                phone2: profile.phone?.[1] || '',
            });
            setWhatsappNumber({
                whatsapp1: profile.whatsappNumber?.[0] || '',
                whatsapp2: profile.whatsappNumber?.[1] || '',
            });
        }
    }, [profile]);

    useEffect(() => {
        const initialData = {
            logo: undefined,
            name: '',
            email: '',
            phone: [''],
            address: '',
            GSTNumber: '',
            UPI: { id: '', number: '' },
            whatsappNumber: [''],
            website: '',
            description: '',
            driverWalletAmount: 0,
            vendorWalletAmount: 0,
            socialLinks: { facebook: '', X: '', instagram: '', youtube: '' },
        };
        setIsFormDirty(JSON.stringify(initialData) !== JSON.stringify(formData));
    }, [formData]);

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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const updatedFormData = {
            ...formData,
            logo: formData.logo,
            createdBy: createdBy,
            phone: [phoneNumber.phone1, phoneNumber.phone2],
            whatsappNumber: [whatsappNumber.whatsapp1, whatsappNumber.whatsapp2],
        };

        try {
            if (id) {
                await updateProfile(id, updatedFormData); // Update profile if ID exists
                const { statusCode, message } = useProfileStore.getState()
                if (statusCode === 200 || statusCode === 201) {
                    toast.success('Profile updated successfully', {
                        style: {
                            background: '#009F7F',
                            color: '#fff',
                        },
                    });
                    setTimeout(() => {
                        router.push(`/${createdBy.toLowerCase()}/profiles`);
                    }, 1000);
                    return
                }
                toast.error(message, {
                    style: {
                        background: '#db182f',
                        color: '#fff',
                    },
                })
            } else {
                await createProfile(updatedFormData);
                const { statusCode, message } = useProfileStore.getState();
                if (statusCode === 200 || statusCode === 201) {
                    toast.success('Profile created successfully', {
                        style: {
                            background: '#009F7F',
                            color: '#fff',
                        },
                    });
                    setTimeout(() => {
                        router.push(`/${createdBy.toLowerCase()}/profiles`);
                    }, 1000);
                    return
                }
            }
            toast.error(message, {
                style: {
                    background: '#d42433',
                    color: '#fff',
                },
            })
        } catch (error) {
            toast.error(message, {
                style: {
                    background: '#FF0000',
                    color: '#fff',
                },
            });
        }
    };


    const handleInputChange = (field: string, value: any) => {

        let formattedValue = value;
        if (field === 'driverWalletAmount' || field === 'vendorWalletAmount') {
            formattedValue = value.replace(/\D/g, "");
        }
        setFormData((prev) => ({
            ...prev,
            [field]: formattedValue
        }));
    };

    const handlePhoneNumberChange = (field: keyof typeof phoneNumber, value: string) => {
        let formattedValue = value.replace(/\D/g, "");
        if (!/^([6-9])\d{0,9}$/.test(formattedValue) && formattedValue !== '') {
            return;
        }
        setPhoneNumber((prev) => ({ ...prev, [field]: formattedValue }));
    };

    const handleWhatsappNumberChange = (field: keyof typeof whatsappNumber, value: string) => {
        let formattedValue = value.replace(/\D/g, "");
        if (!/^([6-9])\d{0,9}$/.test(formattedValue) && formattedValue !== '') {
            return;
        }
        setWhatsappNumber((prev) => ({ ...prev, [field]: formattedValue }));
    };

    const handleClose = () => {
        if (isFormDirty) {
            setShowUnsavedChangesDialog(true);
            setPendingNavigation(() => () => router.push(`/${createdBy.toLowerCase()}/profiles`));
        } else {
            router.push(`/${createdBy.toLowerCase()}/profiles`);
        }
    };

    const handleConfirmNavigation = () => {
        setIsFormDirty(false);
        setShowUnsavedChangesDialog(false);
        pendingNavigation();
    };

    return (<>
        <Card className="bg-white rounded-none border-none p-3">
            <div className="flex justify-between items-center p-6 pt-2 pb-6">
                <h2 className="text-3xl font-bold tracking-tight">
                    {id ? 'Edit Profile' : 'Create Profile'}
                </h2>
                <Button onClick={handleClose} variant="outline">
                    Close
                </Button>
            </div>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="flex py-2 gap-4">
                        <div className="w-1/3">
                            <h2 className="text-black text-lg font-bold">Profile</h2>
                            <p className="text-gray-500">Create or update the profile</p>
                        </div>
                        <div className="w-2/3 border border-gray-400 rounded p-5">
                            {/* Logo Upload */}
                            <div className="border bg-white px-8 rounded my-5 p-4 border-dashed border-border-base pb-5 md:pb-7 onhover">
                                <Label htmlFor="logo">Logo</Label>
                                <div className="mt-1" />
                                <div className="flex flex-col items-center justify-center border border-dashed border-gray-400 rounded-lg p-6 hover:border-gray-600 transition cursor-pointer">
                                    <Label htmlFor="logo" className="flex flex-col items-center cursor-pointer">
                                        {!logoURL && <>
                                            <Upload className="text-gray-600 text-4xl mb-2" />
                                            <p className="text-gray-600 text-sm mb-2">Click to upload or drag and drop</p>
                                            <span className="text-xs text-gray-400">Only image files (JPG, PNG, etc.)</span>
                                            <input
                                                id="logo"
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                onChange={handleLogoChange}
                                            />
                                        </>}
                                        {logoURL && (
                                            <>
                                                <img
                                                    src={
                                                        formData.logo instanceof File
                                                            ? URL.createObjectURL(formData.logo)
                                                            : formData.logo as string
                                                    }
                                                    alt="Logo Preview"
                                                    className="w-full h-32 object-cover rounded"
                                                />
                                                <div className='flex flex-col items-center'>
                                                    <p className="text-gray-400 mt-2 text-center text-base">
                                                        {formData.logo instanceof File ? formData.logo.name : formData.logo}
                                                    </p>
                                                    <span className='cursor-pointer text-black text-base border border-black rounded bg-[#EFEFEF] p-1'>change image</span>
                                                    <input
                                                        id="logo"
                                                        type="file"
                                                        accept="image/*"
                                                        className="hidden"
                                                        onChange={handleLogoChange}
                                                    />
                                                </div>
                                            </>
                                        )}
                                    </Label>
                                </div>
                            </div>

                            {/* Company Name */}
                            <div className="pt-2">
                                <Label htmlFor="name">Company Name</Label>
                                <Input
                                    id="name"
                                    placeholder="Enter company name"
                                    className="w-full border-grey py-7 mt-1"
                                    value={formData.name}
                                    onChange={(e) => handleInputChange('name', e.target.value)}
                                />
                            </div>

                            {/* Phone Numbers */}
                            <div className="pt-2">
                                <Label htmlFor="phone">Phone Numbers</Label>
                                <div className="flex items-center space-x-2 mt-2">
                                    <Input
                                        id={`phone1`}
                                        placeholder="Enter primary phone number"
                                        className="w-full border-grey py-7"
                                        value={phoneNumber.phone1}
                                        onChange={(e) => handlePhoneNumberChange('phone1', e.target.value)}
                                    />
                                    <Input
                                        id={`phone2`}
                                        placeholder="Enter secondary phone number"
                                        className="w-full border-grey py-7"
                                        value={phoneNumber.phone2}
                                        onChange={(e) => handlePhoneNumberChange('phone2', e.target.value)}
                                    />
                                </div>
                            </div>

                            {/* Email */}
                            <div className="pt-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    placeholder="Enter email"
                                    className="w-full border-grey py-7 mt-1"
                                    value={formData.email}
                                    onChange={(e) => handleInputChange('email', e.target.value)}
                                />
                            </div>

                            {/* Address */}
                            <div className="pt-2">
                                <Label htmlFor="address">Address</Label>

                                <Textarea
                                    rows={3}
                                    id="address"
                                    placeholder="Enter address"
                                    className="w-full border-grey py-5 mt-1"
                                    value={formData.address}
                                    onChange={(e) => handleInputChange('address', e.target.value)}
                                />
                            </div>

                            {/* GST Number */}
                            <div className="pt-2">
                                <Label htmlFor="GST">GST Number</Label>
                                <Input
                                    id="GST"
                                    placeholder="Enter GST number"
                                    className="w-full border-grey py-7 mt-1"
                                    value={formData.GSTNumber}
                                    onChange={(e) => handleInputChange('GSTNumber', e.target.value)}
                                />
                            </div>

                            {/* UPI Details */}
                            <div className="pt-2">
                                <Label htmlFor="UPI">UPI Details</Label>
                                <div className="flex space-x-2">
                                    <Input
                                        id="UPI-id"
                                        placeholder="UPI ID"
                                        className="w-1/2 border-grey py-7 mt-1"
                                        value={formData.UPI?.id || ''}
                                        onChange={(e) => handleInputChange('UPI', { ...formData.UPI, id: e.target.value })}
                                    />
                                    <Input
                                        id="UPI-name"
                                        placeholder="UPI Number"
                                        className="w-1/2 border-grey py-7 mt-1"
                                        value={formData.UPI?.number || ''}
                                        onChange={(e) => handleInputChange('UPI', { ...formData.UPI, number: e.target.value })}
                                    />
                                </div>
                            </div>

                            {/* WhatsApp Numbers */}
                            <div className="pt-2">
                                <Label htmlFor="whatsappNumber">WhatsApp Numbers</Label>

                                <div className="flex items-center space-x-2 mt-2">
                                    <Input
                                        id={`whatsapp-1`}
                                        placeholder="Enter primary WhatsApp number"
                                        className="w-full border-grey py-7"
                                        value={whatsappNumber.whatsapp1}
                                        onChange={(e) => handleWhatsappNumberChange('whatsapp1', e.target.value)}
                                    />
                                    <Input
                                        id={`whatsapp-2`}
                                        placeholder="Enter secondary WhatsApp number"
                                        className="w-full border-grey py-7"
                                        value={whatsappNumber.whatsapp2}
                                        onChange={(e) => handleWhatsappNumberChange('whatsapp2', e.target.value)}
                                    />
                                </div>
                            </div>

                            {/* Website */}
                            <div className="pt-2">
                                <Label htmlFor="website">Website</Label>
                                <Input
                                    id="website"
                                    placeholder="Enter website URL"
                                    className="w-full border-grey py-7 mt-1"
                                    value={formData.website}
                                    onChange={(e) => handleInputChange('website', e.target.value)}
                                />
                            </div>

                            {/* Driver Wallet Amount */}
                            {createdBy === "Admin" && (
                                <>
                                    <div className="pt-2">
                                        <Label htmlFor="driverWalletAmount">Driver Minimum Wallet Amount</Label>
                                        <Input
                                            id="driverWalletAmount"
                                            placeholder="Enter driver minimum wallet amount"
                                            className="w-full border-grey py-7 mt-1"
                                            value={formData.driverWalletAmount}
                                            onChange={(e) => handleInputChange('driverWalletAmount', e.target.value)}
                                        />
                                    </div>
                                    <div className="pt-2">
                                        <Label htmlFor="vendorWalletAmount">Vendor Minimum Wallet Amount</Label>
                                        <Input
                                            id="vendorWalletAmount"
                                            placeholder="Enter vendor minimum wallet amount"
                                            className="w-full border-grey py-7 mt-1"
                                            value={formData.vendorWalletAmount}
                                            onChange={(e) => handleInputChange('vendorWalletAmount', e.target.value)}
                                        />
                                    </div>
                                </>
                            )}

                            {/* Social Links */}
                            <div className="pt-2">
                                <Label htmlFor="socialLinks">Social Links</Label>
                                <div className="space-y-2">
                                    <Input
                                        id="facebook"
                                        placeholder="Facebook URL"
                                        className="w-full border-grey py-7 mt-1"
                                        value={formData.socialLinks?.facebook || ''}
                                        onChange={(e) => handleInputChange('socialLinks', { ...formData.socialLinks, facebook: e.target.value })}
                                    />
                                    {/* <Input
                                        id="twitter"
                                        placeholder="Twitter URL"
                                        className="w-full border-grey py-7 mt-1"
                                        value={formData.socialLinks?.twitter || ''}
                                        onChange={(e) => handleInputChange('socialLinks', { ...formData.socialLinks, twitter: e.target.value })}
                                    /> */}
                                    <Input
                                        id="x"
                                        placeholder="X URL"
                                        className="w-full border-grey py-7 mt-1"
                                        value={formData.socialLinks?.x || ''}
                                        onChange={(e) => handleInputChange('socialLinks', { ...formData.socialLinks, x: e.target.value })}
                                    />
                                    <Input
                                        id="instagram"
                                        placeholder="Instagram URL"
                                        className="w-full border-grey py-7 mt-1"
                                        value={formData.socialLinks?.instagram || ''}
                                        onChange={(e) => handleInputChange('socialLinks', { ...formData.socialLinks, instagram: e.target.value })}
                                    />
                                    <Input
                                        id="youtube"
                                        placeholder="Youtube URL"
                                        className="w-full border-grey py-7 mt-1"
                                        value={formData.socialLinks?.youtube || ''}
                                        onChange={(e) => handleInputChange('socialLinks', { ...formData.socialLinks, youtube: e.target.value })}
                                    />
                                </div>
                            </div>

                            {/* Submit Button */}
                            <div className="flex justify-end pt-4">
                                <Button type="submit" className="px-4 py-2" disabled={isLoading}>
                                    {isLoading ? 'Saving...' : id ? 'Update Profile' : 'Create Profile'}
                                </Button>
                            </div>
                        </div>
                    </div>
                </form>
            </CardContent>
        </Card>

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
    </>);
};


export default ProfileForm



// 'use client';
// import React, { useEffect, useState } from 'react';
// import { useRouter } from 'next/navigation';
// import { Card, CardContent } from 'components/ui/card';
// import { Input } from 'components/ui/input';
// import { Label } from 'components/ui/label';
// import { Button } from 'components/ui/button';
// import { Upload, X } from 'lucide-react';
// import { useProfileStore } from 'stores/-profileStore';
// import { toast } from 'sonner';
// import { Textarea } from '../ui/textarea';
// import {
//     AlertDialog,
//     AlertDialogContent,
//     AlertDialogHeader,
//     AlertDialogTitle,
//     AlertDialogDescription,
//     AlertDialogAction,
//     AlertDialogCancel,
//     AlertDialogFooter
// } from 'components/ui/alert-dialog';

// type ProfileFormProps = {
//     id?: string;
//     createdBy: 'Admin' | 'Vendor';
// };

// type FormData = {
//     logo: File | string | undefined;
//     name: string;
//     email: string;
//     phone: string[];
//     address: string;
//     GSTNumber: string;
//     UPI: { id: string; number: string };
//     whatsappNumber: string[];
//     website: string;
//     description: string;
//     driverWalletAmount: number;
//     vendorWalletAmount: number;
//     socialLinks: { facebook: string; twitter: string; x: string; instagram: string; youtube: string };
//     // customer: { senderAmount: number; receiverAmount: number };
//     // vendor: { senderAmount: number; receiverAmount: number };
//     // driver: { senderAmount: number; receiverAmount: number };
// };

// const ProfileForm = ({ id, createdBy }: ProfileFormProps) => {
//     const router = useRouter();
//     const { profile, fetchProfileById, createProfile, updateProfile, isLoading, message } = useProfileStore();

//     const [logoURL, setLogoURL] = useState<string | null>(null);
//     const [formData, setFormData] = useState<FormData>({
//         logo: undefined,
//         name: '',
//         email: '',
//         phone: [''],
//         address: '',
//         GSTNumber: '',
//         UPI: { id: '', number: '' },
//         whatsappNumber: [''],
//         website: '',
//         description: '',
//         driverWalletAmount: 0,
//         vendorWalletAmount: 0,
//         socialLinks: { facebook: '', twitter: '', x: '', instagram: '', youtube: '' },
//         // customer: { senderAmount: 0, receiverAmount: 0 },
//         // vendor: { senderAmount: 0, receiverAmount: 0 },
//         // driver: { senderAmount: 0, receiverAmount: 0 },
//     });

//     const [phoneNumber, setPhoneNumber] = useState({
//         phone1: '',
//         phone2: '',
//     });
//     const [whatsappNumber, setWhatsappNumber] = useState({
//         whatsapp1: '',
//         whatsapp2: '',
//     });

//     const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//         const file = e.target.files?.[0];
//         if (file) {
//             if (file.size > 5 * 1024 * 1024) {
//                 toast.error('Image size exceeds 5MB limit');
//                 return;
//             }
//             if (!file.type.startsWith('image/')) {
//                 toast.error('Only image files are allowed');
//                 return;
//             }
//             setLogoURL(URL.createObjectURL(file));
//             setFormData(prevData => ({ ...prevData, logo: file }));
//         } else {
//             setLogoURL(null);
//             setFormData(prevData => ({ ...prevData, logo: undefined }));
//         }
//     };

//     const [isFormDirty, setIsFormDirty] = useState(false);
//     const [showUnsavedChangesDialog, setShowUnsavedChangesDialog] = useState(false);
//     const [pendingNavigation, setPendingNavigation] = useState<() => void>(() => {});

//     useEffect(() => {
//         if (id) {
//             fetchProfileById(id);
//         }
//     }, [id, fetchProfileById]);

//     useEffect(() => {
//         if (profile) {
//             setLogoURL(profile.logo as string);
//             setFormData({
//                 logo: profile.logo || undefined,
//                 name: profile.name || '',
//                 email: profile.email || '',
//                 phone: profile.phone || [''],
//                 address: profile.address || '',
//                 GSTNumber: profile.GSTNumber || '',
//                 UPI: profile.UPI || { id: '', number: '' },
//                 whatsappNumber: profile.whatsappNumber || [''],
//                 website: profile.website || '',
//                 description: profile.description || '',
//                 driverWalletAmount: profile.driverWalletAmount || 0,
//                 vendorWalletAmount: profile.vendorWalletAmount || 0,
//                 socialLinks: profile.socialLinks || { facebook: '', twitter: '', x: '', instagram: '', youtube: '' },
//                 // customer: profile.customer || { senderAmount: 0, receiverAmount: 0 },
//                 // vendor: profile.vendor || { senderAmount: 0, receiverAmount: 0 },
//                 // driver: profile.driver || { senderAmount: 0, receiverAmount: 0 },
//             });
//             setPhoneNumber({
//                 phone1: profile.phone?.[0] || '',
//                 phone2: profile.phone?.[1] || '',
//             });
//             setWhatsappNumber({
//                 whatsapp1: profile.whatsappNumber?.[0] || '',
//                 whatsapp2: profile.whatsappNumber?.[1] || '',
//             });
//         }
//     }, [profile]);

    
//     const handleConfirmNavigation = () => {
//         setIsFormDirty(false);
//         setShowUnsavedChangesDialog(false);
//         pendingNavigation();
//     };

//     useEffect(() => {
//         const initialData = {
//             logo: undefined,
//             name: '',
//             email: '',
//             phone: [''],
//             address: '',
//             GSTNumber: '',
//             UPI: { id: '', number: '' },
//             whatsappNumber: [''],
//             website: '',
//             description: '',
//             driverWalletAmount: 0,
//             vendorWalletAmount: 0,
//             socialLinks: { facebook: '', twitter: '', x: '', instagram: '', youtube: '' },
//             // customer: { senderAmount: 0, receiverAmount: 0 },
//             // vendor: { senderAmount: 0, receiverAmount: 0 },
//             // driver: { senderAmount: 0, receiverAmount: 0 },
//         };
//         setIsFormDirty(JSON.stringify(initialData) !== JSON.stringify(formData));
//     }, [formData]);

//     useEffect(() => {
//         const handleBeforeUnload = (e: BeforeUnloadEvent) => {
//             if (isFormDirty) {
//                 e.preventDefault();
//                 e.returnValue = '';
//             }
//         };
//         window.addEventListener('beforeunload', handleBeforeUnload);
//         return () => window.removeEventListener('beforeunload', handleBeforeUnload);
//     }, [isFormDirty]);

//     const handleSubmit = async (e: React.FormEvent) => {
//         e.preventDefault();

//         // Basic validation
//         if (!formData.name || !formData.email) {
//             toast.error('Please fill all required fields (Company Name, Email)');
//             return;
//         }

//         const updatedFormData = {
//             ...formData,
//             logo: formData.logo,
//             createdBy: createdBy,
//             phone: [phoneNumber.phone1, phoneNumber.phone2].filter(num => num),
//             whatsappNumber: [whatsappNumber.whatsapp1, whatsappNumber.whatsapp2].filter(num => num),
//         };

//         try {
//             if (id) {
//                 await updateProfile(id, updatedFormData);
//             } else {
//                 await createProfile(updatedFormData);
//             }
//             const { statusCode, message } = useProfileStore.getState();
//             if (statusCode === 200 || statusCode === 201) {
//                 toast.success(id ? 'Profile updated successfully' : 'Profile created successfully', {
//                     style: {
//                         background: '#009F7F',
//                         color: '#fff',
//                     },
//                 });
//                 setTimeout(() => {
//                     router.push(`/${createdBy.toLowerCase()}/profiles`);
//                 }, 1000);
//             } else {
//                 toast.error(message || 'Failed to save profile', {
//                     style: {
//                         background: '#db182f',
//                         color: '#fff',
//                     },
//                 });
//             }
//         } catch (error: any) {
//             toast.error(error.message || 'An unexpected error occurred', {
//                 style: {
//                     background: '#FF0000',
//                     color: '#fff',
//                 },
//             });
//         }
//     };

//     const handleInputChange = (field: string, value: any) => {
//         let formattedValue = value;
//         if (['driverWalletAmount', 'vendorWalletAmount', 'customer?.senderAmount', 'customer?.receiverAmount', 'vendor?.senderAmount', 'vendor?.receiverAmount', 'driver?.senderAmount', 'driver?.receiverAmount'].includes(field)) {
//             formattedValue = value.replace(/\D/g, '') || '0';
//         }
//         if (field.includes('.')) {
//             const [parent, child] = field.split('.');
//             setFormData(prev => ({
//                 ...prev,
//                 [parent]: { ...prev[parent as keyof FormData], [child]: Number(formattedValue) },
//             }));
//         } else {
//             setFormData(prev => ({
//                 ...prev,
//                 [field]: formattedValue,
//             }));
//         }
//     };

//     const handlePhoneNumberChange = (field: keyof typeof phoneNumber, value: string) => {
//         let formattedValue = value.replace(/\D/g, '');
//         if (!/^([6-9])\d{0,9}$/.test(formattedValue) && formattedValue !== '') {
//             return;
//         }
//         setPhoneNumber(prev => ({ ...prev, [field]: formattedValue }));
//     };

//     const handleWhatsappNumberChange = (field: keyof typeof whatsappNumber, value: string) => {
//         let formattedValue = value.replace(/\D/g, '');
//         if (!/^([6-9])\d{0,9}$/.test(formattedValue) && formattedValue !== '') {
//             return;
//         }
//         setWhatsappNumber(prev => ({ ...prev, [field]: formattedValue }));
//     };

//     const handleClose = () => {
//         if (isFormDirty) {
//             setShowUnsavedChangesDialog(true);
//             setPendingNavigation(() => () => router.push(`/${createdBy.toLowerCase()}/profiles`));
//         } else {
//             router.push(`/${createdBy.toLowerCase()}/profiles`);
//         }
//     };

//     return (
//         <Card className="bg-white rounded-none border-none p-3">
//             <div className="flex justify-between items-center p-6 pt-2 pb-6">
//                 <h2 className="text-3xl font-bold tracking-tight">
//                     {id ? 'Edit Profile' : 'Create Profile'}
//                 </h2>
//                 <Button onClick={handleClose} variant="outline">
//                     Close
//                 </Button>
//             </div>
//             <CardContent>
//                 <form onSubmit={handleSubmit} className="space-y-6">
//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                         {/* Left Column */}
//                         <div className="space-y-6">
//                             {/* Logo Upload */}
//                             <div className="border bg-white px-8 rounded p-4 border-dashed border-border-base">
//                                 <Label htmlFor="logo">Logo</Label>
//                                 <div className="mt-1" />
//                                 <div className="flex flex-col items-center justify-center border border-dashed border-gray-400 rounded-lg p-6 hover:border-gray-600 transition cursor-pointer">
//                                     <Label htmlFor="logo" className="flex flex-col items-center cursor-pointer">
//                                         {!logoURL && (
//                                             <>
//                                                 <Upload className="text-gray-600 text-4xl mb-2" />
//                                                 <p className="text-gray-600 text-sm mb-2">Click to upload or drag and drop</p>
//                                                 <span className="text-xs text-gray-400">Only image files (JPG, PNG, etc.)</span>
//                                                 <input
//                                                     id="logo"
//                                                     type="file"
//                                                     accept="image/*"
//                                                     className="hidden"
//                                                     onChange={handleLogoChange}
//                                                 />
//                                             </>
//                                         )}
//                                         {logoURL && (
//                                             <>
//                                                 <img
//                                                     src={formData.logo instanceof File ? URL.createObjectURL(formData.logo) : formData.logo as string}
//                                                     alt="Logo Preview"
//                                                     className="w-full h-32 object-cover rounded"
//                                                 />
//                                                 <div className="flex flex-col items-center">
//                                                     <p className="text-gray-400 mt-2 text-center text-base">
//                                                         {formData.logo instanceof File ? formData.logo.name : formData.logo}
//                                                     </p>
//                                                     <span className="cursor-pointer text-black text-base border border-black rounded bg-[#EFEFEF] p-1">Change image</span>
//                                                     <input
//                                                         id="logo"
//                                                         type="file"
//                                                         accept="image/*"
//                                                         className="hidden"
//                                                         onChange={handleLogoChange}
//                                                     />
//                                                 </div>
//                                             </>
//                                         )}
//                                     </Label>
//                                 </div>
//                             </div>

//                             {/* Company Name */}
//                             <div>
//                                 <Label htmlFor="name">Company Name</Label>
//                                 <Input
//                                     id="name"
//                                     placeholder="Enter company name"
//                                     className="w-full border-grey py-7 mt-1"
//                                     value={formData.name}
//                                     onChange={(e) => handleInputChange('name', e.target.value)}
//                                 />
//                             </div>

//                             {/* Email */}
//                             <div>
//                                 <Label htmlFor="email">Email</Label>
//                                 <Input
//                                     id="email"
//                                     placeholder="Enter email"
//                                     className="w-full border-grey py-7 mt-1"
//                                     value={formData.email}
//                                     onChange={(e) => handleInputChange('email', e.target.value)}
//                                 />
//                             </div>

//                             {/* Address */}
//                             <div>
//                                 <Label htmlFor="address">Address</Label>
//                                 <Textarea
//                                     rows={3}
//                                     id="address"
//                                     placeholder="Enter address"
//                                     className="w-full border-grey py-5 mt-1"
//                                     value={formData.address}
//                                     onChange={(e) => handleInputChange('address', e.target.value)}
//                                 />
//                             </div>

//                             {/* GST Number */}
//                             <div>
//                                 <Label htmlFor="GST">GST Number</Label>
//                                 <Input
//                                     id="GST"
//                                     placeholder="Enter GST number"
//                                     className="w-full border-grey py-7 mt-1"
//                                     value={formData.GSTNumber}
//                                     onChange={(e) => handleInputChange('GSTNumber', e.target.value)}
//                                 />
//                             </div>

//                             {/* Website */}
//                             <div>
//                                 <Label htmlFor="website">Website</Label>
//                                 <Input
//                                     id="website"
//                                     placeholder="Enter website URL"
//                                     className="w-full border-grey py-7 mt-1"
//                                     value={formData.website}
//                                     onChange={(e) => handleInputChange('website', e.target.value)}
//                                 />
//                             </div>
//                         </div>

//                         {/* Right Column */}
//                         <div className="space-y-6">
//                             {/* Phone Numbers */}
//                             <div>
//                                 <Label htmlFor="phone">Phone Numbers</Label>
//                                 <div className="flex items-center space-x-2 mt-2">
//                                     <Input
//                                         id="phone1"
//                                         placeholder="Enter primary phone number"
//                                         className="w-full border-grey py-7"
//                                         value={phoneNumber.phone1}
//                                         onChange={(e) => handlePhoneNumberChange('phone1', e.target.value)}
//                                     />
//                                     <Input
//                                         id="phone2"
//                                         placeholder="Enter secondary phone number"
//                                         className="w-full border-grey py-7"
//                                         value={phoneNumber.phone2}
//                                         onChange={(e) => handlePhoneNumberChange('phone2', e.target.value)}
//                                     />
//                                 </div>
//                             </div>

//                             {/* WhatsApp Numbers */}
//                             <div>
//                                 <Label htmlFor="whatsappNumber">WhatsApp Numbers</Label>
//                                 <div className="flex items-center space-x-2 mt-2">
//                                     <Input
//                                         id="whatsapp-1"
//                                         placeholder="Enter primary WhatsApp number"
//                                         className="w-full border-grey py-7"
//                                         value={whatsappNumber.whatsapp1}
//                                         onChange={(e) => handleWhatsappNumberChange('whatsapp1', e.target.value)}
//                                     />
//                                     <Input
//                                         id="whatsapp-2"
//                                         placeholder="Enter secondary WhatsApp number"
//                                         className="w-full border-grey py-7"
//                                         value={whatsappNumber.whatsapp2}
//                                         onChange={(e) => handleWhatsappNumberChange('whatsapp2', e.target.value)}
//                                     />
//                                 </div>
//                             </div>

//                             {/* UPI Details */}
//                             <div>
//                                 <Label htmlFor="UPI">UPI Details</Label>
//                                 <div className="flex space-x-2">
//                                     <Input
//                                         id="UPI-id"
//                                         placeholder="UPI ID"
//                                         className="w-1/2 border-grey py-7 mt-1"
//                                         value={formData.UPI?.id || ''}
//                                         onChange={(e) => handleInputChange('UPI', { ...formData.UPI, id: e.target.value })}
//                                     />
//                                     <Input
//                                         id="UPI-number"
//                                         placeholder="UPI Number"
//                                         className="w-1/2 border-grey py-7 mt-1"
//                                         value={formData.UPI?.number || ''}
//                                         onChange={(e) => handleInputChange('UPI', { ...formData.UPI, number: e.target.value })}
//                                     />
//                                 </div>
//                             </div>

//                             {/* Customer Amounts */}
//                             <div>
//                                 <Label>Customer Referral</Label>
//                                 <div className="flex space-x-2 mt-2">
//                                     <Input
//                                         id="customer-sender"
//                                         placeholder="Sender Amount"
//                                         className="w-1/2 border-grey py-7"
//                                         value={formData.UPI?.senderAmount}
//                                         onChange={(e) => handleInputChange('customer.senderAmount', e.target.value)}
//                                     />
//                                     <Input
//                                         id="customer-receiver"
//                                         placeholder="Receiver Amount"
//                                         className="w-1/2 border-grey py-7"
//                                         value={formData.UPI?.receiverAmount}
//                                         onChange={(e) => handleInputChange('customer.receiverAmount', e.target.value)}
//                                     />
//                                 </div>
//                             </div>

//                             {/* Vendor Amounts */}
//                             {/* <div>
//                                 <Label>Vendor Referral</Label>
//                                 <div className="flex space-x-2 mt-2">
//                                     <Input
//                                         id="vendor-sender"
//                                         placeholder="Sender Amount"
//                                         className="w-1/2 border-grey py-7"
//                                         // value={formData.UPI?.senderAmount}
//                                         onChange={(e) => handleInputChange('vendor.senderAmount', e.target.value)}
//                                     />
//                                     <Input
//                                         id="vendor-receiver"
//                                         placeholder="Receiver Amount"
//                                         className="w-1/2 border-grey py-7"
//                                         // value={formData.UPI?.receiverAmount}
//                                         onChange={(e) => handleInputChange('vendor.receiverAmount', e.target.value)}
//                                     />
//                                 </div>
//                             </div> */}

//                             {/* Driver Amounts */}
//                             <div>
//                                 <Label>Driver Referral</Label>
//                                 <div className="flex space-x-2 mt-2">
//                                     <Input
//                                         id="driver-sender"
//                                         placeholder="Sender Amount"
//                                         className="w-1/2 border-grey py-7"
//                                         onChange={(e) => handleInputChange('driver.senderAmount', e.target.value)}
//                                     />
//                                     <Input
//                                         id="driver-receiver"
//                                         placeholder="Receiver Amount"
//                                         className="w-1/2 border-grey py-7"
//                                         value={formData.UPI?.receiverAmount}
//                                         onChange={(e) => handleInputChange('driver.receiverAmount', e.target.value)}
//                                     />
//                                 </div>
//                             </div>

//                             {/* Driver and Vendor Wallet Amounts (Admin Only) */}
//                             {createdBy === 'Admin' && (
//                                 <>
//                                     <div>
//                                         <Label htmlFor="driverWalletAmount">Driver Minimum Wallet Amount</Label>
//                                         <Input
//                                             id="driverWalletAmount"
//                                             placeholder="Enter driver minimum wallet amount"
//                                             className="w-full border-grey py-7 mt-1"
//                                             value={formData.driverWalletAmount}
//                                             onChange={(e) => handleInputChange('driverWalletAmount', e.target.value)}
//                                         />
//                                     </div>
//                                     <div>
//                                         <Label htmlFor="vendorWalletAmount">Vendor Minimum Wallet Amount</Label>
//                                         <Input
//                                             id="vendorWalletAmount"
//                                             placeholder="Enter vendor minimum wallet amount"
//                                             className="w-full border-grey py-7 mt-1"
//                                             value={formData.vendorWalletAmount}
//                                             onChange={(e) => handleInputChange('vendorWalletAmount', e.target.value)}
//                                         />
//                                     </div>
//                                 </>
//                             )}

//                             {/* Social Links */}
//                             <div>
//                                 <Label htmlFor="socialLinks">Social Links</Label>
//                                 <div className="space-y-2">
//                                     <Input
//                                         id="facebook"
//                                         placeholder="Facebook URL"
//                                         className="w-full border-grey py-7 mt-1"
//                                         value={formData.socialLinks?.facebook || ''}
//                                         onChange={(e) => handleInputChange('socialLinks', { ...formData.socialLinks, facebook: e.target.value })}
//                                     />
//                                     <Input
//                                         id="x"
//                                         placeholder="X URL"
//                                         className="w-full border-grey py-7 mt-1"
//                                         value={formData.socialLinks?.x || ''}
//                                         onChange={(e) => handleInputChange('socialLinks', { ...formData.socialLinks, x: e.target.value })}
//                                     />
//                                     <Input
//                                         id="instagram"
//                                         placeholder="Instagram URL"
//                                         className="w-full border-grey py-7 mt-1"
//                                         value={formData.socialLinks?.instagram || ''}
//                                         onChange={(e) => handleInputChange('socialLinks', { ...formData.socialLinks, instagram: e.target.value })}
//                                     />
//                                     <Input
//                                         id="youtube"
//                                         placeholder="Youtube URL"
//                                         className="w-full border-grey py-7 mt-1"
//                                         value={formData.socialLinks?.youtube || ''}
//                                         onChange={(e) => handleInputChange('socialLinks', { ...formData.socialLinks, youtube: e.target.value })}
//                                     />
//                                 </div>
//                             </div>
//                         </div>
//                     </div>

//                     {/* Submit Button */}
//                     <div className="flex justify-end pt-4">
//                         <Button type="submit" className="px-4 py-2" disabled={isLoading}>
//                             {isLoading ? 'Saving...' : id ? 'Update Profile' : 'Create Profile'}
//                         </Button>
//                     </div>
//                 </form>
//             </CardContent>

//             <AlertDialog open={showUnsavedChangesDialog} onOpenChange={setShowUnsavedChangesDialog}>
//                 <AlertDialogContent>
//                     <AlertDialogHeader>
//                         <AlertDialogTitle>Unsaved Changes</AlertDialogTitle>
//                         <AlertDialogDescription>
//                             You have unsaved changes. Are you sure you want to leave this page?
//                         </AlertDialogDescription>
//                     </AlertDialogHeader>
//                     <AlertDialogFooter>
//                         <AlertDialogCancel>Stay</AlertDialogCancel>
//                         <AlertDialogAction onClick={handleConfirmNavigation}>
//                             Leave
//                         </AlertDialogAction>
//                     </AlertDialogFooter>
//                 </AlertDialogContent>
//             </AlertDialog>
//         </Card>
//     );
// };

// export default ProfileForm;
