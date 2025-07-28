import { create } from "zustand";
import { persist } from "zustand/middleware";
import axios, { AxiosError } from "../lib/http-common";
import { AuthState, ErrorResponse } from "types/auth";

const EXPIRY_TIME = 24 * 60 * 60 * 1000; // 1 day in milliseconds

// Function to check if the store has expired
const isExpired = (timestamp: number) => {
  const currentTime = Date.now();
  return currentTime - timestamp > EXPIRY_TIME;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      message: null,
      statusCode: null,
      user: null,
      email: null,
      permissions: null,
      timestamp: null,

      setMessage: (message: string | null) => set({ message }),
      setUser: (user: string | null) => set({ user }),
      setEmail: (email: string | null) => set({ email }),
      setPermissions: (permissions: string[] | null) => set({ permissions }),
      setTimestamp: (timestamp: number | null) => set({ timestamp }),

      login: async (emailOrPhone: string, password: string) => {
        try {
          const isEmail = /\S+@\S+\.\S+/.test(emailOrPhone);
          const payload = {
            email: isEmail ? emailOrPhone : null,
            phone: !isEmail ? emailOrPhone : null,
            password,
          };
          console.log("Login payload:", payload);
          const response = await axios.post("/auth/login", payload);
          const { token, role, permissions, user } = response.data.data;
          const statusCode = response.status;
          const message = response.data.message;

          // Update the state and store the timestamp of when the data was saved
          const timestamp = Date.now();
          set({  message, statusCode, user, timestamp });

          // Store the entire state along with the timestamp in localStorage
          sessionStorage.setItem("token", token);
          sessionStorage.setItem("role", role);

        } catch (error) {
          const axiosError = error as AxiosError<ErrorResponse>;
          set({
            message: axiosError.response?.data?.message || "An error occurred.",
            statusCode: axiosError.response?.status || 500,
            user: null,
            permissions: null,
            timestamp: null,
          });
        }
      },

      logout: () => {
        localStorage.clear();
        sessionStorage.clear();
        // Clear the entire stored state
        set({
          message: null,
          statusCode: null,
          user: null,
          email: null,
          permissions: null,
          timestamp: null,
        });
      },

      // Auto-clear expired data when accessing the store
      checkExpiry: () => {
        const storedState = localStorage.getItem("auth-storage");
        if (storedState) {
          const { timestamp } = JSON.parse(storedState);
          if (isExpired(timestamp)) {
            // Clear the store if expired
            localStorage.clear();
            sessionStorage.clear();
            set({
              message: null,
              statusCode: null,
              user: null,
              email: null,
              permissions: null,
              timestamp: null,
            });
          }
        }
      },
    }),
    {
      name: "auth-storage",
      onRehydrateStorage: (state) => {
        state?.checkExpiry();
      },
    }
  )
);
