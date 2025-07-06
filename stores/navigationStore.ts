import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface NavigationState {
  previousPath: string | null;
  setPreviousPath: (path: string) => void;
}

export const useNavigationStore = create<NavigationState>()(
  persist(
    (set) => ({
      previousPath: null,
      setPreviousPath: (path) => set({ previousPath: path }),
    }),
    {
      name: "navigation-storage",
      storage: {
        getItem: (name) => {
          if (typeof window === "undefined") return null;
          const item = sessionStorage.getItem(name);
          return item ? JSON.parse(item) : null;
        },
        setItem: (name, value) => {
          if (typeof window === "undefined") return;
          sessionStorage.setItem(name, JSON.stringify(value));
        },
        removeItem: (name) => {
          if (typeof window === "undefined") return;
          sessionStorage.removeItem(name);
        },
      },
    }
  )
);
