"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { account } from "../../lib/appwrite";

export default function VerifyPage() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"verifying" | "success" | "error">(
    "verifying"
  );
  const [message, setMessage] = useState("Verifying your email...");

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const userId = searchParams.get("userId");
        const secret = searchParams.get("secret");

        if (!userId || !secret) {
          throw new Error("Missing verification parameters");
        }

        await account.updateVerification(userId, secret);
        setStatus("success");
        setMessage("Email verified successfully! You can now sign in.");
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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">
            Email Verification
          </h2>

          <div className="mt-8">
            {status === "verifying" && (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="ml-3 text-gray-600 dark:text-gray-300">
                  {message}
                </p>
              </div>
            )}

            {status === "success" && (
              <div className="text-center">
                <div className="text-green-600 text-lg mb-4">{message}</div>
                <a
                  href="/"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                >
                  Go to Sign In
                </a>
              </div>
            )}

            {status === "error" && (
              <div className="text-center">
                <div className="text-red-600 text-lg mb-4">{message}</div>
                <a
                  href="/"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                >
                  Back to Home
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
