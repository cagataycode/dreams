import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase.service';
import { LoginDto, RegisterDto, AuthResponse } from './auth.dto';

@Injectable()
export class AuthService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async login(loginDto: LoginDto): Promise<AuthResponse> {
    try {
      console.log('Attempting login with email:', loginDto.email);

      const { data, error } = await this.supabaseService
        .getClient()
        .auth.signInWithPassword({
          email: loginDto.email,
          password: loginDto.password,
        });

      if (error) {
        throw error;
      }

      if (!data.session || !data.user) {
        throw new Error('Login failed: No session or user returned');
      }

      console.log('Session created successfully:', data.session.access_token);
      console.log('User details retrieved:', data.user.id, data.user.email);

      return {
        user: data.user,
        session: data.session.access_token,
      };
    } catch (error) {
      console.error('Detailed login error:', error);
      throw new Error(`Login failed: ${error.message}`);
    }
  }

  async register(registerDto: RegisterDto): Promise<{ message: string }> {
    try {
      const { data, error } = await this.supabaseService
        .getClient()
        .auth.signUp({
          email: registerDto.email,
          password: registerDto.password,
          options: {
            data: {
              name: registerDto.name,
            },
          },
        });

      if (error) {
        throw error;
      }

      return {
        message:
          'Account created! Please check your email for verification link.',
      };
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  async logout(accessToken: string): Promise<{ message: string }> {
    try {
      const supabase = this.supabaseService.getClient();
      await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: '',
      });

      const { error } = await supabase.auth.signOut();

      if (error) {
        throw error;
      }

      return {
        message: 'Logged out successfully',
      };
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  }

  async getCurrentUser(accessToken: string): Promise<any> {
    try {
      const supabase = this.supabaseService.getClient();
      supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: '',
      });

      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error) {
        throw error;
      }

      return user;
    } catch (error) {
      console.error('Get user error:', error);
      throw error;
    }
  }

  async resendVerification(accessToken: string): Promise<{ message: string }> {
    try {
      const supabase = this.supabaseService.getClient();
      await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: '',
      });

      // Get user to get their email
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        throw new Error('User not found');
      }

      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: user.email!,
      });

      if (error) {
        throw error;
      }

      return {
        message: 'Verification email sent',
      };
    } catch (error) {
      console.error('Resend verification error:', error);
      throw error;
    }
  }

  async verifyEmail(
    token: string,
    type: string = 'email',
  ): Promise<{ message: string }> {
    try {
      const { error } = await this.supabaseService.getClient().auth.verifyOtp({
        token_hash: token,
        type: type as any,
      });

      if (error) {
        throw error;
      }

      return {
        message: 'Email verified successfully! You can now sign in.',
      };
    } catch (error) {
      console.error('Email verification error:', error);
      throw error;
    }
  }
}
