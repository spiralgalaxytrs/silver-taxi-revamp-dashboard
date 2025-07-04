"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Button } from "../ui/button"
import { Card, CardContent } from "../ui/card"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { CalendarIcon, Minus, Plus } from "lucide-react"
import { cn } from "lib/utils"
import type { PriceEntry } from "../../app/admin/price-changes/airport/pickup-pricing/page"
import { getMinDate } from "../../lib/date-restrict"

interface PriceFormProps {
    onSave: (data: PriceEntry) => void
    initialData: PriceEntry | null
    isEditing: boolean
    getServiceId: string | null
}

export function PriceForm({ onSave, initialData, isEditing, getServiceId }: PriceFormProps) {
    const [fromDate, setFromDate] = useState<Date | undefined>(undefined)
    const [toDate, setToDate] = useState<Date | undefined>(undefined)
    const [price, setPrice] = useState<string>("")
    const [serviceId, setServiceId] = useState<string | null>(getServiceId)
    const [errors, setErrors] = useState({
        fromDate: false,
        toDate: false,
        price: false,
    })

    useEffect(() => {
        if (initialData) {
            setFromDate(initialData.fromDate)
            setToDate(initialData.toDate)
            setPrice(initialData.price.toString())
            setServiceId(initialData.priceId)
        } else {
            setFromDate(undefined)
            setToDate(undefined)
            setServiceId(getServiceId)
            setPrice("")
        }
    }, [initialData])

    const validateForm = () => {
        const newErrors = {
            fromDate: !fromDate,
            toDate: !toDate,
            price: !price || isNaN(Number(price)) || Number(price) <= 0,
        }

        setErrors(newErrors)
        return !Object.values(newErrors).some(Boolean)
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        if (!validateForm()) return

        onSave({
            priceId: initialData?.priceId!,
            fromDate: fromDate!,
            toDate: toDate!,
            serviceId: serviceId ? serviceId : "",
            price: Number(price),
        })

        if (!isEditing) {
            setFromDate(undefined)
            setToDate(undefined)
            setServiceId(null)
            setPrice("")
        }
    }

    // console.log("fromDate ====> ", fromDate)
    // console.log("toDate ====> ", toDate)

    return (
        <Card className="border-0 shadow-none">
            <CardContent className="p-0">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="fromDate">From Date</Label>
                            <Input
                                type="date"
                                id="search"
                                min={getMinDate()}
                                value={fromDate ? new Date(fromDate).toISOString().split('T')[0] : ""} // Convert Date to string
                                onChange={(e) => setFromDate(new Date(e.target.value))}
                            />
                            {errors.fromDate && <p className="text-sm text-red-500">From date is required</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="toDate">To Date</Label>
                            <Input
                                type="date"
                                id="search"
                                min={getMinDate()}
                                value={toDate ? new Date(toDate).toISOString().split('T')[0] : ""} // Convert Date to string
                                onChange={(e) => setToDate(new Date(e.target.value))}
                            />
                            {errors.toDate && <p className="text-sm text-red-500">To date is required</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="price">Price</Label>
                            <div className="relative">
                                <Input
                                    id="price"
                                    type="number"
                                    value={price}
                                    onChange={(e) => setPrice(e.target.value)}
                                    placeholder="Enter price"
                                    className={cn(errors.price && "border-red-500")}
                                />
                                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                    <span className="text-gray-500">₹</span>
                                </div>
                            </div>
                            {errors.price && <p className="text-sm text-red-500">Valid price is required</p>}
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <Button type="submit">{isEditing ? "Update" : "Save"}</Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    )
}

