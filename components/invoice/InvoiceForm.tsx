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
  const [paymentStatus, setPaymentStatus] = useState("Unpaid");
  const [bookingStatus, setBookingStatus] = useState("Unpaid");
  const [paymentDetails, setPaymentDetails] = useState("");
  const [note, setNote] = useState("");


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

      setItems({
        serviceType: invoice?.serviceType || "",
        vehicleType: invoice?.vehicleType || "",
        details: `${invoice?.pickup} to ${invoice?.drop}` || "",
        km: invoice?.totalKm || 0,
        price: invoice?.pricePerKm || 0,
        time: invoice?.travelTime || "",
        amount: invoice?.estimatedAmount || 0,
      })

      // console.log("invoice >>>", invoice);

      setPaymentDetails(invoice?.paymentDetails || "");
      setNote(invoice?.note || "");
      setPaymentStatus(invoice?.status || "Unpaid");
      setInvoiceDate(invoice?.invoiceDate.split("T")[0] || new Date().toISOString().split("T")[0]);

      if (invoice?.otherCharges) {

        const taxValue =
          invoice?.otherCharges?.["CGST & SGST"] ??
          invoice?.otherCharges?.["IGST"] ??
          0;

        setTaxCharges((prev) => {
          return prev.map((charge) => ({
            ...charge,
            value: taxValue,
          }));
        });


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
    return (invoice?.totalAmount || 0) + customTotal;
  }, [customCharges, invoice]);




  const handleCreateInvoice = () => {


    const customChargeEntries = customCharges.map((c) => [c.label, c.value]);

    const baseOtherCharges = {
      ...Object.fromEntries(OtherCharges.map(c => [c.label, Number(c.value)])),
      ...Object.fromEntries(customChargeEntries),
    };

    // Step 2: Remove any GST from base charges
    delete baseOtherCharges["CGST & SGST"];
    delete baseOtherCharges["IGST"];

    // Step 3: Add only the selected GST
    if (isCGSTSGSTSelected) {
      const gstValue = taxCharges.find(charge => charge.label === "CGST & SGST")?.value || 0;
      baseOtherCharges["CGST & SGST"] = gstValue;
    } else if (isIGSTSelected) {
      const gstValue = taxCharges.find(charge => charge.label === "IGST")?.value || 0;
      baseOtherCharges["IGST"] = gstValue;
    }

    // Final object to save in DB
    const finalOtherCharges = baseOtherCharges;


    const payload = {
      invoiceId,
      bookingId: invoice?.bookingId || bookingId || "",
      companyId: invoice?.companyId || "",
      invoiceNo: invoice?.invoiceNo || newInvoiceId,
      invoiceDate: invoiceDate || invoice?.invoiceDate,
      name: shippingAddress.name,
      phone: shippingAddress.phone,
      email: shippingAddress.email,
      serviceType: items.serviceType,
      vehicleType: items.vehicleType,
      totalKm: items.km,
      pricePerKm: items.price,
      travelTime: items.time,
      address: shippingAddress.address,
      estimatedAmount: invoice?.estimatedAmount || items.amount,
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
          {invoiceId ? "Edit Invoice" : "Create New Invoice"}
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
            {paymentStatus === "Paid" ? (
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
              <div>
                <Label>Email</Label>
                <Input
                  type="text"
                  placeholder="Email"
                  value={shippingAddress.email}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, email: e.target.value })}
                />
              </div>
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
                  {paymentStatus === "Paid" ? (
                    <div className="text-sm text-gray-700">
                      {items.serviceType || "No Service Selected"}
                    </div>
                  ) : (
                    <Select
                      value={items.serviceType}
                      onValueChange={(value) => handleItemChange("serviceType", value)}
                    >
                      <SelectTrigger className="border-none shadow-none">
                        <SelectValue placeholder="Select Service" />
                      </SelectTrigger>
                      <SelectContent>
                        {services.map((service: any) => (
                          <SelectItem key={service.name} value={service.name}>
                            {service.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}

                </td>
                <td className="px-2 py-2 border">
                  <Input
                    type="text"
                    readOnly={paymentStatus === "Paid"}
                    className="border-none shadow-none"
                    placeholder="Vehicle Category"
                    value={items.vehicleType || ""}
                    onChange={(e) => handleItemChange("vehicleType", e.target.value)}
                  />
                </td>
                {
                  selectedServiceName !== "Package" &&
                  <td className="px-4 py-2 border">
                    <Input
                      className="border-none shadow-none"
                      placeholder="Pickup - Drop"
                      readOnly={paymentStatus === "Paid"}
                      value={items.details || ""}
                      onBlur={(e) => {
                        const value = e.target.value;

                        // Update the item details when input loses focus
                        handleItemChange("details", value);

                        // Parse and set pickup/drop if "-" is present
                        if (value.includes("-")) {
                          const [newPickup, newDrop] = value.split("-").map((s) => s.trim());
                          setPickupDrop({ pickup: newPickup, drop: newDrop });
                        }
                      }}
                    />

                  </td>
                }
                {
                  selectedServiceName === "Package" &&
                  <td className="px-4 py-2 border">
                    <Input
                      className="border-none shadow-none"
                      placeholder="Pickup - Drop"
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
                  <Input
                    className="appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none border-none shadow-none"
                    type="text"
                    placeholder="Km"
                    readOnly={paymentStatus === "Paid"}
                    value={items.km || 0}
                    onBlur={(e) => {
                      const numericValue = e.target.value.replace(/[^0-9]/g, '')
                      handleItemChange("km", Number(numericValue))
                    }}
                  />
                </td>
                <td className="px-2 py-2 border">
                  <Input
                    className="appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none border-none shadow-none"
                    type="text"
                    placeholder="Price"
                    readOnly={paymentStatus === "Paid"}
                    value={items.price || 0}
                    onBlur={(e) => {
                      const numericValue = e.target.value.replace(/[^0-9]/g, '')
                      handleItemChange("price", Number(numericValue))
                    }}
                  />
                </td>
                <td className="px-4 py-2 border">
                  <Input
                    type="text"
                    className="border-none shadow-none"
                    readOnly={paymentStatus === "Paid"}
                    placeholder={selectedServiceName === "Package" ? "Day / Hour" : "Time"}
                    value={items.time || ""}
                    onChange={(e) => handleItemChange("time", e.target.value)}
                  />
                </td>
                <td className="px-2 py-2 border">
                  <Input
                    className="appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none border-none shadow-none"
                    type="text"
                    readOnly={paymentStatus === "Paid"}
                    placeholder="Amount"
                    value={items.amount || 0}
                  />
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
              {taxCharges.filter(charge => charge.isFixed).map((charge, index) => (
                <div key={index} className="flex flex-row gap-2 items-center">
                      <Checkbox
                    checked={
                      charge.label === "CGST & SGST" ? isCGSTSGSTSelected : isIGSTSelected
                    }
                    onCheckedChange={() =>
                      handleTaxSelection(charge.label as "CGST & SGST" | "IGST")
                    }
                  />

                  <Input
                    type="text"
                    value={charge.label}
                    readOnly
                    className="w-32 bg-white border border-gray-300 text-gray-600"
                  />
                  <Input
                    type="number"
                    className="w-32 appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    value={charge.value || ""}
                    readOnly
                  />
                </div>
              ))}
            </div>

            {/* Other Charges */}
            <div className="flex flex-col gap-2 items-end">
              {OtherCharges.map((charge, index) => (
                <div key={index} className="flex flex-row gap-2 items-center">
                  <Input
                    type="text"
                    value={charge.label}
                    readOnly
                    className="w-32 bg-white border border-gray-300 text-gray-600"
                  />
                  <Input
                    type="number"
                    className="w-32 appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    value={charge.value || ""}
                    readOnly
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

            <div className="flex flex-row gap-2 items-center">
              <Label className="ml-12">Total Amount</Label>
              <Input
                type="text"
                placeholder="Total Amount"
                className="w-32"
                value={totalAmount}
                readOnly
              />
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