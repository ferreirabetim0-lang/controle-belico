import {
  Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, Request,
} from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { ClientsService } from './clients.service'
import { CreateClientDto } from './dto/create-client.dto'
import { UpdateClientDto } from './dto/update-client.dto'
import { ListClientsDto } from './dto/list-clients.dto'

@ApiTags('clients')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('clients')
export class ClientsController {
  constructor(private clientsService: ClientsService) {}

  @Get()
  @ApiOperation({ summary: 'Listar clientes da empresa' })
  findAll(@Request() req: any, @Query() query: ListClientsDto) {
    return this.clientsService.findAll(req.user.companyId, query)
  }

  @Get('pendencies')
  @ApiOperation({ summary: 'Central de Pendências — identificar clientes com pendências' })
  getPendencies(@Request() req: any) {
    return this.clientsService.getPendencies(req.user.companyId)
  }

  @Get('radar')
  @ApiOperation({ summary: 'Radar de Renovação — oportunidades identificadas' })
  getRadar(@Request() req: any) {
    return this.clientsService.getRenewalRadar(req.user.companyId)
  }

  @Get('radar-items')
  @ApiOperation({ summary: 'Radar de Renovação — itens detalhados com vencimentos' })
  getRadarItems(@Request() req: any) {
    return this.clientsService.getRadarItems(req.user.companyId)
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detalhes de um cliente' })
  findOne(@Request() req: any, @Param('id') id: string) {
    return this.clientsService.findOne(req.user.companyId, id)
  }

  @Post()
  @ApiOperation({ summary: 'Criar novo cliente' })
  create(@Request() req: any, @Body() dto: CreateClientDto) {
    return this.clientsService.create(req.user.companyId, req.user.userId, dto)
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar cliente' })
  update(@Request() req: any, @Param('id') id: string, @Body() dto: UpdateClientDto) {
    return this.clientsService.update(req.user.companyId, id, dto)
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Arquivar cliente' })
  remove(@Request() req: any, @Param('id') id: string) {
    return this.clientsService.archive(req.user.companyId, id)
  }

  @Get(':id/timeline')
  @ApiOperation({ summary: 'Timeline completa do cliente' })
  getTimeline(@Request() req: any, @Param('id') id: string) {
    return this.clientsService.getTimeline(req.user.companyId, id)
  }
}
