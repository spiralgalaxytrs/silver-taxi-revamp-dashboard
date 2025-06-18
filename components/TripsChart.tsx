"use client"

import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

const data = [
  { date: "Jan 1", trips: 400 },
  { date: "Jan 8", trips: 300 },
  { date: "Jan 15", trips: 500 },
  { date: "Jan 22", trips: 278 },
  { date: "Jan 29", trips: 189 },
  { date: "Feb 5", trips: 239 },
  { date: "Feb 12", trips: 349 },
]

export function TripsChart() {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data}>
        <XAxis dataKey="date" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
        <Tooltip />
        <Bar dataKey="trips" fill="#8884d8" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}

