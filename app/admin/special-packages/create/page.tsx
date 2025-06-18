"use client"

import { useRouter } from 'next/navigation'
import { Button } from 'components/ui/button'
import { AIPackagesForm } from 'components/AIPackagesForm'
import { toast } from "sonner"
import { SpecialPackageForm } from 'components/SpecialPackageForm'

export default function CreatePackagePage() {
  const router = useRouter()

  // const handleClose = () => {
  //   router.push('/admin/all-including-packages')
  // }

  return (
    <>
      <div className="space-y-6 bg-white p-5 rounded ">
        {/* <h2 className="text-3xl font-bold tracking-tight flex justify-between">Create New Package
          <Button onClick={handleClose}>Close</Button>
        </h2> */}
        <SpecialPackageForm />
      </div>
    </>
  )
}

