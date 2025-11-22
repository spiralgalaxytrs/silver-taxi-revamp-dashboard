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
import { useFetchDashboardData, useFetchRecentBookings } from 'hooks/react-query/useBooking'
import { useEnquiries } from 'hooks/react-query/useEnquiry';
import { useDrivers } from 'hooks/react-query/useDriver';
import { useInvoices } from 'hooks/react-query/useInvoice';
import ShortcutSection from "components/others/ShortCut"
import CreateCustomerForm from "components/customer/CreateCustomerForm";
import { useState } from "react";

export default function AdminDashboard() {
  const [showCreateCustomerModal, setShowCreateCustomerModal] = useState(false);
  const [barChartFilter, setBarChartFilter] = useState<'day' | 'week' | 'month' | 'year' | 'lastYear'>('week');
  const [overviewFilter, setOverviewFilter] = useState<'day' | 'week' | 'month' | 'year' | 'lastYear'>('year');
  const { data: bookingsData = {
    bookings: [],
    bookingsCount: { vendor: 0, website: 0, manual: 0 },
    pagination: { currentPage: 0, totalPages: 0, totalCount: 0, hasNext: false, hasPrev: false, limit: 0 }
  },
    isPending: isLoading,
    refetch: refetchBookings
  } = useFetchRecentBookings({
    enabled: true,
    page: 1,
    limit: 30,
    sortBy: 'createdAt',
    sortOrder: 'DESC',
  });
  const { data: driversData = { drivers: [], pagination: { currentPage: 0, totalPages: 0, totalDrivers: 0, hasNext: false, hasPrev: false, limit: 0 } },
    isPending: isDriversLoading,
    refetch: refetchDrivers
  } = useDrivers({ enabled: true });
  const { data: invoicesData = {
    invoices: [],
    pagination: { currentPage: 0, totalPages: 0, totalCount: 0, hasNext: false, hasPrev: false, limit: 0 }
  }
    , isPending: isInvoicesLoading
  } = useInvoices({
    enabled: true,
    page: 1,
    limit: 30,
    sortBy: 'createdAt',
    sortOrder: 'DESC',
  });
  const { data: dashboardData = {
    areaChartData: { oneWay: 0, roundTrip: 0, hourlyPackages: 0 },
    barChartData: [],
    topDriversData: []
  },
    isPending: isDashboardLoading,
    refetch: refetchDashboard } = useFetchDashboardData({
      enabled: true,
      areaChart: true,
      barChart: barChartFilter,
      topDrivers: overviewFilter,
    });
  const drivers = driversData?.drivers || [];
  const invoices = invoicesData?.invoices || [];
  const bookings = bookingsData?.bookings || [];
  const areaChart = dashboardData?.areaChartData || { oneWay: 0, roundTrip: 0, hourlyPackages: 0 };
  const barChart = dashboardData?.barChartData || [];
  const topDrivers = dashboardData?.topDriversData || [];
  const bookingsCount = bookingsData?.bookingsCount || {
    vendor: 0,
    website: 0,
    manual: 0,
  };

  return (
    <>
      <CreateCustomerForm open={showCreateCustomerModal} onOpenChange={setShowCreateCustomerModal} showTrigger={false} />
      <div className="min-h-screen space-y-8 bg-slate-50 p-8">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">Dashboard</h2>

        {/* Charts - Pie */}
        <div className="flex justify-center gap-4">
          <div className='w-2/3'>
            <Card className="overflow-hidden border-none bg-white shadow-md w-full">
              <CardContent className="p-6">
                <AreaChart createdBy="Admin" bookings={areaChart} isLoading={isDashboardLoading} />
              </CardContent>
            </Card>
            {/* <Card className="overflow-hidden border-none bg-white shadow-md">
            <CardContent className="p-6">
              <PaymentComponent createdBy="Admin" bookings={bookings} isLoading={isLoading} />
            </CardContent>
          </Card> */}
          </div>
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

        <ShortcutSection
          col={4}
          shortcuts={[
            {
              title: "Create Notification",
              href: "/admin/custom-notifications/create",
              icon: User,
              color: "from-green-500 to-green-600",
              hoverColor: "group-hover:from-green-600 group-hover:to-green-700",
            },
            {
              title: "Create Vendors",
              href: "/admin/vendor/create",
              icon: User,
              color: "from-pink-500 to-pink-600",
              hoverColor: "group-hover:from-pink-600 group-hover:to-pink-700",
            },
            {
              title: "Create Offers",
              href: "/admin/offers/create",
              icon: BadgePercent,
              color: "from-yellow-500 to-yellow-600",
              hoverColor: "group-hover:from-yellow-600 group-hover:to-yellow-700",
            },
            {
              title: "Create Promo Code",
              href: "/admin/promo-codes/create",
              icon: Route,
              color: "from-red-500 to-red-600",
              hoverColor: "group-hover:from-red-600 group-hover:to-red-700",
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
                count={bookingsCount?.website || 0}
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
                count={bookingsCount?.manual || 0}
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
                count={bookingsCount?.vendor || 0}
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
              <BarChartComponent createdBy='Admin' data={barChart} isLoading={isDashboardLoading} filter={barChartFilter} setFilter={setBarChartFilter} />
            </CardContent>
          </Card>
          <Card className="border-none bg-white shadow-md">
            <CardContent className="p-6">
              <Overview data={topDrivers} isLoading={isDashboardLoading} filter={overviewFilter} setFilter={setOverviewFilter} />
            </CardContent>
          </Card>
        </div>



        {/* Enquiries */}

        {/* <EnquiryTable enquiries={enquiries} refetch={refetchEnquiries} isLoading={isEnquiriesLoading} /> */}
      </div>
    </>
  )
}




