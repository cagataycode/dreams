import { getCurrentAccessToken } from "../supabase";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export type PsychoanalystType =
  | "jung"
  | "freud"
  | "adler"
  | "klein"
  | "lacan"
  | "hillman"
  | "hall";

// Structured interpretation result from AI
export interface StructuredInterpretationData {
  summary: string;
  symbols: Array<{
    symbol: string;
    meaning: string;
    significance: string;
  }>;
  themes: Array<{
    theme: string;
    interpretation: string;
    importance: "high" | "medium" | "low";
  }>;
  emotions: {
    primary: string;
    underlying: string;
    significance: string;
  };
  coreInterpretation: {
    mainMessage: string;
    unconsciousMaterial: string;
    psychologicalFunction: string;
  };
  keyInsight: string;
  reflection: string;
  personalContextIntegration: string | null;
}

export interface Interpretation {
  id: string;
  dream_id: string;
  user_id: string;
  psychoanalyst_type: PsychoanalystType;
  interpretation_text: string; // Legacy/summary text
  interpretation_data?: StructuredInterpretationData; // Structured JSON
  created_at: string;
}

export interface CreateInterpretationDto {
  dream_id: string;
  psychoanalyst_type: PsychoanalystType;
  personal_context?: string; // Optional decrypted personal context
}

export interface CreateCollectiveAnalysisDto {
  dream_ids: string[];
  personal_context?: string;
}

// Structured analysis result from AI
export interface StructuredAnalysisData {
  summary: string;
  recurringPatterns: {
    symbols: Array<{ symbol: string; occurrences: string[]; meaning: string }>;
    themes: Array<{ theme: string; dreams: string[]; significance: string }>;
    emotions: Array<{ emotion: string; frequency: string; context: string }>;
    settings: Array<{ setting: string; dreams: string[]; symbolism: string }>;
    characters: Array<{
      character: string;
      role: string;
      interpretation: string;
    }>;
  };
  psychologicalProgression: {
    trajectory: string;
    evolution: string;
    keyTransitions: Array<{ from: string; to: string; significance: string }>;
    emotionalArc: string;
  };
  synthesis: {
    coreConflict: string;
    metaNarrative: string;
    lifeSituation: string;
    unconsciousMessage: string;
  };
  keyInsights: Array<{ insight: string; evidence: string; importance: string }>;
  recommendations: string[];
  personalContextIntegration: string | null;
}

export interface CollectiveAnalysis {
  id: string;
  user_id: string;
  dream_ids: string[];
  analysis_data: StructuredAnalysisData;
  created_at: string;
}

// Helper function to make API calls
const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  const accessToken = await getCurrentAccessToken();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    credentials: "include",
    headers,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || `HTTP error! status: ${response.status}`);
  }

  return response.json();
};

export const interpretationService = {
  // Create a new interpretation (generates it using OpenAI)
  async createInterpretation(
    dto: CreateInterpretationDto
  ): Promise<Interpretation> {
    try {
      return await apiCall("/interpretations", {
        method: "POST",
        body: JSON.stringify(dto),
      });
    } catch (error) {
      console.error("Error creating interpretation:", error);
      throw error;
    }
  },

  // Get all interpretations for a specific dream
  async getDreamInterpretations(dreamId: string): Promise<Interpretation[]> {
    try {
      const result = await apiCall(`/interpretations/dream/${dreamId}`);
      // Ensure we always return an array
      return Array.isArray(result) ? result : [];
    } catch (error) {
      console.error("Error fetching dream interpretations:", error);
      // Return empty array instead of throwing if it's a 404 or empty response
      if (error instanceof Error && error.message.includes("404")) {
        return [];
      }
      throw error;
    }
  },

  // Get a specific interpretation by dream ID and type
  async getInterpretationByType(
    dreamId: string,
    type: PsychoanalystType
  ): Promise<Interpretation | null> {
    try {
      return await apiCall(`/interpretations/dream/${dreamId}/type/${type}`);
    } catch (error) {
      console.error("Error fetching interpretation:", error);
      return null;
    }
  },

  // Get all interpretations for the authenticated user
  async getUserInterpretations(): Promise<Interpretation[]> {
    try {
      return await apiCall("/interpretations");
    } catch (error) {
      console.error("Error fetching user interpretations:", error);
      throw error;
    }
  },

  // Delete an interpretation
  async deleteInterpretation(interpretationId: string): Promise<void> {
    try {
      await apiCall(`/interpretations/${interpretationId}`, {
        method: "DELETE",
      });
    } catch (error) {
      console.error("Error deleting interpretation:", error);
      throw error;
    }
  },

  // Create collective analysis for multiple dreams
  async createCollectiveAnalysis(
    dto: CreateCollectiveAnalysisDto
  ): Promise<CollectiveAnalysis> {
    try {
      return await apiCall("/interpretations/collective", {
        method: "POST",
        body: JSON.stringify(dto),
      });
    } catch (error) {
      console.error("Error creating collective analysis:", error);
      throw error;
    }
  },

  // Get all collective analyses for the user
  async getCollectiveAnalyses(): Promise<CollectiveAnalysis[]> {
    try {
      return await apiCall("/interpretations/collective");
    } catch (error) {
      console.error("Error fetching collective analyses:", error);
      throw error;
    }
  },

  // Delete a collective analysis
  async deleteCollectiveAnalysis(analysisId: string): Promise<void> {
    try {
      await apiCall(`/interpretations/collective/${analysisId}`, {
        method: "DELETE",
      });
    } catch (error) {
      console.error("Error deleting collective analysis:", error);
      throw error;
    }
  },
};
