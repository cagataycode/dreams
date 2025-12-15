"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../lib/auth-context";
import { useTheme } from "../../lib/theme-context";
import { dreamService, FEELING_OPTIONS } from "../../lib/services/dreams";

export default function NewDreamForm() {
  const router = useRouter();
  const { user } = useAuth();
  const { theme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    dream_date: new Date().toISOString().split("T")[0],
    feelings: [] as string[],
    mood: 5,
    is_lucid: false,
    is_recurring: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    setError("");

    try {
      await dreamService.createDream({
        title: formData.title,
        content: formData.content,
        dream_date: formData.dream_date,
        feelings: formData.feelings.length > 0 ? formData.feelings : undefined,
        mood: formData.mood,
        is_lucid: formData.is_lucid,
        is_recurring: formData.is_recurring,
      });

      router.push("/dreams");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save dream");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const toggleFeeling = (feeling: string) => {
    setFormData((prev) => ({
      ...prev,
      feelings: prev.feelings.includes(feeling)
        ? prev.feelings.filter((f) => f !== feeling)
        : [...prev.feelings, feeling],
    }));
  };

  const handleMoodChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      mood: parseInt(e.target.value),
    }));
  };

  const handleToggle = (field: "is_lucid" | "is_recurring") => {
    setFormData((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold" style={{ color: theme.text }}>
          Record a New Dream
        </h1>
        <p className="mt-2" style={{ color: theme.text, opacity: 0.7 }}>
          Capture the details of your dream while they&apos;re still fresh in
          your memory.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Dream Date */}
        <div>
          <label
            htmlFor="dream_date"
            className="block text-sm font-medium mb-2"
            style={{ color: theme.text }}
          >
            Dream Date
          </label>
          <input
            type="date"
            id="dream_date"
            name="dream_date"
            value={formData.dream_date}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 rounded-md transition-theme"
            style={{
              backgroundColor: theme.card,
              border: `1px solid ${theme.border}`,
              color: theme.text,
            }}
          />
        </div>

        {/* Dream Title */}
        <div>
          <label
            htmlFor="title"
            className="block text-sm font-medium mb-2"
            style={{ color: theme.text }}
          >
            Dream Title (Optional)
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Give your dream a memorable title..."
            className="w-full px-3 py-2 rounded-md transition-theme"
            style={{
              backgroundColor: theme.card,
              border: `1px solid ${theme.border}`,
              color: theme.text,
            }}
          />
        </div>

        {/* Dream Description */}
        <div>
          <label
            htmlFor="content"
            className="block text-sm font-medium mb-2"
            style={{ color: theme.text }}
          >
            Dream Description *
          </label>
          <textarea
            id="content"
            name="content"
            value={formData.content}
            onChange={handleChange}
            required
            rows={8}
            placeholder="Describe your dream in as much detail as you can remember..."
            className="w-full px-3 py-2 rounded-md transition-theme resize-vertical"
            style={{
              backgroundColor: theme.card,
              border: `1px solid ${theme.border}`,
              color: theme.text,
            }}
          />
        </div>

        {/* Feelings Multi-select */}
        <div>
          <label
            className="block text-sm font-medium mb-2"
            style={{ color: theme.text }}
          >
            How did you feel? (Select all that apply)
          </label>
          <div className="flex flex-wrap gap-2">
            {FEELING_OPTIONS.map((feeling) => {
              const isSelected = formData.feelings.includes(feeling.value);
              return (
                <button
                  key={feeling.value}
                  type="button"
                  onClick={() => toggleFeeling(feeling.value)}
                  className="px-3 py-1.5 rounded-full text-sm transition-theme"
                  style={{
                    backgroundColor: isSelected ? theme.text : theme.card,
                    color: isSelected ? theme.background : theme.text,
                    border: `1px solid ${theme.border}`,
                  }}
                >
                  {feeling.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Mood Slider */}
        <div>
          <label
            className="block text-sm font-medium mb-2"
            style={{ color: theme.text }}
          >
            Emotional Intensity: {formData.mood}/10
          </label>
          <div className="flex items-center gap-3">
            <span
              className="text-sm"
              style={{ color: theme.text, opacity: 0.6 }}
            >
              Mild
            </span>
            <input
              type="range"
              min="1"
              max="10"
              value={formData.mood}
              onChange={handleMoodChange}
              className="flex-1 h-2 rounded-lg appearance-none cursor-pointer"
              style={{
                backgroundColor: theme.card,
                accentColor: theme.text,
              }}
            />
            <span
              className="text-sm"
              style={{ color: theme.text, opacity: 0.6 }}
            >
              Intense
            </span>
          </div>
        </div>

        {/* Toggles Row */}
        <div className="flex gap-6">
          {/* Lucid Dream Toggle */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => handleToggle("is_lucid")}
              className="relative w-12 h-6 rounded-full transition-theme"
              style={{
                backgroundColor: formData.is_lucid ? theme.text : theme.card,
                border: `1px solid ${theme.border}`,
              }}
            >
              <span
                className="absolute top-0.5 w-5 h-5 rounded-full transition-transform"
                style={{
                  backgroundColor: formData.is_lucid
                    ? theme.background
                    : theme.text,
                  transform: formData.is_lucid
                    ? "translateX(24px)"
                    : "translateX(2px)",
                }}
              />
            </button>
            <label className="text-sm" style={{ color: theme.text }}>
              Lucid Dream
            </label>
          </div>

          {/* Recurring Dream Toggle */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => handleToggle("is_recurring")}
              className="relative w-12 h-6 rounded-full transition-theme"
              style={{
                backgroundColor: formData.is_recurring
                  ? theme.text
                  : theme.card,
                border: `1px solid ${theme.border}`,
              }}
            >
              <span
                className="absolute top-0.5 w-5 h-5 rounded-full transition-transform"
                style={{
                  backgroundColor: formData.is_recurring
                    ? theme.background
                    : theme.text,
                  transform: formData.is_recurring
                    ? "translateX(24px)"
                    : "translateX(2px)",
                }}
              />
            </button>
            <label className="text-sm" style={{ color: theme.text }}>
              Recurring Dream
            </label>
          </div>
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

        <div className="flex gap-4 pt-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-2 rounded-md transition-theme"
            style={{
              backgroundColor: "transparent",
              border: `1px solid ${theme.border}`,
              color: theme.text,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = theme.card;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
            }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || !formData.content.trim()}
            className="px-6 py-2 rounded-md transition-theme disabled:opacity-50"
            style={{
              backgroundColor: theme.text,
              color: theme.background,
              border: `1px solid ${theme.border}`,
            }}
            onMouseEnter={(e) => {
              if (!loading && formData.content.trim()) {
                e.currentTarget.style.backgroundColor = theme.card;
                e.currentTarget.style.color = theme.text;
              }
            }}
            onMouseLeave={(e) => {
              if (!loading && formData.content.trim()) {
                e.currentTarget.style.backgroundColor = theme.text;
                e.currentTarget.style.color = theme.background;
              }
            }}
          >
            {loading ? "Saving..." : "Save Dream"}
          </button>
        </div>
      </form>
    </div>
  );
}
