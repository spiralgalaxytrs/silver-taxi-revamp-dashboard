"use client"

import React, { useState } from "react"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

import { PriceForm } from "../../../../../components/others/price-form"
import { PriceCard } from "../../../../../components/cards/price-card"

import {
    useServiceByName
} from 'hooks/react-query/useServices'

import {
    usePriceEntryById,
    useCreatePriceEntry,
    useUpdatePriceEntry,
    useDeletePriceEntry
} from 'hooks/react-query/usePriceChanges'

export type PriceEntry = {
    priceId: string
    fromDate: Date
    serviceId: string
    toDate: Date
    price: number
}

export default function OutstationRoundTripPrice() {
    const { data: service = null } = useServiceByName("Round trip")

    const { mutate: createEntry } = useCreatePriceEntry()
    const { mutate: updateEntry } = useUpdatePriceEntry()
    const { mutate: deleteEntry } = useDeletePriceEntry()

    const id = service?.serviceId ?? ""
    const { data: priceEntry = null, isLoading } = usePriceEntryById(id)
    const [editingEntry, setEditingEntry] = useState<PriceEntry | null>(null)

    const handleSave = (entry: PriceEntry) => {
        if (editingEntry) {
            updateEntry(
                { id: editingEntry.priceId, data: entry },
                {
                    onSuccess: () => {
                        toast.success("Round trip Price updated successfully", {
                            style: { backgroundColor: "#009F7F", color: "#fff" }
                        })
                        setEditingEntry(null)
                    },
                    onError: (error: any) => {
                        toast.error(error?.response?.data?.message || "Failed to update round trip price", {
                            style: { backgroundColor: "#FF0000", color: "#fff" }
                        })
                    }
                }
            )
        } else {
            createEntry(entry, {
                onSuccess: () => {
                    toast.success("Round trip created successfully", {
                        style: { backgroundColor: "#009F7F", color: "#fff" }
                    })
                },
                onError: (error: any) => {
                    toast.error(error?.response?.data?.message || "Failed to create round trip", {
                        style: { backgroundColor: "#FF0000", color: "#fff" }
                    })
                }
            })
        }
    }

    const handleEdit = (entry: PriceEntry) => {
        setEditingEntry(entry)
    }

    const handleDelete = (priceId: string) => {
        deleteEntry(priceId, {
            onSuccess: () => {
                toast.success("Price deleted successfully")
                setEditingEntry(null)
            },
            onError: () => {
                toast.error("Failed to delete Price", {
                    style: { backgroundColor: "#FF0000", color: "#fff" }
                })
            }
        })
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-50">
                <Loader2 className="w-12 h-12 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="p-6 space-y-6 bg-white rounded-lg shadow">
            <div className="rounded bg-white p-5 shadow">
                <h1 className="text-3xl font-bold tracking-tight">Round Trip Pricing</h1>
            </div>

            <div className="rounded bg-white p-5 shadow">
                <PriceForm
                    onSave={handleSave}
                    initialData={editingEntry}
                    isEditing={!!editingEntry}
                    getServiceId={id}
                />
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {priceEntry && (
                    <PriceCard
                        key={priceEntry.priceId}
                        entry={priceEntry as PriceEntry}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        serviceName="Round Trip"
                    />
                )}
            </div>
        </div>
    )
}
