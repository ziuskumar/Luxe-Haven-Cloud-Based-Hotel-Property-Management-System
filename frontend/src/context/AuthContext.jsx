import React, { createContext, useContext, useState, useEffect } from "react";
import API from "../api";

const AuthContext = createContext();

export const DEMO_CREDENTIALS = {
  admin: { email: "admin@luxehaven.com", password: "Password@123", label: "Admin" },
  hotel_manager: { email: "manager@luxehaven.com", password: "Password@123", label: "Hotel Manager" },
  receptionist: { email: "reception@luxehaven.com", password: "Password@123", label: "Receptionist" },
  customer: { email: "guest@luxehaven.com", password: "Password@123", label: "Customer" },
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem("luxehaven_user");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem("luxehaven_token") || "");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (token && !user) {
      API.get("/auth/me")
        .then((res) => {
          setUser(res.data.user);
          localStorage.setItem("luxehaven_user", JSON.stringify(res.data.user));
        })
        .catch(() => {
          logout();
        });
    }
  }, [token]);

  const login = async (identifier, password) => {
    setLoading(true);
    try {
      const res = await API.post("/auth/login", { identifier, password });
      const { token: newToken, user: newUser } = res.data;
      setToken(newToken);
      setUser(newUser);
      localStorage.setItem("luxehaven_token", newToken);
      localStorage.setItem("luxehaven_user", JSON.stringify(newUser));
      return { success: true, user: newUser };
    } catch (err) {
      const message = err.response?.data?.message || "Login failed.";
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    setLoading(true);
    try {
      const res = await API.post("/auth/register", userData);
      const { token: newToken, user: newUser } = res.data;
      setToken(newToken);
      setUser(newUser);
      localStorage.setItem("luxehaven_token", newToken);
      localStorage.setItem("luxehaven_user", JSON.stringify(newUser));
      return { success: true, user: newUser };
    } catch (err) {
      const message = err.response?.data?.message || "Registration failed.";
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken("");
    localStorage.removeItem("luxehaven_token");
    localStorage.removeItem("luxehaven_user");
  };

  // Instant demo role switch
  const switchDemoRole = async (roleKey) => {
    const creds = DEMO_CREDENTIALS[roleKey];
    if (creds) {
      return await login(creds.email, creds.password);
    }
  };

  const role = user?.role || "guest";
  const isAdmin = role === "admin";
  const isManager = role === "hotel_manager";
  const isReceptionist = role === "receptionist";
  const isCustomer = role === "customer";
  const isStaff = isAdmin || isManager || isReceptionist;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        role,
        loading,
        login,
        register,
        logout,
        switchDemoRole,
        isAdmin,
        isManager,
        isReceptionist,
        isCustomer,
        isStaff,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
