import { Controller, Get, Post, Patch, Delete, Body, Query, Param, UseGuards, Request, HttpCode } from '@nestjs/common'
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
  getDashboard(@Request() req: any, @Query('dateFrom') dateFrom?: string, @Query('dateTo') dateTo?: string) {
    return this.financialService.getDashboard(req.user.companyId, dateFrom, dateTo)
  }

  @Get('monthly-history')
  getMonthlyHistory(@Request() req: any, @Query('dateFrom') dateFrom?: string, @Query('dateTo') dateTo?: string) {
    return this.financialService.getMonthlyHistory(req.user.companyId, dateFrom, dateTo)
  }

  @Get()
  findAll(
    @Request() req: any,
    @Query('clientId') clientId?: string,
    @Query('type') type?: string,
    @Query('status') status?: string,
    @Query('search') search?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
    @Query('category') category?: string,
  ) {
    return this.financialService.findAll(req.user.companyId, { clientId, type, status, search, dateFrom, dateTo, category })
  }

  @Post()
  create(@Request() req: any, @Body() body: any) {
    return this.financialService.create(req.user.companyId, body)
  }

  @Patch(':id')
  update(@Request() req: any, @Param('id') id: string, @Body() body: any) {
    return this.financialService.update(req.user.companyId, id, body)
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@Request() req: any, @Param('id') id: string) {
    return this.financialService.remove(req.user.companyId, id)
  }
}
