import {
  Controller, Get, Post, Patch, Delete, Body, Param, Query,
  UseGuards, Request, UseInterceptors, UploadedFile, BadRequestException,
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { ProcessesService, StepMetadata } from './processes.service'

@ApiTags('processes')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('processes')
export class ProcessesController {
  constructor(private processesService: ProcessesService) {}

  @Get()
  @ApiOperation({ summary: 'Listar processos' })
  findAll(
    @Request() req: any,
    @Query('clientId') clientId?: string,
    @Query('type') type?: string,
    @Query('status') status?: string,
  ) {
    return this.processesService.findAll(req.user.companyId, { clientId, type, status })
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

  @Delete(':id/steps/:stepKey/complete')
  @ApiOperation({ summary: 'Desmarcar etapa (reverter conclusão)' })
  uncompleteStep(@Request() req: any, @Param('id') id: string, @Param('stepKey') stepKey: string) {
    return this.processesService.uncompleteStep(req.user.companyId, id, stepKey, req.user.userId)
  }

  @Patch(':id/steps/:stepKey/metadata')
  @ApiOperation({ summary: 'Salvar metadata da etapa (datas, senha, certidões, etc.)' })
  updateMetadata(
    @Request() req: any,
    @Param('id') id: string,
    @Param('stepKey') stepKey: string,
    @Body() body: StepMetadata,
  ) {
    return this.processesService.updateStepMetadata(req.user.companyId, id, stepKey, body, req.user.userId)
  }

  @Post(':id/steps/:stepKey/upload')
  @ApiOperation({ summary: 'Upload de arquivo para etapa do processo' })
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @Request() req: any,
    @Param('id') id: string,
    @Param('stepKey') stepKey: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) throw new BadRequestException('Arquivo obrigatório')
    const allowed = ['application/pdf', 'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/png', 'image/jpeg']
    if (!allowed.includes(file.mimetype)) throw new BadRequestException('Tipo de arquivo não permitido')
    return this.processesService.uploadStepFile(
      req.user.companyId, id, stepKey, file.originalname, file.buffer, file.mimetype, req.user.userId,
    )
  }

  @Delete(':id/steps/:stepKey/files/:fileId')
  @ApiOperation({ summary: 'Excluir arquivo de etapa do processo' })
  deleteFile(
    @Request() req: any,
    @Param('id') id: string,
    @Param('stepKey') stepKey: string,
    @Param('fileId') fileId: string,
  ) {
    return this.processesService.deleteStepFile(req.user.companyId, id, stepKey, fileId)
  }
}
