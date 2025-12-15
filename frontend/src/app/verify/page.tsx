"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useTheme } from "../../lib/theme-context";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export default function VerifyPage() {
  const searchParams = useSearchParams();
  const { theme } = useTheme();
  const [status, setStatus] = useState<"verifying" | "success" | "error">(
    "verifying"
  );
  const [message, setMessage] = useState("Verifying your email...");

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        // Supabase uses token_hash from the URL
        const token =
          searchParams.get("token_hash") || searchParams.get("token");
        const type = searchParams.get("type") || "email";

        if (!token) {
          throw new Error("Missing verification token");
        }

        const response = await fetch(`${API_BASE_URL}/auth/verify`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token, type }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(errorText || "Verification failed");
        }

        const result = await response.json();
        setStatus("success");
        setMessage(
          result.message || "Email verified successfully! You can now sign in."
        );
      } catch (error) {
        setStatus("error");
        setMessage(
          error instanceof Error ? error.message : "Verification failed"
        );
      }
    };

    verifyEmail();
  }, [searchParams]);

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ backgroundColor: theme.background }}
    >
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2
            className="mt-6 text-3xl font-extrabold"
            style={{ color: theme.text }}
          >
            Email Verification
          </h2>

          <div className="mt-8">
            {status === "verifying" && (
              <div className="flex items-center justify-center">
                <div
                  className="animate-spin rounded-full h-8 w-8 border-b-2"
                  style={{ borderColor: theme.text }}
                ></div>
                <p className="ml-3" style={{ color: theme.text, opacity: 0.7 }}>
                  {message}
                </p>
              </div>
            )}

            {status === "success" && (
              <div className="text-center">
                <div className="text-lg mb-4" style={{ color: "#22c55e" }}>
                  {message}
                </div>
                <Link
                  href="/"
                  className="inline-block font-bold py-2 px-4 rounded transition-theme"
                  style={{
                    backgroundColor: theme.text,
                    color: theme.background,
                  }}
                >
                  Go to Sign In
                </Link>
              </div>
            )}

            {status === "error" && (
              <div className="text-center">
                <div className="text-lg mb-4" style={{ color: "#ef4444" }}>
                  {message}
                </div>
                <Link
                  href="/"
                  className="inline-block font-bold py-2 px-4 rounded transition-theme"
                  style={{
                    backgroundColor: theme.text,
                    color: theme.background,
                  }}
                >
                  Back to Home
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
