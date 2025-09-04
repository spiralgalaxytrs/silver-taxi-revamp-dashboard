"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "../../../../../components/ui/button"
import { Input } from "../../../../../components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from '../../../../../components/ui/card'
import { useDynamicRouteStore } from "stores/-dynamicRouteStore"
import { Loader2, Upload } from "lucide-react"
import { toast } from "sonner"
import { Label } from "../../../../../components/ui/label"

interface RouteField {
    text: string
    link: string
}

const EditRoutePage: React.FC = () => {
    const params = useParams()
    const router = useRouter()
    const searchParams = new URLSearchParams(window.location.search)

    const routeId = params.id as string
    const routeNameFromParams = searchParams.get('name') || ""
    const { routes, fetchRoutes, updateRoute, isLoading } = useDynamicRouteStore()

    // State management
    const [routeTitle, setRouteTitle] = useState(routeNameFromParams)
    const [routeFields, setRouteFields] = useState<RouteField[]>([{ text: routeNameFromParams, link: "" }])
    const [currentRoute, setCurrentRoute] = useState<any>(null)
    const [imageURL, setImageURL] = useState<string | null>(null)
    const [imageFile, setImageFile] = useState<File | undefined>(undefined)

    useEffect(() => {
        let mounted = true; // Flag to prevent setting state on unmounted component

        const loadRouteData = async () => {
            try {
                await fetchRoutes()
                if (mounted && routeId) {
                    const routeData = routes.find(route => route.routeId === routeId)
                    if (routeData) {
                        setCurrentRoute(routeData)
                        setImageURL(routeData.image ? String(routeData.image) : null)
                        setRouteTitle(routeData.title || routeNameFromParams)
                        setRouteFields(
                            routeData.link ? routeData.link.split(',').map((dest: string) => ({
                                text: routeData.title || routeNameFromParams,
                                link: dest.trim()
                            })) : [{ text: routeData.title || routeNameFromParams, link: "" }]
                        )
                    }
                }
            } catch (error) {
                // console.error("Error fetching routes:", error)
                toast.error("Failed to load route data", {
                    style: {
                        backgroundColor: "#FF0000",
                        color: "#fff",
                    },
                })
            }
        }

        loadRouteData()
    }, [fetchRoutes, routeId])

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setImageURL(URL.createObjectURL(file))
            setImageFile(file)
        }
    }

    const handleAddField = () => {
        setRouteFields([...routeFields, { text: routeTitle, link: "" }])
    }

    const handleRemoveField = (index: number) => {
        setRouteFields(routeFields.filter((_, i) => i !== index))
    }

    const handleFieldChange = (index: number, field: keyof RouteField, value: string) => {
        const newFields = [...routeFields]
        newFields[index][field] = value
        setRouteFields(newFields)
    }

    const handleUpdateRoute = async () => {
        try {
            if (!currentRoute) return

            const updatedRoute = {
                ...currentRoute,
                link: routeFields.map(field => field.link).join(','),
                image: imageFile || currentRoute.image // Use new file if uploaded, otherwise keep existing
            }

            await updateRoute(currentRoute.routeId, updatedRoute)
            const status = useDynamicRouteStore.getState().statusCode;
            const message = useDynamicRouteStore.getState().message;
            if (status === 200 || status === 201) {
                toast.success("Route update successfully", {
                    style: {
                        backgroundColor: "#009F7F",
                        color: "#fff",
                    },
                });
                router.push("/admin/dynamic-routes")
            } else {
                toast.error(message, {
                    style: {
                        backgroundColor: "#FF0000",
                        color: "#fff",
                    },
                });
            }
        } catch (error) {
            toast.error("Failed to update route", {
                style: {
                    backgroundColor: "#FF0000",
                    color: "#fff",
                },
            })
            // console.error("Error updating route:", error)
        }
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-50">
                <Loader2 className="w-12 h-12 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <>
            <div className="p-6">
                <div className="flex items-center justify-center">
                    <Card>
                        <CardContent className="sm:max-w-[500px] max-h-[100vh] overflow-y-auto bg-white rounded">
                            <CardHeader>
                                <CardTitle className="text-center text-xl font-bold">
                                    Edit {routeNameFromParams} Routes
                                </CardTitle>
                            </CardHeader>

                            <div className="space-y-4">
                                {/* Image Upload */}
                                <div className="border bg-white px-8 rounded  p-4 border-dashed border-border-base pb-5">
                                    <Label htmlFor="routeImage">Route Image</Label>
                                    <div className="mt-1" />
                                    <div className="flex flex-col items-center justify-center border border-dashed border-gray-400 rounded-lg p-6 hover:border-gray-600 transition cursor-pointer">
                                        <Label htmlFor="routeImage" className="flex flex-col items-center cursor-pointer w-full">
                                            {!imageURL && (
                                                <>
                                                    <Upload className="text-gray-600 text-4xl mb-2" />
                                                    <p className="text-gray-600 text-sm mb-2">Click to upload</p>
                                                    <span className="text-xs text-gray-400">Only image files (JPG, PNG, etc.)</span>
                                                    <input
                                                        id="routeImage"
                                                        type="file"
                                                        accept="image/*"
                                                        className="hidden"
                                                        onChange={handleImageChange}
                                                    />
                                                </>
                                            )}
                                            {imageURL && (
                                                <div className="w-full max-w-[300px] mx-auto max-h-[400px]">
                                                    <div className="relative aspect-[4/3] overflow-hidden rounded">
                                                        <img
                                                            src={imageURL}
                                                            alt="Route Image Preview"
                                                            className="w-full h-full object-contain"
                                                        />
                                                    </div>
                                                    <div className="flex flex-col items-center ">
                                                        <p className="text-gray-400 text-center text-sm truncate w-full">
                                                            {imageFile ? imageFile.name : 'Existing Image'}
                                                        </p>
                                                        <span className="cursor-pointer text-black text-sm border border-black rounded bg-[#EFEFEF] px-2 py-1 mt-1">
                                                            Change image
                                                        </span>
                                                        <input
                                                            id="routeImage"
                                                            type="file"
                                                            accept="image/*"
                                                            className="hidden"
                                                            onChange={handleImageChange}
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                        </Label>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Route Title</label>
                                    <Input
                                        value={routeTitle}
                                        readOnly
                                        placeholder="Enter Route Title"
                                    />
                                </div>

                                {routeFields.map((field, index) => (
                                    <div key={index} className="flex gap-2">
                                        <Input
                                            placeholder="Enter Text"
                                            value={field.text}
                                            readOnly
                                            className="pointer-events-none"
                                        />
                                        <Input
                                            placeholder="Enter Drop Location"
                                            value={field.link}
                                            onChange={(e) => handleFieldChange(index, "link", e.target.value)}
                                        />
                                        <Button
                                            variant="destructive"
                                            onClick={() => handleRemoveField(index)}
                                            className="shrink-0"
                                        >
                                            Remove
                                        </Button>
                                    </div>
                                ))}

                                <Button
                                    className="w-full bg-emerald-500 hover:bg-emerald-600 text-white"
                                    onClick={handleAddField}
                                >
                                    Add More Fields
                                </Button>

                                <div className="flex gap-2">
                                    <Button
                                        className="w-full bg-gray-500 hover:bg-gray-600"
                                        onClick={() => router.back()}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        className="w-full bg-blue-500 hover:bg-blue-600 text-white"
                                        onClick={handleUpdateRoute}
                                    >
                                        Update Route
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

export default EditRoutePage