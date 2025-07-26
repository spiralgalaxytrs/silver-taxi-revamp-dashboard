"use client"
import { useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from 'components/ui/button'
import InvoicePDF from 'components/invoice/InvoicePDF'

const page = () => {
  const router = useRouter()
  const params = useParams()
  const invoiceId = params.id as string
  const bookingId = params.bookingId as string

  const handleClose = () => {
    router.push('/admin/invoices')
  }
  const handleEditInvoice = useCallback(async (id: string | undefined) => {
    router.push(`/admin/invoices/edit/${id}`)
  }, [router])


  return (
    <>
      <div className="space-y-6">
        <div className='pb-4 border-b-2'>
          <h2 className="text-3xl font-bold tracking-tight flex justify-between ">View Invoice
            <div className='flex gap-2'>
              <Button onClick={() => handleEditInvoice(invoiceId || bookingId)}
              >
                Edit Invoice
              </Button>
              <Button onClick={handleClose}>Close</Button>
            </div>

          </h2>
        </div>
        <InvoicePDF id={invoiceId || bookingId} />
      </div>
    </>
  )
}

export default page
