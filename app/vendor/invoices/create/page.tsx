"use client"

import InvoiceForm from 'components/invoice/InvoiceForm'

const page = () => {

  return (
    <>
    <div className="space-y-6 bg-white p-5 rounded ">
      <InvoiceForm createdBy={"Vendor"}/>
    </div>
    </>
  )
}

export default page
