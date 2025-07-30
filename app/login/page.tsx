"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "components/ui/button";
import { Input } from "components/ui/input";
import { Label } from "components/ui/label";
import { useAuthStore } from "stores/authStore";
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    // email: "silvertaxi@gmail.com",
    contact: "9361060914",
    password: "12345678",
  });
  const login = useAuthStore((state) => state.login);

  type ToastState = {
    open: boolean;
    title: string;
    description: string;
    variant: "default" | "destructive";
  };

  const [toastState, setToastState] = useState<ToastState>({
    open: false,
    title: "",
    description: "",
    variant: "default",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.clear();

    const contact = formData.contact.trim();
    const password = formData.password.trim();

    if (!contact || !password) {
      toast.info("Please fill in all fields.", {
        style: { backgroundColor: "#007FFF", color: "#fff" },
      });
      return;
    }

    const isEmail = /\S+@\S+\.\S+/.test(contact);
    const isPhone = /^[6-9]\d{9}$/.test(contact);

    if (!isEmail && !isPhone) {
      toast.info("Please enter a valid email or phone number.", {
        style: { backgroundColor: "#007FFF", color: "#fff" },
      });
      return;
    }

    // You can pass both, backend will use whichever is valid
    const email = isEmail ? contact : "";
    const phone = isPhone ? contact : "";

    await login(email || phone, password); // adjust this if login takes both separately

    const status = useAuthStore.getState().statusCode;
    const message = useAuthStore.getState().message;

    if (status === 200 || status === 201) {
      toast.success("You have successfully logged in.", {
        style: { backgroundColor: "#009F7F", color: "#fff" },
      });
      let role = sessionStorage.getItem("role");
      router.push(role === "admin" ? "/admin" : "/vendor");
    } else if (status === 400) {
      toast.info(message || "You are not authorized to login.", {
        style: { backgroundColor: "#00CAFF", color: "#fff" },
      });
    } else {
      toast.error(message || "An unknown error occurred.", {
        style: { backgroundColor: "#FF0000", color: "#fff" },
      });
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md">
        <form
          onSubmit={handleSubmit}
          className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4"
        >
          <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>
          <div className="mb-4">
            <Label htmlFor="email">Email or Phone</Label>
            <Input
              id="contact"
              name="contact"
              type="text"
              autoComplete="username"
              value={formData.contact}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="mb-6">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              value={formData.password}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="flex items-center justify-between">
            <Button type="submit">Login</Button>
            <Button variant="outline" onClick={() => router.push("/")}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
