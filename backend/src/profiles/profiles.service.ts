import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase.service';
import { SaveProfileDto, UserProfile } from './profiles.dto';

@Injectable()
export class ProfilesService {
  private readonly PROFILES_TABLE = 'user_profiles';

  constructor(private readonly supabaseService: SupabaseService) {}

  async getProfile(userId: string): Promise<UserProfile | null> {
    try {
      const { data, error } = await this.supabaseService
        .getAdminClient()
        .from(this.PROFILES_TABLE)
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        // No profile found is not an error
        if (error.code === 'PGRST116') {
          return null;
        }
        throw error;
      }

      return data as UserProfile;
    } catch (error) {
      console.error('Error fetching profile:', error);
      throw error;
    }
  }

  async saveProfile(
    userId: string,
    saveProfileDto: SaveProfileDto,
  ): Promise<UserProfile> {
    try {
      // Check if profile exists
      const existingProfile = await this.getProfile(userId);

      if (existingProfile) {
        // Update existing profile
        const { data, error } = await this.supabaseService
          .getAdminClient()
          .from(this.PROFILES_TABLE)
          .update({
            encrypted_data: saveProfileDto.encrypted_data,
            salt: saveProfileDto.salt,
            iv: saveProfileDto.iv,
            include_in_interpretations:
              saveProfileDto.include_in_interpretations,
          })
          .eq('user_id', userId)
          .select()
          .single();

        if (error) {
          throw error;
        }

        return data as UserProfile;
      } else {
        // Create new profile
        const { data, error } = await this.supabaseService
          .getAdminClient()
          .from(this.PROFILES_TABLE)
          .insert({
            user_id: userId,
            encrypted_data: saveProfileDto.encrypted_data,
            salt: saveProfileDto.salt,
            iv: saveProfileDto.iv,
            include_in_interpretations:
              saveProfileDto.include_in_interpretations,
          })
          .select()
          .single();

        if (error) {
          throw error;
        }

        return data as UserProfile;
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      throw error;
    }
  }

  async updateSettings(
    userId: string,
    includeInInterpretations: boolean,
  ): Promise<UserProfile | null> {
    try {
      const existingProfile = await this.getProfile(userId);

      if (!existingProfile) {
        return null;
      }

      const { data, error } = await this.supabaseService
        .getAdminClient()
        .from(this.PROFILES_TABLE)
        .update({
          include_in_interpretations: includeInInterpretations,
        })
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data as UserProfile;
    } catch (error) {
      console.error('Error updating profile settings:', error);
      throw error;
    }
  }

  async deleteProfile(userId: string): Promise<void> {
    try {
      const { error } = await this.supabaseService
        .getAdminClient()
        .from(this.PROFILES_TABLE)
        .delete()
        .eq('user_id', userId);

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Error deleting profile:', error);
      throw error;
    }
  }
}
