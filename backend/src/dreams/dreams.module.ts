import { Module } from '@nestjs/common';
import { DreamsController } from './dreams.controller';
import { DreamsService } from './dreams.service';
import { SupabaseService } from '../supabase.service';

@Module({
  controllers: [DreamsController],
  providers: [DreamsService, SupabaseService],
  exports: [DreamsService],
})
export class DreamsModule {}
