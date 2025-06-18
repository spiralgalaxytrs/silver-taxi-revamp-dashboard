"use client"

import React, { useEffect, useState } from "react"
import { toast } from "sonner"
import { PriceForm } from "../../../../../components/price-form"
import { PriceCard } from "../../../../../components/price-card"
import { usePriceStore } from "../../../../../stores/priceChangingStore"
import { useServiceStore } from "stores/serviceStore";
import { Loader2 } from 'lucide-react';

export type PriceEntry = {
  priceId: string
  fromDate: Date
  toDate: Date
  serviceId: string
  price: number
}

export default function AirportPickUpPrice() {
  const { priceEntry, CreateEntry, fetchEntriesById, updateEntry, deleteEntry, isLoading, error } = usePriceStore()
  const [editingEntry, setEditingEntry] = useState<PriceEntry | null>(null)
  const { fetchServices, services } = useServiceStore();
  const [id, setId] = useState<string>("");

  useEffect(() => {
    fetchServices();
  
    const filtered = services.find(service => service.name === "Airport Pickup");
    if (filtered?.serviceId !== null && filtered?.serviceId !== undefined) {
      setId(filtered.serviceId);
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      await fetchEntriesById(id)
    }
    fetchData()
  }, [fetchEntriesById, id])


  const handleSave = async (entry: PriceEntry) => {
    try {
      if (editingEntry) {
        await updateEntry(editingEntry.priceId, entry)
        setEditingEntry(null)
      } else {
        await CreateEntry(entry)
      }

      const status = usePriceStore.getState().statusCode
      const message = usePriceStore.getState().message

      if (status === 201 || status === 200) {
        toast.success(editingEntry ? "Airport Pickup Price updated successfully" : "Airport Pickup created successfully", {
          style: {
            backgroundColor: "#009F7F",
            color: "#fff",
          },
        })
      }
      else {
        toast.error(message, {
          style: {
            backgroundColor: "#FF0000",
            color: "#fff",
          },
        })
      }

    } catch (error) {
      toast.error("Server unexpected error occurred", {
        style: {
          backgroundColor: "#FF0000",
          color: "#fff",
        },
      })
      console.error(error);
    }
  }

  const handleEdit = (entry: PriceEntry) => {
    setEditingEntry(entry)
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteEntry(id)
      toast.success("Price deleted successfully")
    } catch (error) {
      toast.error("Failed to delete Price", {
        style: {
          backgroundColor: "#FF0000",
          color: "#fff",
        },
      });
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
      <div className="p-6 space-y-6 bg-white rounded-lg shadow">
        <div className="rounded bg-white p-5 shadow">
          <h1 className="text-3xl font-bold tracking-tight">Airport PickUp Pricing</h1>
        </div>

        <div className="rounded bg-white p-5 shadow">
          <PriceForm onSave={handleSave} initialData={editingEntry} isEditing={!!editingEntry} getServiceId={id} />
        </div>

        {error && <p className="text-red-500">{error}</p>}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {priceEntry &&
            <PriceCard key={priceEntry.priceId} entry={priceEntry as PriceEntry} onEdit={handleEdit} onDelete={handleDelete} serviceName="Airport Pickup" />
          }
        </div>
      </div>
    </>
  )
}

