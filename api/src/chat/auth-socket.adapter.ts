// api/src/chat/auth-socket.adapter.ts
import { IoAdapter } from '@nestjs/platform-socket.io';
import { INestApplicationContext } from '@nestjs/common';
import { Server, ServerOptions } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as cookie from 'cookie';
import { AuthenticatedSocket } from './types/chat.types';

export class AuthSocketAdapter extends IoAdapter {
  private readonly jwtService: JwtService;
  private readonly prisma: PrismaService;

  constructor(private app: INestApplicationContext) {
    super(app);
    this.jwtService = this.app.get(JwtService);
    this.prisma = this.app.get(PrismaService);
  }

  createIOServer(port: number, options?: ServerOptions): any {
    const server: Server = super.createIOServer(port, options);

    server.use(async (socket: AuthenticatedSocket, next) => {
      console.log('--- New WebSocket Connection Attempt ---');
      try {
        // 1. Get the cookie string
        const cookieString = socket.handshake.headers.cookie;
        if (!cookieString) {
          console.error('Auth Error: No cookie string provided.');
          return next(new Error('Authentication error: No cookie provided.'));
        }
        console.log('Found cookie header:', cookieString);

        // 2. Parse the 'access_token'
        const parsedCookies = cookie.parse(cookieString);
        const token = parsedCookies['access_token'];
        if (!token) {
          console.error('Auth Error: "access_token" not found in cookies.');
          return next(new Error('Authentication error: No access token.'));
        }
        console.log('Extracted token:', token.substring(0, 10) + '...');

        // 3. Verify the JWT
        console.log('Verifying token...');
        const payload = this.jwtService.verify(token, {
          secret: process.env.JWT_SECRET,
        });
        console.log('Token valid. Payload:', payload);

        // 4. Find the user
        console.log(`Finding user with ID: ${payload.sub}`);
        const user = await this.prisma.user.findUnique({
          where: { id: payload.sub },
        });

        if (!user) {
          console.error('Auth Error: User not found in database.');
          return next(new Error('Authentication error: User not found.'));
        }
        console.log('User found:', user.email);

        // 5. ATTACH THE USER
        socket.user = user;
        console.log('--- Authentication Successful ---');
        next(); // Handshake successful!
      } catch (error) {
        console.error('Auth Error (Catch Block):', error.message);
        next(new Error('Authentication error: Invalid token.'));
      }
    });

    return server;
  }
}