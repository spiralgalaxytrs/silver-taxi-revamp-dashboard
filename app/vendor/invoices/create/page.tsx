"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from 'components/ui/button'
import InvoiceForm from 'components/InvoiceForm'

const page = () => {
  const router = useRouter();
  const [createdBy, setCreatedBy] = useState("Vendor")

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
      <InvoiceForm createdBy={"Vendor"}/>
    </div>
    </>
  )
}

export default page
