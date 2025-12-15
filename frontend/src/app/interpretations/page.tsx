"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "../../lib/auth-context";
import { useTheme } from "../../lib/theme-context";
import { dreamService, Dream } from "../../lib/services/dreams";
import {
  interpretationService,
  Interpretation,
  PsychoanalystType,
  CollectiveAnalysis,
} from "../../lib/services/interpretations";
import { profileService, EncryptedProfile } from "../../lib/services/profile";
import {
  StructuredInterpretation,
  LegacyInterpretation,
} from "../../components/interpretations/structured-interpretation";

const PSYCHOANALYSTS: {
  type: PsychoanalystType;
  name: string;
  description: string;
}[] = [
  {
    type: "jung",
    name: "Carl Jung",
    description: "Archetypal analysis, collective unconscious",
  },
  {
    type: "freud",
    name: "Sigmund Freud",
    description: "Wish fulfillment, repressed desires",
  },
  {
    type: "adler",
    name: "Alfred Adler",
    description: "Individual psychology, life goals",
  },
  {
    type: "klein",
    name: "Melanie Klein",
    description: "Object relations, positions",
  },
  {
    type: "lacan",
    name: "Jacques Lacan",
    description: "Symbolic order, desire",
  },
  {
    type: "hillman",
    name: "James Hillman",
    description: "Archetypal psychology, soul-making",
  },
  {
    type: "hall",
    name: "Calvin Hall",
    description: "Cognitive conception theory",
  },
];

