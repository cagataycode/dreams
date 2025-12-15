"use client";

import { useState } from "react";
import { StructuredInterpretationData } from "../../lib/services/interpretations";

interface StructuredInterpretationProps {
  data: StructuredInterpretationData;
  theme: {
    background: string;
    text: string;
    border: string;
    card: string;
  };
  compact?: boolean; // For inline display in batch results
}

// Collapsible section component
function Section({
  title,
  icon,
  children,
  theme,
  defaultOpen = false,
}: {
  title: string;
  icon: string;
  children: React.ReactNode;
  theme: { background: string; text: string; border: string; card: string };
  defaultOpen?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div
      className="rounded-lg overflow-hidden"
      style={{
        backgroundColor: theme.background,
        border: `1px solid ${theme.border}`,
      }}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 flex items-center justify-between text-left transition-colors"
        style={{ backgroundColor: isOpen ? theme.card : "transparent" }}
      >
        <span className="font-medium flex items-center gap-2" style={{ color: theme.text }}>
          <span>{icon}</span>
          <span>{title}</span>
        </span>
        <span style={{ color: theme.text, opacity: 0.5 }}>
          {isOpen ? "−" : "+"}
        </span>
      </button>
      {isOpen && (
        <div className="p-4" style={{ color: theme.text }}>
          {children}
        </div>
      )}
    </div>
  );
}

// Importance badge
function ImportanceBadge({
  importance,
  theme,
}: {
  importance: "high" | "medium" | "low";
  theme: { background: string; text: string };
}) {
  const colors = {
    high: { bg: "#fef3c7", text: "#92400e" },
    medium: { bg: "#e0e7ff", text: "#3730a3" },
    low: { bg: "#f3f4f6", text: "#6b7280" },
  };

  return (
    <span
      className="text-xs px-2 py-0.5 rounded-full"
      style={{
        backgroundColor: colors[importance].bg,
        color: colors[importance].text,
      }}
    >
      {importance}
    </span>
  );
}

