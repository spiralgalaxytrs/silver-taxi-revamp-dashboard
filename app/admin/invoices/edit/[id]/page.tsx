"use client"

import { useRouter } from 'next/navigation'
import { Button } from 'components/ui/button'
import { useState, useEffect } from 'react'
import InvoiceForm from 'components/invoice/InvoiceForm'

export default function EditInvoiceForm({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()

  const [invId, setInvId] = useState<string | undefined>(undefined)
  const [createdBy, setCreatedBy] = useState<"Admin" | "Vendor">("Admin")

  useEffect(() => {
    const resolvedParams = async () => {
      const resolvedParams = await params
      setInvId(resolvedParams.id)
    }
    resolvedParams()
  }, [params])

  
  // const handleClose = () => {
  //   router.push('/admin/invoices')
  // }

  return (
    <>
    <div className="space-y-6 bg-white p-5 rounded ">
      {/* <div className='pb-4 border-b-2'>
        <h2 className="text-3xl font-bold tracking-tight flex justify-between  ">Create New Invoices
          <Button onClick={handleClose}>Close</Button>
        </h2>
      </div> */}
      <InvoiceForm invId={invId} createdBy={createdBy}/>
    </div>
    </>
  )
}
