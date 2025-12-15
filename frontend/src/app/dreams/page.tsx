"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "../../lib/auth-context";
import { useTheme } from "../../lib/theme-context";
import {
  dreamService,
  Dream,
  FEELING_OPTIONS,
} from "../../lib/services/dreams";

export default function DreamsPage() {
  const { user } = useAuth();
  const { theme, themeName } = useTheme();
  const logoSrc =
    themeName === "dark" ? "/crescent-light.png" : "/crescent-dark.png";
  const [dreams, setDreams] = useState<Dream[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadDreams();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const loadDreams = async () => {
    if (!user) return;

    try {
      const userDreams = await dreamService.getUserDreams();
      setDreams(userDreams);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load dreams");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (dreamId: string) => {
    try {
      setDeletingId(dreamId);
      setError("");
      await dreamService.deleteDream(dreamId);
      setDreams((prev) => prev.filter((d) => d.id !== dreamId));
      setConfirmDeleteId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete dream");
    } finally {
      setDeletingId(null);
    }
  };

  const getFeelingLabel = (value: string) => {
    return FEELING_OPTIONS.find((f) => f.value === value)?.label || value;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div style={{ color: theme.text }}>Loading dreams...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: theme.text }}>
            My Dreams
          </h1>
          <p className="mt-2" style={{ color: theme.text, opacity: 0.7 }}>
            Your personal dream journal
          </p>
        </div>
        <Link
          href="/dreams/new"
          className="px-4 py-2 rounded-md transition-theme"
          style={{
            backgroundColor: theme.text,
            color: theme.background,
            border: `1px solid ${theme.border}`,
          }}
        >
          ✍️ New Dream
        </Link>
      </div>

      {error && (
        <div
          className="p-3 rounded-md"
          style={{
            backgroundColor: "#fee",
            color: "#c53030",
            border: "1px solid #feb2b2",
          }}
        >
          {error}
        </div>
      )}

      {dreams.length === 0 ? (
        <div className="text-center py-12">
          <Image
            src={logoSrc}
            alt="Dreams"
            width={96}
            height={96}
            className="object-contain mx-auto"
          />
          <h3
            className="mt-4 text-lg font-medium"
            style={{ color: theme.text }}
          >
            No dreams recorded yet
          </h3>
          <p className="mt-2" style={{ color: theme.text, opacity: 0.7 }}>
            Start your dream journey by recording your first dream.
          </p>
          <Link
            href="/dreams/new"
            className="mt-6 inline-flex items-center px-4 py-2 rounded-md transition-theme"
            style={{
              backgroundColor: theme.text,
              color: theme.background,
              border: `1px solid ${theme.border}`,
            }}
          >
            Record First Dream
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {dreams.map((dream) => (
            <div
              key={dream.id}
              className="p-6 rounded-lg shadow"
              style={{
                backgroundColor: theme.card,
                border: `1px solid ${theme.border}`,
              }}
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3
                    className="text-lg font-medium"
                    style={{ color: theme.text }}
                  >
                    {dream.title || "Untitled Dream"}
                  </h3>
                  {/* Dream metadata badges */}
                  <div className="flex flex-wrap gap-2 mt-1">
                    {dream.is_lucid && (
                      <span
                        className="text-xs px-2 py-0.5 rounded-full"
                        style={{
                          backgroundColor: theme.background,
                          color: theme.text,
                        }}
                      >
                        ✨ Lucid
                      </span>
                    )}
                    {dream.is_recurring && (
                      <span
                        className="text-xs px-2 py-0.5 rounded-full"
                        style={{
                          backgroundColor: theme.background,
                          color: theme.text,
                        }}
                      >
                        🔄 Recurring
                      </span>
                    )}
                    {dream.mood && (
                      <span
                        className="text-xs px-2 py-0.5 rounded-full"
                        style={{
                          backgroundColor: theme.background,
                          color: theme.text,
                        }}
                      >
                        Intensity: {dream.mood}/10
                      </span>
                    )}
                  </div>
                </div>
                <span
                  className="text-sm"
                  style={{ color: theme.text, opacity: 0.7 }}
                >
                  {new Date(dream.dream_date).toLocaleDateString()}
                </span>
              </div>

              {/* Feelings */}
              {dream.feelings && dream.feelings.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">
                  {dream.feelings.map((feeling) => (
                    <span
                      key={feeling}
                      className="text-xs px-2 py-0.5 rounded-full"
                      style={{
                        backgroundColor: theme.text,
                        color: theme.background,
                        opacity: 0.8,
                      }}
                    >
                      {getFeelingLabel(feeling)}
                    </span>
                  ))}
                </div>
              )}

              <p
                className="line-clamp-3"
                style={{ color: theme.text, opacity: 0.8 }}
              >
                {dream.content}
              </p>

              <div className="mt-4 flex gap-2 items-center">
                <Link
                  href={`/dreams/${dream.id}/interpret`}
                  className="text-sm px-3 py-1 rounded transition-theme"
                  style={{
                    backgroundColor: "transparent",
                    border: `1px solid ${theme.border}`,
                    color: theme.text,
                  }}
                >
                  🧠 Interpret
                </Link>
                <button
                  className="text-sm px-3 py-1 rounded transition-theme"
                  style={{
                    backgroundColor: "transparent",
                    border: `1px solid ${theme.border}`,
                    color: theme.text,
                  }}
                >
                  ✏️ Edit
                </button>

                {/* Delete button with confirmation */}
                {confirmDeleteId === dream.id ? (
                  <div className="flex items-center gap-2 ml-auto">
                    <span
                      className="text-sm"
                      style={{ color: theme.text, opacity: 0.7 }}
                    >
                      Delete?
                    </span>
                    <button
                      onClick={() => handleDelete(dream.id)}
                      disabled={deletingId === dream.id}
                      className="text-sm px-3 py-1 rounded transition-theme disabled:opacity-50"
                      style={{
                        backgroundColor: "#dc2626",
                        color: "white",
                      }}
                    >
                      {deletingId === dream.id ? "..." : "Yes"}
                    </button>
                    <button
                      onClick={() => setConfirmDeleteId(null)}
                      className="text-sm px-3 py-1 rounded transition-theme"
                      style={{
                        backgroundColor: "transparent",
                        border: `1px solid ${theme.border}`,
                        color: theme.text,
                      }}
                    >
                      No
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmDeleteId(dream.id)}
                    className="text-sm px-3 py-1 rounded transition-theme ml-auto"
                    style={{
                      backgroundColor: "transparent",
                      border: `1px solid ${theme.border}`,
                      color: theme.text,
                    }}
                  >
                    🗑️ Delete
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
