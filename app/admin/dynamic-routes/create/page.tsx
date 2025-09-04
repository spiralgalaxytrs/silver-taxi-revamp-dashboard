"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "../../../../components/ui/button"
import { Input } from "../../../../components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "../../../../components/ui/card"
import { useDynamicRouteStore } from "stores/-dynamicRouteStore"
import { toast } from "sonner"
import { Label } from "../../../../components/ui/label"
import { Upload } from 'lucide-react'

interface RouteField {
  text: string
  link: string
}

export default function CreateRoutePage() {
  const { createRoute } = useDynamicRouteStore()
  const [newRouteTitle, setNewRouteTitle] = useState("")
  const [routeFields, setRouteFields] = useState<RouteField[]>([{ text: "", link: "" }])
  const [imageURL, setImageURL] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | undefined>(undefined)
  const router = useRouter()

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    setImageURL(file ? URL.createObjectURL(file) : null)
    setImageFile(file ?? undefined)
  }

  const handleAddField = () => {
    setRouteFields([...routeFields, { text: "", link: "" }])
  }

  const handleRemoveField = (index: number) => {
    setRouteFields(routeFields.filter((_, i) => i !== index))
  }

  const handleFieldChange = (index: number, field: "text" | "link", value: string) => {
    const newFields = [...routeFields]
    newFields[index][field] = value
    setRouteFields(newFields)
  }

  const handleSaveRoute = async () => {
    try {
      if (newRouteTitle.trim()) {
        const response = await createRoute({
          title: newRouteTitle,
          link: routeFields.map(field => field.link).join(","),
          image: imageFile // You might need to adjust this based on your API requirements
        })
        const status = useDynamicRouteStore.getState().statusCode
        const message = useDynamicRouteStore.getState().message
        if (status === 200 || status === 201) {
          toast.success("Route created successfully!", {
            style: {
              backgroundColor: "#009F7F",
              color: "#fff",
            },
          })
          router.push("/admin/dynamic-routes")
        } else {
          toast.error(message || "Error creating route!", {
            style: {
              backgroundColor: "#FF0000",
              color: "#fff",
            },
          })
        }
      }
    } catch (error) {
      console.error("Error creating route:", error)
    }
  }

  return (
    <>
      <div className="ml-60 p-6">
        <div className="flex items-center justify-between">
          <Card>
            <CardContent className="sm:max-w-[500px] max-h-[100vh] overflow-y-auto bg-white rounded">
              <CardHeader>
                <CardTitle className="text-center text-xl font-bold">Create New Route</CardTitle>
              </CardHeader>

              <div className="space-y-4">
                {/* Image Upload */}
                <div className="border bg-white px-8 rounded my-5 p-4 border-dashed border-border-base pb-5 md:pb-7">
                  <Label htmlFor="image">Route Image</Label>
                  <div className="mt-1" />
                  <div className="flex flex-col items-center justify-center border border-dashed border-gray-400 rounded-lg p-6 hover:border-gray-600 transition cursor-pointer">
                    <Label htmlFor="image" className="flex flex-col items-center cursor-pointer">
                      {!imageURL && (
                        <>
                          <Upload className="text-gray-600 text-4xl mb-2" />
                          <p className="text-gray-600 text-sm mb-2">Click to upload</p>
                          <span className="text-xs text-gray-400">Only image files (JPG, PNG, etc.)</span>
                          <input
                            id="image"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleImageChange}
                          />
                        </>
                      )}
                      {imageURL && (
                        <>
                          <img
                            src={imageURL}
                            alt="Route Image Preview"
                            className="w-full h-32 object-cover rounded"
                          />
                          <div className="flex flex-col items-center">
                            <p className="text-gray-400 mt-2 text-center text-base">
                              {imageFile?.name}
                            </p>
                            <span className="cursor-pointer text-black text-base border border-black rounded bg-[#EFEFEF] p-1">
                              Change image
                            </span>
                            <input
                              id="image"
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={handleImageChange}
                            />
                          </div>
                        </>
                      )}
                    </Label>
                  </div>
                </div>

                <div className="space-y-2">
                  <Input
                    placeholder="Enter Route Title"
                    value={newRouteTitle}
                    onChange={(e) => setNewRouteTitle(e.target.value)}
                    className="w-full"
                  />
                </div>

                {routeFields.map((field, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      placeholder="Enter Text"
                      value={field.text}
                      onChange={(e) => handleFieldChange(index, "text", e.target.value)}
                    />
                    <Input
                      placeholder="Enter Link"
                      value={field.link}
                      onChange={(e) => handleFieldChange(index, "link", e.target.value)}
                    />
                    <Button variant="destructive" onClick={() => handleRemoveField(index)} className="shrink-0">
                      Remove
                    </Button>
                  </div>
                ))}

                <Button className="w-full bg-emerald-500 hover:bg-emerald-600" onClick={handleAddField}>
                  Add More Fields
                </Button>

                <div className="flex gap-2">
                  <Button className="w-full bg-gray-500 hover:bg-gray-600" onClick={() => router.back()}>
                    Cancel
                  </Button>
                  <Button className="w-full bg-blue-500 hover:bg-blue-600" onClick={handleSaveRoute}>
                    Save Route
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}