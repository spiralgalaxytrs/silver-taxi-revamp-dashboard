"use client"

import { Loader2 } from "lucide-react";
import { Bar, BarChart, XAxis, YAxis } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "components/ui/chart";
import { useEffect, useMemo } from "react";

const colorMap: { [key: string]: string } = {
  "One way": "hsl(var(--chart-1))",      // Set color for One way
  "Round trip": "hsl(var(--chart-2))",   // Set color for Round trip
  "Airport": "hsl(var(--chart-3))",     // Set color for Airport
  "Package": "hsl(var(--chart-4))"      // Set color for Package
};

const chartConfig = {
  count: {
    label: "Count",
  },
  "One way": {
    label: "One way",
    color: colorMap["One way"],
  },
  "Round trip": {
    label: "Round trip",
    color: colorMap["Round trip"],
  },
  // "Airport": {
  //   label: "Airport",
  //   color: colorMap["Airport"],
  // },
  // "Package": {
  //   label: "Package",
  //   color: colorMap["Package"],
  // },
} satisfies ChartConfig;

// Custom Legend Component
const ChartLegend = ({ config }: { config: ChartConfig }) => {
  return (
    <div className="flex justify-center gap-4 mt-4 flex-wrap">
      {Object.entries(config).map(([key, value]) => {
        if (key === "count") return null; // Skip the "count" entry
        return (
          <div key={key} className="flex items-center gap-2">
            <div
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: value.color }}
            />
            <span className="text-sm">{value.label}</span>
          </div>
        );
      })}
    </div>
  );
};

interface AreaChartProps {
  createdBy: string;
  bookings: any[];
  isLoading: boolean
}

export function AreaChart({ createdBy, bookings, isLoading }: AreaChartProps) {

  const chartData = useMemo(() => {
    const initial = [
      { service: "One way", bookings: 0, fill: colorMap["One way"] },
      { service: "Round trip", bookings: 0, fill: colorMap["Round trip"] },
      // { service: "Package", bookings: 0, fill: colorMap["Package"] },
      // { service: "Airport", bookings: 0, fill: colorMap["Airport"] },
    ];

    const filteredBookings =
      createdBy === "Vendor"
        ? bookings.filter((b) => b.createdBy === "Vendor")
        : bookings;

    filteredBookings.forEach((booking) => {
      const index = initial.findIndex((item) => item.service === booking.serviceType);
      if (index !== -1) initial[index].bookings++;
    });

    return initial;
  }, [bookings, createdBy]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Services</CardTitle>
        <CardDescription>Showing total services per Bookings</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mt-5">
          <ChartContainer config={chartConfig}>
            <BarChart
              accessibilityLayer
              data={chartData}
              layout="vertical"
              barCategoryGap={30}
              margin={{
                left: 10,
              }}
            >
              <YAxis
                dataKey="service"
                type="category"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                tickFormatter={(value) =>
                  chartConfig[value as keyof typeof chartConfig]?.label
                }
              />
              <XAxis dataKey="bookings" type="number" hide />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <Bar dataKey="bookings" layout="vertical" radius={5} />
            </BarChart>
          </ChartContainer>
        </div>
        {/* Add the custom legend */}
        <div className="mt-10">
          <ChartLegend config={chartConfig} />
        </div>
      </CardContent>
    </Card>
  );
}