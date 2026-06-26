import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Request } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { LeadsService, CreateLeadDto, UpdateLeadDto, LeadStage } from './leads.service'

@ApiTags('leads')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('leads')
export class LeadsController {
  constructor(private leadsService: LeadsService) {}

  @Get()
  @ApiOperation({ summary: 'Listar todos os leads do funil' })
  findAll(@Request() req: any) {
    return this.leadsService.findAll(req.user.companyId)
  }

  @Post()
  @ApiOperation({ summary: 'Criar novo lead' })
  create(@Request() req: any, @Body() dto: CreateLeadDto) {
    return this.leadsService.create(req.user.companyId, dto)
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar lead' })
  update(@Request() req: any, @Param('id') id: string, @Body() dto: UpdateLeadDto) {
    return this.leadsService.update(req.user.companyId, id, dto)
  }

  @Patch(':id/move')
  @ApiOperation({ summary: 'Mover lead para outro estágio' })
  move(@Request() req: any, @Param('id') id: string, @Body() body: { stage: LeadStage; order: number }) {
    return this.leadsService.moveStage(req.user.companyId, id, body.stage, body.order)
  }

  @Post('reorder')
  @ApiOperation({ summary: 'Reordenar múltiplos leads' })
  reorder(@Request() req: any, @Body() body: { updates: { id: string; stage: LeadStage; order: number }[] }) {
    return this.leadsService.reorder(req.user.companyId, body.updates)
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover lead' })
  remove(@Request() req: any, @Param('id') id: string) {
    return this.leadsService.remove(req.user.companyId, id)
  }
}