export function StructuredInterpretation({
  data,
  theme,
  compact = false,
}: StructuredInterpretationProps) {
  if (compact) {
    // Compact view for batch results
    return (
      <div className="space-y-3">
        {/* Summary */}
        <p style={{ color: theme.text }}>{data.summary}</p>

        {/* Key Insight */}
        <div
          className="p-3 rounded-lg"
          style={{
            backgroundColor: theme.background,
            border: `1px solid ${theme.border}`,
          }}
        >
          <p className="text-sm font-medium mb-1" style={{ color: theme.text, opacity: 0.7 }}>
            💡 Key Insight
          </p>
          <p className="text-sm" style={{ color: theme.text }}>
            {data.keyInsight}
          </p>
        </div>

        {/* Reflection */}
        <div
          className="p-3 rounded-lg italic"
          style={{
            backgroundColor: theme.background,
            border: `1px solid ${theme.border}`,
          }}
        >
          <p className="text-sm" style={{ color: theme.text, opacity: 0.8 }}>
            🤔 {data.reflection}
          </p>
        </div>
      </div>
    );
  }

  // Full view
  return (
    <div className="space-y-4">
      {/* Summary - Always visible */}
      <div
        className="p-4 rounded-lg"
        style={{
          backgroundColor: theme.background,
          border: `1px solid ${theme.border}`,
        }}
      >
        <p className="font-medium mb-2" style={{ color: theme.text }}>
          Summary
        </p>
        <p style={{ color: theme.text }}>{data.summary}</p>
      </div>

      {/* Core Interpretation */}
      <Section title="Core Interpretation" icon="🎯" theme={theme} defaultOpen>
        <div className="space-y-3">
          <div>
            <p className="text-sm font-medium mb-1" style={{ opacity: 0.7 }}>
              Main Message
            </p>
            <p>{data.coreInterpretation.mainMessage}</p>
          </div>
          <div>
            <p className="text-sm font-medium mb-1" style={{ opacity: 0.7 }}>
              Unconscious Material
            </p>
            <p>{data.coreInterpretation.unconsciousMaterial}</p>
          </div>
          <div>
            <p className="text-sm font-medium mb-1" style={{ opacity: 0.7 }}>
              Psychological Function
            </p>
            <p>{data.coreInterpretation.psychologicalFunction}</p>
          </div>
        </div>
      </Section>

      {/* Symbols */}
      {data.symbols && data.symbols.length > 0 && (
        <Section title="Symbols" icon="🔮" theme={theme}>
          <div className="space-y-3">
            {data.symbols.map((symbol, i) => (
              <div
                key={i}
                className="p-3 rounded"
                style={{
                  backgroundColor: theme.card,
                  border: `1px solid ${theme.border}`,
                }}
              >
                <p className="font-medium">{symbol.symbol}</p>
                <p className="text-sm mt-1" style={{ opacity: 0.8 }}>
                  {symbol.meaning}
                </p>
                <p className="text-sm mt-1" style={{ opacity: 0.6 }}>
                  <em>Significance:</em> {symbol.significance}
                </p>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Themes */}
      {data.themes && data.themes.length > 0 && (
        <Section title="Themes" icon="📚" theme={theme}>
          <div className="space-y-3">
            {data.themes.map((themeItem, i) => (
              <div
                key={i}
                className="p-3 rounded"
                style={{
                  backgroundColor: theme.card,
                  border: `1px solid ${theme.border}`,
                }}
              >
                <div className="flex items-center justify-between mb-1">
                  <p className="font-medium">{themeItem.theme}</p>
                  <ImportanceBadge importance={themeItem.importance} theme={theme} />
                </div>
                <p className="text-sm" style={{ opacity: 0.8 }}>
                  {themeItem.interpretation}
                </p>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Emotions */}
      {data.emotions && (
        <Section title="Emotional Landscape" icon="💭" theme={theme}>
          <div className="space-y-3">
            <div className="flex items-center gap-4">
              <div
                className="px-4 py-2 rounded-full"
                style={{
                  backgroundColor: theme.card,
                  border: `1px solid ${theme.border}`,
                }}
              >
                <span className="text-sm" style={{ opacity: 0.6 }}>
                  Primary:
                </span>{" "}
                <span className="font-medium">{data.emotions.primary}</span>
              </div>
              <div
                className="px-4 py-2 rounded-full"
                style={{
                  backgroundColor: theme.card,
                  border: `1px solid ${theme.border}`,
                }}
              >
                <span className="text-sm" style={{ opacity: 0.6 }}>
                  Underlying:
                </span>{" "}
                <span className="font-medium">{data.emotions.underlying}</span>
              </div>
            </div>
            <p className="text-sm" style={{ opacity: 0.8 }}>
              {data.emotions.significance}
            </p>
          </div>
        </Section>
      )}

      {/* Key Insight - Highlighted */}
      <div
        className="p-4 rounded-lg"
        style={{
          backgroundColor: "#fef3c7",
          border: "1px solid #fcd34d",
        }}
      >
        <p className="font-medium mb-2" style={{ color: "#92400e" }}>
          💡 Key Insight
        </p>
        <p style={{ color: "#78350f" }}>{data.keyInsight}</p>
      </div>

      {/* Reflection Prompt */}
      <div
        className="p-4 rounded-lg"
        style={{
          backgroundColor: theme.background,
          border: `1px solid ${theme.border}`,
        }}
      >
        <p className="font-medium mb-2" style={{ color: theme.text }}>
          🤔 For Reflection
        </p>
        <p className="italic" style={{ color: theme.text, opacity: 0.9 }}>
          &quot;{data.reflection}&quot;
        </p>
      </div>

      {/* Personal Context Integration (if present) */}
      {data.personalContextIntegration && (
        <div
          className="p-4 rounded-lg"
          style={{
            backgroundColor: "#d1fae5",
            border: "1px solid #6ee7b7",
          }}
        >
          <p className="font-medium mb-2" style={{ color: "#065f46" }}>
            🔐 Personal Context Integration
          </p>
          <p style={{ color: "#047857" }}>{data.personalContextIntegration}</p>
        </div>
      )}
    </div>
  );
}

// Legacy fallback - displays plain text when structured data is not available
export function LegacyInterpretation({
  text,
  theme,
}: {
  text: string;
  theme: { background: string; text: string };
}) {
  return (
    <div
      className="whitespace-pre-wrap p-4 rounded"
      style={{
        backgroundColor: theme.background,
        color: theme.text,
      }}
    >
      {text}
    </div>
  );
}

