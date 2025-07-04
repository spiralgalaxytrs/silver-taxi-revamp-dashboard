"use client"

import * as React from "react"
import { Label, Pie, PieChart, Sector } from "recharts"
import { PieSectorDataItem } from "recharts/types/polar/Pie"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartStyle,
  ChartTooltip,
  ChartTooltipContent,
} from "../ui/chart"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select"
import { useBookingStore } from "stores/bookingStore"
import { useEffect, useState } from "react"
const desktopData = [
  { paymentMethod: "UPI", count: 186, fill: "var(--color-UPI)" },
  { paymentMethod: "Bank", count: 305, fill: "var(--color-Bank)" },
  { paymentMethod: "Cash", count: 237, fill: "var(--color-Cash)" },
  { paymentMethod: "Card", count: 173, fill: "var(--color-Card)" },
]


export function PaymentComponent({ createdBy }: { createdBy: string }) {

  const { fetchBookings, fetchVendorBookings, bookings } = useBookingStore();
  const [chartData, setChartData] = useState<{ paymentMethod: string; count: number; fill: string }[]>([
    { paymentMethod: "UPI", count: 0, fill: "var(--color-UPI)" },
    { paymentMethod: "Bank", count: 0, fill: "var(--color-Bank)" },
    { paymentMethod: "Cash", count: 0, fill: "var(--color-Cash)" },
    { paymentMethod: "Card", count: 0, fill: "var(--color-Card)" },
  ]);

  useEffect(() => {

    const updatedChartData = chartData.map(item => ({ ...item, count: 0 }));

    if (createdBy === "Vendor") {
      fetchVendorBookings();
      const filteredBookings = bookings.filter(booking => booking.createdBy === 'Vendor');
      filteredBookings.forEach((booking) => {
        if (booking.paymentMethod === "UPI") {
          updatedChartData[0].count++;
        } else if (booking.paymentMethod === "Bank") {
          updatedChartData[1].count++;
        } else if (booking.paymentMethod === "Cash") {
          updatedChartData[2].count++;
        } else if (booking.paymentMethod === "Card") {
          updatedChartData[3].count++;
        }
      });
    }

    if (createdBy === "Admin") {
      fetchBookings();
      bookings.forEach((booking) => {
        if (booking.paymentMethod === "UPI") {
          updatedChartData[0].count++;
        } else if (booking.paymentMethod === "Bank") {
          updatedChartData[1].count++;
        } else if (booking.paymentMethod === "Cash") {
          updatedChartData[2].count++;
        } else if (booking.paymentMethod === "Card") {
          updatedChartData[3].count++;
        }
      });
    }
    setChartData(updatedChartData);
  }, []);

  const chartConfig = {

    UPI: {
      label: "UPI",
      color: "hsl(var(--chart-1))",
    },
    Bank: {
      label: "Bank",
      color: "hsl(var(--chart-2))",
    },
    Cash: {
      label: "Cash",
      color: "hsl(var(--chart-3))",
    },
    Card: {
      label: "Card",
      color: "hsl(var(--chart-4))",
    },
  } satisfies ChartConfig

  const id = "pie-interactive"
  const [activeMonth, setActiveMonth] = React.useState(chartData[0].paymentMethod)

  const activeIndex = React.useMemo(
    () => chartData.findIndex((item) => item.paymentMethod === activeMonth),
    [activeMonth]
  )
  const months = React.useMemo(() => chartData.map((item) => item.paymentMethod), [])

  const ChartLegend = ({ config }: { config: ChartConfig }) => {
    return (
      <div className="flex justify-center gap-4 mt-4 flex-wrap">
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
    );
  };
  

  return (
    <Card data-chart={id} className="flex flex-col">
      <ChartStyle id={id} config={chartConfig} />
      <CardHeader className="flex-row items-start space-y-0 pb-0">
        <div className="grid gap-1">
          <CardTitle>Payment methods</CardTitle>
          <CardDescription>Choose - UPI / Bank / Cash / Card</CardDescription>
        </div>
        <Select value={activeMonth} onValueChange={setActiveMonth}>
          <SelectTrigger
            className="ml-auto h-7 w-[130px] rounded-lg pl-2.5"
            aria-label="Select a value"
          >
            <SelectValue placeholder="Select month" />
          </SelectTrigger>
          <SelectContent align="end" className="rounded-xl">
            {months.map((key) => {
              const config = chartConfig[key as keyof typeof chartConfig]

              if (!config) {
                return null
              }

              return (
                <SelectItem
                  key={key}
                  value={key}
                  className="rounded-lg [&_span]:flex"
                >
                  <div className="flex items-center gap-2 text-xs">
                    <span
                      className="flex h-3 w-3 shrink-0 rounded-sm"
                      style={{
                        backgroundColor: `var(--color-${key})`,
                      }}
                    />
                    {config?.label}
                  </div>
                </SelectItem>
              )
            })}
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center pb-0">
        <ChartContainer
          id={id}
          config={chartConfig}
          className="mx-auto aspect-square w-full max-w-[300px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={chartData}
              dataKey="count"
              nameKey="paymentMethod"
              innerRadius={60}
              strokeWidth={5}
              activeIndex={activeIndex}
              activeShape={({
                outerRadius = 0,
                ...props
              }: PieSectorDataItem) => (
                <g>
                  <Sector {...props} outerRadius={outerRadius + 10} />
                  <Sector
                    {...props}
                    outerRadius={outerRadius + 25}
                    innerRadius={outerRadius + 12}
                  />
                </g>
              )}
            >
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="fill-foreground text-3xl font-bold"
                        >
                          {chartData[activeIndex].count.toLocaleString()}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className="fill-muted-foreground"
                        >
                          Count
                        </tspan>
                      </text>
                    )
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
        <ChartLegend config={chartConfig} />
      </CardContent>
    </Card>
  )
}
