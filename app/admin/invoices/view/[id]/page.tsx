"use client"

import { useParams, useRouter } from 'next/navigation'
import { Button } from 'components/ui/button'
import InvoicePDF from 'components/invoice/InvoicePDF'  

const page = () => {
  const router = useRouter()
  const params = useParams()
  const invoiceId = params.id as string

  const handleClose = () => {
    router.push('/admin/invoices')
  }

  return (
    <>
    <div className="space-y-6">
      <div className='pb-4 border-b-2'>
        <h2 className="text-3xl font-bold tracking-tight flex justify-between  ">View Invoice
          <Button onClick={handleClose}>Close</Button>
        </h2>
      </div>
      <InvoicePDF id={invoiceId}/>
    </div>
    </>
  )
}

export default page
