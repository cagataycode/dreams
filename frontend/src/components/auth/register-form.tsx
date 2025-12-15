"use client";

import React, { useState } from "react";
import { useAuth } from "../../lib/auth-context";
import { useTheme } from "../../lib/theme-context";

export default function RegisterForm() {
  const { theme } = useTheme();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const { register, resendVerification } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      await register(email, password, name);
      setSuccess(
        "Account created! Please check your email for verification link."
      );
      setName("");
      setEmail("");
      setPassword("");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium"
          style={{ color: theme.text }}
        >
          Name
        </label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="mt-1 block w-full px-3 py-2 rounded-md shadow-sm focus:outline-none transition-theme"
          style={{
            backgroundColor: theme.background,
            border: `1px solid ${theme.border}`,
            color: theme.text,
          }}
        />
      </div>
      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium"
          style={{ color: theme.text }}
        >
          Email
        </label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="mt-1 block w-full px-3 py-2 rounded-md shadow-sm focus:outline-none transition-theme"
          style={{
            backgroundColor: theme.background,
            border: `1px solid ${theme.border}`,
            color: theme.text,
          }}
        />
      </div>
      <div>
        <label
          htmlFor="password"
          className="block text-sm font-medium"
          style={{ color: theme.text }}
        >
          Password
        </label>
        <input
          type="password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="mt-1 block w-full px-3 py-2 rounded-md shadow-sm focus:outline-none transition-theme"
          style={{
            backgroundColor: theme.background,
            border: `1px solid ${theme.border}`,
            color: theme.text,
          }}
        />
      </div>
      {error && <div className="text-red-600 text-sm">{error}</div>}
      {success && (
        <div className="text-green-600 text-sm space-y-2">
          <div>{success}</div>
          <button
            type="button"
            onClick={resendVerification}
            className="text-blue-600 hover:text-blue-800 underline text-xs"
          >
            Resend verification email
          </button>
        </div>
      )}
      <button
        type="submit"
        disabled={loading}
        className="w-full flex justify-center py-2 px-4 rounded-md shadow-sm text-sm font-medium transition-theme disabled:opacity-50"
        style={{
          backgroundColor: theme.text,
          color: theme.background,
          border: `1px solid ${theme.border}`,
        }}
        onMouseEnter={(e) => {
          if (!loading) {
            e.currentTarget.style.backgroundColor = theme.background;
            e.currentTarget.style.color = theme.text;
          }
        }}
        onMouseLeave={(e) => {
          if (!loading) {
            e.currentTarget.style.backgroundColor = theme.text;
            e.currentTarget.style.color = theme.background;
          }
        }}
      >
        {loading ? "Creating account..." : "Create account"}
      </button>
    </form>
  );
}
