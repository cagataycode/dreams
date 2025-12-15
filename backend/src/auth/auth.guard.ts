import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { SupabaseService } from '../supabase.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly supabaseService: SupabaseService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    try {
      // Extract access token from cookies or headers
      const accessToken = this.extractTokenFromRequest(request);

      if (!accessToken) {
        throw new UnauthorizedException('No access token found');
      }

      // Verify the token and get user
      const supabase = this.supabaseService.getClient();
      const { data: { user }, error } = await supabase.auth.getUser(accessToken);

      if (error || !user) {
        throw new UnauthorizedException(`Invalid token: ${error?.message || 'User not found'}`);
      }

      // Attach user to request for use in controllers
      request.user = user;

      return true;
    } catch (error) {
      console.error('Auth error:', error);
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException(`Invalid session: ${error.message}`);
    }
  }

  private extractTokenFromRequest(request: any): string | undefined {
    // Try to get token from Authorization header
    const authHeader = request.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }

    // Check for Supabase session cookie
    const possibleCookieNames = [
      'sb-access-token',
      'supabase-auth-token',
      'access_token',
    ];

    for (const cookieName of possibleCookieNames) {
      const cookieValue = request.cookies?.[cookieName];
      if (cookieValue) {
        return cookieValue;
      }
    }

    return undefined;
  }
}