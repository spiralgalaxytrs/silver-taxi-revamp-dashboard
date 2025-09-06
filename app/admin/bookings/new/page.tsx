"use client"
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { NewBookingForm } from 'components/booking/NewBookingForm'

export default function NewCreateBookingPage() {
  const router = useRouter()
  const [createdBy, setCreatedBy] = useState<"Admin" | "Vendor">("Admin")

  return (
    <div className="min-h-screen bg-gray-50">
      <NewBookingForm createdBy={createdBy} />
    </div>
  )
}
