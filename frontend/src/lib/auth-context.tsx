"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { getSupabaseClient } from "./supabase";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  resendVerification: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const supabase = getSupabaseClient();

    checkUser(supabase);

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkUser = async (supabase: ReturnType<typeof getSupabaseClient>) => {
    try {
      console.log("Checking user...");
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();
      if (error) throw error;
      console.log("User found:", user);
      setUser(user);
    } catch (error) {
      console.log("No user found:", error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    const supabase = getSupabaseClient();

    try {
      console.log("Attempting login...");
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      console.log("Session created:", data.session);
      console.log("User:", data.user);

      // Store access token in localStorage for API calls
      if (data.session?.access_token) {
        localStorage.setItem("sb-access-token", data.session.access_token);
      }

      setUser(data.user);
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  };

  const register = async (email: string, password: string, name: string) => {
    const supabase = getSupabaseClient();

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
        },
      },
    });

    if (error) throw error;

    // If email confirmation is required, user will be null
    if (data.user) {
      setUser(data.user);
    }
  };

  const logout = async () => {
    const supabase = getSupabaseClient();

    await supabase.auth.signOut();
    localStorage.removeItem("sb-access-token");
    setUser(null);
  };

  const resendVerification = async () => {
    const supabase = getSupabaseClient();

    const { error } = await supabase.auth.resend({
      type: "signup",
      email: user?.email || "",
    });

    if (error) throw error;
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
