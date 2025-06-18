"use client"

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Upload, MapPin, Route } from "lucide-react";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription
} from "components/ui/card";
import { Button } from "components/ui/button";
import { Input } from "components/ui/input";
import { Label } from "components/ui/label";
import { usePopularRoutesStore } from "stores/popularRoutesStore";
import { useRouter } from "next/navigation";

const PopularRoutesForm = ({ id }: { id?: string }) => {
    const router = useRouter();
    const { createPopularRoute, updatePopularRoute, fetchPopularRouteById, route, routes } = usePopularRoutesStore();

    const [from, setFrom] = useState("");
    const [to, setTo] = useState("");
    const [price, setPrice] = useState("");
    const [fromImage, setFromImage] = useState<File | string | undefined>(undefined);
    const [toImage, setToImage] = useState<File | string | undefined>(undefined);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (id) {
            const route = routes.find((route) => route.routeId === id);
            if (route) {
                setFrom(route.from);
                setTo(route.to);
                setPrice(route.price);
                setFromImage(route.fromImage);
                setToImage(route.toImage);
            }
            const fetchRoute = async () => {
                await fetchPopularRouteById(id);
                if (route) {
                    setFrom(route.from);
                    setTo(route.to);
                    setPrice(route.price);
                    setFromImage(route.fromImage);
                    setToImage(route.toImage);
                }
            };
            fetchRoute();
        }
    }, [id, fetchPopularRouteById]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, type: "from" | "to") => {
        const file = e.target.files?.[0];
        if (file) {
            const maxSizeInBytes = 300 * 1024; // 300KB in bytes
            if (file.size > maxSizeInBytes) {
                toast.error("The file is too large. Please choose a smaller one under 300KB", {
                    style: {
                        backgroundColor: "#FF0000",
                        color: "#fff",
                    },
                });
                e.target.value = ""; // Reset the input
                return;
            }
            if (type === "from") {
                setFromImage(file);
            } else {
                setToImage(file);
            }
        }
    };

    const handleSaveRoute = async () => {
        // Validate inputs
        if (!from.trim() || !to.trim() || !price.trim()) {
            toast.error("Please fill in all fields.");
            return;
        }

        setIsSubmitting(true); // Manage loading state
        try {
            const formData = {
                from,
                to,
                price,
                fromImage,
                toImage,
            };

            if (id) {
                await updatePopularRoute(id, formData);
                toast.success("Route updated successfully!");
            } else {
                await createPopularRoute(formData);
                toast.success("Route created successfully!");
            }

            // Reset state after successful save
            setFrom("");
            setTo("");
            setPrice("");
            setFromImage(undefined);
            setToImage(undefined);
            router.push("/admin/popular-routes");
        } catch (error) {
            toast.error("An unexpected error occurred. Please try again.");
            console.error("Error saving route:", error);
        } finally {
            setIsSubmitting(false); // Reset loading state
        }
    };

    return (
        <div className="flex bg-gray-50 rounded-lg shadow-lg">
            <main className="flex-1 p-6 max-w-7xl mx-auto">
                <div className="mb-8">
                    <div className="flex items-center gap-3">
                        <div className="p-3 rounded-full bg-custom-green">
                            <Route className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">{id ? "Edit Route" : "Create Route"}</h1>
                            <p className="text-gray-500 mt-1">Manage your popular routes</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="space-y-6">
                        <Card className="border-l-4 border-custom-green shadow-md overflow-hidden">
                            <CardHeader className="bg-gradient-to-r from-green-100 to-green-200 pb-4">
                                <CardTitle className="text-xl flex items-center text-custom-green">
                                    <MapPin className="h-5 w-5 mr-2 text-custom-green" />
                                    Origin Details
                                </CardTitle>
                                <CardDescription>Upload an image of the starting location</CardDescription>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <div className="space-y-4">
                                    <div className="relative">
                                        <Label htmlFor="fromImage" className="block mb-2 text-sm font-medium">
                                            Location Image
                                        </Label>
                                        <div className={`border-2 ${fromImage ? 'border-custom-green' : 'border-dashed border-gray-300'} rounded-lg transition-all hover:border-custom-green group`}>
                                            <Label htmlFor="fromImage" className="cursor-pointer w-full">
                                                {!fromImage ? (
                                                    <div className="flex flex-col items-center justify-center py-10">
                                                        <div className="h-16 w-16 rounded-full bg-green-50 flex items-center justify-center mb-3 group-hover:bg-green-100 transition-colors">
                                                            <Upload className="h-8 w-8 text-custom-green" />
                                                        </div>
                                                        <p className="text-sm font-medium text-gray-700">Click to upload or drag and drop</p>
                                                        <p className="text-xs text-gray-500 mt-1">PNG, JPG or JPEG (max. 300KB)</p>
                                                    </div>
                                                ) : (
                                                    <div className="relative">
                                                        <img
                                                            src={fromImage instanceof File ? URL.createObjectURL(fromImage) : fromImage as string}
                                                            alt="From location"
                                                            className="w-full h-48 object-cover rounded-lg"
                                                        />
                                                        <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
                                                            <p className="text-white text-sm font-medium">Click to change</p>
                                                        </div>
                                                    </div>
                                                )}
                                                <input
                                                    id="fromImage"
                                                    type="file"
                                                    accept="image/png, image/jpeg, image/jpg"
                                                    className="hidden"
                                                    onChange={(e) => handleImageChange(e, "from")}
                                                />
                                            </Label>
                                        </div>
                                    </div>

                                    <div>
                                        <Label htmlFor="from" className="block text-sm font-medium mb-2 text-gray-700">
                                            Starting Location <span className="text-red-500">*</span>
                                        </Label>
                                        <div className="relative">
                                            <MapPin className="h-5 w-5 text-custom-green absolute left-3 top-1/2 transform -translate-y-1/2" />
                                            <Input
                                                id="from"
                                                placeholder="Enter starting location"
                                                value={from}
                                                onChange={(e) => setFrom(e.target.value)}
                                                className="pl-10 border-gray-200 focus:border-custom-green focus:ring-custom-green"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="space-y-6">
                        <Card className="border-l-4 border-custom-green shadow-md overflow-hidden">
                            <CardHeader className="bg-gradient-to-r from-green-100 to-green-200 pb-4">
                                <CardTitle className="text-xl flex items-center text-custom-green">
                                    <MapPin className="h-5 w-5 mr-2 text-custom-green" />
                                    Destination Details
                                </CardTitle>
                                <CardDescription>Upload an image of the destination</CardDescription>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <div className="space-y-4">
                                    <div className="relative">
                                        <Label htmlFor="toImage" className="block mb-2 text-sm font-medium">
                                            Location Image
                                        </Label>
                                        <div className={`border-2 ${toImage ? 'border-custom-green' : 'border-dashed border-gray-300'} rounded-lg transition-all hover:border-custom-green group`}>
                                            <Label htmlFor="toImage" className="cursor-pointer w-full">
                                                {!toImage ? (
                                                    <div className="flex flex-col items-center justify-center py-10">
                                                        <div className="h-16 w-16 rounded-full bg-green-50 flex items-center justify-center mb-3 group-hover:bg-green-100 transition-colors">
                                                            <Upload className="h-8 w-8 text-custom-green" />
                                                        </div>
                                                        <p className="text-sm font-medium text-gray-700">Click to upload or drag and drop</p>
                                                        <p className="text-xs text-gray-500 mt-1">PNG, JPG or JPEG (max. 300KB)</p>
                                                    </div>
                                                ) : (
                                                    <div className="relative">
                                                        <img
                                                            src={toImage instanceof File ? URL.createObjectURL(toImage) : toImage as string}
                                                            alt="To location"
                                                            className="w-full h-48 object-cover rounded-lg"
                                                        />
                                                        <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
                                                            <p className="text-white text-sm font-medium">Click to change</p>
                                                        </div>
                                                    </div>
                                                )}
                                                <input
                                                    id="toImage"
                                                    type="file"
                                                    accept="image/png, image/jpeg, image/jpg"
                                                    className="hidden"
                                                    onChange={(e) => handleImageChange(e, "to")}
                                                />
                                            </Label>
                                        </div>
                                    </div>

                                    <div>
                                        <Label htmlFor="to" className="block text-sm font-medium mb-2 text-gray-700">
                                            Destination <span className="text-red-500">*</span>
                                        </Label>
                                        <div className="relative">
                                            <MapPin className="h-5 w-5 text-custom-green absolute left-3 top-1/2 transform -translate-y-1/2" />
                                            <Input
                                                id="to"
                                                placeholder="Enter destination"
                                                value={to}
                                                onChange={(e) => setTo(e.target.value)}
                                                className="pl-10 border-gray-200 focus:border-custom-green focus:ring-custom-green"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                <Card className="mt-8 border-l-4 border-custom-green shadow-md overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-green-100 to-green-200 pb-4">
                        <CardTitle className="text-xl flex items-center text-custom-green">
                            <Route className="h-5 w-5 mr-2 text-custom-green" />
                            Route Pricing
                        </CardTitle>
                        <CardDescription>Set the price for this route</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="max-w-md">
                            <Label htmlFor="price" className="block text-sm font-medium mb-2 text-gray-700">
                                Price <span className="text-red-500">*</span>
                            </Label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                    <span className="text-custom-green font-medium">₹ </span>
                                </div>
                                <Input
                                    id="price"
                                    type="text"
                                    placeholder="0.00"
                                    className="pl-8 border-gray-200 focus:border-custom-green focus:ring-custom-green"
                                    value={price}
                                    onChange={(e) => setPrice(e.target.value)}
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="mt-8 flex justify-end gap-4">
                    <Button 
                    variant="outline"
                    onClick={() => router.push("/admin/popular-routes")}
                    className="w-32 border-gray-300 text-gray-700 hover:bg-gray-50">
                        Cancel
                    </Button>
                    <Button
                        className="rounded-sm"
                        onClick={handleSaveRoute}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? "Saving..." : "Save Route"}
                    </Button>
                </div>
            </main>
        </div>
    );
};

export default PopularRoutesForm;
