"use client"
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { BookingForm } from 'components/BookingForm'
import { Button } from 'components/ui/button'
import { toast } from "sonner"

export default function CreateBookingPage() {
  const router = useRouter()
  const [createdBy, setCreatedBy] = useState<"Admin" | "Vendor">("Admin")

  // const handleClose = () => {
  //   router.push('/admin/bookings')
  // }

  return (
    <>
      <div className="space-y-6 bg-white p-5 rounded ">
        {/* <h2 className="text-3xl font-bold tracking-tight flex justify-between">Create New Booking
          <Button onClick={handleClose}>Close</Button>
        </h2> */}
        <BookingForm createdBy={createdBy} />
      </div>
    </>)
}

