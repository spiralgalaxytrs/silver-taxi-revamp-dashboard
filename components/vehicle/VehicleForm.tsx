'use client'
import React, { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation';
import { Card, CardContent } from "components/ui/card"
import CustomInputCreate from '../customer/CustomInputCreate';
import { Input } from "components/ui/input"
import { Label } from "components/ui/label"
import { Upload } from 'lucide-react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "components/ui/select"
import { Button } from "components/ui/button"
import { toast } from 'sonner';
import {
    useVehicleById,
    useCreateVehicle,
    useUpdateVehicle,
    useVehicleTypes,
    useCreateVehicleTypes
} from 'hooks/react-query/useVehicle';
import { Vehicle } from 'types/react-query/vehicle'
import { capitalize } from 'lib/capitalize';

interface FormDataType {
    name: string;
    type: string;
    fuelType: 'Petrol' | 'Diesel' | 'Electric' | 'Hybrid';
    imageUrl: File | undefined | string;
    seats: number;
    bags: number;
    permitCharge?: number;
    driverBeta: number;
}

const VehicleForm = ({ id }: { id?: string }) => {
    const router = useRouter();

    const {
        data: vehicle = null as Vehicle | null,
        isLoading,
    } = useVehicleById(id ?? "")
    const { data: fetchedTypes = [], refetch } = useVehicleTypes();
    const { mutate: createVehicleTypes } = useCreateVehicleTypes();
    const { mutate: createVehicle } = useCreateVehicle()
    const { mutate: updateVehicle } = useUpdateVehicle()


    const vehicleTypes = useMemo(() => {
        return fetchedTypes.map((type) => ({
            value: capitalize(type.name),
            label: capitalize(type.name),
        }))
    }, [fetchedTypes])

    const [formData, setFormData] = useState<FormDataType>({
        name: '',
        type: '',
        fuelType: 'Petrol',
        imageUrl: undefined,
        seats: 0,
        bags: 0,
        permitCharge: 0,
        driverBeta: 0,
    })

    useEffect(() => {
        if (vehicle) {
            setFormData({
                name: vehicle.name,
                type: vehicle.type,
                fuelType: vehicle?.fuelType || 'Petrol',
                imageUrl: vehicle?.imageUrl || "",
                seats: vehicle?.seats || 0,
                bags: vehicle?.bags || 0,
                permitCharge: vehicle?.permitCharge,
                driverBeta: vehicle?.driverBeta || 0,
            })
        }
    }, [vehicle])

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const maxSizeInBytes = 300 * 1024; // 200KB in bytes
            if (file.size > maxSizeInBytes) {
                toast.error("The file is too large. Please choose a smaller one under 200KB",
                    {
                        duration: 5000,
                        position: "top-right",
                        closeButton: true,
                        style: {
                            background: "#007bff", // Set background color to blue
                            color: "#fff", // Keep text color white
                            border: "1px solid #fff",
                            borderRadius: "5px",
                            padding: "10px",
                        }
                    }
                );
                e.target.value = ""; // Reset the input
                return;
            }
        }
        setFormData(prevData => ({ ...prevData, imageUrl: file ?? undefined }));
    };

    const handleInputChange = (field: keyof FormDataType, value: any) => {
        setFormData(prev => ({
            ...prev,
            [field]: (field === "seats" || field === "bags" || field === "driverBeta")
                ? String(value).replace(/[^0-9]/g, '')
                : value
        }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        const vehicleData = {
            ...formData,
        };

        try {

            if (id) {
                updateVehicle({ id, vehicleData }, {
                    onSuccess: () => {
                        toast.success("Vehicle updated successfully", {
                            style: {
                                backgroundColor: "#009F7F",
                                color: "#fff",
                            },
                        })
                        setTimeout(() => router.push('/admin/vehicles'), 1000)
                    },
                    onError: (error: any) => {
                        toast.error(error?.response?.data?.message || "Failed to update vehicle", {
                            style: {
                                backgroundColor: "#FF0000",
                                color: "#fff",
                            },
                        })
                    },
                })
            } else {
                createVehicle(vehicleData, {
                    onSuccess: () => {
                        toast.success("Vehicle created successfully", {
                            style: {
                                backgroundColor: "#009F7F",
                                color: "#fff",
                            },
                        })
                        setTimeout(() => router.push('/admin/vehicles'), 1000)
                    },
                    onError: (error: any) => {
                        toast.error(error?.response?.data?.message || "Failed to create vehicle", {
                            style: {
                                backgroundColor: "#FF0000",
                                color: "#fff",
                            },
                        })
                    },
                })
            }
        } catch (error) {
            toast.error("Server unexpected error occurred", {
                style: {
                    backgroundColor: "#FF0000",
                    color: "#fff",
                },
            })
            // console.error(error);
        }
    }

    const handleClose = () => {
        router.push('/admin/vehicles')
    }

    return (
        <div className='flex flex-col gap-4 bg-white rounded'>
            <Card className='rounded-none border-none'>
                <div className="flex justify-between items-center p-6 pt-4 pb-6">
                    <h2 className="text-3xl font-bold tracking-tight">
                        {id ? 'Edit Vehicle' : 'Create Vehicle'}
                    </h2>
                    <Button onClick={handleClose} variant="outline">
                        Close
                    </Button>
                </div>
                <CardContent>
                    <form onSubmit={handleSubmit} className='space-y-6'>
                        <div className="flex py-3 gap-4">

                            <div className="w-1/3">

                                <h2 className='text-black text-lg font-bold'>Vehicle </h2>
                                <p className='text-gray-500'>Enter Vehicle Details ...</p>
                            </div>

                            <div className="w-2/3">
                                <div className='border bg-white px-8 rounded my-5 p-4 border-dashed border-border-base pb-5 md:pb-7'>
                                    <Label htmlFor="name">Name</Label>
                                    <Input
                                        id="name"
                                        placeholder="Enter vehicle name"
                                        className='w-full border-grey py-7  mt-1'
                                        value={formData.name}
                                        onChange={(e) => handleInputChange('name', e.target.value)}
                                    />
                                    <div className='pt-3' />
                                    <Label htmlFor="fuelType" >Fuel Type</Label>
                                    <div className=' mt-1' />
                                    <Select
                                        defaultValue={formData.fuelType}
                                        onValueChange={(value) => setFormData({ ...formData, fuelType: value as "Petrol" | "Diesel" | "Electric" })}
                                    >
                                        <SelectTrigger id="fuelType" className='py-7 border-grey'>
                                            <SelectValue placeholder={formData.fuelType ? formData.fuelType : "Select fuel type"} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Petrol">Petrol</SelectItem>
                                            <SelectItem value="Diesel">Diesel</SelectItem>
                                            <SelectItem value="Electric">Electric</SelectItem>
                                        </SelectContent>
                                    </Select>

                                    <div className='pt-3' />
                                    <Label htmlFor="type">Vehicle Type</Label>
                                    <CustomInputCreate
                                        className='w-full border-grey py-3 mt-1'
                                        value={formData.type}
                                        placeholder={formData.type ? formData.type : "Select vehicle type"}
                                        data={vehicleTypes}
                                        onChange={(value) => setFormData({ ...formData, type: value })}
                                        onCreate={(value) => {
                                            createVehicleTypes(value, {
                                                onSuccess: () => {
                                                    refetch();
                                                    toast.success("Vehicle type created successfully", {
                                                        style: {
                                                            backgroundColor: "#0065F8",
                                                            color: "#fff",
                                                        },
                                                    })
                                                },
                                                onError: (error: any) => {
                                                    toast.error(error?.response?.data?.message || "Failed to create vehicle type", {
                                                        style: {
                                                            backgroundColor: "#FF0000",
                                                            color: "#fff",
                                                        },
                                                    })
                                                },
                                            })
                                        }}
                                    />

                                    <div className='pt-3' />
                                    <Label htmlFor="seats">Seats</Label>
                                    <Input
                                        id="seats"
                                        className='w-full border-grey py-7 mt-1'
                                        type="text"
                                        placeholder="Enter vehicle Seats"
                                        value={formData.seats}
                                        onChange={(e) => handleInputChange('seats', Number(e.target.value))}
                                    />
                                    <div className='pt-3' />


                                    <Label htmlFor="bags">No of Luggages</Label>
                                    <Input
                                        id="bags"
                                        className='w-full border-grey py-7'
                                        type="text"
                                        placeholder="Enter extra kilometer price mt-1"
                                        value={formData.bags}
                                        onChange={(e) => handleInputChange('bags', Number(e.target.value))}
                                    />

                                    <Label htmlFor="bags">Permit Charge</Label>
                                    <Input
                                        id="permitCharge"
                                        className='w-full border-grey py-7'
                                        type="text"
                                        placeholder="Enter extra kilometer price mt-1"
                                        value={formData.permitCharge}
                                        onChange={(e) => handleInputChange('permitCharge', Number(e.target.value))}
                                    />

                                    <Label htmlFor="driverBeta">Driver Beta</Label>
                                    <Input
                                        id="driverBeta"
                                        className='w-full border-grey py-7'
                                        type="text"
                                        placeholder="Enter driver beta"
                                        value={formData.driverBeta}
                                        onChange={(e) => handleInputChange('driverBeta', Number(e.target.value))}
                                    />
                                    <div className='pt-3' />

                                    <Label htmlFor="vehicleImage">Vehicle Image</Label>
                                    {/* <div>
                                        <Switch id="url_upload"
                                            checked={isUpload}
                                            onCheckedChange={(checked) => setIsUpload((checked))}
                                        />
                                    </div> */}
                                    <div className="flex flex-col items-center justify-center border border-dashed border-gray-400 rounded-lg p-6 hover:border-gray-600 transition cursor-pointer">
                                        <Label htmlFor="vehicleImageFile" className="flex flex-col items-center cursor-pointer">
                                            {!formData.imageUrl && <>
                                                <Upload className="text-gray-600 text-4xl mb-2" />
                                                <p className="text-gray-600 text-sm mb-2">Click to upload or drag and drop</p>
                                                <span className="text-xs text-gray-400">Only image files (Webp,SVG, PNG, etc.) max size 200KB</span>
                                                <input
                                                    id="vehicleImageFile"
                                                    type="file"
                                                    required
                                                    accept="image/*"
                                                    className="hidden"
                                                    onChange={handleImageChange}
                                                />
                                            </>}
                                            {formData.imageUrl && (
                                                <>
                                                    <img
                                                        src={
                                                            formData.imageUrl instanceof File
                                                                ? URL.createObjectURL(formData.imageUrl)
                                                                : formData.imageUrl as string
                                                        }
                                                        alt="Banner Preview"
                                                        className="w-full h-32 object-cover rounded"
                                                    />
                                                    <div className='flex flex-col items-center'>
                                                        <p className="text-gray-400 mt-2 text-center text-base">
                                                            {formData.imageUrl instanceof File ? formData.imageUrl.name : formData.imageUrl}
                                                        </p>
                                                        <span className='cursor-pointer text-black text-base border border-black rounded bg-[#EFEFEF] p-1'>change image</span>
                                                        <input
                                                            id="vehicleImageFile"
                                                            type="file"
                                                            accept="image/*"
                                                            className="hidden"
                                                            onChange={handleImageChange}
                                                        />
                                                    </div>
                                                </>
                                            )}
                                        </Label>
                                    </div>
                                </div>

                            </div>
                        </div>

                        <div className="flex justify-end">
                            <Button
                                type="submit"
                                className="px-6 py-2"
                            >
                                {isLoading ? 'Creating...' : 'Save Vehicle'}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card >
        </div>

    )
}

export default VehicleForm