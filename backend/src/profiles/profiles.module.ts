import { Module } from '@nestjs/common';
import { ProfilesController } from './profiles.controller';
import { ProfilesService } from './profiles.service';
import { SupabaseService } from '../supabase.service';

@Module({
  controllers: [ProfilesController],
  providers: [ProfilesService, SupabaseService],
  exports: [ProfilesService],
})
export class ProfilesModule {}
