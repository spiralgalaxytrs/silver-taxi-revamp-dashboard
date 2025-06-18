"use client"

import { useRouter } from 'next/navigation'
import { VendorBookingForm } from 'components/VendorBookingForm'
import { Button } from 'components/ui/button'
import { toast } from "sonner"
import { useState, useEffect } from 'react'
import { GetServerSideProps } from 'next'


export default function EditBookingPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()

  const [id, setId] = useState<string | undefined>(undefined)
  const [createdBy, setCreatedBy] = useState<"Admin" | "Vendor">("Vendor")

  useEffect(() => {
    const resolvedParams = async () => {
      const resolvedParams = await params
      setId(resolvedParams.id)
    }
    resolvedParams()
  }, [params])



  // const handleClose = () => {
  //   router.push('/admin/bookings')
  // }


  return (
    <>
      <div className="space-y-6 bg-white rounded-lg p-4">
        {/* <h2 className="text-3xl font-bold tracking-tight flex justify-between">Edit Booking
          <Button onClick={handleClose}>Close</Button>
        </h2> */}
        <VendorBookingForm id={id} createdBy={createdBy} />
      </div>
    </>)
}



