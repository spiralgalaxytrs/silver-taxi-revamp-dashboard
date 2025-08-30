"use client"
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { BookingForm } from 'components/booking/BookingForm'


export default function CreateBookingPage() {
  const router = useRouter()
  const [createdBy, setCreatedBy] = useState<"Admin" | "Vendor">("Admin")


  return (
    <div className="space-y-6 bg-white p-5 rounded ">
      <BookingForm createdBy={createdBy} />
    </div>
  )
}

