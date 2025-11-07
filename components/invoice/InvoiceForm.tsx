import React, { useEffect, useMemo, useState } from "react";
import { Input } from "components/ui/input";
import { Card, CardContent } from "components/ui/card";
import { Button } from "components/ui/button";
import { Label } from "components/ui/label";
import { Textarea } from "../ui/textarea";
import { PlusIcon } from "lucide-react";
import { customAlphabet } from 'nanoid';
import { useInvoiceById, useCreateInvoice, useUpdateInvoice } from 'hooks/react-query/useInvoice';
import { useServices } from 'hooks/react-query/useServices';
import { useOffers } from 'hooks/react-query/useOffers';
import { useVehiclesAdmin } from 'hooks/react-query/useVehicle';
import { useTariffs, usePackageTariffs } from 'hooks/react-query/useTariff';
import LocationAutocomplete from '../location/LocationAutocomplete';
import axios from '../../lib/http-common';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from "../ui/select";
import { toast } from "sonner";
import { useParams, useRouter } from "next/navigation";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogFooter
} from 'components/ui/alert-dialog';
import { Checkbox } from "components/ui/checkbox";

interface InvoiceItem {
  serviceType: string;
  vehicleType: string;
  details: string;
  km: number;
  price: number;
  time: string;
  amount: number;
}

interface Charge {
  label: string;
  value: number;
  isFixed?: boolean;
}

interface InvoiceFormProps {
  invId?: string;
  createdBy: string;
}

