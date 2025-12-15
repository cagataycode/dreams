import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  Get,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { AuthGuard } from './auth.guard';
import { LoginDto, RegisterDto } from './auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() loginDto: LoginDto, @Res() res: Response) {
    try {
      const result = await this.authService.login(loginDto);

      // Set session as HTTP-only cookie
      res.cookie('sb-access-token', result.session, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      });

      return res.json({
        user: result.user,
        message: 'Login successful',
      });
    } catch (error) {
      return res.status(401).json({
        message: 'Login failed',
        error: error.message,
      });
    }
  }

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    try {
      return await this.authService.register(registerDto);
    } catch (error) {
      throw error;
    }
  }

  @UseGuards(AuthGuard)
  @Get('me')
  async getCurrentUser(@Request() req) {
    return {
      user: req.user,
    };
  }

  @UseGuards(AuthGuard)
  @Post('logout')
  async logout(@Request() req, @Res() res: Response) {
    try {
      const sessionId = this.extractSessionFromRequest(req);
      if (sessionId) {
        await this.authService.logout(sessionId);
      }

      // Clear the session cookie
      res.clearCookie('sb-access-token');

      return res.json({
        message: 'Logout successful',
      });
    } catch (error) {
      return res.status(500).json({
        message: 'Logout failed',
        error: error.message,
      });
    }
  }

  @UseGuards(AuthGuard)
  @Post('resend-verification')
  async resendVerification(@Request() req) {
    try {
      const sessionId = this.extractSessionFromRequest(req);
      return await this.authService.resendVerification(sessionId);
    } catch (error) {
      throw error;
    }
  }

  @Post('verify')
  async verifyEmail(@Body() verifyDto: { token: string; type?: string }) {
    try {
      return await this.authService.verifyEmail(verifyDto.token, verifyDto.type || 'email');
    } catch (error) {
      throw error;
    }
  }

  private extractSessionFromRequest(request: any): string | undefined {
    const authHeader = request.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }

    return request.cookies?.['sb-access-token'];
  }
}
