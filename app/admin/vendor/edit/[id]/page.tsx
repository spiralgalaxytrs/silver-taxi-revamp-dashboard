"use client"

import { useRouter } from 'next/navigation'
import { VendorForm } from 'components/VendorForm'
import { Button } from 'components/ui/button'
import { toast } from "sonner"
import React, { useState, useEffect } from 'react'


export default function EditBookingPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()

  const [id, setId] = useState<string | undefined>(undefined)

  useEffect(() => {
    const resolvedParams = async () => {
      const resolvedParams = await params
      setId(resolvedParams.id)
    }
    resolvedParams()
  }, [params])



  const handleClose = () => {
    router.push('/admin/vendor')
  }


  return (
    <>
      <div className="space-y-6">
        <h2 className="text-3xl font-bold tracking-tight flex justify-between">Edit Booking
          <Button onClick={handleClose}>Close</Button>
        </h2>
        <VendorForm id={id} />
      </div>
    </>)
}
