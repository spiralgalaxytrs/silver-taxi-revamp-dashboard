"use client";

import React, { useMemo, useState } from "react";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts";
import dayjs from "dayjs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Loader2 } from "lucide-react";

interface DriverProps {
    drivers: any[];
    isLoading: boolean;
}

export function Overview({ drivers = [], isLoading }: DriverProps) {
    const [timeFilter, setTimeFilter] = useState<string>("year"); // Default filter: year

    const filteredDrivers = useMemo(() => {
        if (!drivers || drivers.length === 0) return [];

        const now = dayjs();
        let filtered = [...drivers];

        switch (timeFilter) {
            case "day":
                filtered = drivers.filter((driver) =>
                    dayjs(driver.createdAt).isSame(now, "day")
                );
                break;
            case "month":
                filtered = drivers.filter((driver) =>
                    dayjs(driver.createdAt).isSame(now, "month")
                );
                break;
            case "year":
                filtered = drivers.filter((driver) =>
                    dayjs(driver.createdAt).isSame(now, "year")
                );
                break;
            case "lastYear":
                filtered = drivers.filter((driver) => {
                    const driverDate = dayjs(driver.createdAt);
                    const startOfLastYear = now.subtract(1, "year").startOf("year");
                    const endOfLastYear = now.subtract(1, "year").endOf("year");
                    return (
                        driverDate.isAfter(startOfLastYear) &&
                        driverDate.isBefore(endOfLastYear) ||
                        driverDate.isSame(startOfLastYear, "day") ||
                        driverDate.isSame(endOfLastYear, "day")
                    );
                });
                break;
            default:
                break;
        }

        const top5Drivers = filtered
            .sort((a, b) => (b.bookingCount || 0) - (a.bookingCount || 0))
            .slice(0, 5);

        return top5Drivers.map((driver) => ({
            name: driver.name || "Unknown",
            total: driver.bookingCount || 0,
        }));
    }, [drivers, timeFilter]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-[350px] bg-gray-50">
                <Loader2 className="w-12 h-12 animate-spin text-primary" />
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
                        value={timeFilter}
                        onValueChange={(value) => setTimeFilter(value)}
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
                <BarChart data={filteredDrivers}>
                    <XAxis
                        dataKey="name"
                        stroke="#888888"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                    />
                    <YAxis
                        stroke="#888888"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => `${value}`}
                    />
                    <Bar dataKey="total" fill="#0096FF" radius={[4, 4, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>

        </div >
    );
}