export default function InterpretationsPage() {
  const { user, loading: authLoading } = useAuth();
  const { theme, themeName } = useTheme();
  const logoSrc =
    themeName === "dark" ? "/crescent-light.png" : "/crescent-dark.png";
  const [dreams, setDreams] = useState<Dream[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Mode: "single" or "batch"
  const [mode, setMode] = useState<"single" | "batch">("single");

  // Single mode state
  const [selectedDreamId, setSelectedDreamId] = useState<string>("");
  const [selectedAnalyst, setSelectedAnalyst] =
    useState<PsychoanalystType>("jung");
  const [singleGenerating, setSingleGenerating] = useState(false);
  const [singleResult, setSingleResult] = useState<Interpretation | null>(null);

  // Batch mode state - each dream has its own analyst
  const [batchSelections, setBatchSelections] = useState<
    Record<string, PsychoanalystType>
  >({});
  const [batchGenerating, setBatchGenerating] = useState(false);
  const [batchResults, setBatchResults] = useState<
    Array<{
      dreamId: string;
      dreamTitle: string;
      analyst: PsychoanalystType;
      status: "pending" | "generating" | "completed" | "error";
      interpretation?: Interpretation;
      error?: string;
    }>
  >([]);
  const [collectiveResult, setCollectiveResult] =
    useState<CollectiveAnalysis | null>(null);
  const [collectiveGenerating, setCollectiveGenerating] = useState(false);

  // Personal context state
  const [encryptedProfile, setEncryptedProfile] =
    useState<EncryptedProfile | null>(null);
  const [showPassphraseModal, setShowPassphraseModal] = useState(false);
  const [passphrase, setPassphrase] = useState("");
  const [passphraseError, setPassphraseError] = useState("");
  const [pendingAction, setPendingAction] = useState<"single" | "batch" | null>(
    null
  );
  const [decryptedContext, setDecryptedContext] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && user) {
      loadDreams();
      loadProfile();
    } else if (!authLoading && !user) {
      setLoading(false);
      setError("Please log in to view interpretations");
    }
  }, [authLoading, user]);

  const loadDreams = async () => {
    try {
      setLoading(true);
      const userDreams = await dreamService.getUserDreams();
      setDreams(userDreams);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load dreams");
    } finally {
      setLoading(false);
    }
  };

  const loadProfile = async () => {
    try {
      const profile = await profileService.getProfile();
      setEncryptedProfile(profile);
    } catch {
      // Silently fail - profile is optional
    }
  };

  const shouldUsePersonalContext = () => {
    return (
      encryptedProfile &&
      encryptedProfile.include_in_interpretations &&
      encryptedProfile.encrypted_data
    );
  };

  const handlePassphraseSubmit = async () => {
    if (!encryptedProfile || !passphrase) return;

    setPassphraseError("");
    try {
      const decrypted = await profileService.decryptProfile(
        encryptedProfile,
        passphrase
      );
      const formattedContext =
        profileService.formatForInterpretation(decrypted);
      setDecryptedContext(formattedContext);
      setShowPassphraseModal(false);

      // Execute the pending action
      if (pendingAction === "single") {
        executeGenerateSingle(formattedContext);
      } else if (pendingAction === "batch") {
        executeGenerateBatch(formattedContext);
      }
      setPendingAction(null);
    } catch {
      setPassphraseError("Incorrect passphrase. Please try again.");
    }
  };

  const skipPersonalContext = () => {
    setShowPassphraseModal(false);
    setDecryptedContext(null);

    if (pendingAction === "single") {
      executeGenerateSingle(null);
    } else if (pendingAction === "batch") {
      executeGenerateBatch(null);
    }
    setPendingAction(null);
  };

  // Single mode handlers
  const handleSingleGenerate = async () => {
    if (!selectedDreamId) return;

    // Check if we should include personal context
    if (shouldUsePersonalContext() && !decryptedContext) {
      setPendingAction("single");
      setShowPassphraseModal(true);
      return;
    }

    executeGenerateSingle(decryptedContext);
  };

  const executeGenerateSingle = async (personalContext: string | null) => {
    if (!selectedDreamId) return;

    try {
      setSingleGenerating(true);
      setError("");
      setSingleResult(null);

      const interpretation = await interpretationService.createInterpretation({
        dream_id: selectedDreamId,
        psychoanalyst_type: selectedAnalyst,
        personal_context: personalContext || undefined,
      });

      setSingleResult(interpretation);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to generate interpretation"
      );
    } finally {
      setSingleGenerating(false);
    }
  };

  // Batch mode handlers
  const toggleBatchDream = (dreamId: string) => {
    setBatchSelections((prev) => {
      if (prev[dreamId] !== undefined) {
        const newSelections = { ...prev };
        delete newSelections[dreamId];
        return newSelections;
      } else {
        return { ...prev, [dreamId]: "jung" as PsychoanalystType };
      }
    });
  };

  const updateBatchAnalyst = (dreamId: string, analyst: PsychoanalystType) => {
    setBatchSelections((prev) => ({
      ...prev,
      [dreamId]: analyst,
    }));
  };

  const selectAllDreams = () => {
    const all: Record<string, PsychoanalystType> = {};
    dreams.forEach((d) => {
      all[d.id] = "jung";
    });
    setBatchSelections(all);
  };

  const clearSelection = () => {
    setBatchSelections({});
  };

  const handleBatchAnalysis = async () => {
    const selectedIds = Object.keys(batchSelections);
    if (selectedIds.length < 2) return;

    // Check if we should include personal context
    if (shouldUsePersonalContext() && !decryptedContext) {
      setPendingAction("batch");
      setShowPassphraseModal(true);
      return;
    }

    executeGenerateBatch(decryptedContext);
  };

  const executeGenerateBatch = async (personalContext: string | null) => {
    const selectedIds = Object.keys(batchSelections);
    if (selectedIds.length < 2) return;

    // Initialize batch results
    const initialResults = selectedIds.map((dreamId) => {
      const dream = dreams.find((d) => d.id === dreamId);
      return {
        dreamId,
        dreamTitle: dream?.title || "Untitled Dream",
        analyst: batchSelections[dreamId],
        status: "pending" as const,
      };
    });

    setBatchResults(initialResults);
    setBatchGenerating(true);
    setCollectiveResult(null);
    setCollectiveGenerating(false);
    setError("");

    // Step 1: Generate individual interpretations
    for (let i = 0; i < initialResults.length; i++) {
      const item = initialResults[i];

      // Update status to generating
      setBatchResults((prev) =>
        prev.map((r, idx) =>
          idx === i ? { ...r, status: "generating" as const } : r
        )
      );

      try {
        const interpretation = await interpretationService.createInterpretation(
          {
            dream_id: item.dreamId,
            psychoanalyst_type: item.analyst,
            personal_context: personalContext || undefined,
          }
        );

        setBatchResults((prev) =>
          prev.map((r, idx) =>
            idx === i
              ? { ...r, status: "completed" as const, interpretation }
              : r
          )
        );
      } catch (err) {
        setBatchResults((prev) =>
          prev.map((r, idx) =>
            idx === i
              ? {
                  ...r,
                  status: "error" as const,
                  error: err instanceof Error ? err.message : "Failed",
                }
              : r
          )
        );
      }
    }

    // Step 2: Generate collective analysis
    setCollectiveGenerating(true);
    try {
      const collective = await interpretationService.createCollectiveAnalysis({
        dream_ids: selectedIds,
        personal_context: personalContext || undefined,
      });
      setCollectiveResult(collective);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to generate collective analysis"
      );
    } finally {
      setCollectiveGenerating(false);
      setBatchGenerating(false);
    }
  };

  const clearBatchResults = () => {
    setBatchResults([]);
    setCollectiveResult(null);
    setBatchSelections({});
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
      {/* Passphrase Modal */}
      {showPassphraseModal && (
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
              🔐 Include Personal Context?
            </h3>
            <p className="mb-4" style={{ color: theme.text, opacity: 0.7 }}>
              You have enabled personal context for interpretations. Enter your
              passphrase to include it, or skip to generate without it.
            </p>

            {passphraseError && (
              <div
                className="p-3 rounded-md mb-4"
                style={{
                  backgroundColor: "#fee",
                  color: "#c53030",
                  border: "1px solid #feb2b2",
                }}
              >
                {passphraseError}
              </div>
            )}

            <input
              type="password"
              value={passphrase}
              onChange={(e) => setPassphrase(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handlePassphraseSubmit()}
              placeholder="Enter your passphrase"
              className="w-full px-4 py-2 rounded-lg mb-4"
              style={{
                backgroundColor: theme.background,
                border: `1px solid ${theme.border}`,
                color: theme.text,
              }}
            />

            <div className="flex gap-3">
              <button
                onClick={skipPersonalContext}
                className="flex-1 py-2 rounded-lg transition-all"
                style={{
                  backgroundColor: "transparent",
                  border: `1px solid ${theme.border}`,
                  color: theme.text,
                }}
              >
                Skip
              </button>
              <button
                onClick={handlePassphraseSubmit}
                disabled={!passphrase}
                className="flex-1 py-2 rounded-lg transition-all disabled:opacity-50"
                style={{ backgroundColor: theme.text, color: theme.background }}
              >
                Include Context
              </button>
            </div>
          </div>
        </div>
      )}

      <div>
        <h1 className="text-3xl font-bold" style={{ color: theme.text }}>
          Interpretations
        </h1>
        <p className="mt-2" style={{ color: theme.text, opacity: 0.7 }}>
          Generate AI-powered psychoanalytic interpretations of your dreams
        </p>
        {shouldUsePersonalContext() && (
          <p
            className="mt-1 text-sm flex items-center gap-1"
            style={{ color: "#22c55e" }}
          >
            <span>🔐</span> Personal context enabled
            {decryptedContext && <span>(unlocked)</span>}
          </p>
        )}
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
            No dreams to interpret
          </h3>
          <p className="mt-2" style={{ color: theme.text, opacity: 0.7 }}>
            Record some dreams first to start interpreting them.
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
        <>
          {/* Mode Toggle */}
          <div
            className="flex gap-2 p-1 rounded-lg w-fit"
            style={{ backgroundColor: theme.card }}
          >
            <button
              onClick={() => setMode("single")}
              className="px-4 py-2 rounded-md transition-theme"
              style={{
                backgroundColor:
                  mode === "single" ? theme.background : "transparent",
                color: theme.text,
              }}
            >
              Single
            </button>
            <button
              onClick={() => setMode("batch")}
              className="px-4 py-2 rounded-md transition-theme"
              style={{
                backgroundColor:
                  mode === "batch" ? theme.background : "transparent",
                color: theme.text,
              }}
            >
              Batch
            </button>
          </div>

          {mode === "single" ? (
            /* Single Interpretation Mode */
            <div className="space-y-6">
              <div
                className="p-6 rounded-lg"
                style={{
                  backgroundColor: theme.card,
                  border: `1px solid ${theme.border}`,
                }}
              >
                <h2
                  className="text-xl font-semibold mb-4"
                  style={{ color: theme.text }}
                >
                  Select Dream & Analyst
                </h2>

                <div className="grid gap-4 md:grid-cols-2">
                  {/* Dream Selector */}
                  <div>
                    <label
                      className="block text-sm font-medium mb-2"
                      style={{ color: theme.text }}
                    >
                      Dream
                    </label>
                    <select
                      value={selectedDreamId}
                      onChange={(e) => {
                        setSelectedDreamId(e.target.value);
                        setSingleResult(null);
                      }}
                      className="w-full px-3 py-2 rounded-md"
                      style={{
                        backgroundColor: theme.background,
                        border: `1px solid ${theme.border}`,
                        color: theme.text,
                      }}
                    >
                      <option value="">Select a dream...</option>
                      {dreams.map((dream) => (
                        <option key={dream.id} value={dream.id}>
                          {dream.title || "Untitled"} -{" "}
                          {new Date(dream.dream_date).toLocaleDateString()}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Analyst Selector */}
                  <div>
                    <label
                      className="block text-sm font-medium mb-2"
                      style={{ color: theme.text }}
                    >
                      Psychoanalyst
                    </label>
                    <select
                      value={selectedAnalyst}
                      onChange={(e) => {
                        setSelectedAnalyst(e.target.value as PsychoanalystType);
                        setSingleResult(null);
                      }}
                      className="w-full px-3 py-2 rounded-md"
                      style={{
                        backgroundColor: theme.background,
                        border: `1px solid ${theme.border}`,
                        color: theme.text,
                      }}
                    >
                      {PSYCHOANALYSTS.map((analyst) => (
                        <option key={analyst.type} value={analyst.type}>
                          {analyst.name} - {analyst.description}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <button
                  onClick={handleSingleGenerate}
                  disabled={!selectedDreamId || singleGenerating}
                  className="mt-4 px-6 py-2 rounded-md transition-theme disabled:opacity-50"
                  style={{
                    backgroundColor: theme.text,
                    color: theme.background,
                  }}
                >
                  {singleGenerating
                    ? "Generating..."
                    : "Generate Interpretation"}
                </button>
              </div>

              {/* Single Result */}
              {singleGenerating && (
                <div
                  className="p-6 rounded-lg flex items-center gap-3"
                  style={{
                    backgroundColor: theme.card,
                    border: `1px solid ${theme.border}`,
                  }}
                >
                  <div
                    className="animate-spin rounded-full h-5 w-5 border-b-2"
                    style={{ borderColor: theme.text }}
                  ></div>
                  <span style={{ color: theme.text }}>
                    Generating interpretation...
                  </span>
                </div>
              )}

              {singleResult && (
                <div
                  className="p-6 rounded-lg"
                  style={{
                    backgroundColor: theme.card,
                    border: `1px solid ${theme.border}`,
                  }}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3
                        className="text-lg font-semibold"
                        style={{ color: theme.text }}
                      >
                        {PSYCHOANALYSTS.find(
                          (a) => a.type === singleResult.psychoanalyst_type
                        )?.name || "Interpretation"}
                      </h3>
                      <p
                        className="text-xs mt-1"
                        style={{ color: theme.text, opacity: 0.5 }}
                      >
                        Generated{" "}
                        {new Date(singleResult.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  {singleResult.interpretation_data ? (
                    <StructuredInterpretation
                      data={singleResult.interpretation_data}
                      theme={theme}
                    />
                  ) : (
                    <LegacyInterpretation
                      text={singleResult.interpretation_text}
                      theme={theme}
                    />
                  )}
                </div>
              )}
            </div>
          ) : (
            /* Batch Analysis Mode */
            <div className="space-y-6">
              {batchResults.length === 0 ? (
                /* Selection Phase */
                <div
                  className="p-6 rounded-lg"
                  style={{
                    backgroundColor: theme.card,
                    border: `1px solid ${theme.border}`,
                  }}
                >
                  <h2
                    className="text-xl font-semibold mb-2"
                    style={{ color: theme.text }}
                  >
                    Batch Dream Analysis
                  </h2>
                  <p
                    className="text-sm mb-4"
                    style={{ color: theme.text, opacity: 0.7 }}
                  >
                    Select dreams and choose an analyst for each. You&apos;ll
                    get individual interpretations plus a collective pattern
                    analysis.
                  </p>

                  <div className="flex gap-2 mb-4">
                    <button
                      onClick={selectAllDreams}
                      className="px-3 py-1 text-sm rounded-md transition-theme"
                      style={{
                        backgroundColor: "transparent",
                        border: `1px solid ${theme.border}`,
                        color: theme.text,
                      }}
                    >
                      Select All
                    </button>
                    <button
                      onClick={clearSelection}
                      className="px-3 py-1 text-sm rounded-md transition-theme"
                      style={{
                        backgroundColor: "transparent",
                        border: `1px solid ${theme.border}`,
                        color: theme.text,
                      }}
                    >
                      Clear
                    </button>
                  </div>

                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {dreams.map((dream) => {
                      const isSelected =
                        batchSelections[dream.id] !== undefined;
                      return (
                        <div
                          key={dream.id}
                          className="flex items-center gap-3 p-3 rounded-md transition-all"
                          style={{
                            backgroundColor: isSelected
                              ? theme.background
                              : "transparent",
                            border: `1px solid ${
                              isSelected ? theme.text : theme.border
                            }`,
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleBatchDream(dream.id)}
                            className="w-4 h-4 rounded cursor-pointer"
                          />
                          <div
                            className="flex-1 min-w-0 cursor-pointer"
                            onClick={() => toggleBatchDream(dream.id)}
                          >
                            <p
                              className="font-medium truncate"
                              style={{ color: theme.text }}
                            >
                              {dream.title || "Untitled Dream"}
                            </p>
                            <p
                              className="text-sm truncate"
                              style={{ color: theme.text, opacity: 0.6 }}
                            >
                              {new Date(dream.dream_date).toLocaleDateString()}{" "}
                              - {dream.content.substring(0, 50)}...
                            </p>
                          </div>
                          {isSelected && (
                            <select
                              value={batchSelections[dream.id]}
                              onChange={(e) =>
                                updateBatchAnalyst(
                                  dream.id,
                                  e.target.value as PsychoanalystType
                                )
                              }
                              onClick={(e) => e.stopPropagation()}
                              className="px-2 py-1 rounded-md text-sm"
                              style={{
                                backgroundColor: theme.card,
                                border: `1px solid ${theme.border}`,
                                color: theme.text,
                              }}
                            >
                              {PSYCHOANALYSTS.map((analyst) => (
                                <option key={analyst.type} value={analyst.type}>
                                  {analyst.name}
                                </option>
                              ))}
                            </select>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-6 flex items-center justify-between">
                    <span
                      className="text-sm"
                      style={{ color: theme.text, opacity: 0.7 }}
                    >
                      {Object.keys(batchSelections).length} dream
                      {Object.keys(batchSelections).length !== 1
                        ? "s"
                        : ""}{" "}
                      selected
                      {Object.keys(batchSelections).length < 2 && (
                        <span className="ml-2" style={{ color: "#f59e0b" }}>
                          (minimum 2 required)
                        </span>
                      )}
                    </span>
                    <button
                      onClick={handleBatchAnalysis}
                      disabled={
                        Object.keys(batchSelections).length < 2 ||
                        batchGenerating
                      }
                      className="px-6 py-2 rounded-md transition-theme disabled:opacity-50"
                      style={{
                        backgroundColor: theme.text,
                        color: theme.background,
                      }}
                    >
                      {batchGenerating ? "Analyzing..." : "Analyze Dreams"}
                    </button>
                  </div>
                </div>
              ) : (
                /* Results Phase */
                <>
                  <div className="flex justify-between items-center">
                    <h2
                      className="text-xl font-semibold"
                      style={{ color: theme.text }}
                    >
                      Batch Analysis Results
                    </h2>
                    {!batchGenerating && (
                      <button
                        onClick={clearBatchResults}
                        className="px-4 py-2 rounded-md transition-theme"
                        style={{
                          backgroundColor: "transparent",
                          border: `1px solid ${theme.border}`,
                          color: theme.text,
                        }}
                      >
                        New Batch
                      </button>
                    )}
                  </div>

                  {/* Individual Interpretations */}
                  <div
                    className="p-6 rounded-lg"
                    style={{
                      backgroundColor: theme.card,
                      border: `1px solid ${theme.border}`,
                    }}
                  >
                    <h3
                      className="text-lg font-semibold mb-4"
                      style={{ color: theme.text }}
                    >
                      Individual Interpretations
                    </h3>
                    <div className="space-y-3">
                      {batchResults.map((item) => (
                        <div
                          key={item.dreamId}
                          className="p-3 rounded-md"
                          style={{
                            backgroundColor: theme.background,
                            border: `1px solid ${theme.border}`,
                          }}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <span
                                className="font-medium"
                                style={{ color: theme.text }}
                              >
                                {item.dreamTitle}
                              </span>
                              <span
                                className="ml-2 text-sm"
                                style={{ color: theme.text, opacity: 0.6 }}
                              >
                                (
                                {
                                  PSYCHOANALYSTS.find(
                                    (a) => a.type === item.analyst
                                  )?.name
                                }
                                )
                              </span>
                            </div>
                            <div>
                              {item.status === "pending" && (
                                <span
                                  className="text-xs px-2 py-1 rounded"
                                  style={{
                                    backgroundColor: theme.card,
                                    color: theme.text,
                                    opacity: 0.6,
                                  }}
                                >
                                  Pending
                                </span>
                              )}
                              {item.status === "generating" && (
                                <span
                                  className="flex items-center gap-1 text-xs px-2 py-1 rounded"
                                  style={{
                                    backgroundColor: "#fef3c7",
                                    color: "#92400e",
                                  }}
                                >
                                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current"></div>
                                  Generating
                                </span>
                              )}
                              {item.status === "completed" && (
                                <span
                                  className="text-xs px-2 py-1 rounded"
                                  style={{
                                    backgroundColor: "#d1fae5",
                                    color: "#065f46",
                                  }}
                                >
                                  ✓ Done
                                </span>
                              )}
                              {item.status === "error" && (
                                <span
                                  className="text-xs px-2 py-1 rounded"
                                  style={{
                                    backgroundColor: "#fee",
                                    color: "#c53030",
                                  }}
                                >
                                  ✗ Error
                                </span>
                              )}
                            </div>
                          </div>
                          {item.status === "completed" &&
                            item.interpretation && (
                              <details>
                                <summary
                                  className="cursor-pointer text-sm"
                                  style={{ color: theme.text, opacity: 0.8 }}
                                >
                                  View interpretation
                                </summary>
                                <div className="mt-2">
                                  {item.interpretation.interpretation_data ? (
                                    <StructuredInterpretation
                                      data={item.interpretation.interpretation_data}
                                      theme={theme}
                                      compact
                                    />
                                  ) : (
                                    <LegacyInterpretation
                                      text={item.interpretation.interpretation_text}
                                      theme={theme}
                                    />
                                  )}
                                </div>
                              </details>
                            )}
                          {item.status === "error" && item.error && (
                            <p className="text-sm" style={{ color: "#c53030" }}>
                              {item.error}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Collective Analysis */}
                  <div
                    className="p-6 rounded-lg"
                    style={{
                      backgroundColor: theme.card,
                      border: `1px solid ${theme.border}`,
                    }}
                  >
                    <h3
                      className="text-lg font-semibold mb-4"
                      style={{ color: theme.text }}
                    >
                      Collective Pattern Analysis
                    </h3>
                    {collectiveGenerating && (
                      <div className="flex items-center gap-3">
                        <div
                          className="animate-spin rounded-full h-5 w-5 border-b-2"
                          style={{ borderColor: theme.text }}
                        ></div>
                        <span style={{ color: theme.text, opacity: 0.7 }}>
                          Analyzing patterns across all dreams...
                        </span>
                      </div>
                    )}
                    {collectiveResult && collectiveResult.analysis_data && (
                      <div className="space-y-4">
                        <p
                          className="text-sm"
                          style={{ color: theme.text, opacity: 0.6 }}
                        >
                          Analysis of {collectiveResult.dream_ids.length} dreams
                        </p>

                        {/* Summary */}
                        <div
                          className="p-4 rounded"
                          style={{
                            backgroundColor: theme.background,
                            border: `1px solid ${theme.border}`,
                          }}
                        >
                          <p
                            className="font-medium mb-2"
                            style={{ color: theme.text }}
                          >
                            Summary
                          </p>
                          <p style={{ color: theme.text }}>
                            {collectiveResult.analysis_data.summary}
                          </p>
                        </div>

                        {/* Core Synthesis */}
                        <div
                          className="p-4 rounded"
                          style={{
                            backgroundColor: theme.background,
                            border: `1px solid ${theme.border}`,
                          }}
                        >
                          <p
                            className="font-medium mb-3"
                            style={{ color: theme.text }}
                          >
                            🎯 Core Synthesis
                          </p>
                          <div className="space-y-2 text-sm">
                            <p style={{ color: theme.text }}>
                              <strong>Conflict:</strong>{" "}
                              {
                                collectiveResult.analysis_data.synthesis
                                  .coreConflict
                              }
                            </p>
                            <p style={{ color: theme.text }}>
                              <strong>Message:</strong>{" "}
                              {
                                collectiveResult.analysis_data.synthesis
                                  .unconsciousMessage
                              }
                            </p>
                          </div>
                        </div>

                        {/* Key Insights */}
                        {collectiveResult.analysis_data.keyInsights.length >
                          0 && (
                          <div
                            className="p-4 rounded"
                            style={{
                              backgroundColor: theme.background,
                              border: `1px solid ${theme.border}`,
                            }}
                          >
                            <p
                              className="font-medium mb-3"
                              style={{ color: theme.text }}
                            >
                              💡 Key Insights
                            </p>
                            <ul className="space-y-2 text-sm">
                              {collectiveResult.analysis_data.keyInsights.map(
                                (insight, i) => (
                                  <li
                                    key={i}
                                    className="flex items-start gap-2"
                                    style={{ color: theme.text }}
                                  >
                                    <span>•</span>
                                    <span>{insight.insight}</span>
                                  </li>
                                )
                              )}
                            </ul>
                          </div>
                        )}

                        {/* View full analysis link */}
                        <p
                          className="text-sm text-center"
                          style={{ color: theme.text, opacity: 0.6 }}
                        >
                          View the full analysis in the{" "}
                          <a
                            href="/analysis"
                            className="underline"
                            style={{ color: theme.text }}
                          >
                            Analysis
                          </a>{" "}
                          section
                        </p>
                      </div>
                    )}
                    {!collectiveGenerating && !collectiveResult && (
                      <p style={{ color: theme.text, opacity: 0.5 }}>
                        Collective analysis will appear here after individual
                        interpretations complete.
                      </p>
                    )}
                  </div>
                </>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
