"use client"

import { useRef, useState, useEffect } from "react"
import jsPDF from "jspdf"
import html2canvas from "html2canvas"
import { Button } from "components/ui/button"
import { Download, Phone, Mail } from "lucide-react"
import { useInvoiceStore } from "stores/invoiceStore"
import { useProfileStore } from "stores/profileStore"
import { Profile } from "types/profile"

const Invoice = ({ id }: { id: string }) => {
  const pdfRef = useRef<HTMLDivElement>(null)
  const { invoice, fetchInvoiceById } = useInvoiceStore()
  const { profile, fetchProfile } = useProfileStore()
  const [isGenerating, setIsGenerating] = useState(false)
  const [updatedCompanyProfile, setUpdatedCompanyProfile] = useState<Profile>()

  useEffect(() => {
    fetchInvoiceById(id);
  }, [id])

  useEffect(() => {
    fetchProfile();
    if (profile) {
      setUpdatedCompanyProfile(profile as unknown as Profile)
    }
  }, [])

  const handleDownload = async () => {
    const element = pdfRef.current
    if (!element) return

    setIsGenerating(true)
    await new Promise((resolve) => setTimeout(resolve, 500));

    const canvas = await html2canvas(element, {
      scale: 2, // Increase resolution for better quality
      useCORS: true, // Allow cross-origin images if any
      logging: true, // Enable logging to debug rendering issues
    });

    const imgData = canvas.toDataURL("image/png")
    const pdf = new jsPDF("p", "mm", "a4")
    const pdfWidth = pdf.internal.pageSize.getWidth()
    const pdfHeight = pdf.internal.pageSize.getHeight()

    // Calculate the aspect ratio to fit the content properly
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
    const scaledWidth = imgWidth * ratio;
    const scaledHeight = imgHeight * ratio;

    pdf.addImage(imgData, "PNG", 0, 0, scaledWidth, scaledHeight);
    pdf.save("diamond-cabs-Invoice.pdf");
    setIsGenerating(false);
  };

  const rideAmount = (invoice?.pricePerKm ?? 0) * (invoice?.totalKm ?? 0);

  const invDate = invoice?.invoiceDate
    ? invoice.invoiceDate.split("T")[0].split("-").reverse().join("-")
    : "";

  return (
    <div className="min-h-screen relative bg-white shadow-lg p-8 flex justify-center items-center">
      {/* Download Button positioned at the top right corner */}
      <div className="absolute top-4 right-4">
        <Button
          onClick={handleDownload}
          disabled={isGenerating}
          className="bg-gradient-to-r from-[#009879] to-[#00775F] hover:from-[#00775F] hover:to-[#005F47] text-white font-bold py-3 px-6 rounded-full shadow-lg transition duration-300 ease-in-out transform hover:scale-105 flex items-center"
        >
          {isGenerating ? (
            "Generating..."
          ) : (
            <>
              <Download className="mr-2 h-5 w-5" />
              Download Invoice
            </>
          )}
        </Button>
      </div>

      {/* Invoice template container */}
      <div className="w-full max-w-4xl bg-white shadow-2xl overflow-hidden" ref={pdfRef}>
        <div className="bg-gradient-to-r from-[#009879] to-[#00775F] text-white p-8 w-full">
          <div className="flex justify-between items-center flex-nowrap">
            <div className="flex flex-col justify-center">
              <h1 className="text-4xl font-bold">Diamond Cabs</h1>
              <p className="text-sm mt-1 opacity-75">Your Luxury Ride Partner</p>
            </div>
            <div className="text-right">
              <h2 className="text-5xl font-bold whitespace-nowrap -mt-2">INVOICE</h2>
              <p className="text-sm mt-1 opacity-75 text-start">Invoice #{invoice?.invoiceNo}</p>
            </div>
          </div>
        </div>

        <div className="p-8 space-y-8">


          {/* Invoice Details at the top */}
          <section className="bg-gray-50 p-4 rounded-lg shadow">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center">
                {/* <Calendar className="mr-2" size={25} /> */}
                <div>
                  <p className="text-sm text-gray-600">Date</p>
                  <p className="font-medium">{invDate}</p>
                </div>
              </div>
              <div className="flex items-center">
                {/* <Clock className="mr-2" size={25} /> */}
                <div>
                  <p className="text-sm text-gray-600">Payment Status</p>
                  <p className="font-medium text-yellow-600">{invoice?.status}</p>
                </div>
              </div>
            </div>
          </section>

          {/* Billing and Company Details */}
          <section className="bg-gray-50 p-4 rounded-lg shadow">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-lg font-semibold text-[#00775F] mb-2">BILLING ADDRESS</h3>
                <p className="font-medium text-lg mb-2">{invoice?.name}</p>
                <p className="flex items-center mt-3">{invoice?.phone}</p>
                <p className="flex items-center mt-3">{invoice?.email}</p>
                <p className="flex items-center mt-3">{invoice?.address}</p>
                <p className="flex items-center mt-3">{invoice?.GSTNumber}</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-[#00775F] mb-2">CompanyDetails</h3>
                <p className="font-medium text-lg mb-2">{updatedCompanyProfile?.name}</p>
                <p className="mt-3">{updatedCompanyProfile?.address}</p>
                <p className="flex items-center mt-3">{updatedCompanyProfile?.phone}</p>
                <p className="flex items-center mt-3">{updatedCompanyProfile?.email}</p>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-[#00775F] mb-2">Trip Details</h2>
            <div className="overflow-x-auto bg-gray-50 rounded-lg shadow">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-[#009879] to-[#00775F] text-white">
                  <tr>
                    <th className="p-3 text-left">Service</th>
                    <th className="p-3 text-left">Category</th>
                    <th className="p-3 text-left">Route</th>
                    <th className="p-3 text-left">Distance</th>
                    <th className="p-3 text-left">
                      {invoice?.serviceType === "Package" ? "Day / Hour" : "Duration"}
                    </th>
                    <th className="p-3 text-left">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-200">
                    <td className="p-3">{invoice?.serviceType}</td>
                    <td className="p-3">{invoice?.vehicleType}</td>
                    { invoice?.serviceType !== "Package" && <td className="p-3">{invoice?.pickup} to {invoice?.drop}</td>}
                    {invoice?.serviceType === "Package" && <td className="p-3">{invoice?.pickup}</td>}
                    <td className="p-3">{invoice?.totalKm} km</td>
                    <td className="p-3">{invoice?.travelTime}</td>
                    <td className="p-3 font-medium">₹{rideAmount}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section className="flex justify-end">
            <div className="w-72 space-y-4">
              <h2 className="text-2xl font-semibold text-[#00775F]">Total Charges</h2>
              <div className="bg-gray-50 p-4 rounded-lg shadow space-y-2">
                {invoice?.otherCharges &&
                  Object.entries(invoice.otherCharges)
                    .reverse() // Reverse the order of entries
                    .map(([chargeKey, amount]) => (
                      <div key={chargeKey} className="flex justify-between">
                        <span>{chargeKey}</span>
                        <span className="font-medium">₹{amount}</span>
                      </div>
                    ))}
                <div className="flex justify-between text-lg font-bold text-[#00775F] border-t border-gray-300 pt-2">
                  <span>Total Amount:</span>
                  <span>₹{invoice?.totalAmount}</span>
                </div>
              </div>
            </div>
          </section>

          <section className="space-y-2">
            <h2 className="text-2xl font-semibold text-[#00775F]">Payment Information</h2>
            <div className="bg-gray-50 p-4 rounded-lg shadow">
              <p>{invoice?.paymentDetails}</p>
            </div>
          </section>

          <section className="text-sm text-gray-600">
            <h3 className="text-lg font-semibold mb-2 italic">NOTES:</h3>
            <p>{invoice?.note}</p>
          </section>
        </div>

        <div className="bg-gradient-to-r from-[#009879] to-[#00775F] h-4"></div>
      </div>
    </div>
  )
}

export default Invoice
