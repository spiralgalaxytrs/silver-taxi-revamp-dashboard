"use client"

import type React from "react"
import PopularRoutesForm from "components/popularRoutesForm"
import { useState, useEffect } from "react"

const EditRoutePage = ({ params }: { params: Promise<{ id: string }> }) => {  
    const [id, setId] = useState<string | undefined>(undefined)
  
    useEffect(() => {
      const resolvedParams = async () => {
        const resolvedParams = await params
        setId(resolvedParams.id)
      }
      resolvedParams()
    }, [params])
    return (
        <>
            <div className="space-y-6 bg-white p-5 rounded-lg shadow-lg">
        {/* <h2 className="text-3xl font-bold tracking-tight flex justify-between">Create New Booking
          <Button onClick={handleClose}>Close</Button>
        </h2> */}
                <PopularRoutesForm id={id} />
            </div>
        </>
    )
}

export default EditRoutePage