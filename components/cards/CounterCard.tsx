"use client"
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from 'components/ui/card';

const CounterCard = ({ color, icon: Icon, count, label, counterSize = 'text-2xl', cardSize = 'w-[250px]' }: any | null) => {
  const [currentCount, setCurrentCount] = useState(0);

  useEffect(() => {
    let isMounted = true; // Track if the component is mounted
    const increment = () => {
      if (isMounted && currentCount < count) {
        setCurrentCount(prevCount => Math.min(prevCount + 10, count));
      }
    };

    const interval = setInterval(increment, 10); // Adjust the interval as needed

    return () => {
      isMounted = false; // Cleanup on unmount
      clearInterval(interval);
    };
  }, [count]);

  useEffect(() => {
    setCurrentCount(count); // Directly set currentCount to count when it changes
  }, [count]);

  return (
    <Card className={`${cardSize} ${color} h-[150px] w-[full]` }>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{label}</CardTitle>
        <Icon className='h-5 w-5' />
      </CardHeader>
      <CardContent>
        <div className={`font-bold ${counterSize}`}>{currentCount ? currentCount: "0"}</div>
      </CardContent>
    </Card>
  );
};

export default CounterCard;