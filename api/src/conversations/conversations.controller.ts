// api/src/conversations/conversations.controller.ts
import { Controller, Post, Body, UseGuards, Request, Get, Param } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ConversationsService } from './conversations.service';
import { StartConversationDto } from './dto/start-conversation.dto';

@UseGuards(AuthGuard('jwt'))
@Controller('conversations')
export class ConversationsController {
  constructor(private conversationsService: ConversationsService) {}

  @Post('start')
  startConversation(@Request() req, @Body() body: StartConversationDto) {
    const currentUserId = req.user.id;
    const otherUserId = body.userId;
    return this.conversationsService.findOrCreate(currentUserId, otherUserId);
  }

  @Get(':id/messages')
  getMessages(@Request() req, @Param('id') conversationId: string) {
    const userId = req.user.id;
    return this.conversationsService.getMessages(userId, conversationId);
  }
}