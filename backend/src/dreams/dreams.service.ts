import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase.service';
import { CreateDreamDto, UpdateDreamDto, Dream } from './dreams.dto';

@Injectable()
export class DreamsService {
  private readonly DREAMS_TABLE = 'dreams';

  constructor(private readonly supabaseService: SupabaseService) {}

  async createDream(userId: string, createDreamDto: CreateDreamDto): Promise<Dream> {
    try {
      // Convert feelings array to JSON string for storage
      const insertData: Record<string, unknown> = {
        user_id: userId,
        title: createDreamDto.title,
        content: createDreamDto.content,
        dream_date: createDreamDto.dream_date,
        mood: createDreamDto.mood,
        is_lucid: createDreamDto.is_lucid ?? false,
        is_recurring: createDreamDto.is_recurring ?? false,
      };

      if (createDreamDto.feelings) {
        insertData.feelings = JSON.stringify(createDreamDto.feelings);
      }

      const { data, error } = await this.supabaseService
        .getAdminClient()
        .from(this.DREAMS_TABLE)
        .insert(insertData)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return this.parseDream(data);
    } catch (error) {
      console.error('Error creating dream:', error);
      throw error;
    }
  }

  // Helper to parse dream data from DB (handle JSON fields)
  private parseDream(data: Record<string, unknown>): Dream {
    return {
      ...data,
      feelings: data.feelings ? JSON.parse(data.feelings as string) : undefined,
    } as Dream;
  }

  private parseDreams(data: Record<string, unknown>[]): Dream[] {
    return data.map((d) => this.parseDream(d));
  }

  async getUserDreams(userId: string): Promise<Dream[]> {
    try {
      const { data, error } = await this.supabaseService
        .getAdminClient()
        .from(this.DREAMS_TABLE)
        .select('*')
        .eq('user_id', userId)
        .order('dream_date', { ascending: false })
        .limit(100);

      if (error) {
        throw error;
      }

      return this.parseDreams(data as Record<string, unknown>[]);
    } catch (error) {
      console.error('Error fetching dreams:', error);
      throw error;
    }
  }

  async getDream(dreamId: string, userId: string): Promise<Dream> {
    try {
      const { data, error } = await this.supabaseService
        .getAdminClient()
        .from(this.DREAMS_TABLE)
        .select('*')
        .eq('id', dreamId)
        .eq('user_id', userId)
        .single();

      if (error) {
        throw error;
      }

      if (!data) {
        throw new Error('Dream not found');
      }

      return this.parseDream(data as Record<string, unknown>);
    } catch (error) {
      console.error('Error fetching dream:', error);
      throw error;
    }
  }

  async updateDream(dreamId: string, userId: string, updateDreamDto: UpdateDreamDto): Promise<Dream> {
    try {
      // First verify the dream belongs to the user
      await this.getDream(dreamId, userId);

      // Prepare update data, converting feelings to JSON
      const updateData: Record<string, unknown> = {};
      if (updateDreamDto.title !== undefined) updateData.title = updateDreamDto.title;
      if (updateDreamDto.content !== undefined) updateData.content = updateDreamDto.content;
      if (updateDreamDto.dream_date !== undefined) updateData.dream_date = updateDreamDto.dream_date;
      if (updateDreamDto.mood !== undefined) updateData.mood = updateDreamDto.mood;
      if (updateDreamDto.is_lucid !== undefined) updateData.is_lucid = updateDreamDto.is_lucid;
      if (updateDreamDto.is_recurring !== undefined) updateData.is_recurring = updateDreamDto.is_recurring;
      if (updateDreamDto.feelings !== undefined) {
        updateData.feelings = JSON.stringify(updateDreamDto.feelings);
      }

      const { data, error } = await this.supabaseService
        .getAdminClient()
        .from(this.DREAMS_TABLE)
        .update(updateData)
        .eq('id', dreamId)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return this.parseDream(data as Record<string, unknown>);
    } catch (error) {
      console.error('Error updating dream:', error);
      throw error;
    }
  }

  async deleteDream(dreamId: string, userId: string): Promise<void> {
    try {
      // First verify the dream belongs to the user
      await this.getDream(dreamId, userId);

      const { error } = await this.supabaseService
        .getAdminClient()
        .from(this.DREAMS_TABLE)
        .delete()
        .eq('id', dreamId)
        .eq('user_id', userId);

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Error deleting dream:', error);
      throw error;
    }
  }
}