"use client";

import { useAuth } from "../../lib/auth-context";
import { useTheme } from "../../lib/theme-context";
import Sidebar from "./sidebar";

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const { user, loading } = useAuth();
  const { theme } = useTheme();

  if (loading) {
    return (
      <div
        className="flex items-center justify-center min-h-screen"
        style={{ backgroundColor: theme.background, color: theme.text }}
      >
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <>{children}</>;
  }

  return (
    <div
      className="flex h-screen"
      style={{ backgroundColor: theme.background, color: theme.text }}
    >
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <div className="p-4 md:p-8">{children}</div>
      </main>
    </div>
  );
}
