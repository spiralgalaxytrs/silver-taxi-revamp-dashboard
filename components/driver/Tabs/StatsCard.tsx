import React from "react";
import { Card } from "components/ui/card";
import CounterCard from "components/cards/CounterCard";
import { Activity } from "lucide-react";

interface StatsCardProps {
  count: number;
  label: string;
  gradientFrom: string;
  gradientTo: string;
  color: string;
  format?: "currency" | "default";
}

export function StatsCard({
  count,
  label,
  gradientFrom,
  gradientTo,
  color,
  format = "default",
}: StatsCardProps) {
  return (
    <Card
      className={`relative overflow-hidden border-none bg-gradient-to-br from-${gradientFrom}-50 to-${gradientTo}-50 shadow-md w-full h-[120px] transform transition duration-300 ease-in-out hover:scale-105`}
    >
      <div
        className={`absolute inset-0 bg-gradient-to-r from-${gradientFrom}-500/10 to-${gradientTo}-500/10 opacity-0 w-full`}
      />
      <div className="h-[150px] w-full">
        <CounterCard
          color={`bg-${color}-100`}
          icon={Activity}
          count={count}
          label={label}
          className="relative z-10 p-6"
          format={format}
        />
      </div>
      <div
        className={`absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-${gradientFrom}-500 to-${gradientTo}-500 transform scale-x-100`}
      />
    </Card>
  );
}