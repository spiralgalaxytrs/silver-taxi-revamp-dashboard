"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from 'components/ui/button'
import { Input } from 'components/ui/input'
import { Label } from 'components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from 'components/ui/select'
import { toast } from 'hooks/use-toast'


export default function SignupPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phno: '',
    role: '',
    tenantName: '',
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSelectChange = (value: string) => {
    setFormData({ ...formData, role: value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Basic validation
    if (!formData.email || !formData.password || !formData.role) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      toast({
        title: "Error",
        description: "Please enter a valid email address.",
        variant: "destructive",
      })
      return
    }

    if (formData.role === '0' && (!formData.name || !formData.phno)) {
      toast({
        title: "Error",
        description: "Please fill in all fields for user registration.",
        variant: "destructive",
      })
      return
    }

    if (formData.role === '1' && !formData.tenantName) {
      toast({
        title: "Error",
        description: "Please enter the Tenant Name.",
        variant: "destructive",
      })
      return
    }
    
    // Simulating successful signup
    toast({
      title: "Success",
      description: "You have successfully signed up.",
    })
    router.push('/login')
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md">
        <form onSubmit={handleSubmit} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
          <h2 className="text-2xl font-bold mb-6 text-center">Sign Up</h2>
          <div className="mb-4">
            <Label htmlFor="role">Role</Label>
            <Select onValueChange={handleSelectChange} required>
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">User</SelectItem>
                <SelectItem value="1">Tenant</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {formData.role === '0' && (
            <>
              <div className="mb-4">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="mb-4">
                <Label htmlFor="phno">Phone Number</Label>
                <Input
                  id="phno"
                  name="phno"
                  value={formData.phno}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </>
          )}
          {formData.role === '1' && (
            <div className="mb-4">
              <Label htmlFor="tenantName">Tenant Name</Label>
              <Input
                id="tenantName"
                name="tenantName"
                value={formData.tenantName}
                onChange={handleInputChange}
                required
              />
            </div>
          )}
          <div className="mb-4">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="mb-6">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="flex items-center justify-between">
            <Button type="submit">Sign Up</Button>
            <Button variant="outline" onClick={() => router.push('/')}>Cancel</Button>
          </div>
        </form>
      </div>
    </div>
  )
}

