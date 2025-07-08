"use client"

import { useRouter } from 'next/navigation'
import { BookingForm } from 'components/booking/BookingForm'
import { useState, useEffect } from 'react'


export default function EditBookingPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()

  const [id, setId] = useState<string | undefined>(undefined)
  const [createdBy, setCreatedBy] = useState<"Admin" | "Vendor">("Admin")

  useEffect(() => {
    const resolvedParams = async () => {
      const resolvedParams = await params
      setId(resolvedParams.id)
    }
    resolvedParams()
  }, [params])

  const handleClose = () => {
    router.push('/admin/bookings')
  }


  return (
    <div className="space-y-6 bg-white  rounded-lg p-4">
      <BookingForm id={id} createdBy={createdBy} />
    </div>
  )
}



