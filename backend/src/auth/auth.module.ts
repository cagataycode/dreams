import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthGuard } from './auth.guard';
import { SupabaseService } from '../supabase.service';

@Module({
  controllers: [AuthController],
  providers: [AuthService, AuthGuard, SupabaseService],
  exports: [AuthGuard, AuthService],
})
export class AuthModule {}
