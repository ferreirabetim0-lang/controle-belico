import { Controller, Get, Param, UseGuards, Request, Query } from '@nestjs/common'
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { DocumentsService } from './documents.service'

@ApiTags('documents')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('documents')
export class DocumentsController {
  constructor(private documentsService: DocumentsService) {}

  @Get('client/:clientId')
  findByClient(@Request() req: any, @Param('clientId') clientId: string) {
    return this.documentsService.findByClient(req.user.companyId, clientId)
  }

  @Get('expiring')
  getExpiring(@Request() req: any, @Query('days') days?: number) {
    return this.documentsService.getExpiringDocuments(req.user.companyId, days)
  }
}
