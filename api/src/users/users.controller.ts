// api/src/users/users.controller.ts
import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UsersService } from './users.service';

@UseGuards(AuthGuard('jwt')) // Protect all routes in this controller
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  getAllUsers(@Request() req) {
    // req.user is attached by the JwtStrategy
    return this.usersService.getAllUsers(req.user.id);
  }
}