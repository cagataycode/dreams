"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useAuth } from "../../lib/auth-context";
import { useTheme } from "../../lib/theme-context";
import {
  profileService,
  PersonalProfile,
  EncryptedProfile,
  EMPTY_PROFILE,
} from "../../lib/services/profile";

type PageState =
  | "loading"
  | "no_profile"
  | "enter_passphrase"
  | "editing"
  | "saving";

export default function YouPage() {
  const { user } = useAuth();
  const { theme, themeName } = useTheme();
  const logoSrc =
    themeName === "dark" ? "/crescent-light.png" : "/crescent-dark.png";

  const [pageState, setPageState] = useState<PageState>("loading");
  const [encryptedProfile, setEncryptedProfile] =
    useState<EncryptedProfile | null>(null);
  const [profileData, setProfileData] =
    useState<PersonalProfile>(EMPTY_PROFILE);
  const [passphrase, setPassphrase] = useState("");
  const [confirmPassphrase, setConfirmPassphrase] = useState("");
  const [includeInInterpretations, setIncludeInInterpretations] =
    useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (user) {
      loadProfile();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const loadProfile = async () => {
    try {
      setPageState("loading");
      const profile = await profileService.getProfile();
      if (profile) {
        setEncryptedProfile(profile);
        setIncludeInInterpretations(profile.include_in_interpretations);
        setPageState("enter_passphrase");
      } else {
        setPageState("no_profile");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load profile");
      setPageState("no_profile");
    }
  };

  const handleCreateNew = () => {
    setProfileData(EMPTY_PROFILE);
    setPassphrase("");
    setConfirmPassphrase("");
    setPageState("editing");
  };

  const handleUnlock = async () => {
    if (!encryptedProfile || !passphrase) return;

    setError("");
    try {
      const decrypted = await profileService.decryptProfile(
        encryptedProfile,
        passphrase
      );
      setProfileData(decrypted);
      setPageState("editing");
    } catch {
      setError("Incorrect passphrase. Please try again.");
    }
  };

  const handleSave = async () => {
    setError("");
    setSuccess("");

    // Validate passphrase for new profiles
    if (!encryptedProfile) {
      if (passphrase.length < 8) {
        setError("Passphrase must be at least 8 characters");
        return;
      }
      if (passphrase !== confirmPassphrase) {
        setError("Passphrases do not match");
        return;
      }
    }

    if (!passphrase) {
      setError("Please enter your passphrase");
      return;
    }

    try {
      setPageState("saving");
      const saved = await profileService.saveProfile(
        profileData,
        passphrase,
        includeInInterpretations
      );
      setEncryptedProfile(saved);
      setSuccess("Profile saved and encrypted successfully!");
      setPageState("editing");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save profile");
      setPageState("editing");
    }
  };

  const handleDelete = async () => {
    try {
      await profileService.deleteProfile();
      setEncryptedProfile(null);
      setProfileData(EMPTY_PROFILE);
      setPassphrase("");
      setConfirmPassphrase("");
      setShowDeleteConfirm(false);
      setPageState("no_profile");
      setSuccess("Profile deleted successfully");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete profile");
    }
  };

  const handleFieldChange = (field: keyof PersonalProfile, value: string) => {
    setProfileData((prev) => ({ ...prev, [field]: value }));
  };

  // Loading state
  if (pageState === "loading") {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div
          className="animate-spin rounded-full h-8 w-8 border-b-2"
          style={{ borderColor: theme.text }}
        ></div>
      </div>
    );
  }

  // No profile - show intro
  if (pageState === "no_profile") {
    return (
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="text-center py-8">
          <Image
            src={logoSrc}
            alt="You"
            width={80}
            height={80}
            className="object-contain mx-auto mb-4"
          />
          <h1 className="text-3xl font-bold mb-4" style={{ color: theme.text }}>
            Personal Context
          </h1>
          <p
            className="text-lg mb-6"
            style={{ color: theme.text, opacity: 0.7 }}
          >
            Add personal information to help our AI provide more personalized
            dream interpretations.
          </p>
        </div>

        <div
          className="p-6 rounded-xl"
          style={{
            backgroundColor: theme.card,
            border: `1px solid ${theme.border}`,
          }}
        >
          <h2
            className="text-xl font-semibold mb-4"
            style={{ color: theme.text }}
          >
            🔒 Your Privacy is Protected
          </h2>
          <ul
            className="space-y-3"
            style={{ color: theme.text, opacity: 0.85 }}
          >
            <li className="flex items-start gap-2">
              <span>•</span>
              <span>
                All personal information is <strong>encrypted</strong> in your
                browser before being stored
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span>•</span>
              <span>
                Only you can decrypt your data using your personal passphrase
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span>•</span>
              <span>
                Even administrators cannot see your personal information
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span>•</span>
              <span>
                <strong>Important:</strong> If you forget your passphrase, your
                data cannot be recovered
              </span>
            </li>
          </ul>
        </div>

        {success && (
          <div
            className="p-4 rounded-lg"
            style={{ backgroundColor: "#22c55e20", color: "#22c55e" }}
          >
            {success}
          </div>
        )}

        <button
          onClick={handleCreateNew}
          className="w-full py-3 rounded-lg font-semibold transition-all hover:scale-[1.02]"
          style={{ backgroundColor: theme.text, color: theme.background }}
        >
          Create Personal Profile
        </button>
      </div>
    );
  }

  // Enter passphrase to unlock
  if (pageState === "enter_passphrase") {
    return (
      <div className="max-w-md mx-auto space-y-6">
        <div className="text-center py-8">
          <Image
            src={logoSrc}
            alt="You"
            width={64}
            height={64}
            className="object-contain mx-auto mb-4"
          />
          <h1 className="text-2xl font-bold mb-2" style={{ color: theme.text }}>
            Unlock Your Profile
          </h1>
          <p style={{ color: theme.text, opacity: 0.7 }}>
            Enter your passphrase to view and edit your encrypted personal
            information
          </p>
        </div>

        <div
          className="p-6 rounded-xl space-y-4"
          style={{
            backgroundColor: theme.card,
            border: `1px solid ${theme.border}`,
          }}
        >
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

          <div>
            <label
              className="block text-sm font-medium mb-2"
              style={{ color: theme.text }}
            >
              Passphrase
            </label>
            <input
              type="password"
              value={passphrase}
              onChange={(e) => setPassphrase(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleUnlock()}
              placeholder="Enter your passphrase"
              className="w-full px-4 py-2 rounded-lg"
              style={{
                backgroundColor: theme.background,
                border: `1px solid ${theme.border}`,
                color: theme.text,
              }}
            />
          </div>

          <button
            onClick={handleUnlock}
            disabled={!passphrase}
            className="w-full py-2 rounded-lg font-semibold transition-all disabled:opacity-50"
            style={{ backgroundColor: theme.text, color: theme.background }}
          >
            Unlock
          </button>
        </div>
      </div>
    );
  }

  // Editing/saving state - show full form
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: theme.text }}>
            Personal Context
          </h1>
          <p style={{ color: theme.text, opacity: 0.7 }}>
            This information helps personalize your dream interpretations
          </p>
        </div>
        {encryptedProfile && (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="px-4 py-2 rounded-lg text-sm transition-all"
            style={{
              backgroundColor: "transparent",
              border: `1px solid #ef4444`,
              color: "#ef4444",
            }}
          >
            Delete Profile
          </button>
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

      {success && (
        <div
          className="p-4 rounded-lg"
          style={{ backgroundColor: "#22c55e20", color: "#22c55e" }}
        >
          {success}
        </div>
      )}

      {/* Delete confirmation modal */}
      {showDeleteConfirm && (
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
              Delete Profile?
            </h3>
            <p className="mb-4" style={{ color: theme.text, opacity: 0.7 }}>
              This will permanently delete all your encrypted personal
              information. This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
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
                onClick={handleDelete}
                className="flex-1 py-2 rounded-lg transition-all"
                style={{ backgroundColor: "#ef4444", color: "white" }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Passphrase section for new profiles */}
      {!encryptedProfile && (
        <div
          className="p-6 rounded-xl space-y-4"
          style={{
            backgroundColor: theme.card,
            border: `1px solid ${theme.border}`,
          }}
        >
          <h2 className="text-lg font-semibold" style={{ color: theme.text }}>
            🔐 Create Your Passphrase
          </h2>
          <p className="text-sm" style={{ color: theme.text, opacity: 0.7 }}>
            This passphrase encrypts your data. Choose something memorable but
            secure - if you forget it, your data cannot be recovered.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: theme.text }}
              >
                Passphrase
              </label>
              <input
                type="password"
                value={passphrase}
                onChange={(e) => setPassphrase(e.target.value)}
                placeholder="Minimum 8 characters"
                className="w-full px-4 py-2 rounded-lg"
                style={{
                  backgroundColor: theme.background,
                  border: `1px solid ${theme.border}`,
                  color: theme.text,
                }}
              />
            </div>
            <div>
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: theme.text }}
              >
                Confirm Passphrase
              </label>
              <input
                type="password"
                value={confirmPassphrase}
                onChange={(e) => setConfirmPassphrase(e.target.value)}
                placeholder="Re-enter passphrase"
                className="w-full px-4 py-2 rounded-lg"
                style={{
                  backgroundColor: theme.background,
                  border: `1px solid ${theme.border}`,
                  color: theme.text,
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Profile fields */}
      <div
        className="p-6 rounded-xl space-y-6"
        style={{
          backgroundColor: theme.card,
          border: `1px solid ${theme.border}`,
        }}
      >
        <div>
          <label
            className="block text-sm font-medium mb-2"
            style={{ color: theme.text }}
          >
            Early Life Experiences
          </label>
          <textarea
            value={profileData.earlyLifeExperiences}
            onChange={(e) =>
              handleFieldChange("earlyLifeExperiences", e.target.value)
            }
            placeholder="Childhood memories, family dynamics, formative experiences..."
            rows={3}
            className="w-full px-4 py-2 rounded-lg resize-none"
            style={{
              backgroundColor: theme.background,
              border: `1px solid ${theme.border}`,
              color: theme.text,
            }}
          />
        </div>

        <div>
          <label
            className="block text-sm font-medium mb-2"
            style={{ color: theme.text }}
          >
            Significant Relationships
          </label>
          <textarea
            value={profileData.significantRelationships}
            onChange={(e) =>
              handleFieldChange("significantRelationships", e.target.value)
            }
            placeholder="Important people in your life, relationship patterns..."
            rows={3}
            className="w-full px-4 py-2 rounded-lg resize-none"
            style={{
              backgroundColor: theme.background,
              border: `1px solid ${theme.border}`,
              color: theme.text,
            }}
          />
        </div>

        <div>
          <label
            className="block text-sm font-medium mb-2"
            style={{ color: theme.text }}
          >
            Recurring Life Themes
          </label>
          <textarea
            value={profileData.recurringLifeThemes}
            onChange={(e) =>
              handleFieldChange("recurringLifeThemes", e.target.value)
            }
            placeholder="Patterns you notice in your life, ongoing challenges or interests..."
            rows={3}
            className="w-full px-4 py-2 rounded-lg resize-none"
            style={{
              backgroundColor: theme.background,
              border: `1px solid ${theme.border}`,
              color: theme.text,
            }}
          />
        </div>

        <div>
          <label
            className="block text-sm font-medium mb-2"
            style={{ color: theme.text }}
          >
            Personal Symbols & Meanings
          </label>
          <textarea
            value={profileData.personalSymbols}
            onChange={(e) =>
              handleFieldChange("personalSymbols", e.target.value)
            }
            placeholder="Objects, places, or concepts that have special meaning to you..."
            rows={3}
            className="w-full px-4 py-2 rounded-lg resize-none"
            style={{
              backgroundColor: theme.background,
              border: `1px solid ${theme.border}`,
              color: theme.text,
            }}
          />
        </div>

        <div>
          <label
            className="block text-sm font-medium mb-2"
            style={{ color: theme.text }}
          >
            <span className="text-yellow-500">⚠️</span> Sensitive/Formative
            Experiences
          </label>
          <p
            className="text-xs mb-2"
            style={{ color: theme.text, opacity: 0.6 }}
          >
            This section is for difficult experiences that may influence your
            dreams. Only share what you&apos;re comfortable with.
          </p>
          <textarea
            value={profileData.sensitiveExperiences}
            onChange={(e) =>
              handleFieldChange("sensitiveExperiences", e.target.value)
            }
            placeholder="Traumas, losses, or challenging experiences (optional)..."
            rows={3}
            className="w-full px-4 py-2 rounded-lg resize-none"
            style={{
              backgroundColor: theme.background,
              border: `1px solid ${theme.border}`,
              color: theme.text,
            }}
          />
        </div>

        <div>
          <label
            className="block text-sm font-medium mb-2"
            style={{ color: theme.text }}
          >
            Additional Notes
          </label>
          <textarea
            value={profileData.additionalNotes}
            onChange={(e) =>
              handleFieldChange("additionalNotes", e.target.value)
            }
            placeholder="Any other context that might help with dream interpretation..."
            rows={3}
            className="w-full px-4 py-2 rounded-lg resize-none"
            style={{
              backgroundColor: theme.background,
              border: `1px solid ${theme.border}`,
              color: theme.text,
            }}
          />
        </div>
      </div>

      {/* Include in interpretations toggle */}
      <div
        className="p-6 rounded-xl"
        style={{
          backgroundColor: theme.card,
          border: `1px solid ${theme.border}`,
        }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium" style={{ color: theme.text }}>
              Include in Dream Interpretations
            </h3>
            <p className="text-sm" style={{ color: theme.text, opacity: 0.7 }}>
              When enabled, you&apos;ll be prompted to enter your passphrase to
              include this context in interpretations
            </p>
          </div>
          <button
            onClick={() =>
              setIncludeInInterpretations(!includeInInterpretations)
            }
            className="relative w-12 h-6 rounded-full transition-all"
            style={{
              backgroundColor: includeInInterpretations
                ? theme.text
                : theme.background,
              border: `1px solid ${theme.border}`,
            }}
          >
            <span
              className="absolute top-0.5 w-5 h-5 rounded-full transition-transform"
              style={{
                backgroundColor: includeInInterpretations
                  ? theme.background
                  : theme.text,
                transform: includeInInterpretations
                  ? "translateX(24px)"
                  : "translateX(2px)",
              }}
            ></span>
          </button>
        </div>
      </div>

      {/* Save button */}
      <button
        onClick={handleSave}
        disabled={pageState === "saving"}
        className="w-full py-3 rounded-lg font-semibold transition-all disabled:opacity-50"
        style={{ backgroundColor: theme.text, color: theme.background }}
      >
        {pageState === "saving" ? "Encrypting & Saving..." : "Save Profile"}
      </button>
    </div>
  );
}
