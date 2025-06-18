"use client"; 

import React, { useState } from "react";
import SunEditor from "suneditor-react";
import { useImageUploadStore } from "stores/imageUploadStore";
import { useBlogStore } from "stores/blogsStore";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Button } from "components/ui/button";
import { Input } from "components/ui/input";
import { Label } from "components/ui/label";
import { Textarea } from "components/ui/textarea";
import { Upload } from "lucide-react";

interface BlogData {
  title: string;
  url: string;
  description: string;
  coverImage: string | File;
}

export default function CreateBlog() {
  const { uploadImage, } = useImageUploadStore();
  const { createBlog, isLoading } = useBlogStore();
  const router = useRouter();

  const [blogData, setBlogData] = useState<BlogData>({
    title: "",
    url: "",
    description: "",
    coverImage: "",
  });
  const [editorContent, setEditorContent] = useState<string>(""); 

  // Handle cover image change with size validation
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const maxSizeInBytes = 300 * 1024; // 300KB
      if (file.size > maxSizeInBytes) {
        toast.error("File too large. Please upload an image under 300KB.", {
          style: { backgroundColor: "#FF0000", color: "#fff" },
        });
        e.target.value = ""; // Reset input
        return;
      }
      setBlogData({ ...blogData, coverImage: file });
    }
  };

  // Handle editor content change
  const handleEditorChange = (content: string) => {
    setEditorContent(content); 
  };

  // Handle image upload within SunEditor
  const handleImageUploadBefore = (
    files: File[],
    info: object,
    uploadHandler: (response: { error?: string; result?: { url: string }[] }) => void
  ) => {
    const uploadImageToServer = async () => {
      try {
        const file = files[0];
        await uploadImage(file);
        const uploadedUrl = useImageUploadStore.getState().imageUrl;
        if (uploadedUrl) {
          uploadHandler({ result: [{ url: uploadedUrl }] }); 
        } else {
          uploadHandler({ error: "Image upload failed: No URL returned." });
        }
      } catch (error) {
        console.error("Image Upload Error:", error);
        uploadHandler({ error: "Image upload failed." });
      }
    };

    uploadImageToServer();
    return false; 
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!editorContent) {
      toast.error("Please add some content to the blog.", {
        style: { backgroundColor: "#FF0000", color: "#fff" },
      });
      return;
    }

    try {
      console.log("editorContent ==> ",editorContent)
      const data = {
        title: blogData.title,
        description: blogData.description,
        coverImage: blogData.coverImage,
        url: blogData.url.toLowerCase(),
        htmlContent: editorContent, 
        status: true,
      };

      await createBlog(data);

      const status = useBlogStore.getState().statusCode;
      const message = useBlogStore.getState().message;

      if (status === 200 || status === 201) {
        toast.success(message, {
          style: { backgroundColor: "#009F7F", color: "#fff" },
        });
        setTimeout(() => router.push("/admin/blog"), 1000);
      } else {
        toast.error(message || "Failed to create blog.", {
          style: { backgroundColor: "#FF0000", color: "#fff" },
        });
      }
    } catch (error) {
      toast.error("An error occurred while saving the blog.", {
        style: { backgroundColor: "#FF0000", color: "#fff" },
      });
      console.error("Submit Error:", error);
    }
  };

  return (
    <div className="bg-white rounded shadow p-10">
      <h2 className="font-bold text-4xl mb-3">Create Blog</h2>

      <div>
        {/* Blog URL */}
        <Label>
          Blog URL <span className="text-red-600">*</span>
        </Label>
        <Input
          type="text"
          placeholder="bangalore-to-delhi-oneway-cab"
          className="mb-3 py-7"
          value={blogData.url}
          onChange={(e) =>
            setBlogData({ ...blogData, url: e.target.value.replaceAll(" ", "-") })
          }
        />

        {/* Cover Image */}
        <Label>
          Blog Cover Image <span className="text-red-600">*</span>
        </Label>
        <div
          className={`border-2 ${
            blogData.coverImage ? "border-custom-green" : "border-dashed border-gray-300"
          } rounded-lg transition-all hover:border-custom-green group mb-3`}
        >
          <Label htmlFor="coverImage" className="cursor-pointer w-full">
            {!blogData.coverImage ? (
              <div className="flex flex-col items-center justify-center py-10">
                <div className="h-16 w-16 rounded-full bg-green-50 flex items-center justify-center mb-3 group-hover:bg-green-100 transition-colors">
                  <Upload className="h-8 w-8 text-custom-green" />
                </div>
                <p className="text-sm font-medium text-gray-700">Click to upload or drag and drop</p>
                <p className="text-xs text-gray-500 mt-1">PNG, JPG, or JPEG (max. 300KB)</p>
              </div>
            ) : (
              <div className="relative">
                <img
                  src={
                    blogData.coverImage instanceof File
                      ? URL.createObjectURL(blogData.coverImage)
                      : blogData.coverImage as string
                  }
                  alt="Cover image"
                  className="w-full h-48 object-cover rounded-lg"
                />
                <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
                  <p className="text-white text-sm font-medium">Click to change</p>
                </div>
              </div>
            )}
            <input
              id="coverImage"
              type="file"
              accept="image/png, image/jpeg, image/jpg"
              className="hidden"
              onChange={handleImageChange}
            />
          </Label>
        </div>

        {/* Blog Title */}
        <Label>
          Blog Title <span className="text-red-600">*</span>
        </Label>
        <Input
          type="text"
          className="mb-3 py-7"
          value={blogData.title}
          onChange={(e) => setBlogData({ ...blogData, title: e.target.value })}
        />

        {/* Blog Description */}
        <Label>
          Blog Description <span className="text-red-600">*</span>
        </Label>
        <Textarea
          placeholder="Write a short description about the blog"
          rows={4}
          className="mb-3 py-7"
          value={blogData.description}
          onChange={(e) => setBlogData({ ...blogData, description: e.target.value })}
        />

        {/* SunEditor */}
        <Label>
          Blog Content <span className="text-red-600">*</span>
        </Label>
        <SunEditor
          setOptions={{
            defaultStyle: "height: 600px;",
            buttonList: [
              ["undo", "redo"],
              ["font", "fontSize", "formatBlock"],
              ["bold", "underline", "italic", "strike"],
              ["fontColor"],
              ["align", "list", "table"],
              ["link", "image"],
              ["fullScreen"],
            ],
            imageUploadSizeLimit: 5 * 1024 * 1024, // 5MB limit for editor images
          }}
          onChange={handleEditorChange} // Capture HTML content
          onImageUploadBefore={handleImageUploadBefore} // Custom image upload handler
        />

        {/* Buttons */}
        <div className="flex justify-end mt-3">
          <div className="flex gap-4">
            <Button variant="outline" onClick={() => router.push("/admin/blog")}>
              Close
            </Button>
            <Button onClick={handleSubmit} disabled={isLoading}>
              {isLoading ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}