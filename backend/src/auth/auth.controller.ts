import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  Get,
} from '@nestjs/common';
import { AppwriteService } from '../appwrite.service';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly appwriteService: AppwriteService) {}

  @Post('login')
  async login(@Body() loginDto: { email: string; password: string }) {
    // This endpoint can be used for server-side login if needed
    // For now, we'll let the frontend handle login directly with Appwrite
    return {
      message: 'Login handled by frontend with Appwrite',
      redirect: 'Use Appwrite client-side authentication',
    };
  }

  @Post('register')
  async register(
    @Body() registerDto: { email: string; password: string; name: string },
  ) {
    // Registration is handled by Appwrite client-side
    return {
      message: 'Registration handled by frontend with Appwrite',
      redirect: 'Use Appwrite client-side registration',
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Request() req) {
    // Get user profile using Appwrite
    try {
      // This would require implementing JWT verification with Appwrite
      return {
        message: 'User profile endpoint',
        userId: req.user?.userId,
      };
    } catch (error) {
      return {
        error: 'Failed to get profile',
      };
    }
  }

  @Post('logout')
  async logout() {
    // Logout is handled by Appwrite client-side
    return {
      message: 'Logout handled by frontend with Appwrite',
    };
  }
}
