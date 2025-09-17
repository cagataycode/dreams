"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { Models } from "appwrite";
import { account } from "./appwrite";

interface AuthContextType {
  user: Models.User<Models.Preferences> | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<Models.Session>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  resendVerification: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Models.User<Models.Preferences> | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const user = await account.get();
      setUser(user);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    const session = await account.createEmailPasswordSession(email, password);
    await checkUser();
    return session;
  };

  const register = async (email: string, password: string, name: string) => {
    // Create account with email verification
    await account.create("unique()", email, password, name);
    // Email verification will be sent automatically by Appwrite
  };

  const logout = async () => {
    await account.deleteSession("current");
    setUser(null);
  };

  const resendVerification = async () => {
    await account.createVerification("http://localhost:3000/verify");
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, logout, resendVerification }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
