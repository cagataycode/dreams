export class LoginDto {
  email: string;
  password: string;
}

export class RegisterDto {
  name: string;
  email: string;
  password: string;
}

export class AuthResponse {
  user: any;
  session: string;
}