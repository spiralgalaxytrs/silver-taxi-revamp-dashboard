"use client"

import { useRouter } from 'next/navigation'
import { Button } from 'components/ui/button'
import ProfileForm from 'components/ProfileForm'
import { useEffect, useState } from 'react'


const page = ({ params }: { params: Promise<{ id: string }> }) => {
  const router = useRouter()

  const [profileId, setProfileId] = useState<string>('');

  useEffect(() => {
    const fetchParams = async () => {
        const resolvedParams = await params; // Unwrap the Promise
        setProfileId(resolvedParams.id); // Set the tariffId state
    };
    fetchParams();
}, [params]);

  // const handleClose = () => {
  //   router.push('/admin/profiles')
  // }

  return (
    <div className="space-y-6">
      {/* <div className='pb-4 border-b-2'>
        <h2 className="text-3xl font-bold tracking-tight flex justify-between  ">Edit Profile
          <Button onClick={handleClose}>Close</Button>
        </h2>
      </div> */}
      <ProfileForm id={profileId} createdBy="Admin" />
    </div>
  )
}

export default page
