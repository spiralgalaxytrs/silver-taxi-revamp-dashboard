"use client"

import { useState } from 'react'
import { Button } from 'components/ui/button'
import { Input } from 'components/ui/input'
import { Label } from 'components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from 'components/ui/tabs'
import { Textarea } from 'components/ui/textarea'
import { toast } from 'hooks/use-toast'
import Link from 'next/link'


export default function SettingsPage() {

  const [generalSettings, setGeneralSettings] = useState({
    companyName: 'TaxiE',
    email: 'contact@taxie.com',
    phone: '+1 (555) 123-4567',
    address: '123 Taxi Street, City, Country',
  })

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
  })

  const handleGeneralSettingsChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setGeneralSettings(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleNotificationSettingsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNotificationSettings(prev => ({ ...prev, [e.target.name]: e.target.checked }))
  }

  const handleSaveSettings = () => {
    toast({
      title: "Settings saved",
      description: "Your settings have been saved successfully.",
    })
  }

  return (  
    <>
    <div className="space-y-6">
      <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <Link href='/admin/profiles'><TabsTrigger value="profile">Profile</TabsTrigger></Link>
        </TabsList>
        <TabsContent value="general" className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="companyName">Company Name</Label>
            <Input
              id="companyName"
              name="companyName"
              value={generalSettings.companyName}
              onChange={handleGeneralSettingsChange}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={generalSettings.email}
              onChange={handleGeneralSettingsChange}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              value={generalSettings.phone}
              onChange={handleGeneralSettingsChange}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="address">Address</Label>
            <Textarea
              id="address"
              name="address"
              value={generalSettings.address}
              onChange={handleGeneralSettingsChange}
            />
          </div>
        </TabsContent>
        <TabsContent value="notifications" className="space-y-4">
          <div className="flex items-center space-x-2">
            <input
              id="emailNotifications"
              name="emailNotifications"
              type="checkbox"
              checked={notificationSettings.emailNotifications}
              onChange={handleNotificationSettingsChange}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <Label htmlFor="emailNotifications">Email Notifications</Label>
          </div>
          <div className="flex items-center space-x-2">
            <input
              id="smsNotifications"
              name="smsNotifications"
              type="checkbox"
              checked={notificationSettings.smsNotifications}
              onChange={handleNotificationSettingsChange}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <Label htmlFor="smsNotifications">SMS Notifications</Label>
          </div>
          <div className="flex items-center space-x-2">
            <input
              id="pushNotifications"
              name="pushNotifications"
              type="checkbox"
              checked={notificationSettings.pushNotifications}
              onChange={handleNotificationSettingsChange}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <Label htmlFor="pushNotifications">Push Notifications</Label>
          </div>
        </TabsContent>
      </Tabs>
      <Button onClick={handleSaveSettings}>Save Settings</Button>
    </div>
    </>
  )
}

