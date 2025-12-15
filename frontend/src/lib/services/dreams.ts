import { getCurrentAccessToken } from "../supabase";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

// Pre-defined feeling options
export const FEELING_OPTIONS = [
  { value: 'happy', label: 'Happy / Joyful' },
  { value: 'anxious', label: 'Anxious / Fearful' },
  { value: 'confused', label: 'Confused' },
  { value: 'peaceful', label: 'Peaceful / Calm' },
  { value: 'excited', label: 'Excited' },
  { value: 'sad', label: 'Sad / Melancholic' },
  { value: 'angry', label: 'Angry / Frustrated' },
  { value: 'nostalgic', label: 'Nostalgic' },
  { value: 'mysterious', label: 'Mysterious' },
  { value: 'surreal', label: 'Surreal' },
  { value: 'neutral', label: 'Neutral' },
] as const;

export type FeelingType = (typeof FEELING_OPTIONS)[number]['value'];

export interface Dream {
  id: string;
  user_id: string;
  title: string;
  content: string;
  dream_date: string;
  feelings?: string[];
  mood?: number;
  is_lucid?: boolean;
  is_recurring?: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateDreamDto {
  title: string;
  content: string;
  dream_date: string;
  feelings?: string[];
  mood?: number;
  is_lucid?: boolean;
  is_recurring?: boolean;
}

export interface UpdateDreamDto {
  title?: string;
  content?: string;
  dream_date?: string;
  feelings?: string[];
  mood?: number;
  is_lucid?: boolean;
  is_recurring?: boolean;
}

// Helper function to make API calls
const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  const accessToken = await getCurrentAccessToken();

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  // Send access token as Authorization header
  if (accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    credentials: "include", // Still include cookies as fallback
    headers,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || `HTTP error! status: ${response.status}`);
  }

  return response.json();
};

export const dreamService = {
  // Create a new dream
  async createDream(dream: CreateDreamDto): Promise<Dream> {
    try {
      return await apiCall("/dreams", {
        method: "POST",
        body: JSON.stringify(dream),
      });
    } catch (error) {
      console.error("Error creating dream:", error);
      throw error;
    }
  },

  // Get all dreams for the authenticated user
  async getUserDreams(): Promise<Dream[]> {
    try {
      return await apiCall("/dreams");
    } catch (error) {
      console.error("Error fetching dreams:", error);
      throw error;
    }
  },

  // Get a single dream by ID
  async getDream(dreamId: string): Promise<Dream> {
    try {
      return await apiCall(`/dreams/${dreamId}`);
    } catch (error) {
      console.error("Error fetching dream:", error);
      throw error;
    }
  },

  // Update a dream
  async updateDream(dreamId: string, updates: UpdateDreamDto): Promise<Dream> {
    try {
      return await apiCall(`/dreams/${dreamId}`, {
        method: "PUT",
        body: JSON.stringify(updates),
      });
    } catch (error) {
      console.error("Error updating dream:", error);
      throw error;
    }
  },

  // Delete a dream
  async deleteDream(dreamId: string): Promise<void> {
    try {
      await apiCall(`/dreams/${dreamId}`, {
        method: "DELETE",
      });
    } catch (error) {
      console.error("Error deleting dream:", error);
      throw error;
    }
  },
};
