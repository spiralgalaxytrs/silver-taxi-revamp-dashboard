"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "components/ui/card"
import { Button } from "components/ui/button"
import { Input } from "components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "components/ui/dialog"
import { Trash2, PlusCircle, Edit } from "lucide-react"
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


interface RouteField {
  text: string
  link: string
}

interface Location {
  id: string
  name: string
  fields?: RouteField[]
}

export default function DynamicRoutesPage() {
  const { routes, fetchRoutes, createRoute, deleteRoute } = useDynamicRouteStore()
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const router = useRouter()

  const [locations, setLocations] = useState(
    (routes || []).map((route) => ({
      id: route.routeId,
      name: route.title,
      fields: route.link,
    }))
  )

  useEffect(() => {
    setLocations(
      (routes || []).map((route) => ({
        id: route.routeId,
        name: route.title,
        fields: route.link,
      }))
    );
  }, [routes])

  useEffect(() => {
    fetchRoutes()
  }, [fetchRoutes])

  const handleDeleteLocation = async (locId: string) => {
    try {
      await deleteRoute(locId);
      const status = useDynamicRouteStore.getState().statusCode;
      const message = useDynamicRouteStore.getState().message;
      if (status === 200 || status === 201) {
        toast.success("Route deleted successfully");
        setLocations(prev => prev.filter(location => location.id !== locId));
        await fetchRoutes();
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

  const handleEditRoute = (locationId: string, locationName: string) => {
    const params = new URLSearchParams({
      name: locationName
    }).toString();
    router.push(`/admin/dynamic-routes/edit/${encodeURIComponent(locationId)}?${params}`)
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
      <div className="max-w-6xl mx-auto space-y-8 p-6">
        <div className="flex justify-between items-center border-b border-gray-200 pb-4">
          <h1 className="text-3xl font-bold text-gray-800">Dynamic Routes</h1>
          <Button
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
            onClick={() => router.push("/admin/dynamic-routes/create")}
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Add New Route
          </Button>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {locations.length > 0 ? (
            locations.map((loc) => (
              <Card key={loc.id} className="bg-white shadow-md hover:shadow-lg transition-shadow duration-300">
                <CardHeader className="border-b border-gray-100">
                  <CardTitle className="text-xl  text-gray-700">{loc.name}</CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="flex justify-between gap-4">
                    <Button
                      className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white"
                      onClick={() => handleEditRoute(loc.id, loc.name)}
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </Button>
                    <>
                      <Button
                        variant="destructive"
                        className="flex-1"
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
                            <AlertDialogAction onClick={() => confirmDelete(loc.id)}>Delete</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent> 
                      </AlertDialog>
                    </>
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