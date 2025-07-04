"use client"

import { useRouter } from 'next/navigation'
import { CreateEnquiryForm } from 'components/enquiry/CreateEnquiryForm'
import { Button } from 'components/ui/button'
import { toast } from "sonner"
import { useState } from 'react'

export default function CreateEnquiryPage() {
  const router = useRouter()
  const [createdBy, setCreatedBy] = useState("Vendor")

  const handleSubmit = (data: any) => {
    toast("Enquiry submitted", {
        description: "Your enquiry has been submitted successfully.",
        action: {
            label: "X",
            onClick: () => console.log("Undo"),
          },
      })
    router.replace('/vendor/enquiry')
  }

  // const handleClose = () => {
  //   router.push('/admin/enquiry')
  // }

  return (
    <>
    <div className="space-y-6 bg-white p-5 rounded ">
      {/* <h2 className="text-3xl font-bold tracking-tight flex justify-between">Create New Enquiry
        <Button onClick={handleClose}>Close</Button>
      </h2> */}
        <CreateEnquiryForm onSubmit={handleSubmit} createdBy={createdBy} />
    </div>
    </>
  )
}

