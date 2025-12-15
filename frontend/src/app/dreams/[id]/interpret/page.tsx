"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../../../../lib/auth-context";
import { useTheme } from "../../../../lib/theme-context";
import { dreamService, Dream } from "../../../../lib/services/dreams";
import {
  interpretationService,
  Interpretation,
  PsychoanalystType,
} from "../../../../lib/services/interpretations";
import {
  StructuredInterpretation,
  LegacyInterpretation,
} from "../../../../components/interpretations/structured-interpretation";

const PSYCHOANALYSTS: {
  type: PsychoanalystType;
  name: string;
  description: string;
}[] = [
  {
    type: "jung",
    name: "Carl Jung",
    description: "Archetypal analysis, individuation, collective unconscious",
  },
  {
    type: "freud",
    name: "Sigmund Freud",
    description: "Wish fulfillment, repressed desires, latent content",
  },
  {
    type: "adler",
    name: "Alfred Adler",
    description: "Individual psychology, life goals, social interest",
  },
  {
    type: "klein",
    name: "Melanie Klein",
    description: "Object relations, paranoid-schizoid & depressive positions",
  },
  {
    type: "lacan",
    name: "Jacques Lacan",
    description: "Symbolic order, desire, linguistic structure",
  },
  {
    type: "hillman",
    name: "James Hillman",
    description: "Archetypal psychology, soul-making, image primacy",
  },
  {
    type: "hall",
    name: "Calvin Hall",
    description: "Cognitive conception theory, quantifiable elements",
  },
];

