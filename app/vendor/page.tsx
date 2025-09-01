'use client'
import React, { useMemo, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from 'components/ui/card'
import { Activity, Users, ArrowBigRight, Calendar, MessageSquare, Car, FileText, User, BadgePercent, Route } from 'lucide-react'
import CounterCard from 'components/cards/CounterCard'
import { AreaChart } from 'components/charts/AreaChart'
import { BarChartComponent } from 'components/charts/BarChart'
import { PaymentComponent } from 'components/charts/PaymentChart'
import { useFetchVendorBookings } from 'hooks/react-query/useBooking'
import { useVendorEnquiries } from 'hooks/react-query/useEnquiry';
import { useDrivers } from 'hooks/react-query/useDriver';
import { useVendorInvoices } from 'hooks/react-query/useInvoice';
import { InvoiceTable } from 'components/vendor-dashboard/InvoiceTable'
import { BookingTable } from 'components/vendor-dashboard/BookingTable'
import { EnquiryTable } from 'components/vendor-dashboard/EnquiryTable'
import ShortcutSection from 'components/others/ShortCut'

export default function VendorDashboard() {

  const { data: bookings = [], isPending: isLoading, refetch: refetchBookings } = useFetchVendorBookings();
  const { data: enquiries = [], isPending: isEnquiriesLoading, refetch: refetchEnquiries } = useVendorEnquiries();
  const { data: drivers = [], isPending: isDriversLoading, refetch: refetchDrivers } = useDrivers({ enabled: true });
  const { data: invoices = [], isPending: isInvoicesLoading } = useVendorInvoices();


  const { totalBookings, totalBookingValue } = useMemo(() => {
    return bookings.reduce(
      (acc: any, booking: any) => {
        acc.total++;
        acc.totalValue += Number(booking.finalAmount) || 0;
        return acc;
      },
      { totalBookings: 0, totalBookingValue: 0 }
    );
  }, [bookings]);


  return (
    <>
      <div className="min-h-screen space-y-8 bg-slate-50 p-8">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">Dashboard</h2>

        {/* Charts - Pie */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card className="overflow-hidden border-none bg-white shadow-md">
            <CardContent className="p-6">
              <AreaChart createdBy="Vendor" bookings={bookings} isLoading={isLoading} />
            </CardContent>
          </Card>
          <Card className="overflow-hidden border-none bg-white shadow-md">
            <CardContent className="p-6">
              <PaymentComponent createdBy="Vendor" bookings={bookings} isLoading={isLoading} />
            </CardContent>
          </Card>
        </div>

        {/* Overall shortcuts */}
          <ShortcutSection
            col={3}
            shortcuts={[
              {
                title: "Create Invoice",
                href: "/vendor/invoices/create",
                icon: FileText,
                color: "from-blue-500 to-indigo-600",
                hoverColor: "group-hover:from-blue-600 group-hover:to-indigo-700",
              },
              {
                title: "Create Booking",
                href: "/vendor/bookings/create",
                icon: Calendar,
                color: "from-emerald-500 to-teal-600",
                hoverColor: "group-hover:from-emerald-600 group-hover:to-teal-700",
              },
              {
                title: "Create Enquiry",
                href: "/vendor/enquiry/create",
                icon: MessageSquare,
                color: "from-amber-500 to-orange-600",
                hoverColor: "group-hover:from-amber-600 group-hover:to-orange-700",
              }
            ]}
          />

        {/* Invoice table */}
        <InvoiceTable invoices={invoices} isLoading={isInvoicesLoading} />

        {/* Counters */}
        <div className="flex justify-center gap-8">
          <Card className="relative overflow-hidden border-none bg-gradient-to-br from-emerald-50 to-teal-50 shadow-md w-[230px] h-[120px] transform transition duration-300 ease-in-out hover:scale-105">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 opacity-0 w-full" />
            <div className="h-[150PX] w-full">
              <CounterCard
                color="bg-emerald-100"
                icon={Activity}
                count={totalBookings.toLocaleString()}
                label="Total Bookings"
                className="relative z-10 p-6"
              //cardSize="w-[200px] h-[100px]"
              />
            </div>
            <div className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-emerald-500 to-teal-500 transform scale-x-100" />
          </Card>

          <Card className="relative overflow-hidden border-none bg-gradient-to-br from-blue-50 to-indigo-50 shadow-md w-[230px] h-[120px] transform transition duration-300 ease-in-out hover:scale-105">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 opacity-0 w-full" />
            <div className="h-[150PX] w-full">
              <CounterCard
                color="bg-blue-100"
                icon={Activity}
                count={totalBookingValue}
                label="Total Booking Value"
                //cardSize="w-[200px] h-[100px]"
                format="currency"
              />
            </div>
            <div className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-blue-500 to-indigo-500 transform scale-x-100" />
          </Card>
        </div>


        {/* Booking Table */}
        <BookingTable bookings={bookings} isLoading={isLoading} />

        {/* Extra charts */}
        <div className="flex justify-center w-full gap-8">
          <Card className="border-none bg-white shadow-md w-[60%]">
            <CardContent className="p-6">
              <BarChartComponent createdBy="Vendor" bookings={bookings} 
              // enquiries={enquiries} 
              isLoading={isLoading} />
            </CardContent>
          </Card>
        </div>

        {/* Enquiries */}
        <EnquiryTable enquiries={enquiries} refetch={refetchEnquiries} isLoading={isEnquiriesLoading} />
      </div>
    </>
  )
}




