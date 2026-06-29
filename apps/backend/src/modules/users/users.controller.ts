import { Controller, Get, Patch, Post, Delete, Body, Param, UseGuards, Request, HttpCode } from '@nestjs/common'
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { UsersService } from './users.service'

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('me')
  getMe(@Request() req: any) {
    return this.usersService.getMe(req.user.sub)
  }

  @Patch('me')
  updateMe(@Request() req: any, @Body() body: any) {
    const { name, email, phone, avatar } = body
    return this.usersService.updateMe(req.user.sub, { name, email, phone, avatar })
  }

  @Post('me/avatar')
  uploadAvatar(@Request() req: any, @Body() body: { base64: string; mimeType: string }) {
    return this.usersService.uploadAvatar(req.user.sub, req.user.companyId, body.base64, body.mimeType)
  }

  @Post('me/change-password')
  changePassword(@Request() req: any, @Body() body: { currentPassword: string; newPassword: string }) {
    return this.usersService.changePassword(req.user.sub, body.currentPassword, body.newPassword)
  }

  @Get('me/settings')
  getSettings(@Request() req: any) {
    return this.usersService.getNotificationSettings(req.user.sub)
  }

  @Patch('me/settings')
  updateSettings(@Request() req: any, @Body() body: Record<string, boolean>) {
    return this.usersService.updateNotificationSettings(req.user.sub, body)
  }

  @Get('team')
  listTeam(@Request() req: any) {
    return this.usersService.listTeam(req.user.companyId)
  }

  @Post('team')
  createMember(@Request() req: any, @Body() body: any) {
    return this.usersService.createTeamMember(req.user.companyId, body)
  }

  @Patch('team/:id')
  updateMember(@Request() req: any, @Param('id') id: string, @Body() body: any) {
    return this.usersService.updateTeamMember(req.user.companyId, id, body)
  }

  @Delete('team/:id')
  @HttpCode(200)
  removeMember(@Request() req: any, @Param('id') id: string) {
    return this.usersService.removeTeamMember(req.user.companyId, id)
  }
}
