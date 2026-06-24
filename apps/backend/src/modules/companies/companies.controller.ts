import { Controller, Get, Patch, Body, UseGuards, Request } from '@nestjs/common'
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { CompaniesService } from './companies.service'

@ApiTags('companies')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('companies')
export class CompaniesController {
  constructor(private companiesService: CompaniesService) {}

  @Get('me')
  findMe(@Request() req: any) {
    return this.companiesService.findOne(req.user.companyId)
  }

  @Get('dashboard')
  getDashboard(@Request() req: any) {
    return this.companiesService.getDashboardStats(req.user.companyId)
  }

  @Patch('me')
  update(@Request() req: any, @Body() body: any) {
    return this.companiesService.update(req.user.companyId, body)
  }
}
