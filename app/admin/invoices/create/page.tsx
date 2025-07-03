"use client"

import { useRouter } from 'next/navigation'
import { Button } from 'components/ui/button'
import InvoiceForm from 'components/InvoiceForm'
import { useParams } from 'next/navigation'

const page = () => {


  return (
    <>
      <div className="space-y-6 bg-white p-5 rounded ">
        <InvoiceForm createdBy='Admin' />
      </div>
    </>
  )
}

export default page
