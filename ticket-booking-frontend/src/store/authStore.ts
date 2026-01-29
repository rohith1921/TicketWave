import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface AuthState {
  token: string | null;
  isAuthenticated: boolean;
  setToken: (token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>() (
  persist(
    (set) => ({
  token: null,
  isAuthenticated: false,

  setToken: (token: string) => {
    set({ token, isAuthenticated: true });
  },

  logout: () => {
    set({ token: null, isAuthenticated: false });
  },
}),
{
  name: "ticket-platform-auth",
  storage: createJSONStorage(() => localStorage),
}
  )
);
