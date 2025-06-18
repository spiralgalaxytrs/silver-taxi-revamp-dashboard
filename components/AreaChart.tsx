// "use client"


// import { Bar, BarChart, XAxis, YAxis, Legend } from "recharts";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardFooter,
//   CardHeader,
//   CardTitle,
// } from "components/ui/card";
// import {
//   ChartConfig,
//   ChartContainer,
//   ChartTooltip,
//   ChartTooltipContent,
// } from "components/ui/chart";
// import { useBookingStore } from "stores/bookingStore";
// import { useEffect, useState } from "react";

// const chartConfig = {
//   count: {
//     label: "Count",
//     color: "hsl(var(--chart-1))",
//   },
// } satisfies ChartConfig;

// const colorMap: { [key: string]: string } = {
//   "One way": "blue",
//   "Round trip": "green",
//   "Airport": "purple",
//   "Package": "yellow"
// };

// export function AreaChart({ createdBy }: { createdBy: string }) {
//   const { fetchBookings, bookings, fetchVendorBookings } = useBookingStore();
//   const [chartData, setChartData] = useState([
//     { service: "One way", "One way_bookings": 0 },
//     { service: "Round trip", "Round trip_bookings": 0 },
//     { service: "Package", Package_bookings: 0 },
//     { service: "Airport", Airport_bookings: 0 },
//   ]);

//   useEffect(() => {
//     const fetchAndSetBookings = async () => {
//       const initialChartData = [
//         { service: "One way", "One way_bookings": 0 },
//         { service: "Round trip", "Round trip_bookings": 0 },
//         { service: "Package", Package_bookings: 0 },
//         { service: "Airport", Airport_bookings: 0 },
//       ]

//       if (createdBy === "Vendor") {
//         fetchVendorBookings()
//         const updatedData = [...initialChartData]
//         bookings
//           .filter((booking) => booking.createdBy === "Vendor")
//           .forEach((booking) => {
//             const index = updatedData.findIndex((item) => item.service === booking.serviceType)
//             if (index !== -1 && booking.serviceType) {
//               updatedData[index][`${booking.serviceType}_bookings`] =
//                 (updatedData[index][`${booking.serviceType}_bookings`] || 0) + 1
//             }
//           })
//         setChartData(updatedData)
//       }

//       if (createdBy === "Admin") {
//         fetchBookings()
//         const updatedData = [...initialChartData]
//         bookings.forEach((booking) => {
//           const index = updatedData.findIndex((item) => item.service === booking.serviceType)
//           if (index !== -1 && booking.serviceType) {
//             updatedData[index][`${booking.serviceType}_bookings`] =
//               (updatedData[index][`${booking.serviceType}_bookings`] || 0) + 1
//           }
//         })
//         setChartData(updatedData)
//       }
//     }

//     fetchAndSetBookings();
//   }, [bookings, createdBy, fetchBookings, fetchVendorBookings]);

//   return (
//     <Card>
//       <CardHeader>
//         <CardTitle>Services</CardTitle>
//         <CardDescription>Showing total services per Bookings</CardDescription>
//       </CardHeader>
//       <CardContent>
//         <ChartContainer config={chartConfig}>
//           <BarChart
//             accessibilityLayer
//             data={chartData}
//             layout="vertical"
//             width={600} // Set the width of the chart
//             height={400} // Set the height of the chart
//             margin={{ top: 20, right: 30, left: 20, bottom: 5 }} // Adjust margins if needed
//           >
//             <XAxis type="number" hide />
//             <YAxis
//               dataKey="service"
//               type="category"
//               tickLine={false}
//               tickMargin={5}
//               axisLine={false}
//             />
//             <ChartTooltip
//               cursor={false}
//               content={<ChartTooltipContent hideLabel />}
//             />
//             {/* <Legend  className=" mt-4"/> */}
//             {chartData.map((item) => (
//               <Bar
//                 key={item.service} // Use the service name as the unique key
//                 dataKey={`${item.service}_bookings`} // Unique dataKey for each service
//                 fill={colorMap[item.service]} // Dynamically set the fill color
//                 radius={[0, 4, 4, 0]}
//                 barSize={30}
//                 width={100}
//               />
//             ))}
//           </BarChart>
//         </ChartContainer>
//       </CardContent>
//     </Card>
//   );
// }

"use client"

import { TrendingUp } from "lucide-react";
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
import { useBookingStore } from "stores/bookingStore";
import { useEffect, useState } from "react";

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
  "Airport": {
    label: "Airport",
    color: colorMap["Airport"],
  },
  "Package": {
    label: "Package",
    color: colorMap["Package"],
  },
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

export function AreaChart({ createdBy }: { createdBy: string }) {
  const { fetchBookings, bookings, fetchVendorBookings } = useBookingStore();
  const [chartData, setChartData] = useState([
    { service: "One way", bookings: 0, fill: colorMap["One way"] },
    { service: "Round trip", bookings: 0, fill: colorMap["Round trip"] },
    { service: "Package", bookings: 0, fill: colorMap["Package"] },
    { service: "Airport", bookings: 0, fill: colorMap["Airport"] },
  ]);

  useEffect(() => {
    const fetchAndSetBookings = async () => {
      const updatedChartData = chartData.map((item) => ({ ...item, bookings: 0 }));

      if (createdBy === "Vendor") {
        fetchVendorBookings();
        bookings
          .filter((booking) => booking.createdBy === "Vendor")
          .forEach((booking) => {
            const index = updatedChartData.findIndex(
              (item) => item.service === booking.serviceType
            );
            if (index !== -1) updatedChartData[index].bookings++;
          });
      }

      if (createdBy === "Admin") {
        fetchBookings();
        bookings.forEach((booking) => {
          const index = updatedChartData.findIndex(
            (item) => item.service === booking.serviceType
          );
          if (index !== -1) updatedChartData[index].bookings++;
        });
      }
      setChartData(updatedChartData);
    };
    fetchAndSetBookings();
  }, [createdBy]);

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
              margin={{
                left: 5,
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