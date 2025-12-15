import { Module } from '@nestjs/common';
import { InterpretationsController } from './interpretations.controller';
import { InterpretationsService } from './interpretations.service';
import { OpenAIService } from './openai.service';
import { SupabaseService } from '../supabase.service';
import { DreamsModule } from '../dreams/dreams.module';

@Module({
  imports: [DreamsModule],
  controllers: [InterpretationsController],
  providers: [InterpretationsService, OpenAIService, SupabaseService],
  exports: [InterpretationsService],
})
export class InterpretationsModule {}
