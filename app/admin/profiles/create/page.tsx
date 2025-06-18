"use client"

import { useRouter } from 'next/navigation'
import ProfileForm from 'components/ProfileForm'
import { Button } from 'components/ui/button'


const page = () => {
  const router = useRouter()


  return (
    <>
      <div className="space-y-6">
        {/* <div className='pb-4 border-b-2'>
          <h2 className="text-3xl font-bold tracking-tight flex justify-between  ">Create New Profile
            <Button onClick={handleClose}>Close</Button>
          </h2>
        </div> */}
        <ProfileForm createdBy="Admin" />
      </div>
    </>
  )
}

export default page
