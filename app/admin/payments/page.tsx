"use client";

import { Card, CardTitle, CardHeader, CardContent } from 'components/ui/card';
import Link from "next/link";
import React from 'react';

export default function PaymentsPage() {
  return (
    <React.Fragment>
      <div className="space-y-6">
        <div className="rounded bg-white p-5 shadow">
          <div className='flex flex-col'>
            <div className="flex justify-between items-center mb-5">
              <h1 className="text-2xl font-bold tracking-tight">Payments Page</h1>
            </div>
            {/* First Row with 3 Cards */}
            <div className="flex justify-between mt-5 mb-5">
              <Link href="/admin/payments/customer">
                <Card className="flex items-center justify-center bg-[#D0DDD0] hover:bg-[#B0C0B0] transition duration-200 w-[300px] h-[150px]">
                  <CardContent>
                    <div className="text-xl text-center">Customer</div>
                    <div className="text-xl text-center">Payments</div>
                  </CardContent>
                </Card>
              </Link>
              <Link href="/admin/payments/driver">
                <Card className="flex items-center justify-center bg-[#D0DDD0] hover:bg-[#B0C0B0] transition duration-200 w-[300px] h-[150px]">
                  <CardContent>
                    <div className="text-xl text-center">Driver</div>
                    <div className="text-xl text-center">Payments</div>
                  </CardContent>
                </Card>
              </Link>
              <Link href="/admin/payments/general">
                <Card className="flex items-center justify-center bg-[#D0DDD0] hover:bg-[#B0C0B0] transition duration-200 w-[300px] h-[150px]">
                  <CardContent>
                    <div className="text-xl text-center">General </div>
                    <div className="text-xl text-center">Payments</div>
                  </CardContent>
                </Card>
              </Link>
            </div>
            {/* Second Row with 2 Cards */}
            <div className="flex justify-center gap-16 mb-10 mt-10">
              <Link href="/admin/payments/service">
                <Card className="flex items-center justify-center bg-[#D0DDD0] hover:bg-[#B0C0B0] transition duration-200 w-[300px] h-[150px]">
                  <CardContent>
                    <div className="text-xl text-center ">Service</div>
                    <div className="text-xl text-center">Payments</div>
                  </CardContent>
                </Card>
              </Link>
              <Link href="/admin/payments/vendor">
                <Card className="flex items-center justify-center bg-[#D0DDD0] hover:bg-[#B0C0B0] transition duration-200 w-[300px] h-[150px]">
                  <CardContent>
                    <div className="text-xl text-center ">Vendor</div>
                    <div className="text-xl text-center ">Payments</div>
                  </CardContent>
                </Card>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </React.Fragment>
  );
}