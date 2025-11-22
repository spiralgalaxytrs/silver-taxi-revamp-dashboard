"use client"

import { Loader2, TrendingUp } from "lucide-react"
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
import { useEffect, useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"

const chartConfig = {
  Booking: {
    label: "Booking",
    color: "hsl(var(--chart-1))",
  },
  // Enquiry: {
  //   label: "Enquiry",
  //   color: "hsl(var(--chart-2))",
  // },
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

interface BarChartProps {
  createdBy: string
  data: { category: string; Booking?: number; Bookings?: number; }[],
  isLoading: boolean
  filter: TimeFilter
  setFilter: (filter: TimeFilter) => void
}

export function BarChartComponent({ createdBy, data: initialData, isLoading, filter: initialFilter, setFilter }: BarChartProps) {
  // Normalize data: convert "Bookings" to "Booking" if needed
  const normalizeData = (data: BarChartProps['data']): { category: string; Booking: number; }[] => {
    return data.map((item) => ({
      category: item.category,
      Booking: item.Booking ?? item.Bookings ?? 0
    }))
  }

  const [data, setDataState] = useState<{ category: string; Booking: number; }[]>(() => normalizeData(initialData))
  const [filter, setFilterState] = useState<TimeFilter>(initialFilter)

  const handleFilterChange = (value: TimeFilter) => {
    setFilterState(value)
    setFilter(value)
  }

  useEffect(() => {
    setDataState(normalizeData(initialData))
  }, [initialData])

  console.log("data >> ", data);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[350px] bg-gray-50">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row justify-between items-center">
        <div>
          <CardTitle>Booking</CardTitle>
          <CardDescription className="mt-2">
            {filter === 'lastYear' ? 'Last Year' : `Current ${filter.charAt(0).toUpperCase() + filter.slice(1)}`}
          </CardDescription>
        </div>
        <Select value={filter} onValueChange={(v) => handleFilterChange(v as TimeFilter)}>
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
            {/* <Bar dataKey="Enquiry" fill="var(--color-Enquiry)" radius={4} /> */}
          </BarChart>
        </ChartContainer>
        <ChartLegend config={chartConfig} />
      </CardContent>
    </Card>
  )
}