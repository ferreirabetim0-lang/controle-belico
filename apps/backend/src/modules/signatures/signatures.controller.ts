import { Controller, Get, Post, Patch, Delete, Body, Query, Param, UseGuards, Request, HttpCode } from '@nestjs/common'
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { SignaturesService } from './signatures.service'

@ApiTags('signatures')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('signatures')
export class SignaturesController {
  constructor(private signaturesService: SignaturesService) {}

  @Get()
  findAll(
    @Request() req: any,
    @Query('status') status?: string,
    @Query('search') search?: string,
    @Query('clientId') clientId?: string,
  ) {
    return this.signaturesService.findAll(req.user.companyId, { status, search, clientId })
  }

  @Post()
  create(@Request() req: any, @Body() body: { clientId: string; document: string }) {
    return this.signaturesService.create(req.user.companyId, body)
  }

  @Patch(':id')
  update(@Request() req: any, @Param('id') id: string, @Body() body: { status?: string; signedAt?: string | null }) {
    return this.signaturesService.update(req.user.companyId, id, body)
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@Request() req: any, @Param('id') id: string) {
    return this.signaturesService.remove(req.user.companyId, id)
  }
}
