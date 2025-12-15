import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { SupabaseService } from './supabase.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly supabaseService: SupabaseService,
  ) {}

  @Get()
  getWelcome(): string {
    return this.appService.getWelcome();
  }

  @Get('health')
  getHealth(): { status: string; timestamp: string } {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }

  @Get('supabase')
  getSupabaseInfo(): {
    url: string;
    connected: boolean;
  } {
    return {
      url: process.env.SUPABASE_URL || '',
      connected: !!this.supabaseService.getClient(),
    };
  }
}
