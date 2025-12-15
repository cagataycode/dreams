// Pre-defined feeling options
export const FEELING_OPTIONS = [
  'happy',
  'anxious',
  'confused',
  'peaceful',
  'excited',
  'sad',
  'angry',
  'nostalgic',
  'mysterious',
  'surreal',
  'neutral',
] as const;

export type FeelingType = (typeof FEELING_OPTIONS)[number];

export class CreateDreamDto {
  title: string;
  content: string;
  dream_date: string;
  feelings?: string[]; // Array of feeling strings (stored as JSON in DB)
  mood?: number; // 1-10 emotional intensity scale
  is_lucid?: boolean; // Whether it was a lucid dream
  is_recurring?: boolean; // Whether it's a recurring dream
}

export class UpdateDreamDto {
  title?: string;
  content?: string;
  dream_date?: string;
  feelings?: string[];
  mood?: number;
  is_lucid?: boolean;
  is_recurring?: boolean;
}

export interface Dream {
  id: string;
  user_id: string;
  title: string;
  content: string;
  dream_date: string;
  feelings?: string[]; // JSON array stored as string in DB, parsed to array
  mood?: number;
  is_lucid?: boolean;
  is_recurring?: boolean;
  created_at?: string;
  updated_at?: string;
}