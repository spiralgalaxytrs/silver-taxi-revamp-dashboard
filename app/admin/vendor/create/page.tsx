"use client"

import { useRouter } from 'next/navigation'
import { Button } from 'components/ui/button'
import { VendorForm } from 'components/vendor/VendorForm'

export default function CreateVendorPage() {
  const router = useRouter()

  const handleClose = () => {
    router.push('/admin/vendor')
  }

  return (
    <>
      <div className="space-y-6">
        <h2 className="text-3xl font-bold tracking-tight flex justify-between">Create New Vendor
          <Button onClick={handleClose}>Close</Button>
        </h2>
        <VendorForm/>
      </div>
    </>)
}

