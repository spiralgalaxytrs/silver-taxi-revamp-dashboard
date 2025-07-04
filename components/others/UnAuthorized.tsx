'use client'
import { Button } from 'components/ui/button'
import { useRouter } from 'next/navigation'

export default function Unauthorized() {
  const router = useRouter()

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8 text-center">
        <h1 className="text-4xl font-bold text-red-600 mb-4">401</h1>
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Unauthorized Access</h2>
        <p className="text-gray-600 mb-8">
          Oops! It looks like you don&apos;t have permission to access this page. 
          Please log in or contact the administrator if you believe this is an error.
        </p>
        <Button onClick={() => router.push('/login')}>
          Go to Login
        </Button>
      </div>
    </div>
  )
}

