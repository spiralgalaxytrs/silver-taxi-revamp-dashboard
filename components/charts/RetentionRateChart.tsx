"use client"

import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

const data = [
  { week: "Week 1", retentionRate: 100 },
  { week: "Week 2", retentionRate: 80 },
  { week: "Week 3", retentionRate: 70 },
  { week: "Week 4", retentionRate: 60 },
  { week: "Week 5", retentionRate: 55 },
  { week: "Week 6", retentionRate: 50 },
  { week: "Week 7", retentionRate: 48 },
  { week: "Week 8", retentionRate: 45 },
]

export function RetentionRateChart() {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data}>
        <XAxis dataKey="week" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}%`} />
        <Tooltip />
        <Bar dataKey="retentionRate" fill="#8884d8" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}

