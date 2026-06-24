import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards, Request } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { ProcessesService } from './processes.service'

@ApiTags('processes')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('processes')
export class ProcessesController {
  constructor(private processesService: ProcessesService) {}

  @Get()
  @ApiOperation({ summary: 'Listar processos' })
  findAll(@Request() req: any, @Query('clientId') clientId?: string) {
    return this.processesService.findAll(req.user.companyId, clientId)
  }

  @Post()
  @ApiOperation({ summary: 'Criar processo (CR, CRAF ou GT)' })
  create(@Request() req: any, @Body() body: { clientId: string; type: 'CR' | 'CRAF' | 'GT' }) {
    return this.processesService.createProcess(req.user.companyId, body.clientId, body.type)
  }

  @Patch(':id/steps/:stepKey')
  @ApiOperation({ summary: 'Marcar etapa como concluída' })
  completeStep(@Request() req: any, @Param('id') id: string, @Param('stepKey') stepKey: string) {
    return this.processesService.completeStep(req.user.companyId, id, stepKey, req.user.userId)
  }
}
