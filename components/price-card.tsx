"use client"

import { format } from "date-fns"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { CalendarIcon, Edit, Trash2 } from "lucide-react"
import type { PriceEntry } from "../app/admin/price-changes/airport/pickup-pricing/page"

interface PriceCardProps {
    entry: PriceEntry
    onEdit: (entry: PriceEntry) => void
    onDelete: (id: string) => void
    serviceName: string
}

export function PriceCard({ entry, onEdit, onDelete, serviceName }: PriceCardProps) {

    const handleEdit = (entry: PriceEntry) => {
        onEdit(entry)
    }

    const handleDelete = (id: string) => {
        onDelete(id)
    }

    return (
        <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300 ease-in-out">
            <CardContent className="p-0">
                <div className="bg-gray-200 p-5 ">
                    <div className="flex flex-col gap-4">
                        <div className="flex justify-between items-center">
                            <div className="flex flex-col">
                                <h3 className="font-semibold text-lg text-gray-800">{serviceName} Price</h3>
                                <div className="h-1 w-16 bg-emerald-500 rounded-full mt-1"></div>
                            </div>
                            <div className="bg-white px-4 py-2 rounded-lg shadow-sm">
                                <span className="font-bold text-xl text-emerald-600">₹{entry?.price || "-"}</span>
                            </div>
                        </div>

                        <div className="mt-2 grid grid-cols-2 gap-4 bg-gray-100 rounded-lg p-3 shadow-sm">
                            <div className="flex items-center gap-2">
                                <div className="bg-emerald-100 p-2 rounded-full">
                                    <CalendarIcon className="h-4 w-4 text-emerald-600" />
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-gray-500">From Date</p>
                                    <p className="font-medium text-sm">{format(entry?.fromDate ? new Date(entry.fromDate) : new Date(), "PPP")}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="bg-emerald-100 p-2 rounded-full">
                                    <CalendarIcon className="h-4 w-4 text-emerald-600" />
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-gray-500">To Date</p>
                                    <p className="font-medium text-sm">{format(entry?.toDate ? new Date(entry.toDate) : new Date(), "PPP")}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-2 p-4 bg-gray-200 border-t hover:shadow-xl">
                <Button variant="outline" size="sm" onClick={() => handleEdit(entry)}>
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                </Button>
                <Button variant="destructive" size="sm" onClick={() => handleDelete(entry.priceId)}>
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                </Button>
            </CardFooter>
        </Card>
    )
}

