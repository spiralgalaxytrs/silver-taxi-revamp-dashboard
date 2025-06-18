"use client"

import { Button } from 'components/ui/button'
import VehicleForm from 'components/VehicleForm'
import { useRouter } from 'next/navigation'
import { ArrowBigLeft } from 'lucide-react'



const page = () => {
  const router = useRouter()


  return (
    <>
    <div className="space-y-6">
      {/* <div className='pb-4 border-b-2'>
        <h2 className="text-3xl font-bold tracking-tight flex justify-between  ">Create New Vehicle
          <Button variant="secondary" onClick={handleClose}><ArrowBigLeft /> Back</Button>
        </h2>
      </div> */}
      <VehicleForm />
    </div>
    </>
  )
}

export default page
