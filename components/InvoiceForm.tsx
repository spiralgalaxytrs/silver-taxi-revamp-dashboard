import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useSearchParams } from 'next/navigation';
import { Input } from "components/ui/input";
import { Card, CardContent } from "components/ui/card";
import { Button } from "components/ui/button";
import { Label } from "components/ui/label";
import { Textarea } from "./ui/textarea";
import { PlusIcon } from "lucide-react";
import { customAlphabet, nanoid } from 'nanoid';
import { useInvoiceStore } from "../stores/invoiceStore";
import { useBookingStore } from "../stores/bookingStore";
import { useServiceStore } from "stores/serviceStore";
import { useOfferStore } from "stores/offerStore";
import axios from "axios";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from "./ui/select";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
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
  service: string;
  vehicleType: string;
  details: string;
  km: number;
  price: number;
  time: string;
  amount: number;
  finalAmount: number;
}

interface StaticCharges {
  discount: number;
  advanceAmount: number;
  driverBeta: number;
  toll: number;
  hill: number;
  permitCharge: number;
}

interface Charge {
  label: string;
  value: number;
  isFixed?: boolean;
}

interface Offer {
  offerId?: string;
  type: "Percentage" | "Flat";
  value: number;
  category: string;
  status: boolean;
}

interface InvoiceFormProps {
  invId?: string;
  createdBy: string;
  bookingid?: string;
}

