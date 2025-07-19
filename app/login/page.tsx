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
    email: "silvertaxi@gmail.com",
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
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    localStorage.clear()
    // Basic validation
    if (!formData.email || !formData.password) {
      toast.info("Please fill in all fields.", {
        style: {
          backgroundColor: "#007FFF",
          color: "#fff",
        },
      });
      return;
    }

    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      toast.info("Please enter a valid email address.", {
        style: {
          backgroundColor: "#007FFF",
          color: "#fff",
        },
      });
      return;
    }

    await login(formData.email, formData.password);

    const status = useAuthStore.getState().statusCode;
    const message = useAuthStore.getState().message;

    if (status === 200 || status === 201) {
      toast.success("You have successfully logged in.", {
        style: {
          backgroundColor: "#009F7F",
          color: "#fff",
        },
      });
      let role = sessionStorage.getItem("role");
      if (role === "admin") {
        router.push("/admin");
      } else {
        router.push("/vendor");
      }
    } else if (status === 400) {
      toast.info(message || "You are not authorized to login.", {
        style: {
          backgroundColor: "#00CAFF",
          color: "#fff",
        },
      });
    } else {
      toast.error(message || "An unknown error occurred.", {
        style: {
          backgroundColor: "#FF0000",
          color: "#fff",
        },
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
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              value={formData.email}
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
