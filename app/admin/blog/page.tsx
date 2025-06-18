"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "components/ui/card";
import { Button } from "components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "components/ui/dialog";
import { Trash2, PlusCircle, Edit } from "lucide-react";
import { useBlogStore } from "stores/blogsStore";
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogAction, AlertDialogCancel, AlertDialogFooter } from 'components/ui/alert-dialog';
import { toast } from "sonner";
import Image from "next/image";

interface Blog {
  blogId: string;
  title: string;
  url: string;
  coverImage: string;
  description: string;
  htmlContent: string;
  status: boolean;
}

export default function BlogPage() {
  const { blogs, fetchBlogs, deleteBlog } = useBlogStore();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedBlogId, setSelectedBlogId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchBlogs();
  }, [fetchBlogs]);

  const handleDeleteBlog = async (id: string) => {
    try {
      await deleteBlog(id);
      const status = useBlogStore.getState().statusCode;
      const message = useBlogStore.getState().message;
      if (status === 200 || status === 201) {
        toast.success("Blog deleted successfully");
        await fetchBlogs();
      } else {
        toast.error(message || "Error deleting blog!", {
          style: {
            backgroundColor: "#FF0000",
            color: "#fff",
          },
        });
      }
    } catch (error) {
      toast.error("Failed to delete blog", {
        style: {
          backgroundColor: "#FF0000",
          color: "#fff",
        },
      });
    }
  };

  const confirmDelete = async () => {
    if (selectedBlogId) {
      await handleDeleteBlog(selectedBlogId);
      setIsDialogOpen(false);
      setSelectedBlogId(null);
    }
  };

  return (
    <>
      <div className="max-w-6xl mx-auto space-y-8 p-3">
        <div className="flex justify-between items-center border-b border-gray-200 pb-4">
          <h1 className="text-3xl font-bold text-gray-800">Blogs</h1>
          <Button
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
            onClick={() => router.push("/admin/blog/create")}
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Add New Blog
          </Button>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-2">
          {blogs.length > 0 ? (
            blogs.map((blog: Blog, index: number) => (
              <Card key={index} className="bg-white shadow-md hover:shadow-lg transition-shadow duration-300 rounded-lg px-4 py-3">
                <CardHeader className="border-gray-100 p-3">
                  <CardTitle className="text-xl text-gray-700">{blog.url}</CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <Image src={
                    blog.coverImage || "/img/no_img.webp"
                  }
                    alt={blog.title}
                    width={300}
                    height={100}
                    style={{width: "100%"}}
                  />
                  <h1 className="text-gray-600 text-5xl text-center mt-3">{blog.title}</h1>
                </CardContent>
                <CardFooter className="flex justify-end">
                  <div className="flex justify-between gap-4">
                    <Button
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg"
                      onClick={() => router.push(`/admin/blog/edit/${encodeURIComponent(blog.blogId)}`)}
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white rounded-lg"
                      onClick={() => {
                        setSelectedBlogId(blog.blogId);
                        setIsDialogOpen(true);
                      }}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </Button>
                    <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete this blog? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel onClick={() => setIsDialogOpen(false)}>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={confirmDelete}>Delete</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardFooter>
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
  );
}
