"use client";

import { useState } from "react";
import { useAuth } from "../lib/auth-context";
import { useTheme } from "../lib/theme-context";
import LoginForm from "../components/auth/login-form";
import RegisterForm from "../components/auth/register-form";
import Dashboard from "../components/dashboard/dashboard";

export default function Home() {
  const { user, loading, logout } = useAuth();
  const { theme } = useTheme();
  const [authMode, setAuthMode] = useState<"login" | "register">("login");

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Loading...</p>
        </div>
      </div>
    );
  }

  if (user) {
    return <Dashboard />;
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8"
      style={{ backgroundColor: theme.background }}
    >
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2
            className="mt-6 text-center text-3xl font-extrabold"
            style={{ color: theme.text }}
          >
            Welcome to Dreams
          </h2>
          <p
            className="mt-2 text-center text-sm"
            style={{ color: theme.text, opacity: 0.7 }}
          >
            Your journey starts here
          </p>
        </div>

        <div className="mt-8 space-y-6">
          <div className="flex rounded-md shadow-sm">
            <button
              type="button"
              onClick={() => setAuthMode("login")}
              className="relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-l-md transition-theme"
              style={{
                backgroundColor: authMode === "login" ? theme.text : theme.card,
                color: authMode === "login" ? theme.background : theme.text,
                border: `1px solid ${theme.border}`,
                borderRight: "none",
              }}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setAuthMode("register")}
              className="relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-r-md transition-theme"
              style={{
                backgroundColor:
                  authMode === "register" ? theme.text : theme.card,
                color: authMode === "register" ? theme.background : theme.text,
                border: `1px solid ${theme.border}`,
                borderLeft: "none",
              }}
            >
              Sign Up
            </button>
          </div>

          <div
            className="py-8 px-4 shadow sm:rounded-lg sm:px-10"
            style={{
              backgroundColor: theme.card,
              border: `1px solid ${theme.border}`,
            }}
          >
            {authMode === "login" ? <LoginForm /> : <RegisterForm />}
          </div>
        </div>
      </div>
    </div>
  );
}
