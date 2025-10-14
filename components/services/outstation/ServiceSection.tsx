"use client";
import React, { useEffect, useState, useMemo } from "react";
import { Card } from "components/ui/card";
import { Input } from "components/ui/input";
import { Label } from "components/ui/label";
import { Switch } from "components/ui/switch";
import { Button } from "components/ui/button";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { Service } from "types/service";
import { Textarea } from "components/ui/textarea";
import {
  useServiceById,
  useUpdateService
} from 'hooks/react-query/useServices';

interface ServiceSectionProps {
  isEditing: boolean;
  serviceId: string;
  title: string;
  isLoading?: boolean;
}

export function ServiceSection({ isEditing, serviceId, title, isLoading = false }: ServiceSectionProps) {

  const router = useRouter();
  const [updatedService, setUpdatedService] = useState<Service>({
    serviceId: "",
    name: title,
    tax: { GST: 0, vendorGST: 0 },
    isActive: false,
    minKm: 0,
    driverCommission: 0,
    vendorCommission: 0,
    include: "",
    exclude: "",
  });

  const {
    data: service = null,
    isLoading: isLoadingService,
  } = useServiceById(serviceId);

  const { mutateAsync: updateService } = useUpdateService();


  useEffect(() => {
    if (service) {
      const updated = {
        ...service,
        name: title,
        include: service.include || "",
        exclude: service.exclude || ""
      };

      setUpdatedService(updated);
      // console.log("Updated Service State:", updated); 
    }
  }, [service, title]);


  const handleTaxChange = (key: keyof Service["tax"], value: any) => {
    setUpdatedService((prev) => ({
      ...prev,
      tax: {
        ...prev.tax,
        [key]: String(value).replace(/[^0-9.]/g, ''),
      },
    }));
  };

  const handleInputChange = (key: keyof Service, value: any) => {
    console.log("handleInputChange called with key:", key, "and value:", value);
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

  const handleUpdateService = () => {
    if (updatedService) {
      console.log("Updated Service:", updatedService);
      updateService({ id: serviceId, data: updatedService }, {
        onSuccess: () => {
          toast.success("Service updated successfully", {
            style: {
              backgroundColor: "#009F7F",
              color: "#fff",
            },
          });
          window.location.reload();
        },
        onError: () => {
          toast.error("Failed to update service", {
            style: {
              backgroundColor: "#FF0000",
              color: "#fff",
            },
          });
        }
      });
    }
  };

  if (isLoadingService) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <React.Fragment>
      <Card className="mb-8 py-3">
        <h2 className="mb-6 text-xl font-semibold">Base Detail</h2>
        <div className="grid grid-cols-2 gap-8">
          <div className="space-y-6">
            <div>
              <h3 className="text-base mb-1">Tax</h3>
              {isEditing ? (
                <React.Fragment>
                  <div className="flex items-center gap-3">
                    <div>
                      <Label className="text-sm">GST %<span className="text-red-500 ml-1">*</span></Label>
                      <Input
                        id="GST"
                        type="number"
                        value={updatedService.tax?.GST || 0}
                        className="mt-3"
                        onChange={(e) => handleTaxChange("GST", Number(e.target.value))}
                      />
                    </div>
                    <div>
                      <Label className="text-sm">Vendor GST %<span className="text-red-500 ml-1">*</span></Label>
                      <Input
                        id="vendorGST"
                        type="number"
                        value={updatedService.tax?.vendorGST || 0}
                        className="mt-3"
                        onChange={(e) => handleTaxChange("vendorGST", Number(e.target.value))}
                      />
                    </div>
                  </div>
                </React.Fragment>
              ) : (
                <div className="flex items-center gap-3">
                  <p className="mt-3">GST: {updatedService?.tax?.GST || 0}%</p>
                  <p className="mt-3">Vendor GST: {updatedService?.tax?.vendorGST || 0}%</p>
                </div>
              )}
            </div>
            <div>
              {isEditing ? (
                <div>
                  <Label>Minimum Km <span className="text-red-500">*</span></Label>
                  <Input
                    id="minKm"
                    type="number"
                    value={updatedService.minKm || 0}
                    className="mt-3"
                    onChange={(e) => handleInputChange("minKm", Number(e.target.value))}
                  />
                </div>
              ) : (
                <div>
                  <h2 className="text-base mb-1">Minimum Km</h2>
                  <p className="mt-3">{service?.minKm} Km</p>
                </div>
              )}
            </div>
          </div>
          <div className="space-y-6">
            <div className="flex items-center justify-between mt-7">
              <Label>Service Off | On </Label>
              <Switch
                disabled={!isEditing}
                checked={updatedService.isActive}
                onCheckedChange={(checked) => handleInputChange("isActive", checked)}
              />
            </div>
            <div>
              {isEditing ? (
                <div>
                  <Label>Driver Commission %<span className="text-red-500">*</span></Label>
                  <Input
                    id="driverCommission"
                    type="number"
                    value={updatedService.driverCommission || 0}
                    className="mt-3"
                    onChange={(e) => handleInputChange("driverCommission", Number(e.target.value))}
                  />
                </div>
              ) : (
                <div>
                  <h2 className="text-base mb-1">Driver Commission </h2>
                  <p className="mt-3">{service?.driverCommission}%</p>
                </div>
              )}
            </div>
            <div>
              {isEditing ? (
                <div>
                  <Label>Vendor Commission %<span className="text-red-500">*</span></Label>
                  <Input
                    id="vendorCommission"
                    type="number"
                    value={updatedService.vendorCommission || 0}
                    className="mt-3"
                    onChange={(e) => handleInputChange("vendorCommission", Number(e.target.value))}
                  />
                </div>
              ) : (
                <div>
                  <h2 className="text-base mb-1">Vendor Commission</h2>
                  <p className="mt-3">{service?.vendorCommission}%</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* include and exclude Section */}
        {/* <div className="mt-8 space-y-6">
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
        </div> */}

        {isEditing && (
          <div className="flex justify-center">
            <Button variant="primary" className="mt-8" onClick={handleUpdateService}>
              Save
            </Button>
          </div>
        )}
      </Card>
    </React.Fragment>
  );
} 