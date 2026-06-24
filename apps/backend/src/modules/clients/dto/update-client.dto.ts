import { PartialType } from '@nestjs/swagger'
import { CreateClientDto } from './create-client.dto'
import { IsOptional, IsString } from 'class-validator'

export class UpdateClientDto extends PartialType(CreateClientDto) {
  @IsOptional()
  @IsString()
  status?: string
}
