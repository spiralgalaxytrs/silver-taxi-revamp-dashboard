"use client";

import React, { useEffect, useRef, useState } from "react";
import SunEditor from "suneditor-react";
import { useImageUploadStore } from "stores/imageUploadStore";
import { useBlogStore } from "stores/blogsStore";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Button } from "components/ui/button";
import { Label } from "components/ui/label";
import { Input } from "components/ui/input";
import { Textarea } from "components/ui/textarea";
import { Upload } from "lucide-react";

interface BlogData {
  title: string;
  url: string;
  description: string;
  coverImage: string | File;
}

export default function EditBlog({ params }: { params: Promise<{ id: string }> }) {
  const { uploadImage } = useImageUploadStore();
  const { updateBlog, fetchBlogById } = useBlogStore();
  const router = useRouter();
  const editorRef = useRef<any>(null);

  const [id, setId] = useState<string | undefined>(undefined);
  const [editorContent, setEditorContent] = useState<string>("");
  const [blogData, setBlogData] = useState<BlogData>({
    title: "",
    url: "",
    description: "",
    coverImage: "",
  });

  useEffect(() => {
    const loadBlogData = async () => {
      const resolvedParams = await params;
      setId(resolvedParams.id);

      if (resolvedParams.id) {
        await fetchBlogById(resolvedParams.id);
        const blog = useBlogStore.getState().blog;
        if (blog) {
          setBlogData({
            title: blog.title,
            url: blog.url,
            description: blog.description,
            coverImage: blog.coverImage,
          });
          setEditorContent(blog.htmlContent || "");
        }
      }
    };

    loadBlogData();
    // Cleanup function for object URLs
    return () => {
      if (blogData.coverImage instanceof File) {
        URL.revokeObjectURL(URL.createObjectURL(blogData.coverImage));
      }
    };
  }, [params, fetchBlogById]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const maxSizeInBytes = 300 * 1024; // 300KB
      if (file.size > maxSizeInBytes) {
        toast.error("File too large. Please upload an image under 300KB", {
          style: { backgroundColor: "#FF0000", color: "#fff" },
        });
        e.target.value = "";
        return;
      }
      setBlogData({ ...blogData, coverImage: file });
    }
  };

  const handleImageUploadBefore = (
    files: File[],
    info: object,
    uploadHandler: (response: { error?: string; result?: { url: string }[] }) => void
  ): boolean => {
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

  const handleEditorChange = (content: string) => {
    setEditorContent(content);
  };

  const handleSubmit = async () => {
    if (!editorContent) {
      toast.error("Please add some content to the blog.", {
        style: { backgroundColor: "#FF0000", color: "#fff" },
      });
      return;
    }

    try {
      const data = {
        title: blogData.title,
        description: blogData.description,
        coverImage: blogData.coverImage,
        url: blogData.url.toLowerCase(),
        htmlContent: editorContent,
        status: true,
      };

      if (id) {
        await updateBlog(id, data);
        const status = useBlogStore.getState().statusCode;
        const message = useBlogStore.getState().message;

        if (status === 200 || status === 201) {
          toast.success(message, {
            style: { backgroundColor: "#009F7F", color: "#fff" },
          });
          router.push("/admin/blog");
        } else {
          toast.error(message, {
            style: { backgroundColor: "#FF0000", color: "#fff" },
          });
        }
      }
    } catch (error) {
      toast.error("Failed to update blog", {
        style: { backgroundColor: "#FF0000", color: "#fff" },
      });
    }
  };

  return (
    <div className="bg-white rounded shadow p-10">
      <h2 className="font-bold text-4xl mb-3">Edit Blog</h2>
      <div>
        <Label>
          Blog URL <span className="text-red-600">*</span>
        </Label>
        <Input
          type="text"
          className="mb-3 py-7"
          onChange={(e) =>
            setBlogData({ ...blogData, url: e.target.value.replaceAll(" ", "-") })
          }
          value={blogData.url}
        />

        <Label>
          Cover Image <span className="text-red-600">*</span>
        </Label>
        <div
          className={`border-2 ${blogData.coverImage ? "border-custom-green" : "border-dashed border-gray-300"
            } rounded-lg transition-all hover:border-custom-green group mb-3`}
        >
          <Label htmlFor="coverImage" className="cursor-pointer w-full block">
            {!blogData.coverImage ? (
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
                  src={
                    blogData.coverImage instanceof File
                      ? URL.createObjectURL(blogData.coverImage)
                      : blogData.coverImage
                  }
                  alt="Blog cover"
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

        <Label>
          Blog Title <span className="text-red-600">*</span>
        </Label>
        <Input
          type="text"
          className="mb-3 py-7"
          onChange={(e) => setBlogData({ ...blogData, title: e.target.value })}
          value={blogData.title}
        />

        <Label>
          Blog Description <span className="text-red-600">*</span>
        </Label>
        <Textarea
          placeholder="Write a short description about the blog"
          rows={4}
          className="mb-3 py-7"
          onChange={(e) => setBlogData({ ...blogData, description: e.target.value })}
          value={blogData.description}
        />

        <Label>
          Blog Content <span className="text-red-600">*</span>
        </Label>
        <SunEditor
          setContents={editorContent}
          onChange={handleEditorChange}
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
            imageUploadSizeLimit: 2 * 1024 * 1024, // MB
          }}
          onImageUploadBefore={handleImageUploadBefore}
        />

        <div className="flex justify-end mt-3">
          <div className="flex gap-4">
            <Button variant="outline" onClick={() => router.push("/admin/blog")}>
              Close
            </Button>
            <Button onClick={handleSubmit}>Submit</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