export default function InvoiceForm({ invId, createdBy }: InvoiceFormProps) {
  const router = useRouter();
  const { bookingId } = useParams<{ bookingId: string }>();
  const { mutate: updateInvoice } = useUpdateInvoice();
  const { mutate: createInvoice } = useCreateInvoice();
  const { data: invoice = null } = useInvoiceById(invId || "");
  const { data: offers = [] } = useOffers();
  const { data: services = [] } = useServices();
  const { data: vehicles = [] } = useVehiclesAdmin();
  const { data: tariffs = [] } = useTariffs();

  // Fetch package tariffs for hourly packages
  const { data: allPkgTariffs = [] } = usePackageTariffs('hourly');

  const date = new Date();
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const nanoid = customAlphabet("0123456789", 4);
  const uniqueId = nanoid();
  const newInvoiceId = `INV-${year}${month}${day}${uniqueId}`;
  const invoiceId = invoice?.invoiceNo || newInvoiceId;

  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split("T")[0]);

  const [shippingAddress, setShippingAddress] = useState({
    name: "",
    address: "",
    phone: "",
    email: "",
    GSTNumber: ""
  });

  const [items, setItems] = useState<InvoiceItem>({
    serviceType: "",
    vehicleType: "",
    details: "",
    km: 0,
    price: 0,
    time: "",
    amount: 0,
  });

  const [taxCharges, setTaxCharges] = useState<Charge[]>([
    { label: "CGST & SGST", value: 0, isFixed: true },
    { label: "IGST", value: 0, isFixed: true }
  ]);
  const [OtherCharges, setOtherCharges] = useState<Charge[]>([]);
  const [customCharges, setCustomCharges] = useState<Charge[]>([]);
  const [isFormDirty, setIsFormDirty] = useState(false);
  const [showUnsavedChangesDialog, setShowUnsavedChangesDialog] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<() => void>(() => { });
  const [isCGSTSGSTSelected, setIsCGSTSGSTSelected] = useState(true);
  const [isIGSTSelected, setIsIGSTSelected] = useState(false);
  const [selectedServiceName, setSelectedServiceName] = useState("");
  const [pickupDrop, setPickupDrop] = useState({ pickup: "", drop: "" });
  const [selectedPackageId, setSelectedPackageId] = useState("");
  const [packageDetails, setPackageDetails] = useState({
    noOfHours: "",
    distanceLimit: 0,
    price: 0,
    extraPrice: 0
  });
  const [paymentStatus, setPaymentStatus] = useState("Unpaid");
  const [bookingStatus, setBookingStatus] = useState("Unpaid");
  const [paymentDetails, setPaymentDetails] = useState("");
  const [note, setNote] = useState("");
  const [isCalculatingDistance, setIsCalculatingDistance] = useState(false);
  const [serviceTaxPercentage, setServiceTaxPercentage] = useState(0);


  // Update from invoice when it loads
  useEffect(() => {
    if (invoice) {
      setShippingAddress({
        name: invoice?.name || "",
        phone: invoice?.phone || "",
        email: invoice?.email || "",
        GSTNumber: invoice?.GSTNumber || "",
        address: invoice?.address || ""
      });

      // Calculate amount from km and price if not provided
      const calculatedAmount = invoice?.estimatedAmount || (invoice?.totalKm || 0) * (invoice?.pricePerKm || 0);

      setItems({
        serviceType: invoice?.serviceType || "",
        vehicleType: invoice?.vehicleType || "",
        details: `${invoice?.pickup} to ${invoice?.drop}` || "",
        km: invoice?.totalKm || 0,
        price: invoice?.pricePerKm || 0,
        time: invoice?.travelTime || "",
        amount: calculatedAmount,
      })

      // Set selected service name for package filtering
      setSelectedServiceName(invoice?.serviceType || "");

      // Load tax percentages from service data
      if (invoice?.serviceType) {
        const service = services.find(s => s.name === invoice.serviceType);
        console.log("service >>>", service);
        if (service && service.tax) {
          setServiceTaxPercentage(service.tax.GST);
        }
      }

      // Set pickup and drop locations
      setPickupDrop({
        pickup: invoice?.pickup || "",
        drop: invoice?.drop || ""
      });

      // For hourly packages, try to find and set package details
      if (invoice?.serviceType === "Hourly Packages" && invoice?.otherCharges) {
        // Try to extract package information from otherCharges or set default
        setPackageDetails({
          noOfHours: invoice?.travelTime?.replace(" Hours", "") || "",
          distanceLimit: invoice?.totalKm || 0,
          price: invoice?.totalAmount || 0,
          extraPrice: 0
        });
      }

      // console.log("invoice >>>", invoice);

      setPaymentDetails(invoice?.paymentDetails || "");
      setNote(invoice?.note || "");
      setPaymentStatus(invoice?.status || "Unpaid");
      setInvoiceDate(invoice?.invoiceDate.split("T")[0] || new Date().toISOString().split("T")[0]);

      if (invoice?.otherCharges) {
        // Load GST values and set tax selection
        const cgstSgstValue = invoice?.otherCharges?.["CGST & SGST"];
        const igstValue = invoice?.otherCharges?.["IGST"];

        if (cgstSgstValue !== undefined) {
          setIsCGSTSGSTSelected(true);
          setIsIGSTSelected(false);
          setTaxCharges((prev) => {
            return prev.map((charge) => ({
              ...charge,
              value: charge.label === "CGST & SGST" ? cgstSgstValue : 0,
            }));
          });
        } else if (igstValue !== undefined) {
          setIsCGSTSGSTSelected(false);
          setIsIGSTSelected(true);
          setTaxCharges((prev) => {
            return prev.map((charge) => ({
              ...charge,
              value: charge.label === "IGST" ? igstValue : 0,
            }));
          });
        }

        // Load other charges (excluding GST)
        const excludedLabels = ["CGST & SGST", "IGST"];
        const parsedCharges = Object.entries(invoice.otherCharges)
          .filter(([label]) => !excludedLabels.includes(label.trim()))
          .map(([label, value]) => ({
            label,
            value: Number(value) || 0,
          }));
        setOtherCharges(parsedCharges);
      }
    }
  }, [invoice]);

  // Function to calculate distance and duration between pickup and drop
  const calculateDistance = async (pickup: string, drop: string) => {
    if (!pickup || !drop) return;

    setIsCalculatingDistance(true);
    try {
      const response = await axios.get('/global/distance', {
        params: { origin: pickup, destination: drop }
      });

      const { distance, duration } = response.data.data;
      handleItemChange("km", distance);
      handleItemChange("time", duration);
    } catch (error) {
      console.error('Error calculating distance:', error);
      toast.error('Failed to calculate distance');
    } finally {
      setIsCalculatingDistance(false);
    }
  };

  // Function to get available vehicle types for selected service
  const getAvailableVehicleTypes = (): string[] => {
    const serviceName = selectedServiceName || items.serviceType;
    if (!serviceName) return [];

    const service = services.find(s => s.name === serviceName);
    if (!service) return [];

    // For hourly packages, get vehicles from package tariffs
    if (serviceName === "Hourly Packages") {
      if (selectedPackageId) {
        // If package is selected, show vehicles that support this specific package
        const packageVehicles = vehicles.filter(vehicle =>
          vehicle.isActive &&
          allPkgTariffs.some(
            pkgTariff =>
              pkgTariff.vehicleId === vehicle.vehicleId &&
              pkgTariff.packageId === selectedPackageId &&
              pkgTariff.price > 0
          )
        );

        const vehicleTypes = [...new Set(packageVehicles.map(vehicle => vehicle.type).filter((type): type is string => Boolean(type)))];
        // console.log('Hourly packages vehicle types for selected package:', vehicleTypes);
        return vehicleTypes;
      } else {
        // If no package selected, show all vehicles that have hourly packages
        const packageVehicles = vehicles.filter(vehicle =>
          vehicle.isActive &&
          allPkgTariffs.some(
            pkgTariff =>
              pkgTariff.vehicleId === vehicle.vehicleId &&
              pkgTariff.price > 0
          )
        );

        const vehicleTypes = [...new Set(packageVehicles.map(vehicle => vehicle.type).filter((type): type is string => Boolean(type)))];
        console.log('Hourly packages vehicle types (all packages):', vehicleTypes);
        return vehicleTypes;
      }
    }

    // For regular services, get vehicles from regular tariffs
    const serviceTariffs = tariffs.filter(tariff =>
      tariff.serviceId === service.serviceId && tariff.price > 0
    );

    const vehicleTypes = [...new Set(serviceTariffs.map(tariff => {
      const vehicle = vehicles.sort((a, b) => a.order - b.order).find(v => v.vehicleId === tariff.vehicleId);
      return vehicle?.type;
    }).filter((type): type is string => Boolean(type)))];

    // console.log('Regular service vehicle types:', vehicleTypes);
    return vehicleTypes;
  };

  // Handle pickup location change
  const handlePickupChange = (address: string) => {
    setPickupDrop(prev => ({ ...prev, pickup: address }));

    // For hourly packages, only use pickup location
    if (selectedServiceName === "Hourly Packages") {
      const details = address;
      handleItemChange("details", details);
    } else {
      const details = `${address} - ${pickupDrop.drop}`;
      handleItemChange("details", details);

      // Calculate distance if both pickup and drop are available
      if (address && pickupDrop.drop) {
        calculateDistance(address, pickupDrop.drop);
      }
    }
  };

  // Handle drop location change
  const handleDropChange = (address: string) => {
    setPickupDrop(prev => ({ ...prev, drop: address }));
    const details = `${pickupDrop.pickup} - ${address}`;
    handleItemChange("details", details);

    // Calculate distance if both pickup and drop are available (not for hourly packages)
    if (pickupDrop.pickup && address && selectedServiceName !== "Hourly Packages") {
      calculateDistance(pickupDrop.pickup, address);
    }
  };

  const handleItemChange = (field: keyof InvoiceItem, value: any) => {
    setItems((prevItem) => {
      const updatedItem = { ...prevItem, [field]: value };

      if (["km", "price"].includes(field)) {
        const km = field === "km" ? Number(value) : updatedItem.km;
        const price = field === "price" ? Number(value) : updatedItem.price;
        const amount = km * price;
        updatedItem.amount = amount;
      }

      return updatedItem;
    });

    setIsFormDirty(true);
  };


  const addCustomCharge = () => {
    setCustomCharges([...customCharges, { label: "", value: 0 }]);
    setIsFormDirty(true);
  };

  const removeCustomCharge = (index: number) => {
    setCustomCharges((prev) => {
      const updated = [...prev];
      updated.splice(index, 1);

      return updated;
    });

    setIsFormDirty(true);
  };


  const handleChargeChange = (index: number, field: keyof Charge, value: any) => {
    setCustomCharges((prev) => {
      const updated = [...prev];

      updated[index] = {
        ...updated[index],
        [field]: field === "value" ? Number(value) : value
      };

      return updated;
    });

    setIsFormDirty(true);
  };



  const handleTaxSelection = (label: "CGST & SGST" | "IGST") => {
    console.log("handleTaxSelection", label);
    if (label === "CGST & SGST") {
      console.log("Selected CGST & SGST");
      setIsCGSTSGSTSelected(true);
      setIsIGSTSelected(false);
    } else {
      console.log("Selected IGST");
      setIsCGSTSGSTSelected(false);
      setIsIGSTSelected(true);
    }
    setIsFormDirty(true);
  };


  const totalAmount = useMemo(() => {
    const customTotal = customCharges.reduce(
      (sum, charge) => sum + (Number(charge.value) || 0),
      0
    );

    // Get base amount - use package price for hourly packages, otherwise use items.amount
    const baseAmount = selectedServiceName === "Hourly Packages" ? packageDetails.price : items.amount;

    // Calculate tax amount based on selected tax type
    let taxAmount = (baseAmount * Number(serviceTaxPercentage) / 100);
    return (invoice?.totalAmount || baseAmount || 0) + customTotal + taxAmount;
  }, [customCharges, invoice, items.amount, packageDetails.price, selectedServiceName, isCGSTSGSTSelected, isIGSTSelected, serviceTaxPercentage]);




  const handleCreateInvoice = () => {


    const customChargeEntries = customCharges.map((c) => [c.label, c.value]);

    const baseOtherCharges = {
      ...Object.fromEntries(OtherCharges.map(c => [c.label, Number(c.value)])),
      ...Object.fromEntries(customChargeEntries),
    };

    // Step 2: Remove any GST from base charges
    delete baseOtherCharges["CGST & SGST"];
    delete baseOtherCharges["IGST"];

    // Step 3: Add only the selected GST with proper calculation
    if (isCGSTSGSTSelected) {
      // Calculate CGST + SGST amount based on base amount
      const baseAmount = selectedServiceName === "Hourly Packages" ? packageDetails.price : items.amount;
      const totalPercentage = Number(serviceTaxPercentage);
      const gstAmount = (baseAmount * totalPercentage / 100);
      baseOtherCharges["CGST & SGST"] = gstAmount;
    } else if (isIGSTSelected) {
      // Calculate IGST amount based on base amount
      const baseAmount = selectedServiceName === "Hourly Packages" ? packageDetails.price : items.amount;
      const gstAmount = (baseAmount * Number(serviceTaxPercentage) / 100);
      baseOtherCharges["IGST"] = gstAmount;
    }

    // Final object to save in DB
    const finalOtherCharges = baseOtherCharges;


    const payload = {
      invoiceId,
      bookingId: invoice?.bookingId || bookingId || undefined,
      companyId: invoice?.companyId || "",
      invoiceNo: invoice?.invoiceNo || newInvoiceId,
      invoiceDate: invoiceDate || invoice?.invoiceDate,
      name: shippingAddress.name,
      phone: shippingAddress.phone,
      email: shippingAddress.email,
      serviceType: items.serviceType,
      vehicleType: items.vehicleType,
      totalKm: selectedServiceName === "Hourly Packages" ? packageDetails.distanceLimit : items.km,
      pricePerKm: selectedServiceName === "Hourly Packages" ? 0 : items.price,
      travelTime: selectedServiceName === "Hourly Packages" ? `${packageDetails.noOfHours} Hours` : items.time,
      address: shippingAddress.address,
      estimatedAmount: selectedServiceName === "Hourly Packages" ? packageDetails.price : (invoice?.estimatedAmount || items.amount),
      advanceAmount: invoice?.advanceAmount || 0,
      totalAmount: totalAmount || invoice?.totalAmount || 0,
      otherCharges: finalOtherCharges,
      paymentDetails,
      createdBy: createdBy as "Admin" | "Vendor",
      status: paymentStatus as "Partial Paid" | "Paid" | "Unpaid",
      booking: invoice?.booking || null,
      companyProfile: invoice?.companyProfile || null,
      pickup: pickupDrop.pickup || invoice?.pickup,
      drop: pickupDrop.drop || invoice?.drop,
      note: note || invoice?.note,
      GSTNumber: shippingAddress.GSTNumber || invoice?.GSTNumber,
      offerId: invoice?.offerId || null,
    };


    try {
      if (invId) {
        updateInvoice({ id: invId, data: payload }, {
          onSuccess: () => {
            toast.success("Invoice updated successfully", {
              style: { backgroundColor: "#009F7F", color: "#fff" },
            });
            setIsFormDirty(false);
            router.push(`/${createdBy === "Vendor" ? "vendor" : "admin"}/invoices/view/${invId}`);
          },
          onError: (error: any) => {
            toast.error(error?.response?.data?.message || "Error updating Invoice!", {
              style: { backgroundColor: "#FF0000", color: "#fff" },
            });
          }
        });
      } else {
        createInvoice(payload, {
          onSuccess: () => {
            toast.success("Invoice created successfully", {
              style: { backgroundColor: "#009F7F", color: "#fff" },
            });
            setIsFormDirty(false);
            router.push(`/${createdBy === "Vendor" ? "vendor" : "admin"}/invoices`);
          },
          onError: (error: any) => {
            toast.error(error?.response?.data?.message || "Error creating Invoice!", {
              style: { backgroundColor: "#FF0000", color: "#fff" },
            });
          }
        });
      }
    } catch (error) {
      console.error("Error creating invoice:", error);
      toast.error("Error creating invoice", {
        style: { backgroundColor: "#FF0000", color: "#fff" },
      });
      return;
    }

  };


  useEffect(() => {
    const hasCGST = invoice?.otherCharges?.["CGST & SGST"] !== undefined;
    const hasIGST = invoice?.otherCharges?.["IGST"] !== undefined;

    setIsCGSTSGSTSelected(hasCGST);
    setIsIGSTSelected(hasIGST);
  }, [invoice?.otherCharges]);


  const handleConfirmNavigation = () => {
    setShowUnsavedChangesDialog(false);
    setIsFormDirty(false);
    pendingNavigation();
  };

  const handleClose = () => {
    if (isFormDirty) {
      setShowUnsavedChangesDialog(true);
      setPendingNavigation(() =>
        () => router.push(`/${createdBy === "Vendor" ? "vendor" : "admin"}/invoices`)
      );
    } else {
      router.push(`/${createdBy === "Vendor" ? "vendor" : "admin"}/invoices`);
    }
  };

  return (
    <Card className="rounded-none">
      <div className="flex justify-between items-center p-6 pt-2 pb-6">
        <h2 className="text-3xl font-bold tracking-tight">
          {invoice?.invoiceId ? "Edit Invoice" : "Create New Invoice"}
        </h2>
        <Button onClick={handleClose} variant="outline">Close</Button>
      </div>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Invoice ID</Label>
            <Input type="text" readOnly value={invoiceId} />
          </div>
          <div>
            <Label>Invoice Date</Label>
            <Input type="date" value={invoiceDate} onChange={(e) => setInvoiceDate(e.target.value)} />
          </div>
        </div>
        <div className="mt-4 mb-4 grid grid-cols-2 gap-4">
          <div className="mt-1 border-gray-900">
            <Label>Payment Status</Label>
            {invoice?.status === "Paid" ? (
              <Input
                type="text"
                readOnly
                value={paymentStatus}
                className="bg-gray-100 cursor-default"
              />
            ) : (<Select
              value={paymentStatus}
              onValueChange={(value) => {
                setPaymentStatus(value);
                setBookingStatus(value);
              }}
            >
              <SelectTrigger id="paymentStatus" className="py-3 border-grey">
                <SelectValue placeholder="Select Payment Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Partial Paid">Partial Paid</SelectItem>
                <SelectItem value="Paid">Paid</SelectItem>
                <SelectItem value="Unpaid">Unpaid</SelectItem>
              </SelectContent>
            </Select>)}
          </div>
        </div>

        <div className="grid grid-cols-2 mt-4 gap-4">
          <div className="flex flex-col gap-4">
            <h2 className="font-bold">Billing Address</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Full Name</Label>
                <Input
                  type="text"
                  placeholder="Full Name"
                  value={shippingAddress?.name}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, name: e.target.value })}
                />
              </div>
              <div>
                <Label>Phone</Label>

                <Input
                  type="tel"
                  placeholder="Phone"
                  value={shippingAddress?.phone}
                  maxLength={10}
                  onChange={(e) => {
                    // Allow only numbers and optional leading +
                    let value = e.target.value.replace(/[^0-9+]/g, '');
                    // Remove leading zeros, allow optional +
                    if (value.startsWith('+')) {
                      value = '+' + value.slice(1).replace(/^0+/, '');
                    } else {
                      value = value.replace(/^0+/, '');
                    }
                    // Limit to 15 chars (E.164 max)
                    value = value.slice(0, 15);
                    setShippingAddress({ ...shippingAddress, phone: value });
                  }}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {/* <div>
                <Label>Email</Label>
                <Input
                  type="text"
                  placeholder="Email"
                  value={shippingAddress.email}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, email: e.target.value })}
                />
              </div> */}
              <div>
                <Label>GST Number</Label>
                <Input
                  type="text"
                  placeholder="GST Number"
                  value={shippingAddress.GSTNumber}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, GSTNumber: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label>Address</Label>
              <Input
                type="text"
                placeholder="Address"
                value={shippingAddress.address}
                onChange={(e) => setShippingAddress({ ...shippingAddress, address: e.target.value })}
              />
            </div>
          </div>
        </div>

        <div className="mt-4">
          <h2 className="font-bold">Services</h2>
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-4 py-2 border text-left">Service Name</th>
                <th className="px-2 py-2 border text-left">Category</th>
                <th className="px-4 py-2 border text-left">Details</th>
                <th className="px-2 py-2 border">Km</th>
                <th className="px-2 py-2 border">Price</th>
                <th className="px-4 py-2 border text-left">
                  {selectedServiceName === "Package" ? "Day / Hour" : "Time"}
                </th>
                <th className="px-2 py-2 border text-left">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr>
                <td className="px-4 py-2 border">
                  {invoice?.status === "Paid" ? (
                    <div className="text-sm text-gray-700">
                      {items.serviceType || "No Service Selected"}
                    </div>
                  ) : (
                    <Select
                      value={items.serviceType}
                      onValueChange={(value) => {
                        setSelectedServiceName(value);
                        handleItemChange("serviceType", value);

                        // Reset vehicle type when service changes
                        handleItemChange("vehicleType", "");

                        // Fetch tax percentages for the service
                        const service = services.find(s => s.name === value);
                        if (service && service.tax) {
                          console.log('Service tax values:', service.tax);
                          setServiceTaxPercentage(service.tax.GST);
                        } else {
                          console.log('No tax data found for service:', value);
                          setServiceTaxPercentage(0);
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Service" />
                      </SelectTrigger>
                      <SelectContent>
                        {services.filter(service => service.isActive).map((service: any) => (
                          <SelectItem key={service.name} value={service.name}>
                            {service.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}

                </td>
                <td className="px-2 py-2 border">
                  {invoice?.status === "Paid" ? (
                    <div className="text-sm text-gray-700">
                      {items.vehicleType || "No Vehicle Type Selected"}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {selectedServiceName === "Hourly Packages" ? (
                        <>
                          <div>
                            <Label className="text-xs text-gray-600">Package Selection</Label>
                            <Select
                              value={selectedPackageId}
                              onValueChange={(value) => {
                                const selectedPackage = allPkgTariffs.find(pkg => pkg.packageId === value);
                                setSelectedPackageId(value);
                                setPackageDetails({
                                  noOfHours: selectedPackage?.noOfHours || "",
                                  distanceLimit: selectedPackage?.distanceLimit || 0,
                                  price: selectedPackage?.price || 0,
                                  extraPrice: selectedPackage?.extraPrice || 0
                                });
                                // Reset vehicle type when package changes
                                handleItemChange("vehicleType", "");
                                // Update amount based on package price
                                handleItemChange("amount", selectedPackage?.price || 0);
                                // Update time field with hours
                                handleItemChange("time", selectedPackage?.noOfHours ? `${selectedPackage.noOfHours} Hours` : "");
                                // Update km field with package distance limit
                                handleItemChange("km", selectedPackage?.distanceLimit || 0);
                              }}
                            >
                              <SelectTrigger className="h-8 text-xs">
                                <SelectValue placeholder="Select Package" />
                              </SelectTrigger>
                              <SelectContent>
                                {allPkgTariffs
                                  .filter((pkg, index, self) =>
                                    // Remove duplicates based on hours and distance only
                                    index === self.findIndex(p =>
                                      p.noOfHours === pkg.noOfHours &&
                                      p.distanceLimit === pkg.distanceLimit &&
                                      p.status === true &&
                                      p.createdBy === 'Admin'
                                    )
                                  )
                                  .map(pkg => (
                                    <SelectItem key={pkg.packageId} value={pkg.packageId}>
                                      {pkg.noOfHours} {Number(pkg.noOfHours) > 1 ? "Hours" : "Hour"} {pkg.distanceLimit} Km - ₹{pkg.price}
                                    </SelectItem>
                                  ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label className="text-xs text-gray-600">Vehicle Type</Label>
                            <Select
                              value={items.vehicleType}
                              onValueChange={(value) => handleItemChange("vehicleType", value)}
                            >
                              <SelectTrigger className="h-8 text-xs">
                                <SelectValue placeholder="Select Vehicle Type" />
                              </SelectTrigger>
                              <SelectContent>
                                {getAvailableVehicleTypes().map((vehicleType: string, index: number) => (
                                  <SelectItem key={vehicleType} value={vehicleType}>
                                    {vehicleType}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </>
                      ) : (
                        <Select
                          value={items.vehicleType}
                          onValueChange={(value) => handleItemChange("vehicleType", value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select Vehicle Type" />
                          </SelectTrigger>
                          <SelectContent>
                            {getAvailableVehicleTypes().map((vehicleType: string, index: number) => (
                              <SelectItem key={vehicleType} value={vehicleType}>
                                {vehicleType}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                  )}
                </td>
                {
                  selectedServiceName !== "Package" && selectedServiceName !== "Hourly Packages" &&
                  <td className="px-4 py-2 border">
                    {invoice?.status === "Paid" ? (
                      <div className="text-sm text-gray-700">
                        {items.details || "No Details"}
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <LocationAutocomplete
                          onSelect={handlePickupChange}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => handlePickupChange(e.target.value)}
                          getValue={pickupDrop.pickup}
                          placeholder="Pickup Location"
                        />
                        <LocationAutocomplete
                          onSelect={handleDropChange}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleDropChange(e.target.value)}
                          getValue={pickupDrop.drop}
                          placeholder="Drop Location"
                        />
                      </div>
                    )}
                  </td>
                }
                {
                  selectedServiceName === "Hourly Packages" &&
                  <td className="px-4 py-2 border">
                    {invoice?.status === "Paid" ? (
                      <div className="text-sm text-gray-700">
                        {items.details || "No Details"}
                      </div>
                    ) : (
                      <div>
                        <LocationAutocomplete
                          onSelect={handlePickupChange}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => handlePickupChange(e.target.value)}
                          getValue={pickupDrop.pickup}
                          placeholder="Pickup Location"
                        />
                      </div>
                    )}
                  </td>
                }
                {
                  selectedServiceName === "Package" &&
                  <td className="px-4 py-2 border">
                    <Input
                      className="border-none shadow-none"
                      placeholder="Pickup - Drop"
                      readOnly={invoice?.status === "Paid"}
                      value={items.details.split("-")[0] || ""}
                      onChange={(e) => handleItemChange("details", e.target.value)}
                      onBlur={(e) => {
                        const newPickup = e.target.value;
                        setPickupDrop({ pickup: newPickup, drop: "" });
                      }}
                    />
                  </td>
                }
                <td className="px-2 py-2 border">
                  {invoice?.status === "Paid" ? (
                    <div className="text-sm text-gray-700">
                      {selectedServiceName === "Hourly Packages" ? packageDetails.distanceLimit : items.km || 0} km
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Input
                        className="appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none border-none shadow-none"
                        type="text"
                        placeholder="Km"
                        readOnly={selectedServiceName === "Hourly Packages" || isCalculatingDistance}
                        value={selectedServiceName === "Hourly Packages" ? packageDetails.distanceLimit : items.km || 0}
                        onChange={(e) => {
                          if (selectedServiceName !== "Hourly Packages") {
                            // Allow only numeric input
                            const numericValue = e.target.value.replace(/[^0-9]/g, '');
                            // Update state with 0 if empty
                            handleItemChange("km", numericValue ? Number(numericValue) : 0);
                          }
                        }}
                      />
                      {isCalculatingDistance && (
                        <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                      )}
                    </div>
                  )}
                </td>
                <td className="px-2 py-2 border">
                  {paymentStatus === "Paid" ? (
                    <div className="text-sm text-gray-700">
                      ₹{selectedServiceName === "Hourly Packages" ? "Package Price" : items.price || 0}
                    </div>
                  ) : (
                    <Input
                      className={`${selectedServiceName === "Hourly Packages" ? "cursor-not-allowed bg-gray-50" : ""
                        }`}
                      type="text"
                      placeholder={selectedServiceName === "Hourly Packages" ? "Package Price" : "Price per km"}
                      readOnly={selectedServiceName === "Hourly Packages"}
                      value={selectedServiceName === "Hourly Packages" ? "Package Price" : items.price || 0}
                      onChange={(e) => {
                        if (selectedServiceName !== "Hourly Packages") {
                          // Allow only numeric input
                          const numericValue = e.target.value.replace(/[^0-9]/g, '');
                          // Update state with 0 if empty
                          handleItemChange("price", numericValue ? Number(numericValue) : 0);
                        }
                      }}
                    />
                  )}
                </td>
                <td className="px-4 py-2 border">
                  {invoice?.status === "Paid" ? (
                    <div className="text-sm text-gray-700">
                      {selectedServiceName === "Hourly Packages" ?
                        (packageDetails.noOfHours ? `${packageDetails.noOfHours} Hours` : "No duration") :
                        (items.time || "No duration")
                      }
                    </div>
                  ) : (
                    <Input
                      type="text"
                      readOnly={selectedServiceName === "Hourly Packages" || isCalculatingDistance}
                      placeholder={selectedServiceName === "Package" ? "Day / Hour" : selectedServiceName === "Hourly Packages" ? "Package Duration" : "Duration"}
                      value={selectedServiceName === "Hourly Packages" ?
                        (packageDetails.noOfHours ? `${packageDetails.noOfHours} Hours` : "") :
                        (items.time || "")
                      }
                      onChange={(e) => {
                        if (selectedServiceName !== "Hourly Packages") {
                          handleItemChange("time", e.target.value);
                        }
                      }}
                    />
                  )}
                </td>
                <td className="px-2 py-2 border">
                  {invoice?.status === "Paid" ? (
                    <div className="text-sm text-gray-700 font-semibold">
                      ₹{selectedServiceName === "Hourly Packages" ? packageDetails.price : items.amount || 0}
                    </div>
                  ) : (
                    <Input
                      className="appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none border-none shadow-none cursor-not-allowed bg-gray-50"
                      type="text"
                      readOnly
                      placeholder="Amount"
                      value={`₹${selectedServiceName === "Hourly Packages" ? packageDetails.price : items.amount || 0}`}
                    />
                  )}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="mt-6 flex justify-end">
          <div className="flex flex-col gap-2">
            <h2 className="font-bold">Charges</h2>

            {/* Fixed Tax Charges with Checkboxes */}
            <div className="flex flex-col gap-2 items-end">
              {taxCharges.filter(charge => charge.isFixed).map((charge, index) => {
                const isSelected = charge.label === "CGST & SGST" ? isCGSTSGSTSelected : isIGSTSelected;
                let taxValue = 0;

                if (isSelected) {
                  if (charge.label === "CGST & SGST") {
                    // CGST + SGST = (CGST% + SGST%) of amount
                    console.log("CGST & SGST >> ",serviceTaxPercentage);
                    const totalPercentage = Number(serviceTaxPercentage);
                    taxValue = (items.amount * totalPercentage / 100);
                  } else if (charge.label === "IGST") {
                    // IGST = IGST% of amount
                    taxValue = (items.amount * Number(serviceTaxPercentage) / 100);
                  }
                }

                return (
                  <div key={index} className="flex flex-row gap-2 items-center">
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() =>
                        handleTaxSelection(charge.label as "CGST & SGST" | "IGST")
                      }
                    />

                    <Input
                      type="text"
                      value={`${charge.label}`}
                      readOnly
                      className="w-40 bg-white border border-gray-300 text-gray-600"
                    />
                    <Input
                      type="number"
                      className="w-32 appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      value={taxValue || ""}
                      readOnly
                    />
                  </div>
                );
              })}
            </div>

            {/* Other Charges */}
            <div className="flex flex-col gap-2 items-end">
              {OtherCharges.map((charge, index) => (
                <div key={index} className="flex flex-row gap-2 items-center">
                  <Input
                    type="text"
                    value={charge.label}
                    readOnly={invoice?.status === "Paid"}
                    className="w-32 bg-white border border-gray-300 text-gray-600"
                  />
                  <Input
                    type="number"
                    className="w-32 appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    value={charge.value || ""}
                    readOnly={invoice?.status === "Paid"}
                  />
                </div>
              ))}
            </div>

            {/* Dynamic Custom Charges */}
            <div className="flex flex-col gap-2 items-end">
              {customCharges.map((charge, index) => {
                return (
                  <div key={index} className="flex flex-row gap-2 items-end">
                    <Button
                      variant="destructive"
                      className="w-10"
                      onClick={() => removeCustomCharge(index)}
                    >✖</Button>
                    <Input
                      type="text"
                      placeholder="Charge Label"
                      value={charge.label}
                      onChange={(e) => {
                        const filteredValue = e.target.value.replace(/[^A-Za-z\s]/g, "");
                        handleChargeChange(index, "label", filteredValue);
                      }}
                      className="w-32 bg-white border border-gray-300 text-gray-600"
                    />
                    <Input
                      type="number"
                      className="w-32 appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      value={charge.value || ""}
                      onChange={(e) => handleChargeChange(index, "value", e.target.value)}
                    />
                  </div>
                );
              })}
            </div>

            <div className="flex flex-col gap-2 items-end">
              <div className="flex flex-row gap-2 items-end">
                <Button
                  variant="destructive"
                  className="bg-[#009F7F] hover:bg-[#009F7F] w-10"
                  onClick={addCustomCharge}
                >
                  <PlusIcon />
                </Button>
                <Input hidden className="w-32 invisible" />
                <Input
                  hidden
                  className="invisible w-32 appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2 items-end">
              <div className="flex flex-row gap-2 items-center">
                <Label className="ml-12">Base Amount</Label>
                <Input
                  type="text"
                  placeholder="Base Amount"
                  className="w-32"
                  value={`₹${items.amount || 0}`}
                  readOnly
                />
              </div>
              <div className="flex flex-row gap-2 items-center">
                <Label className="ml-12">Tax Amount</Label>
                <Input
                  type="text"
                  placeholder="Tax Amount"
                  className="w-32"
                  value={`₹${(() => {
                    let taxAmount = 0;
                    if (isCGSTSGSTSelected) {
                      const totalPercentage = Number(serviceTaxPercentage);
                      taxAmount = Math.ceil(items.amount * totalPercentage / 100);
                    } else if (isIGSTSelected) {
                      taxAmount = Math.ceil(items.amount * Number(serviceTaxPercentage) / 100);
                    }
                    return taxAmount;
                  })()}`}
                  readOnly
                />
              </div>
              <div className="flex flex-row gap-2 items-center">
                <Label className="ml-12 font-bold">Total Amount</Label>
                <Input
                  type="text"
                  placeholder="Total Amount"
                  className="w-32 font-bold"
                  value={`₹${totalAmount}`}
                  readOnly
                />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <div className="mt-4 flex flex-col gap-4">
            <h2 className="font-bold">Payment Details</h2>
            <div className="p-4 border rounded bg-gray-50">
              <Textarea
                placeholder="Payment Details"
                rows={6}
                className="resize-none"
                value={paymentDetails}
                onChange={(e) => setPaymentDetails(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div>
          <div className="mt-4 p-4 border rounded bg-gray-50">
            <Textarea
              placeholder="Note"
              rows={4}
              className="resize-none"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>
        </div>

        <div className="flex gap-4 mt-4">
          <Button onClick={() => handleCreateInvoice()}>Save</Button>
        </div>
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
            <AlertDialogAction onClick={handleConfirmNavigation}>Leave</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
