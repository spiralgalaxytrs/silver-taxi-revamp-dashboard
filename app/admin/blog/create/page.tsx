import { useState } from "react";
import { useRouter } from "next/router";
import { toast } from "sonner";
import SunEditor from "suneditor-react";
import { Upload } from "lucide-react";
import { Button } from "components/ui/button";
import { Input } from "components/ui/input";
import { Textarea } from "components/ui/textarea";
import { Label } from "components/ui/label";
import { useCreateBlog } from "hooks/react-query/useBlog";
import { useImageUpload } from "hooks/react-query/useImageUpload";

export default function CreateBlog() {
  const router = useRouter();
  const { mutateAsync: createBlog, isPending } = useCreateBlog();
  const { mutateAsync: uploadImage } = useImageUpload();

  const [blogData, setBlogData] = useState({
    title: "",
    url: "",
    description: "",
    coverImage: "" as string | File,
  });
  const [editorContent, setEditorContent] = useState<string>("");

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const maxSize = 300 * 1024;
    if (file.size > maxSize) {
      toast.error("Image must be less than 300KB", {
        style: { backgroundColor: "#FF0000", color: "#fff" },
      });
      e.target.value = "";
      return;
    }

    setBlogData((prev) => ({ ...prev, coverImage: file }));
  };

  const handleEditorChange = (content: string) => {
    setEditorContent(content);
  };

  const handleImageUploadBefore = (
    files: File[],
    info: object,
    uploadHandler: (response: { error?: string; result?: { url: string }[] }) => void
  ): false => {
    const upload = async () => {
      try {
        const file = files[0];
        const result: any = await uploadImage(file);

        if (result?.url) {
          uploadHandler({ result: [{ url: result.url }] });
          toast.success("Image uploaded successfully", {
            style: { backgroundColor: "#009F7F", color: "#fff" },
          });
        } else {
          uploadHandler({ error: "Failed to get uploaded image URL" });
        }
      } catch (error) {
        console.error("Image upload error:", error);
        uploadHandler({ error: "Upload failed" });
      }
    };

    upload(); // don't await it
    return false; // tell SunEditor we're handling upload manually
  };

  const handleSubmit = async () => {
    if (!editorContent) {
      toast.error("Please add blog content", {
        style: { backgroundColor: "#FF0000", color: "#fff" },
      });
      return;
    }

    try {
      const payload = {
        title: blogData.title,
        url: blogData.url.toLowerCase(),
        description: blogData.description,
        htmlContent: editorContent,
        status: true,
        coverImage: blogData.coverImage,
      };

      const response = await createBlog(payload as any); // adjust typing if needed

      toast.success("Blog created successfully!", {
        style: { backgroundColor: "#009F7F", color: "#fff" },
      });
      setTimeout(() => router.push("/admin/blog"), 1000);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to create blog", {
        style: { backgroundColor: "#FF0000", color: "#fff" },
      });
    }
  };

  return (
    <div className="bg-white rounded shadow p-10">
      <h2 className="font-bold text-4xl mb-3">Create Blog</h2>

      {/* Blog URL */}
      <Label>Blog URL <span className="text-red-600">*</span></Label>
      <Input
        type="text"
        className="mb-3 py-7"
        placeholder="bangalore-to-delhi-oneway-cab"
        value={blogData.url}
        onChange={(e) =>
          setBlogData({ ...blogData, url: e.target.value.replaceAll(" ", "-") })
        }
      />

      {/* Cover Image */}
      <Label>Blog Cover Image <span className="text-red-600">*</span></Label>
      <div className={`border-2 ${blogData.coverImage ? "border-custom-green" : "border-dashed border-gray-300"} rounded-lg group mb-3`}>
        <Label htmlFor="coverImage" className="cursor-pointer w-full">
          {!blogData.coverImage ? (
            <div className="flex flex-col items-center justify-center py-10">
              <div className="h-16 w-16 rounded-full bg-green-50 flex items-center justify-center mb-3">
                <Upload className="h-8 w-8 text-custom-green" />
              </div>
              <p className="text-sm font-medium text-gray-700">Click to upload or drag and drop</p>
              <p className="text-xs text-gray-500 mt-1">PNG, JPG, JPEG (max. 300KB)</p>
            </div>
          ) : (
            <div className="relative">
              <img
                src={
                  blogData.coverImage instanceof File
                    ? URL.createObjectURL(blogData.coverImage)
                    : blogData.coverImage
                }
                alt="Cover"
                className="w-full h-48 object-cover rounded-lg"
              />
              <div className="absolute inset-0 bg-black bg-opacity-40 hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
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
      <Label>Blog Title <span className="text-red-600">*</span></Label>
      <Input
        type="text"
        className="mb-3 py-7"
        value={blogData.title}
        onChange={(e) => setBlogData({ ...blogData, title: e.target.value })}
      />

      {/* Blog Description */}
      <Label>Blog Description <span className="text-red-600">*</span></Label>
      <Textarea
        rows={4}
        className="mb-3 py-7"
        placeholder="Short description"
        value={blogData.description}
        onChange={(e) => setBlogData({ ...blogData, description: e.target.value })}
      />

      {/* Editor */}
      <Label>Blog Content <span className="text-red-600">*</span></Label>
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
          imageUploadSizeLimit: 5 * 1024 * 1024,
        }}
        onChange={handleEditorChange}
        onImageUploadBefore={handleImageUploadBefore}
      />

      {/* Buttons */}
      <div className="flex justify-end mt-3 gap-4">
        <Button variant="outline" onClick={() => router.push("/admin/blog")}>
          Close
        </Button>
        <Button onClick={handleSubmit} disabled={isPending}>
          {isPending ? "Saving..." : "Save"}
        </Button>
      </div>
    </div>
  );
}
