export class SaveProfileDto {
  encrypted_data: string; // AES-GCM encrypted blob (base64 encoded)
  salt: string; // PBKDF2 salt (base64 encoded)
  iv: string; // Initialization vector (base64 encoded)
  include_in_interpretations: boolean;
}

export class UpdateProfileSettingsDto {
  include_in_interpretations: boolean;
}

export interface UserProfile {
  id: string;
  user_id: string;
  encrypted_data: string | null;
  salt: string | null;
  iv: string | null;
  include_in_interpretations: boolean;
  created_at: string;
  updated_at: string;
}
