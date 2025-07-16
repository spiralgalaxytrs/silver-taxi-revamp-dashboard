"use client"

import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import InvoiceForm from 'components/invoice/InvoiceForm'

export default function EditInvoiceForm({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()

  const [invId, setInvId] = useState<string | undefined>(undefined)
  const [createdBy, setCreatedBy] = useState<"Admin" | "Vendor">("Vendor")

  useEffect(() => {
    const resolvedParams = async () => {
      const resolvedParams = await params
      setInvId(resolvedParams.id)
    }
    resolvedParams()
  }, [params])


  return (
    <div className="space-y-6 bg-white p-5 rounded ">
      <InvoiceForm invId={invId} createdBy={createdBy} />
    </div>
  )
}
