"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useTheme } from "../../lib/theme-context";
import { useAuth } from "../../lib/auth-context";

const navigation = [
  { name: "Welcome", href: "/welcome" },
  { name: "Dreams", href: "/dreams" },
  { name: "New Dream", href: "/dreams/new" },
  { name: "Interpretations", href: "/interpretations" },
  { name: "Analysis", href: "/analysis" },
  { name: "You", href: "/you" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();
  const { theme, themeName, toggleTheme } = useTheme();

  // Use light logo on dark theme, dark logo on light theme
  const logoSrc =
    themeName === "dark" ? "/crescent-light.png" : "/crescent-dark.png";

  return (
    <div
      className="hidden md:flex h-screen w-64 flex-col"
      style={{ backgroundColor: theme.card, color: theme.text }}
    >
      <div
        className="flex items-center justify-center gap-2 h-16"
        style={{
          backgroundColor: theme.background,
          borderBottom: `1px solid ${theme.border}`,
        }}
      >
        <Image
          src={logoSrc}
          alt="Dreams"
          width={42}
          height={42}
          className="object-contain"
        />
        <h1 className="text-xl font-bold">DREAMS</h1>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-2">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className="flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors"
              style={{
                backgroundColor: isActive ? theme.background : "transparent",
                color: theme.text,
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = theme.background;
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = "transparent";
                }
              }}
            >
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div
        className="p-4 space-y-2"
        style={{ borderTop: `1px solid ${theme.border}` }}
      >
        {/* Theme Toggle */}
        <div
          className="w-full flex items-center justify-between px-4 py-2 text-sm"
          style={{ color: theme.text }}
        >
          <span className="flex items-center gap-2">
            <span>Theme</span>
          </span>
          <button
            onClick={toggleTheme}
            className="relative w-12 h-6 rounded-full transition-all"
            style={{
              backgroundColor:
                themeName === "dark" ? theme.text : theme.background,
              border: `1px solid ${theme.border}`,
            }}
            aria-label="Toggle theme"
          >
            <span
              className="absolute top-0.5 w-5 h-5 rounded-full transition-transform flex items-center justify-center text-xs"
              style={{
                backgroundColor:
                  themeName === "dark" ? theme.background : theme.text,
                transform:
                  themeName === "dark" ? "translateX(24px)" : "translateX(2px)",
              }}
            ></span>
          </button>
        </div>

        {/* Sign Out */}
        <button
          onClick={logout}
          className="w-full px-4 py-2 text-sm rounded-lg transition-colors"
          style={{ color: theme.text }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = theme.background;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "transparent";
          }}
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}
