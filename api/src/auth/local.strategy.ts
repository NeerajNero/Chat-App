import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from './auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    // We tell Passport to use the 'email' field as the username.
    super({ usernameField: 'email' });
  }

  // This function is automatically called by the AuthGuard('local')
  // It takes the body of the request (a LoginDto)
  async validate(email: string, pass: string): Promise<any> {
    // We'll call a *new* method on our AuthService to do the check.
    // We pass the email and password from the form.
    const user = await this.authService.validateUser(email, pass);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    // Whatever we return here gets attached to req.user
    return user;
  }
}