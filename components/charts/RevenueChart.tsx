"use client"

import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

const data = [
  { date: "Jan 1", revenue: 4000 },
  { date: "Jan 8", revenue: 3000 },
  { date: "Jan 15", revenue: 5000 },
  { date: "Jan 22", revenue: 2780 },
  { date: "Jan 29", revenue: 1890 },
  { date: "Feb 5", revenue: 2390 },
  { date: "Feb 12", revenue: 3490 },
]

export function RevenueChart() {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <LineChart data={data}>
        <XAxis dataKey="date" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `$${value}`}
        />
        <Tooltip />
        <Line type="monotone" dataKey="revenue" stroke="#8884d8" strokeWidth={2} />
      </LineChart>
    </ResponsiveContainer>
  )
}

