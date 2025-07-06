"use client"

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Button } from 'components/ui/button'
import { VendorForm } from 'components/vendor/VendorForm'
import {
  useNavigationStore
} from 'stores/navigationStore'

export default function CreateVendorPage() {
  const router = useRouter()
  const pathname = usePathname()
  const { setPreviousPath } = useNavigationStore()

  useEffect(() => {
    setPreviousPath(pathname)
  }, [pathname, setPreviousPath])

  const handleClose = () => {
    router.push('/admin/vendor')
  }

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold tracking-tight flex justify-between">Create New Vendor
        <Button onClick={handleClose}>Close</Button>
      </h2>
      <VendorForm />
    </div>
  )
}

