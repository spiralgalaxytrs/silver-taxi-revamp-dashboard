"use client"

import { Button } from 'components/ui/button'
import VehicleForm from 'components/VehicleForm'
import { useRouter } from 'next/navigation'
import { ArrowBigLeft } from 'lucide-react'
import { use } from 'react'

const Page = ({ params }: { params: Promise<{ id: string }> }) => {

  const resolveParams = use(params)
  const router = useRouter()
  // const handleClose = () => {
  //   router.push('/admin/vehicles')
  // }

  return (
    <>
    <div className="space-y-6">
      {/* <div className='pb-4 border-b-2'>
        <h2 className="text-3xl font-bold tracking-tight flex justify-between  ">Edit Vehicle
          <Button variant="secondary" onClick={handleClose}><ArrowBigLeft /> Back</Button>
        </h2>
      </div> */}
      <VehicleForm id={resolveParams.id} />
    </div>
    </>
  )
}

export default Page
