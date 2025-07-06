"use client"

import { TrendingUp } from "lucide-react"
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "../ui/chart"
import dayjs from "dayjs"
import { useBookingStore } from "stores/bookingStore"
import { useEnquiryStore } from "stores/-enquiryStore"
import { useEffect, useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { aw } from "node_modules/framer-motion/dist/types.d-6pKw1mTI"

const chartConfig = {
  Booking: {
    label: "Booking",
    color: "hsl(var(--chart-1))",
  },
  Enquiry: {
    label: "Enquiry",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig

type TimeFilter = 'day' | 'week' | 'month' | 'year' | 'lastYear'

const ChartLegend = ({ config }: { config: ChartConfig }) => {
  return (
    <div className="flex justify-center text-start gap-4 mt-4">
      {Object.entries(config).map(([key, value]) => (
        <div key={key} className="flex items-center gap-2">
          <div
            className="w-4 h-4 rounded-full"
            style={{ backgroundColor: value.color }}
          />
          <span className="text-sm">{value.label}</span>
        </div>
      ))}
    </div>
  )
}

export function BarChartComponent({ createdBy }: { createdBy: string }) {
  const { fetchBookings, fetchVendorBookings, bookings } = useBookingStore()
  const { fetchEnquiries, fetchVendorEnquiries, enquiries } = useEnquiryStore()
  const [data, setData] = useState<{ category: string; Booking: number; Enquiry: number }[]>([])
  const [filter, setFilter] = useState<TimeFilter>('week')

  // Separate useEffect for data fetching
  useEffect(() => {
    if (createdBy === "Vendor") {
      fetchVendorBookings()
      fetchVendorEnquiries()
    } else {
      fetchBookings()
      fetchEnquiries()
    }
  }, [createdBy]) // Only run when createdBy changes

  const formatHourToAMPM = (hour: number) => {
    const formattedHour = hour % 12 || 12; // Convert 0-23 to 12-12-11
    const period = hour < 12 ? 'AM' : 'PM';
    return `${formattedHour} ${period}`;
  };

  useEffect(() => {
    const processData = () => {
      const now = dayjs()
      let startDate = dayjs()
      let categories: string[] = []

      // Determine date range based on filter
      switch (filter) {
        case 'day':
          startDate = now.startOf('day')
          categories = Array.from({ length: 24 }, (_, i) => formatHourToAMPM(i))
          break
        case 'week':
          startDate = now.startOf('week')
          categories = Array.from({ length: 7 }, (_, i) =>
            startDate.add(i, 'day').format('ddd')
          )
          break
        case 'month':
          startDate = now.startOf('month')
          const daysInMonth = now.daysInMonth()
          categories = Array.from({ length: daysInMonth }, (_, i) =>
            (i + 1).toString()
          )
          break
        case 'year':
          startDate = now.startOf('year')
          categories = Array.from({ length: 12 }, (_, i) =>
            startDate.add(i, 'month').format('MMM')
          )
          break
        case 'lastYear':
          startDate = now.subtract(1, 'year').startOf('year')
          categories = Array.from({ length: 12 }, (_, i) =>
            startDate.add(i, 'month').format('MMM')
          )
          break
      }

      // Initialize data structure
      const result = categories.map(category => ({
        category,
        Booking: 0,
        Enquiry: 0
      }))

      if (createdBy === "Vendor") {
        const filteredBookings = bookings.filter(booking => booking.createdBy === 'Vendor');
        filteredBookings.forEach(booking => {
          const date = dayjs(booking.bookingDate)
          if (!date.isAfter(startDate)) return

          const index = getCategoryIndex(date, filter, categories, startDate)
          if (index !== -1) result[index].Booking++
        })

        const filteredEnquiries = enquiries.filter(enquiry => enquiry.createdBy === 'Vendor');
        filteredEnquiries.forEach(enquiry => {
          const date = dayjs(enquiry.createdAt)
          if (!date.isAfter(startDate)) return

          const index = getCategoryIndex(date, filter, categories, startDate)
          if (index !== -1) result[index].Enquiry++
        })
      }

      if (createdBy === "Admin") {
        bookings.forEach((booking:any) => {
          const date = dayjs(booking.bookingDate)
          if (!date.isAfter(startDate)) return

          const index = getCategoryIndex(date, filter, categories, startDate)
          if (index !== -1) result[index].Booking++
        })

        // Process enquiries
        enquiries.forEach(enquiry => {
          const date = dayjs(enquiry.createdAt)
          if (!date.isAfter(startDate)) return

          const index = getCategoryIndex(date, filter, categories, startDate)
          if (index !== -1) result[index].Enquiry++
        })
      }

      setData(result)
    }

    processData()
  }, [bookings, enquiries, filter, createdBy]) // Dependencies for data processing

  const getCategoryIndex = (date: dayjs.Dayjs, filter: TimeFilter, categories: string[], startDate: dayjs.Dayjs): number => {
    switch (filter) {
      case 'day':
        return date.hour()
      case 'week':
        return date.diff(startDate, 'day')
      case 'month':
        return date.date() - 1
      case 'year':
        return date.month()
      case 'lastYear':
        return date.month()
      default:
        return -1
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row justify-between items-center">
        <div>
          <CardTitle>Booking & Enquiry</CardTitle>
          <CardDescription className="mt-2">
            {filter === 'lastYear' ? 'Last Year' : `Current ${filter.charAt(0).toUpperCase() + filter.slice(1)}`}
          </CardDescription>
        </div>
        <Select value={filter} onValueChange={(v) => setFilter(v as TimeFilter)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select filter" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="day">Today</SelectItem>
            <SelectItem value="week">This Week</SelectItem>
            <SelectItem value="month">This Month</SelectItem>
            <SelectItem value="year">This Year</SelectItem>
            <SelectItem value="lastYear">Last Year</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="mt-14">
        <ChartContainer config={chartConfig}>
          <BarChart accessibilityLayer data={data}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="category"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dashed" />}
            />
            <Bar dataKey="Booking" fill="var(--color-Booking)" radius={4} />
            <Bar dataKey="Enquiry" fill="var(--color-Enquiry)" radius={4} />
          </BarChart>
        </ChartContainer>
        <ChartLegend config={chartConfig}/>
      </CardContent>
    </Card>
  )
}