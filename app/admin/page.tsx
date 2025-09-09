'use client'
import React, { useEffect, useMemo } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from 'components/ui/card'
import { Overview } from 'components/charts/Overview'
import { Activity, Users, ArrowBigRight, Calendar, MessageSquare, Car, FileText, User, BadgePercent, Route } from 'lucide-react'
import CounterCard from 'components/cards/CounterCard'
import { BarChartComponent } from 'components/charts/BarChart'
import { PaymentComponent } from 'components/charts/PaymentChart'
import { InvoiceTable } from 'components/admin-dashboard/InvoiceTable'
import { BookingTable } from 'components/admin-dashboard/BookingTable'
import { EnquiryTable } from 'components/admin-dashboard/EnquiryTable'
import { AreaChart } from 'components/charts/AreaChart'
import { useFetchBookings } from 'hooks/react-query/useBooking'
import { useEnquiries } from 'hooks/react-query/useEnquiry';
import { useDrivers } from 'hooks/react-query/useDriver';
import { useInvoices } from 'hooks/react-query/useInvoice';
import ShortcutSection from "components/others/ShortCut"
import CreateCustomerForm from "components/customer/CreateCustomerForm";
import { useState } from "react";

export default function AdminDashboard() {
  const [showCreateCustomerModal, setShowCreateCustomerModal] = useState(false);

  const { data: bookings = [], isPending: isLoading, refetch: refetchBookings } = useFetchBookings();
  const { data: enquiries = [], isPending: isEnquiriesLoading, refetch: refetchEnquiries } = useEnquiries();
  const { data: drivers = [], isPending: isDriversLoading, refetch: refetchDrivers } = useDrivers({ enabled: true });
  const { data: invoices = [], isPending: isInvoicesLoading } = useInvoices();

  const { manualBookings, vendorBookings, websiteBookings } = useMemo(() => {
    const currentYear = new Date().getFullYear();

    return bookings.reduce(
      (acc: any, booking: any) => {
        const bookingYear = new Date(booking.createdAt).getFullYear();
        if (bookingYear !== currentYear) return acc;

        if (booking.type === 'Manual') acc.manualBookings++;
        if (booking.type === 'Website') acc.websiteBookings++;
        if (booking.createdBy === 'Vendor') acc.vendorBookings++;
        return acc;
      },
      { manualBookings: 0, vendorBookings: 0, websiteBookings: 0 }
    );
  }, [bookings]);


  return (
    <>
      <CreateCustomerForm open={showCreateCustomerModal} onOpenChange={setShowCreateCustomerModal} showTrigger={false} />
      <div className="min-h-screen space-y-8 bg-slate-50 p-8">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">Dashboard</h2>

        {/* Charts - Pie */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-1">
          <Card className="overflow-hidden border-none bg-white shadow-md">
            <CardContent className="p-6">
              <AreaChart createdBy="Admin" bookings={bookings} isLoading={isLoading} />
            </CardContent>
          </Card>
          {/* <Card className="overflow-hidden border-none bg-white shadow-md">
            <CardContent className="p-6">
              <PaymentComponent createdBy="Admin" bookings={bookings} isLoading={isLoading} />
            </CardContent>
          </Card> */}
        </div>

        {/* Overall shortcuts */}
        <ShortcutSection
          col={4}
          shortcuts={[
            {
              title: "Create Invoice",
              href: "/admin/invoices/create",
              icon: FileText,
              color: "from-blue-500 to-indigo-600",
              hoverColor: "group-hover:from-blue-600 group-hover:to-indigo-700",
            },
            {
              title: "Create Booking",
              href: "/admin/bookings/create",
              icon: Calendar,
              color: "from-emerald-500 to-teal-600",
              hoverColor: "group-hover:from-emerald-600 group-hover:to-teal-700",
            },
            {
              title: "Create Customer",
              href: "#",
              icon: Users,
              color: "from-amber-500 to-orange-600",
              hoverColor: "group-hover:from-amber-600 group-hover:to-orange-700",
              onClick: () => setShowCreateCustomerModal(true),
            },
            {
              title: "Create Vehicle",
              href: "/admin/vehicles/create",
              icon: Car,
              color: "from-purple-500 to-violet-600",
              hoverColor: "group-hover:from-purple-600 group-hover:to-violet-700",
            },
          ]}
        />

        {/* Invoice table */}
        <InvoiceTable invoices={invoices} isLoading={isInvoicesLoading} />

        {/* Counters */}
        <div className="grid gap-28 md:grid-cols-2 lg:grid-cols-3">
          <Card className="relative overflow-hidden border-none bg-gradient-to-br from-emerald-50 to-teal-50 shadow-md transform transition duration-300 ease-in-out hover:scale-105">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 opacity-0 w-full" />
            <div className="h-[150PX] w-full">
              <CounterCard
                color="bg-emerald-100"
                icon={Users}
                count={websiteBookings}
                label="Website Bookings"
                className="relative z-10 p-6"
              />
            </div>
            <div className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-emerald-500 to-teal-500 transform scale-x-100" />
          </Card>

          <Card className="relative overflow-hidden border-none bg-gradient-to-br from-blue-50 to-indigo-50 shadow-md transform transition duration-300 ease-in-out hover:scale-105">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 opacity-0 w-full" />
            <div className="h-[150PX] w-full">
              <CounterCard
                color="bg-blue-100"
                icon={Activity}
                count={manualBookings}
                label="Manual Bookings"
                className="relative z-10 p-6"
              />
            </div>
            <div className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-blue-500 to-indigo-500 transform scale-x-100" />
          </Card>

          <Card className="relative overflow-hidden border-none bg-gradient-to-br from-purple-50 to-pink-50 shadow-md transform transition duration-300 ease-in-out hover:scale-105">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 opacity-100 w-full" />
            <div className="h-[150px] w-full">
              <CounterCard
                color="bg-purple-100"
                icon={Activity}
                count={vendorBookings}
                label="Vendor Bookings"
                className="relative z-10 p-6"
              />
            </div>
            <div className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-purple-500 to-pink-500 transform scale-x-100" />
          </Card>
        </div>


        {/* Booking Table */}
        <BookingTable bookings={bookings} isLoading={isLoading} />

        {/* Extra charts */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card className="border-none bg-white shadow-md">
            <CardContent className="p-6">
              <BarChartComponent createdBy='Admin' bookings={bookings} isLoading={isLoading} />
            </CardContent>
          </Card>
          <Card className="border-none bg-white shadow-md">
            <CardContent className="p-6">
              <Overview drivers={drivers} isLoading={isDriversLoading} />
            </CardContent>
          </Card>
        </div>

        {/* Second shortcuts section */}
        <ShortcutSection
          col={4}
          shortcuts={[
            {
              title: "Create Drivers",
              href: "/admin/drivers/create",
              icon: User,
              color: "from-blue-500 to-indigo-600",
              hoverColor: "group-hover:from-blue-600 group-hover:to-indigo-700",
            },
            {
              title: "Create Vendors",
              href: "/admin/vendor/create",
              icon: User,
              color: "from-emerald-500 to-teal-600",
              hoverColor: "group-hover:from-emerald-600 group-hover:to-teal-700",
            },
            {
              title: "Create Offers",
              href: "/admin/offers/create",
              icon: BadgePercent,
              color: "from-amber-500 to-orange-600",
              hoverColor: "group-hover:from-amber-600 group-hover:to-orange-700",
            },
            {
              title: "Create Routes",
              href: "/admin/dynamic-routes/create",
              icon: Route,
              color: "from-purple-500 to-violet-600",
              hoverColor: "group-hover:from-purple-600 group-hover:to-violet-700",
            },
          ]}
        />

        {/* Enquiries */}

        {/* <EnquiryTable enquiries={enquiries} refetch={refetchEnquiries} isLoading={isEnquiriesLoading} /> */}
      </div>
    </>
  )
}




