"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "components/ui/card"
import { Button } from "components/ui/button"
import { Input } from "components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "components/ui/dialog"
import { Trash2, PlusCircle, Edit, ArrowRight, ArrowLeft } from "lucide-react"
import { useDynamicRouteStore } from "stores/dynamicRouteStore"
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogFooter,
} from 'components/ui/alert-dialog';
import { toast } from "sonner"
import { usePopularRoutesStore } from "stores/popularRoutesStore"
import Image from "next/image"
interface PopularRoutes {
  routeId: string;
  from: string;
  to: string;
  fromImage: File | string;
  toImage: File | string;
  price: string;
  status: boolean;
}

export default function PopularRoutesPage() {
  const { routes, fetchPopularRoutes, deletePopularRoute } = usePopularRoutesStore()
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const router = useRouter()

  const [data, setData] = useState<PopularRoutes[]>([])

  useEffect(() => {
    if (routes) {
      setData(
        (routes || []).map((route) => ({
          routeId: route.routeId,
          from: route.from,
          to: route.to,
          fromImage: route.fromImage,
          toImage: route.toImage,
          price: route.price,
          status: route.status,
        }))
      );
    }
  }, [routes])

  useEffect(() => {
    fetchPopularRoutes()
  }, [fetchPopularRoutes])

  const handleDeleteLocation = async (locId: string) => {
    try {
      await deletePopularRoute(locId);
      const status = usePopularRoutesStore.getState().statusCode;
      const message = usePopularRoutesStore.getState().message;
      if (status === 200 || status === 201) {
        toast.success("Route deleted successfully");
        setData(prev => prev.filter(location => location.routeId !== locId));
        await fetchPopularRoutes();
      } else {
        toast.error(message || "Error deleting route!", {
          style: {
            backgroundColor: "#FF0000",
            color: "#fff",
          },
        });
      }
    } catch (error) {
      // console.error("Error deleting route:", error);
      toast.error("Failed to delete route", {
        style: {
          backgroundColor: "#FF0000",
          color: "#fff",
        },
      });
    }
  }

  const handleEditRoute = (locationId: string) => {
    router.push(`/admin/popular-routes/edit/${encodeURIComponent(locationId)}`)
  }

  const cancelDelete = () => {
    setIsDialogOpen(false);
  }

  const confirmDelete = async (id: string) => {
    await handleDeleteLocation(id);
    setIsDialogOpen(false);
  }

  return (
    <>
      <div className="max-w-6xl mx-auto space-y-8 p-3">
        <div className="flex justify-between items-center border-b border-gray-200 pb-4">
          <h1 className="text-3xl font-bold text-gray-800">Popular Routes</h1>
          <Button
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
            onClick={() => router.push("/admin/popular-routes/create")}
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Add New Route
          </Button>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-2">
          {data.length > 0 ? (
            data.map((items) => (
              <Card key={items.routeId} className="bg-white shadow-md hover:shadow-lg transition-shadow duration-300 rounded-lg px-4 py-3">
                <CardHeader className="border-b border-gray-100 p-3">
                  <CardTitle className="text-xl text-gray-700 text-end">
                    <div className="flex items-center justify-around">
                      <div className="flex flex-col items-center">
                        <Image src={items.fromImage as string} alt={items.from} width={200} height={200} className="rounded" />
                        <span className="mt-2 text-gray-400">{items.from}</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <ArrowRight className="h-4 w-4" />
                        <ArrowLeft className="h-4 w-4" />
                      </div>
                      <div className="flex flex-col items-center justify-center">
                        <Image src={items.toImage as string} alt={items.to} width={200} height={200} className="rounded" />
                        <span className="mt-2 text-gray-400">{items.to}</span>
                      </div>
                    </div>
                    <span className="text-lg text-end font-bold mt-3">Price : ₹ {items.price}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="flex justify-between gap-4">
                    <Button
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg"
                      onClick={() => handleEditRoute(items.routeId)}
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white rounded-lg"
                      onClick={() => setIsDialogOpen(true)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </Button>
                    <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete this Route? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel onClick={cancelDelete}>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => confirmDelete(items.routeId)}>Delete</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="flex justify-center items-center h-full bg-white col-span-full">
              <p className='text-center text-gray-500 p-7'>No data available.</p>
            </div>
          )}
        </div>
      </div>
    </>
  )
}