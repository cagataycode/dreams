"use client";

import { useState } from "react";
import { useAuth } from "../lib/auth-context";
import LoginForm from "../components/auth/login-form";
import RegisterForm from "../components/auth/register-form";

export default function Home() {
  const { user, loading, logout } = useAuth();
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
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Welcome to Dreams, {user.name}!
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
            Your journey starts here
          </p>
          <button
            onClick={logout}
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Sign Out
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            Welcome to Dreams
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            Your journey starts here
          </p>
        </div>

        <div className="mt-8 space-y-6">
          <div className="flex rounded-md shadow-sm">
            <button
              type="button"
              onClick={() => setAuthMode("login")}
              className={`relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-l-md ${
                authMode === "login"
                  ? "bg-blue-600 text-white"
                  : "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setAuthMode("register")}
              className={`relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-r-md ${
                authMode === "register"
                  ? "bg-blue-600 text-white"
                  : "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600"
              }`}
            >
              Sign Up
            </button>
          </div>

          <div className="bg-white dark:bg-gray-800 py-8 px-4 shadow sm:rounded-lg sm:px-10">
            {authMode === "login" ? <LoginForm /> : <RegisterForm />}
          </div>
        </div>
      </div>
    </div>
  );
}
