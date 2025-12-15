import { getCurrentAccessToken } from "../supabase";
import { encrypt, decrypt, EncryptedData } from "./crypto";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

// Personal profile data structure (stored encrypted)
export interface PersonalProfile {
  earlyLifeExperiences: string;
  significantRelationships: string;
  recurringLifeThemes: string;
  personalSymbols: string;
  sensitiveExperiences: string; // Traumas, difficult experiences
  additionalNotes: string;
}

// What we get from the API (encrypted)
export interface EncryptedProfile {
  id: string;
  user_id: string;
  encrypted_data: string | null;
  salt: string | null;
  iv: string | null;
  include_in_interpretations: boolean;
  created_at: string;
  updated_at: string;
}

// Empty profile template
export const EMPTY_PROFILE: PersonalProfile = {
  earlyLifeExperiences: "",
  significantRelationships: "",
  recurringLifeThemes: "",
  personalSymbols: "",
  sensitiveExperiences: "",
  additionalNotes: "",
};

export const profileService = {
  /**
   * Get the encrypted profile from the server
   */
  async getProfile(): Promise<EncryptedProfile | null> {
    const token = await getCurrentAccessToken();
    if (!token) {
      throw new Error("Not authenticated");
    }

    const response = await fetch(`${API_BASE_URL}/profiles/me`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch profile");
    }

    const data = await response.json();

    // If no profile exists yet
    if (data.exists === false || !data.id) {
      return null;
    }

    return data as EncryptedProfile;
  },

  /**
   * Save encrypted profile to the server
   */
  async saveProfile(
    profileData: PersonalProfile,
    passphrase: string,
    includeInInterpretations: boolean
  ): Promise<EncryptedProfile> {
    const token = await getCurrentAccessToken();
    if (!token) {
      throw new Error("Not authenticated");
    }

    // Encrypt the profile data client-side
    const plaintext = JSON.stringify(profileData);
    const encrypted: EncryptedData = await encrypt(plaintext, passphrase);

    const response = await fetch(`${API_BASE_URL}/profiles/me`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        encrypted_data: encrypted.encryptedData,
        salt: encrypted.salt,
        iv: encrypted.iv,
        include_in_interpretations: includeInInterpretations,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to save profile");
    }

    return response.json();
  },

  /**
   * Decrypt a profile using the passphrase
   */
  async decryptProfile(
    encryptedProfile: EncryptedProfile,
    passphrase: string
  ): Promise<PersonalProfile> {
    if (
      !encryptedProfile.encrypted_data ||
      !encryptedProfile.salt ||
      !encryptedProfile.iv
    ) {
      return EMPTY_PROFILE;
    }

    const decrypted = await decrypt(
      encryptedProfile.encrypted_data,
      passphrase,
      encryptedProfile.salt,
      encryptedProfile.iv
    );

    return JSON.parse(decrypted) as PersonalProfile;
  },

  /**
   * Update just the include_in_interpretations setting
   */
  async updateSettings(includeInInterpretations: boolean): Promise<void> {
    const token = await getCurrentAccessToken();
    if (!token) {
      throw new Error("Not authenticated");
    }

    const response = await fetch(`${API_BASE_URL}/profiles/me/settings`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        include_in_interpretations: includeInInterpretations,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to update settings");
    }
  },

  /**
   * Delete the profile
   */
  async deleteProfile(): Promise<void> {
    const token = await getCurrentAccessToken();
    if (!token) {
      throw new Error("Not authenticated");
    }

    const response = await fetch(`${API_BASE_URL}/profiles/me`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to delete profile");
    }
  },

  /**
   * Format profile data for use in interpretation prompts
   */
  formatForInterpretation(profile: PersonalProfile): string {
    const sections: string[] = [];

    if (profile.earlyLifeExperiences.trim()) {
      sections.push(
        `Early Life Experiences: ${profile.earlyLifeExperiences.trim()}`
      );
    }
    if (profile.significantRelationships.trim()) {
      sections.push(
        `Significant Relationships: ${profile.significantRelationships.trim()}`
      );
    }
    if (profile.recurringLifeThemes.trim()) {
      sections.push(
        `Recurring Life Themes: ${profile.recurringLifeThemes.trim()}`
      );
    }
    if (profile.personalSymbols.trim()) {
      sections.push(
        `Personal Symbols & Meanings: ${profile.personalSymbols.trim()}`
      );
    }
    if (profile.sensitiveExperiences.trim()) {
      sections.push(
        `Sensitive/Formative Experiences: ${profile.sensitiveExperiences.trim()}`
      );
    }
    if (profile.additionalNotes.trim()) {
      sections.push(`Additional Context: ${profile.additionalNotes.trim()}`);
    }

    if (sections.length === 0) {
      return "";
    }

    return `\n\n--- Personal Context (provided by the dreamer) ---\n${sections.join(
      "\n\n"
    )}`;
  },
};