export default function InvoiceForm({ invId, createdBy, bookingid }: InvoiceFormProps) {
  const router = useRouter();
  const [selectedServiceName, setSelectedServiceName] = useState("");
  const [invoiceId, setInvoiceId] = useState("");
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split("T")[0]);
  const [bookingId, setBookingId] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("");
  const [bookingStatus, setBookingStatus] = useState("");
  const [shippingAddress, setShippingAddress] = useState({
    name: "",
    address: "",
    phone: "",
    email: "",
    GSTNumber: ""
  });
  const [items, setItems] = useState<InvoiceItem[]>([
    { service: "", vehicleType: "", details: "", km: 0, price: 0, time: "", amount: 0, finalAmount: 0 }
  ]);
  const [charges, setCharges] = useState<Charge[]>([
    { label: "CGST & SGST", value: 0, isFixed: true },
    { label: "IGST", value: 0, isFixed: true }
  ]);
  const [staticCharges, setStaticCharges] = useState<StaticCharges>({
    discount: 0,
    advanceAmount: 0,
    driverBeta: 0,
    toll: 0,
    hill: 0,
    permitCharge: 0,
  });
  const [isTollFilled, setIsTollFilled] = useState(false);
  const [isHillFilled, setIsHillFilled] = useState(false);
  const [isPermitChargeFilled, setIsPermitChargeFilled] = useState(false);
  const [isDiscountPrefilled, setIsDiscountPrefilled] = useState(false);
  const [isAdvanceFilled, setIsAdvanceFilled] = useState(false);
  const [isDriverBetaPrefilled, setIsDriverBetaPrefilled] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);
  const [isOfferPrefilled, setIsOfferPrefilled] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState("");
  const [note, setNote] = useState("");
  const [totalAmount, setTotalAmount] = useState(0);
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null);
  const { createInvoice, updateInvoice, invoices, fetchInvoices } = useInvoiceStore();
  const { fetchBookingById, fetchBookings, bookings } = useBookingStore();
  const { fetchServices, services } = useServiceStore();
  const { fetchOffers, offers } = useOfferStore();
  const [isFormDirty, setIsFormDirty] = useState(false);
  const [showUnsavedChangesDialog, setShowUnsavedChangesDialog] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<() => void>(() => { });
  const searchParams = useSearchParams();
  const bookingIdFromUrl = searchParams.get('bookingId');
  const [loadingBooking, setLoadingBooking] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [bookingIdInput, setBookingIdInput] = useState("");
  const [pickupDrop, setPickupDrop] = useState({ pickup: "", drop: "" });
  const [km, setKm] = useState({ km: 0 });
  const [isCGSTSGSTSelected, setIsCGSTSGSTSelected] = useState(true);
  const [isIGSTSelected, setIsIGSTSelected] = useState(false);
  const [offerAmount, setOfferAmount] = useState(0);
  const [isDiscountApplied, setIsDiscountApplied] = useState(false); // Initially true

  useEffect(() => {
    if (bookingIdFromUrl) {
      setBookingId(bookingIdFromUrl);
      setBookingIdInput(bookingIdFromUrl);
    }
  }, [bookingIdFromUrl]);

  useEffect(() => {
    fetchServices();
    fetchOffers();
    fetchInvoices();
  }, [fetchServices, fetchOffers, fetchInvoices]);

  

  // Fetch invoice data if invoiceId is provided (Edit mode)
  useEffect(() => {
    if (invId) {
      const invoice = invoices.find((inv: any) => inv.invoiceId === invId);
      if (invoice) {
        setInvoiceId(invoice.invoiceNo || "");
        setInvoiceDate(invoice.invoiceDate.split("T")[0]);
        setBookingId(invoice.bookingId || "");
        setBookingIdInput(invoice.bookingId || "");
        setPaymentStatus(invoice.status || "");
        setShippingAddress({
          name: invoice.name || "",
          address: invoice.address || "",
          phone: invoice.phone || "",
          email: invoice.email || "",
          GSTNumber: invoice.GSTNumber || ""
        });
        setItems([{
          service: invoice.serviceType || "",
          vehicleType: invoice.vehicleType || "",
          details: `${invoice.pickup || ""} - ${invoice.drop || ""}`,
          km: invoice.totalKm || 0,
          price: invoice.pricePerKm || 0,
          time: invoice.travelTime || "",
          amount: invoice.totalAmount || 0,
          finalAmount: invoice.totalAmount || 0
        }]);
        setSelectedServiceName(invoice.serviceType || "");
        const otherCharges = invoice.otherCharges || {};
        setCharges([
          { label: "CGST & SGST", value: otherCharges["CGST & SGST"] || 0, isFixed: true },
          { label: "IGST", value: otherCharges["IGST"] || 0, isFixed: true },
          ...Object.entries(otherCharges)
            .filter(([key]) => !["CGST & SGST", "IGST", "Toll Charges", "Hill Charges", "Permit Charges", "Advance Amount", "Driver Betta", "Discount"].includes(key))
            .map(([label, value]) => ({ label, value: Number(value), isFixed: false }))
        ]);
        setStaticCharges({
          toll: otherCharges["Toll Charges"] || 0,
          hill: otherCharges["Hill Charges"] || 0,
          permitCharge: otherCharges["Permit Charges"] || 0,
          advanceAmount: otherCharges["Advance Amount"] || 0,
          driverBeta: otherCharges["Driver Betta"] || 0,
          discount: otherCharges["Discount"] || 0
        });
        setIsTollFilled(!!otherCharges["Toll Charges"]);
        setIsHillFilled(!!otherCharges["Hill Charges"]);
        setIsPermitChargeFilled(!!otherCharges["Permit Charges"]);
        setIsAdvanceFilled(!!otherCharges["Advance Amount"]);
        setIsDriverBetaPrefilled(!!otherCharges["Driver Betta"]);
        setIsDiscountPrefilled(!!otherCharges["Discount"]);
        setIsCGSTSGSTSelected(!!otherCharges["CGST & SGST"]);
        setIsIGSTSelected(!!otherCharges["IGST"]);
        if (invoice.offerId) {
          const offer = offers.find((o: any) => o.offerId === invoice.offerId);
          setSelectedOffer(offer || null);
          setIsOfferPrefilled(true);
          setOfferAmount(otherCharges["Discount"] || 0);
        }
        setPaymentDetails(invoice.paymentDetails || "");
        setNote(invoice.note || "");
        setTotalAmount(invoice.totalAmount || 0);
        setPickupDrop({ pickup: invoice.pickup || "", drop: invoice.drop || "" });
      }
    } else {
      // Generate new invoice ID for create mode
      const date = new Date();
      const year = date.getFullYear();
      const month = date.getMonth();
      const day = date.getDate();
      const nanoid = customAlphabet('0123456789', 4);
      const uniqueId = nanoid();
      const newInvoiceId = `INV-${year}${month + 1}${day}${uniqueId}`;
      setInvoiceId(newInvoiceId);
    }
  }, [invId, invoices, offers]);

  const handleItemChange = (index: number, field: keyof InvoiceItem, value: string | number) => {
    setItems((prevItems) => {
      const newItems = [...prevItems];
      newItems[index] = { ...newItems[index], [field]: value };
      if (field === "km" || field === "price") {
        newItems[index].amount = Number(newItems[index].km) * Number(newItems[index].price);
      }
      return newItems;
    });
    if (field === "details") {
      // if (typingTimeout) clearTimeout(typingTimeout);
      // const timeout = setTimeout(() => {
      //   fetchDistance(index, value as string);
      // }, 800);
      // setTypingTimeout(timeout);
    }
    if (field === "service") {
      setSelectedServiceName(value as string);
      handleServiceBasedOffer(value as string); // Check for offers based on service
    }
    setIsFormDirty(true);
  };

  // const fetchDistance = async (index: number, details: string) => {
  //   const [from, to] = details.split("-").map((part) => part.trim());
  //   if (!from || !to) return;
  //   try {
  //     const response = await axios.get(`/api/findDistance?origin=${from}&destination=${to}`);
  //     setItems((prevItems) => {
  //       const newItems = [...prevItems];
  //       newItems[index].km = response.data.distance;
  //       newItems[index].time = response.data.duration;
  //       newItems[index].amount = newItems[index].km * newItems[index].price;
  //       return newItems;
  //     });
  //   } catch (error) {
  //     console.error("Error fetching distance:", error);
  //   }
  // };

  const handleChargeChange = (index: number, field: "label" | "value", value: string | number) => {
    setCharges((prevCharges) => {
      const newCharges = [...prevCharges];
      if (!newCharges[index].isFixed) {
        newCharges[index] = {
          ...newCharges[index],
          [field]: field === "value" ? Number(value) : String(value)
        };
      }
      return newCharges;
    });
    setIsFormDirty(true);
  };

  const handleStaticChargeChange = (field: keyof StaticCharges, value: string) => {
    const numValue = value === "" ? 0 : Number(value);
    if (isNaN(numValue) || numValue < 0) return;
    setStaticCharges((prev) => ({
      ...prev,
      [field]: numValue,
    }));
    setIsFormDirty(true);
  };

  const addCustomCharge = () => {
    setCharges(prevCharges => [...prevCharges, { label: "", value: 0 }]);
    setIsFormDirty(true);
  };

  const removeCustomCharge = (index: number) => {
    setCharges(prevCharges => prevCharges.filter((_, i) => i !== index));
    setIsFormDirty(true);
  };

  const handleTaxSelection = (type: "CGST & SGST" | "IGST") => {
    if (type === "CGST & SGST") {
      setIsCGSTSGSTSelected(!isCGSTSGSTSelected);
      setIsIGSTSelected(false);
    } else {
      setIsIGSTSelected(!isIGSTSelected);
      setIsCGSTSGSTSelected(false);
    }
    setIsFormDirty(true);
  };

  // useEffect(() => {
  //   const handleCreateInvoiceId = () => {
  //     const date = new Date();
  //     const year = date.getFullYear();
  //     const month = date.getMonth();
  //     const day = date.getDate();
  //     const nanoid = customAlphabet('0123456789', 4); // Only numbers, length 4
  //     const uniqueId = nanoid();
  //     const invoiceId = `INV-${year}${month + 1}${day}${uniqueId}`;
  //     setInvoiceId(invoiceId);
  //   };
  //   handleCreateInvoiceId();
  // }, []);

  const fetchBookingDetails = async (bookingId: string) => {
    setLoadingBooking(true);
    setBookingError(null);

    await fetchBookings();
    if (bookings.length > 0) {
      const booking = bookings.filter((b: any) => b.bookingId === bookingId);
       setBookingStatus(booking[0].paymentStatus);
      // console.log("Status", booking);
      booking.forEach((b: any) => {
      // Check if invoice already has name, email, phone (from edit mode)
      if (
        !shippingAddress.name &&
        !shippingAddress.email &&
        !shippingAddress.phone
      ) {
        setShippingAddress({
        ...shippingAddress,
        name: b.name || "",
        phone: b.phone || "",
        email: b.email || "",
        });
      }
      setPickupDrop({
        pickup: b.pickup || "",
        drop: b.drop || "",
      });
      setSelectedServiceName(b.serviceType as string);

      setKm({ km: b.distance || 0 });

      const newDetails = `${b.pickup || ""} - ${b.drop || ""}`;
      setItems((prevItems) => {
        const newItems = [...prevItems];
        if (newItems.length > 0) {
        newItems[0] = {
          ...newItems[0],
          details: newDetails,
          service: b.serviceType || "",
          vehicleType: b.vehicles?.type || "",
          km: b.distance || 0,
          price: b.pricePerKm || 0,
          amount: b.estimatedAmount || 0,
          finalAmount: b.finalAmount || 0,
          time: b.duration || ""
        };
        }
        return newItems;
      });

      // Only set static charges if they are not 0
      const staticChargesData = {
        discount: b.discountAmount || 0,
        advanceAmount: b.advanceAmount || 0,
        driverBeta: b.driverBeta || 0,
        toll: b.toll || 0,
        hill: b.hill || 0,
        permitCharge: b.permitCharge || 0,
      };
      setStaticCharges(staticChargesData);

      setIsDiscountPrefilled(!!b.discountAmount);
      setIsDriverBetaPrefilled(!!b.driverBeta);
      setIsAdvanceFilled(!!b.advanceAmount);
      setIsTollFilled(!!b.toll);
      setIsHillFilled(!!b.hill);
      setIsPermitChargeFilled(!!b.permitCharge);

      if (b.offerId) {
        const offer = offers.find((o: any) => o.offerId === b.offerId);
        if (offer) {
        setSelectedOffer(offer);
        setIsOfferPrefilled(true);
        if (offer.type === "Flat") {
          setOfferAmount(offer.value);
        } else if (offer?.type === "Percentage") {
          const itemTotal = items[0].amount || 0;
          const discountAmount = (itemTotal * offer.value) / 100;
          setOfferAmount(discountAmount);
        }
        }
      } else {
        handleServiceBasedOffer(b.serviceType || "");
      }
      // setTimeout(() => fetchDistance(0, newDetails), 0);
      });
    }
    setLoadingBooking(false);
  };

  const handleBookingIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setBookingIdInput(value);
    if (typingTimeout) clearTimeout(typingTimeout);
    const timeout = setTimeout(() => {
      setBookingId(value.trim());
    }, 800);
    setTypingTimeout(timeout);
    setIsFormDirty(true);
  };

  useEffect(() => {
    if (bookingId) {
      fetchBookingDetails(bookingId);
    }
  }, [bookingId]);

  // Function to handle offers based on service type
  const handleServiceBasedOffer = (serviceName: string) => {
    if (!bookingId || !bookings.some((b: any) => b.bookingId === bookingId) || !isOfferPrefilled) {
      const activeOffer = offers.find((o: any) => o.category === serviceName && o.status);
      if (activeOffer) {
        setSelectedOffer(activeOffer);
        setIsOfferPrefilled(false); // Editable since it's not from booking
        if (activeOffer?.type === "Flat") {
          setOfferAmount(activeOffer.value);
        } else if (activeOffer?.type === "Percentage") {
          const itemTotal = items[0].amount || 0;
          const discountAmount = (itemTotal * activeOffer.value) / 100;
          setOfferAmount(discountAmount);
        }
      } else {
        setSelectedOffer(null);
        setOfferAmount(0);
      }
    }
  };

  useEffect(() => {
    const selectedService = services.find((s: any) => s.name === items[0].service);
    if (selectedService) {
      const baseAmount = items[0].amount || 0;
      const cgst = (baseAmount || 0) * (selectedService.tax.CGST / 100);
      const sgst = (baseAmount || 0) * (selectedService.tax.SGST / 100);
      const igst = (baseAmount || 0) * (selectedService.tax.IGST / 100);

      setCharges((prevCharges) => {
        const newCharges = [...prevCharges];
        const cgstSgstIndex = newCharges.findIndex(c => c.label === "CGST & SGST");
        const igstIndex = newCharges.findIndex(c => c.label === "IGST");
        if (cgstSgstIndex !== -1) newCharges[cgstSgstIndex].value = parseFloat((cgst + sgst).toFixed(2));
        if (igstIndex !== -1) newCharges[igstIndex].value = parseFloat(igst.toFixed(2));
        return newCharges;
      });
    }
  }, [items, services]);

  // Effect for calculating total amount with offer discount
  useEffect(() => {
    const itemTotal = items.reduce((acc, item) => acc + (item.finalAmount || 0), 0);
    const dynamicChargesTotal = charges
      .filter(charge => !charge.isFixed)
      .reduce((acc, charge) => acc + Number(charge.value || 0), 0);

    // Recalculate offer amount if not prefilled from booking and discount is applied
    if (selectedOffer && !isOfferPrefilled) {
      if (selectedOffer?.type === "Flat") {
        setOfferAmount(selectedOffer.value);
      } else if (selectedOffer?.type === "Percentage") {
        const discountAmount = (itemTotal * selectedOffer.value) / 100;
        setOfferAmount(discountAmount);
      }
    }

    const discountToApply = isDiscountApplied ? offerAmount : 0;
    // const staticChargesTotal = staticCharges.hill + staticCharges.toll+ staticCharges.permitCharge +staticCharges.driverBeta - staticCharges.advanceAmount - discountToApply;
    const total = Math.round(itemTotal + dynamicChargesTotal); {/*+ staticChargesTotal*/ }
    setTotalAmount(total);
  }, [items, charges, staticCharges, selectedOffer, isOfferPrefilled, isDiscountApplied]);

  const handleCreateInvoice = async () => {
    const chargesObject = charges.reduce((acc, charge) => {
      if (charge.label.trim() && (!charge.isFixed || (charge.label === "CGST & SGST" && isCGSTSGSTSelected) || (charge.label === "IGST" && isIGSTSelected))) {
        acc[charge.label.trim()] = charge.value;
      }
      return acc;
    }, {} as Record<string, number>);

    // Add static charges only if they are not 0
    if (staticCharges.toll !== 0) chargesObject["Toll Charges"] = staticCharges.toll;
    if (staticCharges.hill !== 0) chargesObject["Hill Charges"] = staticCharges.hill;
    if (staticCharges.permitCharge !== 0) chargesObject["Permit Charges"] = staticCharges.permitCharge;
    if (staticCharges.advanceAmount !== 0) chargesObject["Advance Amount"] = staticCharges.advanceAmount;
    if (staticCharges.driverBeta !== 0) chargesObject["Driver Betta"] = staticCharges.driverBeta;
    if (offerAmount !== 0) chargesObject["Discount"] = offerAmount;

    const invoiceData = {
      invoiceId,
      invoiceDate,
      bookingId,
      status: paymentStatus as "Paid" | "Partial Paid" | "Unpaid",
      name: shippingAddress.name,
      address: shippingAddress.address,
      phone: shippingAddress.phone,
      email: shippingAddress.email,
      GSTNumber: shippingAddress.GSTNumber,
      serviceType: items[0].service,
      vehicleType: items[0].vehicleType,
      invoiceNo: invoiceId,
      totalKm: items[0].km,
      pricePerKm: items[0].price,
      travelTime: items[0].time,
      otherCharges: chargesObject,
      totalAmount: totalAmount,
      paymentDetails,
      note,
      pickup: pickupDrop.pickup,
      drop: pickupDrop.drop,
      offerId: selectedOffer?.offerId || null,
      createdBy: createdBy as "Vendor" | "Admin",
    };

    try {
      if (invId) {
        // Update existing invoice
        await updateInvoice(invId || "", invoiceData);
        const { statusCode, message } = useInvoiceStore.getState();
        if (statusCode === 200 || statusCode === 201) {
          toast.success(message || "Invoice updated successfully!", {
            style: {
              backgroundColor: "#009F7F",
              color: "#fff",
            },
          });
          router.push(`/${createdBy === "Vendor" ? "vendor" : "admin"}/invoices`);
        } else {
          toast.error(message, {
            style: {
              backgroundColor: "#FF0000",
              color: "#fff",
            },
          });
        }
      } else {
        // Create new invoice
        await createInvoice(invoiceData);
        const { statusCode, message } = useInvoiceStore.getState();
        if (statusCode === 200 || statusCode === 201) {
          toast.success(message || "Invoice created successfully!", {
            style: {
              backgroundColor: "#009F7F",
              color: "#fff",
            },
          });
          router.push(`/${createdBy === "Vendor" ? "vendor" : "admin"}/invoices`);
        } else {
          toast.error(message, {
            style: {
              backgroundColor: "#FF0000",
              color: "#fff",
            },
          });
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
      toast.error(errorMessage, {
        style: {
          backgroundColor: "#FF0000",
          color: "#fff",
        },
      }); // Display the backend error message in the toast
      // console.error("Error creating invoice:", error);
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
      setPendingNavigation(() => () => router.push(`/${createdBy === "Vendor" ? "vendor" : "admin"}/invoices`));
    } else {
      router.push(`/${createdBy === "Vendor" ? "vendor" : "admin"}/invoices`);
    }
  };



  const handleConfirmNavigation = () => {
    setIsFormDirty(false);
    setShowUnsavedChangesDialog(false);
    pendingNavigation();
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
            <Input type="text" readOnly value={invoiceId} onChange={(e) => setInvoiceId(e.target.value)} />
          </div>
          <div>
            <Label>Invoice Date</Label>
            <Input type="date" value={invoiceDate} onChange={(e) => setInvoiceDate(e.target.value)} />
          </div>
        </div>
        <div className="mt-4 mb-4 grid grid-cols-2 gap-4">
          {/* <div>
            <Label>Booking ID</Label>
            <Input
              type="text"
              value={bookingIdInput}
              onChange={handleBookingIdChange}
              placeholder="Enter Booking ID"
            />
            {loadingBooking && <p className="text-blue-500 mt-2">Loading booking details...</p>}
            {bookingError && <p className="text-red-500 mt-2">{bookingError}</p>}
          </div> */}
          <div className="mt-1 border-gray-900">
            <Label>Payment Status</Label>
            <Select
              value={
              (bookingStatus === "Pending"
                ? "Unpaid"
                : bookingStatus) || paymentStatus
              }
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
            </Select>
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
                  value={shippingAddress.name}
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
              {items.map((item, index) => (
                <tr key={index}>
                  <td className="px-4 py-2 border">
                    <Select
                      value={item.service}
                      onValueChange={(value) => handleItemChange(index, "service", value)}
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
                  </td>
                  <td className="px-2 py-2 border">
                    <Input
                      type="text"
                      className="border-none shadow-none"
                      placeholder="Vehicle Category"
                      value={item.vehicleType}
                      onChange={(e) => handleItemChange(index, "vehicleType", e.target.value)}
                    />
                  </td>
                  {
                    selectedServiceName !== "Package" &&
                    <td className="px-4 py-2 border">
                      <Input
                        className="border-none shadow-none"
                        placeholder="Pickup - Drop"
                        value={item.details}
                        onChange={(e) => handleItemChange(index, "details", e.target.value)}
                        onBlur={(e) => {
                          const value = e.target.value;
                          if (value.includes("-")) {
                            const [newPickup, newDrop] = value.split("-").map(s => s.trim());
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
                        value={item.details.split("-")[0]}
                        onChange={(e) => handleItemChange(index, "details", e.target.value)}
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
                      value={item.km}
                      onChange={(e) => {
                        const numericValue = e.target.value.replace(/[^0-9]/g, '')
                        handleItemChange(index, "km", Number(numericValue))
                      }}
                    />
                  </td>
                  <td className="px-2 py-2 border">
                    <Input
                      className="appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none border-none shadow-none"
                      type="text"
                      placeholder="Price"
                      value={item.price}
                      onChange={(e) => {
                        const numericValue = e.target.value.replace(/[^0-9]/g, '')
                        handleItemChange(index, "price", Number(numericValue))
                      }}
                    />
                  </td>
                  <td className="px-4 py-2 border">
                    <Input
                      type="text"
                      className="border-none shadow-none"
                      placeholder={selectedServiceName === "Package" ? "Day / Hour" : "Time"}
                      value={item.time}
                      onChange={(e) => handleItemChange(index, "time", e.target.value)}
                    />
                  </td>
                  <td className="px-2 py-2 border">
                    <Input
                      className="appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none border-none shadow-none"
                      type="text"
                      placeholder="Amount"
                      value={item.amount}
                      readOnly
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-6 flex justify-end">
          <div className="flex flex-col gap-2">
            <h2 className="font-bold">Charges</h2>

            {/* Static Charges */}
            <div className="flex flex-col gap-2 items-end">
              {staticCharges.toll !== 0 && (
                <div className="flex flex-row gap-2 items-center">
                  <Input
                    type="text"
                    value="Toll charges"
                    readOnly
                    className="w-32 bg-white border border-gray-300 text-gray-600"
                  />
                  <Input
                    type="number"
                    className={`w-32 appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${isTollFilled ? ' cursor-not-allowed' : ''}`}
                    value={staticCharges.toll}
                    onChange={(e) => !isTollFilled && handleStaticChargeChange("toll", e.target.value)}
                    placeholder="0"
                  />
                </div>
              )}
              {staticCharges.hill !== 0 && (
                <div className="flex flex-row gap-2 items-center">
                  <Input
                    type="text"
                    value="Hill charges"
                    readOnly
                    className="w-32 bg-white border border-gray-300 text-gray-600"
                  />
                  <Input
                    type="number"
                    className={`w-32 appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${isHillFilled ? ' cursor-not-allowed' : ''}`}
                    value={staticCharges.hill}
                    onChange={(e) => !isHillFilled && handleStaticChargeChange("hill", e.target.value)}
                    placeholder="0"
                  />
                </div>
              )}
              {staticCharges.permitCharge !== 0 && (
                <div className="flex flex-row gap-2 items-center">
                  <Input
                    type="text"
                    value="Permit charges"
                    readOnly
                    className="w-32 bg-white border border-gray-300 text-gray-600"
                  />
                  <Input
                    type="number"
                    className={`w-32 appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${isPermitChargeFilled ? ' cursor-not-allowed' : ''}`}
                    value={staticCharges.permitCharge}
                    onChange={(e) => !isPermitChargeFilled && handleStaticChargeChange("permitCharge", e.target.value)}
                    placeholder="0"
                  />
                </div>
              )}
              {staticCharges.advanceAmount !== 0 && (
                <div className="flex flex-row gap-2 items-center">
                  <Input
                    type="text"
                    value="Advance Amount"
                    readOnly
                    className="w-32 bg-white border border-gray-300 text-gray-600"
                  />
                  <Input
                    type="number"
                    className={`w-32 appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${isAdvanceFilled ? ' cursor-not-allowed' : ''}`}
                    value={staticCharges.advanceAmount}
                    onChange={(e) => !isAdvanceFilled && handleStaticChargeChange("advanceAmount", e.target.value)}
                    placeholder="0"
                  />
                </div>
              )}
              {staticCharges.driverBeta !== 0 && (
                <div className="flex flex-row gap-2 items-center">
                  <Input
                    type="text"
                    value="Driver Betta"
                    readOnly
                    className="w-32 bg-white border border-gray-300 text-gray-600"
                  />
                  <Input
                    type="number"
                    className={`w-32 appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${isDriverBetaPrefilled ? ' cursor-not-allowed' : ''}`}
                    value={staticCharges.driverBeta}
                    onChange={(e) => !isDriverBetaPrefilled && handleStaticChargeChange("driverBeta", e.target.value)}
                    readOnly={isDriverBetaPrefilled}
                    placeholder="0"
                  />
                </div>
              )}
              {offerAmount !== 0 && (
                <div className="flex flex-row gap-2 items-center">
                  <Input
                    type="text"
                    value={
                      selectedOffer
                        ? selectedOffer.type === "Flat"
                          ? "Flat Discount"
                          : "Percentage Discount"
                        : "Discount"
                    }
                    readOnly
                    className="w-32 bg-white border border-gray-300 text-gray-600"
                  />
                  <Input
                    type="number"
                    className={`w-32 appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${isOfferPrefilled ? ' cursor-not-allowed' : ''}`}
                    value={offerAmount}
                    onChange={(e) => !isOfferPrefilled && handleStaticChargeChange("discount", e.target.value)}
                    readOnly={isOfferPrefilled}
                    placeholder="0"
                  />
                </div>
              )}
            </div>

            {/* Fixed Tax Charges with Checkboxes */}
            <div className="flex flex-col gap-2 items-end">
              {charges.filter(charge => charge.isFixed).map((charge, index) => (
                <div key={index} className="flex flex-row gap-2 items-center">
                  <Checkbox
                    checked={charge.label === "CGST & SGST" ? isCGSTSGSTSelected : isIGSTSelected}
                    onCheckedChange={() => handleTaxSelection(charge.label as "CGST & SGST" | "IGST")}
                    disabled={
                      (charge.label === "CGST & SGST" && isIGSTSelected) ||
                      (charge.label === "IGST" && isCGSTSGSTSelected)
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

            {/* Dynamic Custom Charges */}
            <div className="flex flex-col gap-2 items-end">
              {charges.filter(charge => !charge.isFixed).map((charge, index) => {
                const actualIndex = charges.findIndex(c => c === charge);
                return (
                  <div key={actualIndex} className="flex flex-row gap-2 items-end">
                    <Button
                      variant="destructive"
                      className="w-10"
                      onClick={() => removeCustomCharge(actualIndex)}
                    >✖</Button>
                    <Input
                      type="text"
                      placeholder="Charge Label"
                      value={charge.label}
                      onChange={(e) => {
                        const filteredValue = e.target.value.replace(/[^A-Za-z\s]/g, "");
                        handleChargeChange(actualIndex, "label", filteredValue);
                      }}
                      className="w-32 bg-white border border-gray-300 text-gray-600"
                    />
                    <Input
                      type="number"
                      className="w-32 appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      value={charge.value || ""}
                      onChange={(e) => handleChargeChange(actualIndex, "value", e.target.value)}
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