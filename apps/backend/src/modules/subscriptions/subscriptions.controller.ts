import { Controller, Get, Post, Delete, Body, Query, Req, UseGuards, HttpCode } from '@nestjs/common'
import { SubscriptionsService } from './subscriptions.service'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { Request } from 'express'

@Controller('subscriptions')
export class SubscriptionsController {
  constructor(private svc: SubscriptionsService) {}

  @Get('plans')
  listPlans() {
    return this.svc.listPlans()
  }

  @Get('status')
  @UseGuards(JwtAuthGuard)
  getStatus(@Req() req: Request) {
    const user = req.user as any
    return this.svc.getStatus(user.companyId)
  }

  @Post('checkout')
  @UseGuards(JwtAuthGuard)
  createCheckout(@Req() req: Request, @Body() body: { planId: string }) {
    const user = req.user as any
    return this.svc.createCheckout(user.companyId, body.planId, user.email ?? '')
  }

  // MP sends notifications here — no auth guard, raw body
  @Post('webhook')
  @HttpCode(200)
  webhook(@Body() body: any, @Query() query: any, @Req() req: Request) {
    const headers = req.headers as unknown as Record<string, string>
    return this.svc.handleWebhook(body, query, headers)
  }

  @Delete('cancel')
  @UseGuards(JwtAuthGuard)
  cancel(@Req() req: Request) {
    const user = req.user as any
    return this.svc.cancelSubscription(user.companyId)
  }
}
