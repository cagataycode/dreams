import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import {
  psychoanalystPrompts,
  PsychoanalystType,
  collectiveAnalysisPrompt,
  personalContextPrompt,
} from './prompts';
import { DreamForAnalysis } from './interpretations.dto';

@Injectable()
export class OpenAIService {
  private openai: OpenAI;

  constructor(private configService: ConfigService) {
    // Support both OPENAI_API_KEY and OPEN_AI_KEY for flexibility
    const apiKey =
      this.configService.get<string>('OPENAI_API_KEY') ||
      this.configService.get<string>('OPEN_AI_KEY');
    if (!apiKey) {
      throw new Error(
        'OPENAI_API_KEY or OPEN_AI_KEY environment variable is required',
      );
    }
    this.openai = new OpenAI({ apiKey });
  }

  private getPsychoanalystPrompt(type: PsychoanalystType): string {
    return psychoanalystPrompts[type];
  }

  async generateInterpretation(
    dreamContent: string,
    dreamTitle: string | undefined,
    psychoanalystType: PsychoanalystType,
    personalContext?: string,
  ): Promise<InterpretationResult> {
    let systemPrompt = this.getPsychoanalystPrompt(psychoanalystType);

    // If personal context is provided, append it
    if (personalContext && personalContext.trim()) {
      systemPrompt += `\n\n${personalContextPrompt}${personalContext}`;
    }

    const userPrompt = dreamTitle
      ? `Analyze this dream titled "${dreamTitle}":\n\n${dreamContent}`
      : `Analyze this dream:\n\n${dreamContent}`;

    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 1500,
        response_format: { type: 'json_object' },
      });

      const content = completion.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No response from OpenAI');
      }

      // Parse and return JSON response
      const parsed = JSON.parse(content) as InterpretationResult;
      return parsed;
    } catch (error) {
      console.error('OpenAI API error:', error);
      if (error instanceof SyntaxError) {
        throw new Error('Failed to parse interpretation response as JSON');
      }
      throw new Error(`Failed to generate interpretation: ${error.message}`);
    }
  }

  async generateCollectiveAnalysis(
    dreams: DreamForAnalysis[],
    personalContext?: string,
  ): Promise<CollectiveAnalysisResult> {
    let systemPrompt = collectiveAnalysisPrompt;

    // If personal context is provided, append with structured prompt
    if (personalContext && personalContext.trim()) {
      systemPrompt += `\n\n${personalContextPrompt}${personalContext}`;
    }

    // Format dreams for the prompt, sorted by date
    const sortedDreams = [...dreams].sort(
      (a, b) =>
        new Date(a.dream_date).getTime() - new Date(b.dream_date).getTime(),
    );

    const dreamsText = sortedDreams
      .map((dream, index) => {
        let dreamEntry = `\n--- DREAM ${index + 1} (${dream.dream_date}) ---`;
        if (dream.title) {
          dreamEntry += `\nTitle: ${dream.title}`;
        }
        dreamEntry += `\nContent: ${dream.content}`;
        if (dream.feelings && dream.feelings.length > 0) {
          dreamEntry += `\nFeelings: ${dream.feelings.join(', ')}`;
        }
        if (dream.mood) {
          dreamEntry += `\nEmotional Intensity: ${dream.mood}/10`;
        }
        if (dream.is_lucid) {
          dreamEntry += `\n[Lucid Dream]`;
        }
        if (dream.is_recurring) {
          dreamEntry += `\n[Recurring Dream]`;
        }
        return dreamEntry;
      })
      .join('\n');

    const userPrompt = `Analyze this series of ${dreams.length} dreams from the same dreamer:\n${dreamsText}`;

    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 3000, // More tokens for structured JSON
        response_format: { type: 'json_object' },
      });

      const content = completion.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No response from OpenAI');
      }

      // Parse and validate JSON response
      const parsed = JSON.parse(content) as CollectiveAnalysisResult;
      return parsed;
    } catch (error) {
      console.error('OpenAI API error:', error);
      if (error instanceof SyntaxError) {
        throw new Error('Failed to parse analysis response as JSON');
      }
      throw new Error(
        `Failed to generate collective analysis: ${error.message}`,
      );
    }
  }
}

// Type definition for structured individual interpretation result
export interface InterpretationResult {
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

// Type definition for structured collective analysis result
export interface CollectiveAnalysisResult {
  summary: string;
  recurringPatterns: {
    symbols: Array<{
      symbol: string;
      occurrences: string[];
      meaning: string;
    }>;
    themes: Array<{
      theme: string;
      dreams: string[];
      significance: string;
    }>;
    emotions: Array<{
      emotion: string;
      frequency: string;
      context: string;
    }>;
    settings: Array<{
      setting: string;
      dreams: string[];
      symbolism: string;
    }>;
    characters: Array<{
      character: string;
      role: string;
      interpretation: string;
    }>;
  };
  psychologicalProgression: {
    trajectory: string;
    evolution: string;
    keyTransitions: Array<{
      from: string;
      to: string;
      significance: string;
    }>;
    emotionalArc: string;
  };
  synthesis: {
    coreConflict: string;
    metaNarrative: string;
    lifeSituation: string;
    unconsciousMessage: string;
  };
  keyInsights: Array<{
    insight: string;
    evidence: string;
    importance: string;
  }>;
  recommendations: string[];
  personalContextIntegration: string | null;
}
