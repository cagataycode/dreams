import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { AppwriteService } from './appwrite.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly appwriteService: AppwriteService,
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

  @Get('appwrite')
  getAppwriteInfo(): {
    projectId: string;
    projectName: string;
    endpoint: string;
    connected: boolean;
  } {
    return {
      projectId: process.env.APPWRITE_PROJECT_ID || '',
      projectName: process.env.APPWRITE_PROJECT_NAME || '',
      endpoint: process.env.APPWRITE_ENDPOINT || '',
      connected: !!this.appwriteService.getClient(),
    };
  }
}
