import { PsychoanalystType } from './prompts';

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
    importance: 'high' | 'medium' | 'low';
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
  interpretation_text: string; // Legacy plain text (for backwards compatibility)
  interpretation_data?: StructuredInterpretationData; // New structured JSON
  created_at?: string;
}

export class CreateInterpretationDto {
  dream_id: string;
  psychoanalyst_type: PsychoanalystType;
  personal_context?: string; // Optional decrypted personal context
}

export interface GenerateInterpretationDto {
  dream_content: string;
  dream_title?: string;
  psychoanalyst_type: PsychoanalystType;
  personal_context?: string;
}

// Collective analysis for multiple dreams
export class CreateCollectiveAnalysisDto {
  dream_ids: string[];
  personal_context?: string; // Optional decrypted personal context
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
  analysis_data: StructuredAnalysisData; // Structured JSON data
  created_at: string;
}

export interface DreamForAnalysis {
  id: string;
  title?: string;
  content: string;
  dream_date: string;
  feelings?: string[];
  mood?: number;
  is_lucid?: boolean;
  is_recurring?: boolean;
}
