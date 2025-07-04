"use client"

import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

const data = [
  { date: "Jan 1", activeUsers: 4000, newUsers: 2400 },
  { date: "Jan 8", activeUsers: 3000, newUsers: 1398 },
  { date: "Jan 15", activeUsers: 2000, newUsers: 9800 },
  { date: "Jan 22", activeUsers: 2780, newUsers: 3908 },
  { date: "Jan 29", activeUsers: 1890, newUsers: 4800 },
  { date: "Feb 5", activeUsers: 2390, newUsers: 3800 },
  { date: "Feb 12", activeUsers: 3490, newUsers: 4300 },
]

export function UserActivityChart() {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <LineChart data={data}>
        <XAxis dataKey="date" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
        <Tooltip />
        <Line type="monotone" dataKey="activeUsers" stroke="#8884d8" strokeWidth={2} />
        <Line type="monotone" dataKey="newUsers" stroke="#82ca9d" strokeWidth={2} />
      </LineChart>
    </ResponsiveContainer>
  )
}