export default function InterpretDreamPage() {
  const params = useParams();
  const { user, loading: authLoading } = useAuth();
  const { theme } = useTheme();
  const dreamId = params.id as string;

  const [dream, setDream] = useState<Dream | null>(null);
  const [interpretations, setInterpretations] = useState<
    Record<string, Interpretation>
  >({});
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState<Record<string, boolean>>({});
  const [deleting, setDeleting] = useState<Record<string, boolean>>({});
  const [confirmDeleteType, setConfirmDeleteType] = useState<string | null>(
    null
  );
  const [error, setError] = useState("");

  useEffect(() => {
    if (!authLoading && user && dreamId) {
      loadData();
    } else if (!authLoading && !user) {
      setLoading(false);
      setError("Please log in to view interpretations");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, user, dreamId]);

  const loadData = async () => {
    if (!user || !dreamId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const [dreamData, interpretationsData] = await Promise.all([
        dreamService.getDream(dreamId),
        interpretationService.getDreamInterpretations(dreamId),
      ]);

      setDream(dreamData);

      const interpretationsMap: Record<string, Interpretation> = {};
      if (interpretationsData && Array.isArray(interpretationsData)) {
        interpretationsData.forEach((interp) => {
          interpretationsMap[interp.psychoanalyst_type] = interp;
        });
      }
      setInterpretations(interpretationsMap);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to load dream";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const generateInterpretation = async (type: PsychoanalystType) => {
    if (!dreamId) return;

    try {
      setGenerating((prev) => ({ ...prev, [type]: true }));
      setError("");

      const interpretation = await interpretationService.createInterpretation({
        dream_id: dreamId,
        psychoanalyst_type: type,
      });

      setInterpretations((prev) => ({
        ...prev,
        [type]: interpretation,
      }));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to generate interpretation"
      );
    } finally {
      setGenerating((prev) => ({ ...prev, [type]: false }));
    }
  };

  const deleteInterpretation = async (type: string) => {
    const interpretation = interpretations[type];
    if (!interpretation) return;

    try {
      setDeleting((prev) => ({ ...prev, [type]: true }));
      setError("");

      await interpretationService.deleteInterpretation(interpretation.id);

      setInterpretations((prev) => {
        const newInterps = { ...prev };
        delete newInterps[type];
        return newInterps;
      });
      setConfirmDeleteType(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to delete interpretation"
      );
    } finally {
      setDeleting((prev) => ({ ...prev, [type]: false }));
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

  if (!dream) {
    return (
      <div className="text-center py-12">
        <p style={{ color: theme.text }}>Dream not found</p>
        <Link
          href="/dreams"
          className="mt-4 inline-block"
          style={{ color: theme.text }}
        >
          ← Back to Dreams
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/dreams"
            className="text-sm mb-2 inline-block"
            style={{ color: theme.text, opacity: 0.7 }}
          >
            ← Back to Dreams
          </Link>
          <h1 className="text-3xl font-bold" style={{ color: theme.text }}>
            Interpret Dream
          </h1>
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

      {/* Dream Display */}
      <div
        className="p-6 rounded-lg shadow"
        style={{
          backgroundColor: theme.card,
          border: `1px solid ${theme.border}`,
        }}
      >
        <h2
          className="text-xl font-semibold mb-2"
          style={{ color: theme.text }}
        >
          {dream.title || "Untitled Dream"}
        </h2>
        <p className="text-sm mb-4" style={{ color: theme.text, opacity: 0.7 }}>
          {new Date(dream.dream_date).toLocaleDateString()}
        </p>
        <p
          className="whitespace-pre-wrap"
          style={{ color: theme.text, opacity: 0.9 }}
        >
          {dream.content}
        </p>
      </div>

      {/* Interpretations */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold" style={{ color: theme.text }}>
          Psychoanalyst Interpretations
        </h2>

        {PSYCHOANALYSTS.map((analyst) => {
          const interpretation = interpretations[analyst.type];
          const isGenerating = generating[analyst.type];
          const isDeleting = deleting[analyst.type];
          const showConfirmDelete = confirmDeleteType === analyst.type;

          return (
            <div
              key={analyst.type}
              className="p-6 rounded-lg shadow"
              style={{
                backgroundColor: theme.card,
                border: `1px solid ${theme.border}`,
              }}
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3
                    className="text-lg font-semibold"
                    style={{ color: theme.text }}
                  >
                    {analyst.name}
                  </h3>
                  <p
                    className="text-sm mt-1"
                    style={{ color: theme.text, opacity: 0.7 }}
                  >
                    {analyst.description}
                  </p>
                </div>
                {!interpretation && (
                  <button
                    onClick={() => generateInterpretation(analyst.type)}
                    disabled={isGenerating}
                    className="px-4 py-2 rounded transition-theme disabled:opacity-50"
                    style={{
                      backgroundColor: theme.text,
                      color: theme.background,
                      border: `1px solid ${theme.border}`,
                    }}
                  >
                    {isGenerating ? "Generating..." : "Generate"}
                  </button>
                )}
              </div>

              {interpretation ? (
                <div className="mt-4">
                  {/* Structured or Legacy interpretation display */}
                  {interpretation.interpretation_data ? (
                    <StructuredInterpretation
                      data={interpretation.interpretation_data}
                      theme={theme}
                    />
                  ) : (
                    <LegacyInterpretation
                      text={interpretation.interpretation_text}
                      theme={theme}
                    />
                  )}

                  <div className="flex justify-between items-center mt-4">
                    <p
                      className="text-xs"
                      style={{ color: theme.text, opacity: 0.5 }}
                    >
                      Generated{" "}
                      {new Date(interpretation.created_at).toLocaleString()}
                    </p>

                    {/* Delete button with confirmation */}
                    {showConfirmDelete ? (
                      <div className="flex items-center gap-2">
                        <span
                          className="text-xs"
                          style={{ color: theme.text, opacity: 0.7 }}
                        >
                          Delete this interpretation?
                        </span>
                        <button
                          onClick={() => deleteInterpretation(analyst.type)}
                          disabled={isDeleting}
                          className="text-xs px-2 py-1 rounded transition-theme disabled:opacity-50"
                          style={{
                            backgroundColor: "#dc2626",
                            color: "white",
                          }}
                        >
                          {isDeleting ? "..." : "Yes"}
                        </button>
                        <button
                          onClick={() => setConfirmDeleteType(null)}
                          className="text-xs px-2 py-1 rounded transition-theme"
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
                        onClick={() => setConfirmDeleteType(analyst.type)}
                        className="text-xs px-2 py-1 rounded transition-theme"
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
              ) : isGenerating ? (
                <div
                  className="mt-4 flex items-center gap-2"
                  style={{ color: theme.text, opacity: 0.7 }}
                >
                  <div
                    className="animate-spin rounded-full h-4 w-4 border-b-2"
                    style={{ borderColor: theme.text }}
                  ></div>
                  <span>Generating interpretation...</span>
                </div>
              ) : (
                <p
                  className="mt-4 text-sm"
                  style={{ color: theme.text, opacity: 0.6 }}
                >
                  Click &quot;Generate&quot; to create an interpretation from
                  this perspective.
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
