"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "../../lib/auth-context";
import { useTheme } from "../../lib/theme-context";
import { dreamService, Dream } from "../../lib/services/dreams";
import {
  interpretationService,
  CollectiveAnalysis,
  StructuredAnalysisData,
} from "../../lib/services/interpretations";

// Component to render a section card
function AnalysisSection({
  title,
  children,
  theme,
  defaultOpen = false,
}: {
  title: string;
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
        className="w-full px-4 py-3 flex items-center justify-between text-left"
        style={{ backgroundColor: theme.card }}
      >
        <span className="font-medium" style={{ color: theme.text }}>
          {title}
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

// Component to render structured analysis
function StructuredAnalysisDisplay({
  data,
  theme,
}: {
  data: StructuredAnalysisData;
  theme: { background: string; text: string; border: string; card: string };
}) {
  return (
    <div className="space-y-4">
      {/* Summary - always visible */}
      <div
        className="p-4 rounded-lg"
        style={{
          backgroundColor: theme.background,
          border: `1px solid ${theme.border}`,
        }}
      >
        <h3
          className="text-lg font-semibold mb-2"
          style={{ color: theme.text }}
        >
          Summary
        </h3>
        <p style={{ color: theme.text }}>{data.summary}</p>
      </div>

      {/* Synthesis - Core findings */}
      <AnalysisSection title="🎯 Core Synthesis" theme={theme} defaultOpen>
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium mb-1" style={{ opacity: 0.7 }}>
              Core Conflict
            </p>
            <p>{data.synthesis.coreConflict}</p>
          </div>
          <div>
            <p className="text-sm font-medium mb-1" style={{ opacity: 0.7 }}>
              Meta-Narrative
            </p>
            <p>{data.synthesis.metaNarrative}</p>
          </div>
          <div>
            <p className="text-sm font-medium mb-1" style={{ opacity: 0.7 }}>
              Life Situation
            </p>
            <p>{data.synthesis.lifeSituation}</p>
          </div>
          <div>
            <p className="text-sm font-medium mb-1" style={{ opacity: 0.7 }}>
              Unconscious Message
            </p>
            <p className="italic">
              &quot;{data.synthesis.unconsciousMessage}&quot;
            </p>
          </div>
        </div>
      </AnalysisSection>

      {/* Recurring Patterns */}
      <AnalysisSection title="🔄 Recurring Patterns" theme={theme}>
        <div className="space-y-4">
          {/* Symbols */}
          {data.recurringPatterns.symbols.length > 0 && (
            <div>
              <p className="text-sm font-semibold mb-2">Symbols</p>
              <div className="space-y-2">
                {data.recurringPatterns.symbols.map((s, i) => (
                  <div
                    key={i}
                    className="p-3 rounded"
                    style={{
                      backgroundColor: theme.card,
                      border: `1px solid ${theme.border}`,
                    }}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{s.symbol}</span>
                      <span
                        className="text-xs px-2 py-0.5 rounded"
                        style={{ backgroundColor: theme.background }}
                      >
                        {s.occurrences.join(", ")}
                      </span>
                    </div>
                    <p className="text-sm" style={{ opacity: 0.8 }}>
                      {s.meaning}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Themes */}
          {data.recurringPatterns.themes.length > 0 && (
            <div>
              <p className="text-sm font-semibold mb-2">Themes</p>
              <div className="space-y-2">
                {data.recurringPatterns.themes.map((t, i) => (
                  <div
                    key={i}
                    className="p-3 rounded"
                    style={{
                      backgroundColor: theme.card,
                      border: `1px solid ${theme.border}`,
                    }}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{t.theme}</span>
                      <span
                        className="text-xs px-2 py-0.5 rounded"
                        style={{ backgroundColor: theme.background }}
                      >
                        {t.dreams.join(", ")}
                      </span>
                    </div>
                    <p className="text-sm" style={{ opacity: 0.8 }}>
                      {t.significance}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Emotions */}
          {data.recurringPatterns.emotions.length > 0 && (
            <div>
              <p className="text-sm font-semibold mb-2">Emotions</p>
              <div className="flex flex-wrap gap-2">
                {data.recurringPatterns.emotions.map((e, i) => (
                  <div
                    key={i}
                    className="px-3 py-2 rounded"
                    style={{
                      backgroundColor: theme.card,
                      border: `1px solid ${theme.border}`,
                    }}
                  >
                    <span className="font-medium">{e.emotion}</span>
                    <span className="text-sm ml-2" style={{ opacity: 0.7 }}>
                      ({e.frequency})
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Characters */}
          {data.recurringPatterns.characters.length > 0 && (
            <div>
              <p className="text-sm font-semibold mb-2">Characters</p>
              <div className="space-y-2">
                {data.recurringPatterns.characters.map((c, i) => (
                  <div
                    key={i}
                    className="p-3 rounded"
                    style={{
                      backgroundColor: theme.card,
                      border: `1px solid ${theme.border}`,
                    }}
                  >
                    <p className="font-medium">{c.character}</p>
                    <p className="text-sm" style={{ opacity: 0.7 }}>
                      Role: {c.role}
                    </p>
                    <p className="text-sm" style={{ opacity: 0.8 }}>
                      {c.interpretation}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </AnalysisSection>

      {/* Psychological Progression */}
      <AnalysisSection title="📈 Psychological Progression" theme={theme}>
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium" style={{ opacity: 0.7 }}>
              Trajectory:
            </span>
            <span
              className="px-3 py-1 rounded-full text-sm font-medium"
              style={{
                backgroundColor: data.psychologicalProgression.trajectory
                  .toLowerCase()
                  .includes("growth")
                  ? "#d1fae5"
                  : data.psychologicalProgression.trajectory
                      .toLowerCase()
                      .includes("regression")
                  ? "#fee"
                  : theme.card,
                color: data.psychologicalProgression.trajectory
                  .toLowerCase()
                  .includes("growth")
                  ? "#065f46"
                  : data.psychologicalProgression.trajectory
                      .toLowerCase()
                      .includes("regression")
                  ? "#c53030"
                  : theme.text,
              }}
            >
              {data.psychologicalProgression.trajectory}
            </span>
          </div>

          <div>
            <p className="text-sm font-medium mb-1" style={{ opacity: 0.7 }}>
              Evolution
            </p>
            <p>{data.psychologicalProgression.evolution}</p>
          </div>

          <div>
            <p className="text-sm font-medium mb-1" style={{ opacity: 0.7 }}>
              Emotional Arc
            </p>
            <p>{data.psychologicalProgression.emotionalArc}</p>
          </div>

          {data.psychologicalProgression.keyTransitions.length > 0 && (
            <div>
              <p className="text-sm font-medium mb-2" style={{ opacity: 0.7 }}>
                Key Transitions
              </p>
              <div className="space-y-2">
                {data.psychologicalProgression.keyTransitions.map((t, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 p-2 rounded"
                    style={{
                      backgroundColor: theme.card,
                      border: `1px solid ${theme.border}`,
                    }}
                  >
                    <span className="text-sm">{t.from}</span>
                    <span style={{ opacity: 0.5 }}>→</span>
                    <span className="text-sm">{t.to}</span>
                    <span className="text-xs ml-auto" style={{ opacity: 0.6 }}>
                      {t.significance}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </AnalysisSection>

      {/* Key Insights */}
      <AnalysisSection title="💡 Key Insights" theme={theme}>
        <div className="space-y-3">
          {data.keyInsights.map((insight, i) => (
            <div
              key={i}
              className="p-4 rounded"
              style={{
                backgroundColor: theme.card,
                border: `1px solid ${theme.border}`,
              }}
            >
              <p className="font-medium mb-2">{insight.insight}</p>
              <div className="flex gap-4 text-sm" style={{ opacity: 0.7 }}>
                <span>Evidence: {insight.evidence}</span>
              </div>
              <p className="text-sm mt-2" style={{ opacity: 0.8 }}>
                <strong>Why it matters:</strong> {insight.importance}
              </p>
            </div>
          ))}
        </div>
      </AnalysisSection>

      {/* Recommendations */}
      {data.recommendations.length > 0 && (
        <AnalysisSection title="🎯 Recommendations" theme={theme}>
          <ul className="space-y-2">
            {data.recommendations.map((rec, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="mt-1">•</span>
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </AnalysisSection>
      )}

      {/* Personal Context Integration (if present) */}
      {data.personalContextIntegration && (
        <AnalysisSection title="🔐 Personal Context Integration" theme={theme}>
          <p>{data.personalContextIntegration}</p>
        </AnalysisSection>
      )}
    </div>
  );
}

export default function AnalysisPage() {
  const { user, loading: authLoading } = useAuth();
  const { theme, themeName } = useTheme();
  const logoSrc =
    themeName === "dark" ? "/crescent-light.png" : "/crescent-dark.png";

  const [analyses, setAnalyses] = useState<CollectiveAnalysis[]>([]);
  const [dreams, setDreams] = useState<Dream[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && user) {
      loadData();
    } else if (!authLoading && !user) {
      setLoading(false);
      setError("Please log in to view analyses");
    }
  }, [authLoading, user]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [analysesData, dreamsData] = await Promise.all([
        interpretationService.getCollectiveAnalyses(),
        dreamService.getUserDreams(),
      ]);
      setAnalyses(analysesData);
      setDreams(dreamsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load analyses");
    } finally {
      setLoading(false);
    }
  };

  const getDreamTitle = (dreamId: string): string => {
    const dream = dreams.find((d) => d.id === dreamId);
    return dream?.title || "Untitled Dream";
  };

  const handleDelete = async (analysisId: string) => {
    try {
      setDeleting(true);
      await interpretationService.deleteCollectiveAnalysis(analysisId);
      setAnalyses((prev) => prev.filter((a) => a.id !== analysisId));
      setDeleteConfirmId(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to delete analysis"
      );
    } finally {
      setDeleting(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center gap-2">
          <div
            className="animate-spin rounded-full h-8 w-8 border-b-2"
            style={{ borderColor: theme.text }}
          ></div>
          <div style={{ color: theme.text }}>Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div
            className="p-6 rounded-xl max-w-md w-full mx-4"
            style={{
              backgroundColor: theme.card,
              border: `1px solid ${theme.border}`,
            }}
          >
            <h3
              className="text-lg font-semibold mb-2"
              style={{ color: theme.text }}
            >
              Delete Analysis?
            </h3>
            <p className="mb-4" style={{ color: theme.text, opacity: 0.7 }}>
              This action cannot be undone. The collective analysis will be
              permanently deleted.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                disabled={deleting}
                className="flex-1 py-2 rounded-lg transition-all"
                style={{
                  backgroundColor: "transparent",
                  border: `1px solid ${theme.border}`,
                  color: theme.text,
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                disabled={deleting}
                className="flex-1 py-2 rounded-lg transition-all disabled:opacity-50"
                style={{ backgroundColor: "#dc2626", color: "white" }}
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: theme.text }}>
            Pattern Analyses
          </h1>
          <p className="mt-2" style={{ color: theme.text, opacity: 0.7 }}>
            View your collective dream pattern analyses
          </p>
        </div>
        <Link
          href="/interpretations"
          className="px-4 py-2 rounded-md transition-theme"
          style={{
            backgroundColor: theme.text,
            color: theme.background,
          }}
        >
          New Analysis
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

      {analyses.length === 0 ? (
        <div className="text-center py-12">
          <Image
            src={logoSrc}
            alt="Analysis"
            width={96}
            height={96}
            className="object-contain mx-auto"
          />
          <h3
            className="mt-4 text-lg font-medium"
            style={{ color: theme.text }}
          >
            No pattern analyses yet
          </h3>
          <p className="mt-2" style={{ color: theme.text, opacity: 0.7 }}>
            Create a batch analysis in the Interpretations section to find
            patterns across your dreams.
          </p>
          <Link
            href="/interpretations"
            className="mt-6 inline-flex items-center px-4 py-2 rounded-md transition-theme"
            style={{
              backgroundColor: theme.text,
              color: theme.background,
              border: `1px solid ${theme.border}`,
            }}
          >
            Go to Interpretations
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {analyses.map((analysis) => {
            const isExpanded = expandedId === analysis.id;

            return (
              <div
                key={analysis.id}
                className="rounded-lg overflow-hidden"
                style={{
                  backgroundColor: theme.card,
                  border: `1px solid ${theme.border}`,
                }}
              >
                {/* Header */}
                <div className="p-4 flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h2
                        className="text-lg font-semibold"
                        style={{ color: theme.text }}
                      >
                        {analysis.analysis_data?.summary
                          ? analysis.analysis_data.summary.slice(0, 60) + "..."
                          : "Pattern Analysis"}
                      </h2>
                    </div>
                    <p
                      className="text-sm"
                      style={{ color: theme.text, opacity: 0.6 }}
                    >
                      {new Date(analysis.created_at).toLocaleDateString()} •{" "}
                      {analysis.dream_ids.length} dreams analyzed
                    </p>

                    {/* Dreams tags */}
                    <div className="flex flex-wrap gap-2 mt-3">
                      {analysis.dream_ids.map((dreamId) => (
                        <Link
                          key={dreamId}
                          href={`/dreams/${dreamId}`}
                          className="px-2 py-1 text-xs rounded-md transition-all hover:opacity-80"
                          style={{
                            backgroundColor: theme.background,
                            border: `1px solid ${theme.border}`,
                            color: theme.text,
                          }}
                        >
                          {getDreamTitle(dreamId)}
                        </Link>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        setExpandedId(isExpanded ? null : analysis.id)
                      }
                      className="px-3 py-1 text-sm rounded-md transition-all"
                      style={{
                        backgroundColor: theme.background,
                        border: `1px solid ${theme.border}`,
                        color: theme.text,
                      }}
                    >
                      {isExpanded ? "Collapse" : "Expand"}
                    </button>
                    <button
                      onClick={() => setDeleteConfirmId(analysis.id)}
                      className="px-3 py-1 text-sm rounded-md transition-all hover:opacity-80"
                      style={{
                        backgroundColor: "transparent",
                        border: `1px solid ${theme.border}`,
                        color: "#dc2626",
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>

                {/* Expanded Content */}
                {isExpanded && analysis.analysis_data && (
                  <div
                    className="p-4 pt-0"
                    style={{ borderTop: `1px solid ${theme.border}` }}
                  >
                    <StructuredAnalysisDisplay
                      data={analysis.analysis_data}
                      theme={theme}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
