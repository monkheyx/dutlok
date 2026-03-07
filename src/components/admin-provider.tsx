"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";

interface AdminContextType {
  password: string;
  isAuthenticated: boolean;
  login: (password: string) => Promise<boolean>;
  logout: () => void;
}

const AdminContext = createContext<AdminContextType>({
  password: "",
  isAuthenticated: false,
  login: async () => false,
  logout: () => {},
});

export function useAdmin() {
  return useContext(AdminContext);
}

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("dutlok_admin");
    if (stored) {
      setPassword(stored);
      setIsAuthenticated(true);
    }
  }, []);

  const login = useCallback(async (pwd: string) => {
    // Verify the password by making a test API call
    try {
      const res = await fetch("/api/admin/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: pwd }),
      });
      if (res.ok) {
        setPassword(pwd);
        setIsAuthenticated(true);
        localStorage.setItem("dutlok_admin", pwd);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }, []);

  const logout = useCallback(() => {
    setPassword("");
    setIsAuthenticated(false);
    localStorage.removeItem("dutlok_admin");
  }, []);

  return (
    <AdminContext.Provider value={{ password, isAuthenticated, login, logout }}>
      {children}
    </AdminContext.Provider>
  );
}
