"use client"

import { useRouter } from 'next/navigation'
import { Button } from 'components/ui/button'
import { AIPackagesForm } from 'components/all includes/AIPackagesForm'
import { toast } from "sonner"
import { useState } from 'react'

export default function CreatePackagePage() {
  const router = useRouter()
  const [notAllow, setNotAllow] = useState(true);

  // const handleClose = () => {
  //   router.push('/admin/all-including-packages')
  // }

  if (notAllow) return null;

  return (
    <div className="space-y-6 bg-white p-5 rounded ">
      {/* <h2 className="text-3xl font-bold tracking-tight flex justify-between">Create New Package
          <Button onClick={handleClose}>Close</Button>
        </h2> */}
      <AIPackagesForm />
    </div>
  )
}

