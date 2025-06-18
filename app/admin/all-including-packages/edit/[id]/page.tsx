"use client"

import { useRouter } from 'next/navigation'
import { AIPackagesForm } from 'components/AIPackagesForm'
import { Button } from 'components/ui/button'
import { toast } from "sonner"
import { useState, useEffect } from 'react'


export default function EditPackagePage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const [notAllow,setNotAllow] = useState(true);

  const [id, setId] = useState<string | undefined>("")

  useEffect(() => {
    const resolvedParams = async () => {
      const resolvedParams = await params
      setId(resolvedParams.id)
    }
    resolvedParams()
  }, [params])

  // const handleClose = () => {
  //   router.push('/admin/all-including-packages')
  // }

  if(notAllow) return null;

  return (
    <div className="space-y-6 bg-white p-5 rounded">
      {/* <h2 className="text-3xl font-bold tracking-tight flex justify-between">Edit Booking
          <Button onClick={handleClose}>Close</Button>
        </h2> */}
      <AIPackagesForm id={id} />
    </div>
  )
}

