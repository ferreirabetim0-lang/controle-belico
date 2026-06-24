import { Controller, Get, Post, Body, Query, UseGuards, Request } from '@nestjs/common'
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { FinancialService } from './financial.service'

@ApiTags('financial')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('financial')
export class FinancialController {
  constructor(private financialService: FinancialService) {}

  @Get('dashboard')
  getDashboard(@Request() req: any) {
    return this.financialService.getDashboard(req.user.companyId)
  }

  @Get('monthly-history')
  getMonthlyHistory(@Request() req: any) {
    return this.financialService.getMonthlyHistory(req.user.companyId)
  }

  @Get()
  findAll(@Request() req: any, @Query('clientId') clientId?: string) {
    return this.financialService.findAll(req.user.companyId, clientId)
  }

  @Post()
  create(@Request() req: any, @Body() body: any) {
    return this.financialService.create(req.user.companyId, body)
  }
}
