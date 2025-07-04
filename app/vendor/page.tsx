'use client'
import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from 'components/ui/card'
import { Activity, ArrowBigRight } from 'lucide-react'
import CounterCard from 'components/cards/CounterCard'
import { AreaChart } from 'components/charts/AreaChart'
import { BarChartComponent } from 'components/charts/BarChart'
import { PaymentComponent } from 'components/charts/PaymentChart'
import { InvoiceTable } from 'components/vendor-dashboard/InvoiceTable'
import { BookingTable } from 'components/vendor-dashboard/BookingTable'
import { EnquiryTable } from 'components/vendor-dashboard/EnquiryTable'
import { useBookingStore } from 'stores/bookingStore'

export default function VendorDashboard() {
  const { bookings } = useBookingStore();
  const [totalBookings, setTotalBookings] = useState(0);
  const [totalBookingValue, setTotalBookingValue] = useState(0);
  const [bookingData, setBookingData] = useState(
    bookings.map(booking => ({
      ...booking,
      id: booking.bookingId,
      pickupDate: booking.pickupDate,
      dropDate: booking.dropDate ? new Date(booking.dropDate).toLocaleDateString() : null,
    }))
  );

  useEffect(() => {
    const calculateBookingStats = () => {

      const filteredBookingData = bookings.filter(booking => booking.createdBy === 'Vendor');

      const currentYear = new Date().getFullYear();

      return filteredBookingData.reduce((acc, filteredBookingData) => {
        acc.total++;

        acc.totalValue += Number(filteredBookingData.finalAmount) || 0;

        return acc;
      }, { total: 0, totalValue: 0 });
    };

    const stats = calculateBookingStats();
    setTotalBookings(stats.total);
    setTotalBookingValue(stats.totalValue);
  }, [bookingData]);

  return (
    <>
      <div className="min-h-screen space-y-8 bg-slate-50 p-8">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">Dashboard</h2>

        {/* Charts - Pie */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card className="overflow-hidden border-none bg-white shadow-md">
            <CardContent className="p-6">
              <AreaChart createdBy="Vendor"/>
            </CardContent>
          </Card>
          <Card className="overflow-hidden border-none bg-white shadow-md">
            <CardContent className="p-6">
              <PaymentComponent createdBy="Vendor" />
            </CardContent>
          </Card>
        </div>

        {/* Overall shortcuts */}
        <div className="rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 p-6 shadow-lg">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <Link href="/vendor/invoices/create">
              <Card className="border-none bg-white/90 backdrop-blur transition-all hover:scale-105 hover:bg-white hover:shadow-lg">
                <CardHeader className="space-y-1 p-4">
                  <div className="flex items-center gap-3">
                    <CardTitle className="text-sm font-medium text-blue-900">Create Invoice</CardTitle>
                    <ArrowBigRight className='text-blue-900 ' />
                  </div>
                </CardHeader>
              </Card>
            </Link>
            <Link href="/vendor/bookings/create">
              <Card className="border-none bg-white/90 backdrop-blur transition-all hover:scale-105 hover:bg-white hover:shadow-lg">
                <CardHeader className="space-y-1 p-4">
                  <div className="flex items-center gap-3">
                    <CardTitle className="text-sm font-medium text-blue-900">Create Booking</CardTitle>
                    <ArrowBigRight className='text-blue-900' />
                  </div>
                </CardHeader>
              </Card>
            </Link>
            <Link href="/vendor/enquiry/create">
              <Card className="border-none bg-white/90 backdrop-blur transition-all hover:scale-105 hover:bg-white hover:shadow-lg">
                <CardHeader className="space-y-1 p-4">
                  <div className="flex items-center gap-3">
                    <CardTitle className="text-sm font-medium text-blue-900">Create Enquiry</CardTitle>
                    <ArrowBigRight className='text-blue-900' />
                  </div>
                </CardHeader>
              </Card>
            </Link>
          </div>
        </div>

        {/* Invoice table */}
        <InvoiceTable />

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
        <BookingTable />

        {/* Extra charts */}
        <div className="flex justify-center w-full gap-8">
          <Card className="border-none bg-white shadow-md w-[60%]">
            <CardContent className="p-6">
              <BarChartComponent createdBy="Vendor" />
            </CardContent>
          </Card>
        </div>

        {/* Enquiries */}
        <EnquiryTable />
      </div>
    </>
  )
}




