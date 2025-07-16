"use client"

import { useRouter } from 'next/navigation'
import { VendorBookingForm } from 'components/vendor/VendorBookingForm'
import { Button } from 'components/ui/button'
import { toast } from "sonner"
import { useState } from 'react'

export default function CreateBookingPage() {
  const router = useRouter()
  const [createdBy, setCreatedBy] = useState("Vendor")


  return (
    <div className="space-y-6 bg-white p-5 rounded ">
      <VendorBookingForm createdBy={createdBy} />
    </div>
  )
}


