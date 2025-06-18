"use client";
import { useState, useEffect } from "react";
import { Card } from "components/ui/card";
import { Input } from "components/ui/input";
import { Label } from "components/ui/label";
import { Switch } from "components/ui/switch";
import { toast } from "sonner";
import { Button } from "components/ui/button";
import { Edit, X } from "lucide-react";
import { useServiceStore } from "stores/serviceStore";
import { Service } from "types/service";
import { Textarea } from "components/ui/textarea";

interface AirportService extends Service {
    city: string[];
}

interface ServiceSectionProps {
    isEditing: boolean;
    serviceId: string;
    title: string;
}

export default function AirportServiceSection({ isEditing, serviceId, title }: ServiceSectionProps) {
    const { service, fetchServiceById, updateService } = useServiceStore();
    const [updatedService, setUpdatedService] = useState<AirportService>({
        serviceId: "",
        name: "",
        tax: { CGST: 0, SGST: 0, IGST: 0 },
        isActive: false,
        minKm: 0,
        driverCommission: 0,
        vendorCommission: 0,
        city: [],
        include: "",
        exclude: "",
    });
    const [cityInput, setCityInput] = useState("");

    useEffect(() => {
        fetchServiceById(serviceId);
    }, [serviceId, fetchServiceById]);

    useEffect(() => {
        if (service) {
            setUpdatedService({
                ...service,
                city: service.city || [],
                include: service.include || "",
                exclude: service.exclude || ""
            });
        }
    }, [service]);

    const handleTaxChange = (key: keyof Service["tax"], value: number) => {
        setUpdatedService((prev) => ({
            ...prev,
            tax: {
                ...prev.tax,
                [key]: String(value).replace(/[^0-9.]/g, ''),
            },
        }));
    };

    const handleInputChange = (key: keyof AirportService, value: any) => {
        if (key === "isActive") {
            setUpdatedService((prev) => ({
                ...prev,
                [key]: value,
            }));
        } else {
            setUpdatedService((prev) => ({
                ...prev,
                [key]: String(value).replace(/[^0-9.]/g, ''),
            }));
        }
    };

    const handleTextAreaChange = (key: 'include' | 'exclude', value: string) => {
        setUpdatedService((prev) => ({
            ...prev,
            [key]: value,
        }));
    };

    const addCity = () => {
        if (cityInput.trim() !== "" && !updatedService.city.includes(cityInput)) {
            setUpdatedService((prev) => ({
                ...prev,
                city: [...prev.city, cityInput],
            }));
            setCityInput("");
        }
    };

    const removeCity = (city: string) => {
        setUpdatedService((prev) => ({
            ...prev,
            city: prev.city.filter((c) => c !== city),
        }));
    };

    const handleSubmitService = () => {
        if (updatedService) {
            updateService(serviceId, updatedService);
            const message = useServiceStore.getState().message;
            const status = useServiceStore.getState().statusCode;
            if (status === 200 || status === 201) {
                toast.success(message, {
                    style: {
                        backgroundColor: "#009F7F",
                        color: "#fff",
                    },
                });
                window.location.reload();
            } else {
                toast.error(message, {
                    style: {
                        backgroundColor: "#FF0000",
                        color: "#fff",
                    },
                });
            }
        }
    };

    return (
        <div>
            <div>
                <Card className="mb-8 py-3">
                    <h2 className="mb-6 text-xl font-semibold">Base Detail</h2>
                    <div className="grid grid-cols-2 gap-8">
                        <div className="space-y-6">
                            <div>
                                <Label>Service Type</Label>
                                {isEditing ? (
                                    <Input
                                        value={title}
                                        readOnly
                                        className="mt-3"
                                    />
                                ) : (
                                    <p className="mt-3">{title}</p>
                                )}
                            </div>
                            <div>
                                <h3 className="text-base mb-1">Tax</h3>
                                {isEditing ? (
                                    <>
                                        <div className="flex items-center gap-3">
                                            <div>
                                                <Label className="text-sm">CGST %<span className="text-red-500 ml-1">*</span></Label>
                                                <Input
                                                    id="CGST"
                                                    type="number"
                                                    value={updatedService?.tax?.CGST || 0}
                                                    className="mt-3"
                                                    onChange={(e) => handleTaxChange("CGST", Number(e.target.value))}
                                                />
                                            </div>
                                            <div>
                                                <Label className="text-sm">SGST %<span className="text-red-500 ml-1">*</span></Label>
                                                <Input
                                                    id="SGST"
                                                    type="number"
                                                    value={updatedService.tax.SGST || 0}
                                                    className="mt-3"
                                                    onChange={(e) => handleTaxChange("SGST", Number(e.target.value))}
                                                />
                                            </div>
                                            <div>
                                                <Label className="text-sm">IGST %<span className="text-red-500 ml-1">*</span></Label>
                                                <Input
                                                    id="IGST"
                                                    type="number"
                                                    value={updatedService.tax.IGST || 0}
                                                    className="mt-3"
                                                    onChange={(e) => handleTaxChange("IGST", Number(e.target.value))}
                                                />
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="flex items-center gap-3">
                                            <p className="mt-3">CGST: {service?.tax?.CGST || 0}%</p>
                                            <p className="mt-3">SGST: {service?.tax?.SGST || 0}%</p>
                                            <p className="mt-3">IGST: {service?.tax?.IGST || 0}%</p>
                                        </div>
                                    </>
                                )}
                            </div>
                            <div>
                                {isEditing ? (
                                    <div>
                                        <Label className="block text-sm font-medium">Enter the City <span className="text-sm pl-2">(optional)</span></Label>
                                        <div className="flex mt-2 gap-2 items-center">
                                            <Input
                                                type="text"
                                                placeholder="Enter city"
                                                value={cityInput}
                                                onChange={(e) => setCityInput(e.target.value)}
                                                className="flex-1"
                                            />
                                            <Button className="rounded-sm py-2" onClick={addCity}>+</Button>
                                        </div>
                                        <div className="flex flex-wrap gap-2 mt-3">
                                            {updatedService.city.length > 0 ? (
                                                updatedService.city.map((city: string, index: number) => (
                                                    <div key={index} className="bg-gray-200 px-3 py-1 rounded-full flex items-center">
                                                        <span className="mr-2">{city}</span>
                                                        <button onClick={() => removeCity(city)}>
                                                            <X size={16} className="text-red-500" />
                                                        </button>
                                                    </div>
                                                ))
                                            ) : (
                                                <p className="text-sm text-gray-500">No city added</p>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <div>
                                        <h3 className="text-base mb-1">Cities</h3>
                                        <div className="flex flex-wrap gap-2 mt-3">
                                            {updatedService.city.length > 0 ? (
                                                updatedService.city.map((city: string, index: number) => (
                                                    <div key={index} className="bg-gray-200 px-3 py-1 rounded-full flex items-center">
                                                        <span className="mr-2">{city}</span>
                                                    </div>
                                                ))
                                            ) : (
                                                <p className="text-sm text-gray-500">No city available</p>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="space-y-6">
                            <div className="flex items-center justify-between mt-7">
                                <Label>Service Off | On </Label>
                                <Switch disabled={!isEditing} checked={updatedService.isActive} onCheckedChange={(checked) => handleInputChange("isActive", checked)} />
                            </div>
                            <div>
                                {isEditing ? (
                                    <>
                                        <Label>Driver Commission % <span className="text-red-500">*</span></Label>
                                        <Input
                                            id="driverCommission"
                                            type="number"
                                            value={updatedService.driverCommission || 0}
                                            className="mt-3"
                                            onChange={(e) => handleInputChange("driverCommission", Number(e.target.value))}
                                        />
                                    </>
                                ) : (
                                    <>
                                        <h2 className="text-base mb-1">Driver Commission  </h2>
                                        <p className="mt-3">{service?.driverCommission}%</p>
                                    </>
                                )}
                            </div>
                            <div>
                                {isEditing ? (
                                    <>
                                        <Label>Vendor Commission %<span className="text-red-500">*</span></Label>
                                        <Input
                                            id="vendorCommission"
                                            type="number"
                                            value={updatedService.vendorCommission || 0}
                                            className="mt-3"
                                            onChange={(e) => handleInputChange("vendorCommission", Number(e.target.value))}
                                        />
                                    </>
                                ) : (
                                    <>
                                        <h2 className="text-base mb-1">Vendor Commission</h2>
                                        <p className="mt-3">{service?.vendorCommission}%</p>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* include and exclude Section */}
                    <div className="mt-8 space-y-6">
                        <div className="flex space-x-4">
                            <div className="flex-1">
                                <Label>include</Label>
                                {isEditing ? (
                                    <Textarea
                                        value={updatedService.include}
                                        onChange={(e) => handleTextAreaChange('include', e.target.value)}
                                        className="mt-3"
                                        placeholder="List what's included in this service "
                                        rows={4}
                                    />
                                ) : (
                                    <div className="mt-3 p-3 bg-gray-50 rounded-md">
                                        {updatedService.include ? (
                                            <div dangerouslySetInnerHTML={{ __html: updatedService.include.replace(/\n/g, '<br/>') }} />
                                        ) : (
                                            <p className="text-gray-500">No include information available</p>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className="flex-1">
                                <Label>exclude</Label>
                                {isEditing ? (
                                    <Textarea
                                        value={updatedService.exclude}
                                        onChange={(e) => handleTextAreaChange('exclude', e.target.value)}
                                        className="mt-3"
                                        placeholder="List what's excluded from this service "
                                        rows={4}
                                    />
                                ) : (
                                    <div className="mt-3 p-3 bg-gray-50 rounded-md">
                                        {updatedService.exclude ? (
                                            <div dangerouslySetInnerHTML={{ __html: updatedService.exclude.replace(/\n/g, '<br/>') }} />
                                        ) : (
                                            <p className="text-gray-500">No exclude information available</p>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {isEditing && (
                        <div className="flex justify-center">
                            <Button variant="primary" className="mt-8" onClick={handleSubmitService}>
                                Save
                            </Button>
                        </div>
                    )}
                </Card>
            </div>
        </div>
    )
}
