import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase.service';
import { OpenAIService } from './openai.service';
import { DreamsService } from '../dreams/dreams.service';
import {
  CreateInterpretationDto,
  Interpretation,
  CreateCollectiveAnalysisDto,
  CollectiveAnalysis,
  DreamForAnalysis,
} from './interpretations.dto';
import { PsychoanalystType } from './prompts';

@Injectable()
export class InterpretationsService {
  private readonly INTERPRETATIONS_TABLE = 'interpretations';
  private readonly COLLECTIVE_ANALYSES_TABLE = 'collective_analyses';

  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly openaiService: OpenAIService,
    private readonly dreamsService: DreamsService,
  ) {}

  async createInterpretation(
    userId: string,
    createDto: CreateInterpretationDto,
  ): Promise<Interpretation> {
    try {
      // Verify the dream belongs to the user
      const dream = await this.dreamsService.getDream(
        createDto.dream_id,
        userId,
      );

      // Check if interpretation already exists for this dream and analyst type
      const existing = await this.getInterpretationByDreamAndType(
        createDto.dream_id,
        createDto.psychoanalyst_type,
        userId,
      );

      if (existing) {
        return existing;
      }

      // Generate interpretation using OpenAI (returns structured JSON)
      const interpretationData =
        await this.openaiService.generateInterpretation(
          dream.content,
          dream.title,
          createDto.psychoanalyst_type,
          createDto.personal_context,
        );

      // Create legacy text from structured data for backwards compatibility
      const interpretationText = interpretationData.summary;

      // Save interpretation to database
      const { data, error } = await this.supabaseService
        .getAdminClient()
        .from(this.INTERPRETATIONS_TABLE)
        .insert({
          dream_id: createDto.dream_id,
          user_id: userId,
          psychoanalyst_type: createDto.psychoanalyst_type,
          interpretation_text: interpretationText,
          interpretation_data: interpretationData,
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data as Interpretation;
    } catch (error) {
      console.error('Error creating interpretation:', error);
      throw error;
    }
  }

  async getInterpretationByDreamAndType(
    dreamId: string,
    psychoanalystType: PsychoanalystType,
    userId: string,
  ): Promise<Interpretation | null> {
    try {
      const { data, error } = await this.supabaseService
        .getAdminClient()
        .from(this.INTERPRETATIONS_TABLE)
        .select('*')
        .eq('dream_id', dreamId)
        .eq('psychoanalyst_type', psychoanalystType)
        .eq('user_id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No rows returned
          return null;
        }
        throw error;
      }

      return data as Interpretation;
    } catch (error) {
      console.error('Error fetching interpretation:', error);
      throw error;
    }
  }

  async getDreamInterpretations(
    dreamId: string,
    userId: string,
  ): Promise<Interpretation[]> {
    try {
      // Verify the dream belongs to the user
      await this.dreamsService.getDream(dreamId, userId);

      const { data, error } = await this.supabaseService
        .getAdminClient()
        .from(this.INTERPRETATIONS_TABLE)
        .select('*')
        .eq('dream_id', dreamId)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return (data || []) as Interpretation[];
    } catch (error) {
      console.error('Error fetching interpretations:', error);
      throw error;
    }
  }

  async getUserInterpretations(userId: string): Promise<Interpretation[]> {
    try {
      const { data, error } = await this.supabaseService
        .getAdminClient()
        .from(this.INTERPRETATIONS_TABLE)
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return (data || []) as Interpretation[];
    } catch (error) {
      console.error('Error fetching user interpretations:', error);
      throw error;
    }
  }

  async deleteInterpretation(
    interpretationId: string,
    userId: string,
  ): Promise<void> {
    try {
      const { error } = await this.supabaseService
        .getAdminClient()
        .from(this.INTERPRETATIONS_TABLE)
        .delete()
        .eq('id', interpretationId)
        .eq('user_id', userId);

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Error deleting interpretation:', error);
      throw error;
    }
  }

  async createCollectiveAnalysis(
    userId: string,
    createDto: CreateCollectiveAnalysisDto,
  ): Promise<CollectiveAnalysis> {
    try {
      if (!createDto.dream_ids || createDto.dream_ids.length < 2) {
        throw new Error(
          'At least 2 dreams are required for collective analysis',
        );
      }

      // Fetch all dreams and verify they belong to the user
      const dreams: DreamForAnalysis[] = [];
      for (const dreamId of createDto.dream_ids) {
        const dream = await this.dreamsService.getDream(dreamId, userId);
        dreams.push({
          id: dream.id,
          title: dream.title,
          content: dream.content,
          dream_date: dream.dream_date,
          feelings: dream.feelings,
          mood: dream.mood,
          is_lucid: dream.is_lucid,
          is_recurring: dream.is_recurring,
        });
      }

      // Generate collective analysis using OpenAI (returns structured JSON)
      const analysisData = await this.openaiService.generateCollectiveAnalysis(
        dreams,
        createDto.personal_context,
      );

      // Save to database
      const { data, error } = await this.supabaseService
        .getAdminClient()
        .from(this.COLLECTIVE_ANALYSES_TABLE)
        .insert({
          user_id: userId,
          dream_ids: JSON.stringify(createDto.dream_ids),
          analysis_data: analysisData,
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      return {
        ...data,
        dream_ids: JSON.parse(data.dream_ids),
        analysis_data: data.analysis_data,
      } as CollectiveAnalysis;
    } catch (error) {
      console.error('Error creating collective analysis:', error);
      throw error;
    }
  }

  async getCollectiveAnalyses(userId: string): Promise<CollectiveAnalysis[]> {
    try {
      const { data, error } = await this.supabaseService
        .getAdminClient()
        .from(this.COLLECTIVE_ANALYSES_TABLE)
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return (data || []).map((item) => ({
        ...item,
        dream_ids: JSON.parse(item.dream_ids),
        analysis_data: item.analysis_data,
      })) as CollectiveAnalysis[];
    } catch (error) {
      console.error('Error fetching collective analyses:', error);
      throw error;
    }
  }

  async deleteCollectiveAnalysis(
    analysisId: string,
    userId: string,
  ): Promise<void> {
    try {
      const { error } = await this.supabaseService
        .getAdminClient()
        .from(this.COLLECTIVE_ANALYSES_TABLE)
        .delete()
        .eq('id', analysisId)
        .eq('user_id', userId);

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Error deleting collective analysis:', error);
      throw error;
    }
  }
}
