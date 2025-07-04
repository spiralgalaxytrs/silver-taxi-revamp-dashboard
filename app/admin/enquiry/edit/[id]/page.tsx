"use client";
import { useRouter } from "next/navigation";
import { Button } from "components/ui/button";
import { toast } from "sonner";
import { CreateEnquiryForm } from "components/enquiry/CreateEnquiryForm";
import React, { useEffect, useState } from "react";



export default function EditEnquiryPage({ params }: { params: Promise<{ id: string }>}) {

  const router = useRouter()
  const [id, setId] = useState('')
  const [createdBy, setCreatedBy] = useState<"Admin" | "Vendor">("Admin")

  useEffect(() => {
    const resolveParams = async () => {
      const resolvedParams = await params
      setId(resolvedParams.id)
    }
    resolveParams()
  },[params])

  const handleSubmit = (data: any) => {
    toast("Enquiry submitted", {
      description: "Your enquiry has been submitted successfully.",
      action: {
        label: "X",
        onClick: () => console.log("Undo"),
      },
    })
    router.replace('/admin/enquiry')
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
      <CreateEnquiryForm onSubmit={handleSubmit} id={id} createdBy={createdBy} />
    </div>
    </>
  )
}