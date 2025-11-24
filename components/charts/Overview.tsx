"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts";
import dayjs from "dayjs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Loader2 } from "lucide-react";

type TimeFilter = 'day' | 'week' | 'month' | 'year' | 'lastYear'

interface DriverProps {
    data: any[];
    isLoading: boolean;
    filter: TimeFilter
    setFilter: (filter: TimeFilter) => void
}

export function Overview({ data: initialData, isLoading, filter: initialFilter, setFilter }: DriverProps) {
    const [data, setDataState] = useState<any[]>(initialData)
    const [filter, setFilterState] = useState<TimeFilter>(initialFilter)

    const handleFilterChange = (value: TimeFilter) => {
        setFilterState(value)
        setFilter(value)
    }

    useEffect(() => {
        setDataState(initialData)
    }, [initialData])

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-[350px] bg-gray-50">
                <Loader2 className="w-12 h-12 animate-spin text-primary" />
            </div>
        );
    }

    // Determine the correct dataKey for the bar value and label
    const labelKey = data.length > 0
        ? (data[0].name !== undefined ? "name" : data[0].category !== undefined ? "category" : "label")
        : "name";

    const valueKey = data.length > 0
        ? (data[0].total !== undefined ? "total" : data[0].Booking !== undefined ? "Booking" : "value")
        : "Booking";

    if (data.length === 0) {
        return (
            <div className="flex items-center justify-center h-[450px] bg-gray-50">
                <div className="text-l font-semibold">
                    No data available
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4 mt-3">
            <div className="flex flex-row justify-between items-center">
                <div className="text-l font-semibold">
                    <h2>Top 5 Drivers</h2>
                </div>

                {/* Filter Controls */}
                <div className="flex gap-4">
                    <Select
                        value={filter}
                        disabled
                        onValueChange={(value) => handleFilterChange(value as TimeFilter)}
                    >
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Select Time Period" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="day">Today</SelectItem>
                            <SelectItem value="month">This Month</SelectItem>
                            <SelectItem value="year">This Year</SelectItem>
                            <SelectItem value="lastYear">Last Year</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Bar Chart */}
            <ResponsiveContainer width="100%" height={350}>
                <BarChart data={data}>
                    <XAxis
                        dataKey={labelKey}
                        stroke="#888888"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        angle={-45}
                        textAnchor="end"
                        height={80}
                    />
                    <YAxis
                        stroke="#888888"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => `${value}`}
                    />
                    <Bar dataKey={valueKey} fill="#0096FF" radius={[4, 4, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>

        </div >
    );
}