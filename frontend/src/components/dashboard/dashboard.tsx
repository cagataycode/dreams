"use client";

import Image from "next/image";
import { useAuth } from "../../lib/auth-context";
import { useTheme } from "../../lib/theme-context";

export default function Dashboard() {
  const { user } = useAuth();
  const { theme, themeName } = useTheme();
  const logoSrc =
    themeName === "dark" ? "/crescent-light.png" : "/crescent-dark.png";

  return (
    <div className="space-y-6">
      <div
        className="pb-5"
        style={{ borderBottom: `1px solid ${theme.border}` }}
      >
        <h1
          className="text-3xl font-bold leading-6"
          style={{ color: theme.text }}
        >
          Welcome back, {user?.user_metadata?.name || user?.email}
        </h1>
        <p
          className="mt-2 max-w-4xl text-sm"
          style={{ color: theme.text, opacity: 0.7 }}
        >
          Track your dreams and discover insights through AI-powered
          psychoanalysis
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div
          className="overflow-hidden shadow rounded-lg"
          style={{
            backgroundColor: theme.card,
            border: `1px solid ${theme.border}`,
          }}
        >
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Image
                  src={logoSrc}
                  alt="Dreams"
                  width={32}
                  height={32}
                  className="object-contain"
                />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt
                    className="text-sm font-medium truncate"
                    style={{ color: theme.text, opacity: 0.7 }}
                  >
                    Total Dreams
                  </dt>
                  <dd
                    className="text-lg font-medium"
                    style={{ color: theme.text }}
                  >
                    0
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div
          className="overflow-hidden shadow rounded-lg"
          style={{
            backgroundColor: theme.card,
            border: `1px solid ${theme.border}`,
          }}
        >
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-2xl">🧠</span>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt
                    className="text-sm font-medium truncate"
                    style={{ color: theme.text, opacity: 0.7 }}
                  >
                    Interpretations
                  </dt>
                  <dd
                    className="text-lg font-medium"
                    style={{ color: theme.text }}
                  >
                    0
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div
          className="overflow-hidden shadow rounded-lg"
          style={{
            backgroundColor: theme.card,
            border: `1px solid ${theme.border}`,
          }}
        >
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-2xl">📊</span>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt
                    className="text-sm font-medium truncate"
                    style={{ color: theme.text, opacity: 0.7 }}
                  >
                    Analyses
                  </dt>
                  <dd
                    className="text-lg font-medium"
                    style={{ color: theme.text }}
                  >
                    0
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        className="shadow rounded-lg"
        style={{
          backgroundColor: theme.card,
          border: `1px solid ${theme.border}`,
        }}
      >
        <div
          className="px-6 py-5"
          style={{ borderBottom: `1px solid ${theme.border}` }}
        >
          <h3
            className="text-lg leading-6 font-medium"
            style={{ color: theme.text }}
          >
            Recent Dreams
          </h3>
        </div>
        <div className="px-6 py-4">
          <div className="text-center py-8">
            <span className="text-4xl">🌟</span>
            <p
              className="mt-2 text-sm"
              style={{ color: theme.text, opacity: 0.7 }}
            >
              No dreams recorded yet. Start by adding your first dream!
            </p>
            <button
              className="mt-4 inline-flex items-center px-4 py-2 text-sm font-medium rounded-md transition-theme"
              style={{
                backgroundColor: theme.background,
                color: theme.text,
                border: `1px solid ${theme.border}`,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = theme.text;
                e.currentTarget.style.color = theme.background;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = theme.background;
                e.currentTarget.style.color = theme.text;
              }}
            >
              Add First Dream
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
