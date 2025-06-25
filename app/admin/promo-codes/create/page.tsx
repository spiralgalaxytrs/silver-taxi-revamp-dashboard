"use client"

import { useRouter } from 'next/navigation'
import { Button } from 'components/ui/button'
import { toast } from "sonner"
import { CreatePromoForm } from 'components/CreatePromoForm'

export default function CreateOfferPage() {
  const router = useRouter()

  // const handleClose = () => {
  //   router.push('/admin/offers/')
  // }

  return (
    <>
      <div className="space-y-6 bg-white p-5 rounded ">
        {/* <h2 className="text-3xl font-bold tracking-tight flex justify-between">Create New Offer
          <Button onClick={handleClose}>Close</Button>
        </h2> */}
        <CreatePromoForm />
      </div>
    </>)
}

