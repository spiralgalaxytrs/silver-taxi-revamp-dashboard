"use client"

import { Pie, PieChart, ResponsiveContainer, Tooltip, Cell } from "recharts"

const data = [
  { name: "Ride Booking", value: 400 },
  { name: "Fare Estimation", value: 300 },
  { name: "Profile Management", value: 200 },
  { name: "Payment", value: 100 },
]

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042']

export function AppUsageChart() {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
      </PieChart>
    </ResponsiveContainer>
  )
}

