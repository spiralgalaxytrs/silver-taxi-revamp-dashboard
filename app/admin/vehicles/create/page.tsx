"use client"

import VehicleForm from 'components/vehicle/VehicleForm'
import { useRouter } from 'next/navigation'


const page = () => {
  const router = useRouter()


  return (
    <div className="space-y-6">
      <VehicleForm />
    </div>
  )
}

export default page

