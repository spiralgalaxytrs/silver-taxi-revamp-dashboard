"use client"

import { useRouter } from 'next/navigation'
import { VendorBookingForm } from 'components/vendor/VendorBookingForm'
import { Button } from 'components/ui/button'
import { toast } from "sonner"
import { useState } from 'react'

export default function CreateBookingPage() {
  const router = useRouter()
  const [createdBy, setCreatedBy] = useState("Vendor")

  // const handleClose = () => {
  //   router.push('/vendor/bookings')
  // }

  return (
    <>
      <div className="space-y-6 bg-white p-5 rounded ">
        {/* <h2 className="text-3xl font-bold tracking-tight flex justify-between">Create New Booking
          <Button onClick={handleClose}>Close</Button>
        </h2> */}
        <VendorBookingForm createdBy={createdBy} />
      </div>
    </>)
}


