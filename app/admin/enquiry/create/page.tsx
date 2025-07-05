"use client"
import React, { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { CreateEnquiryForm } from 'components/enquiry/CreateEnquiryForm'
import { toast } from "sonner"
import { useNavigationStore } from 'stores/navigationStore'

export default function CreateEnquiryPage() {
  const router = useRouter()
  const pathname = usePathname()
  const { setPreviousPath } = useNavigationStore()

  const [createdBy, setCreatedBy] = useState<"Admin" | "Vendor">("Admin")

  useEffect(() => {
    setPreviousPath(pathname)
  }, [pathname, setPreviousPath])


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

  return (
    <div className="space-y-6 bg-white p-5 rounded ">
      <CreateEnquiryForm onSubmit={handleSubmit} createdBy={createdBy} />
    </div>
  )
}

