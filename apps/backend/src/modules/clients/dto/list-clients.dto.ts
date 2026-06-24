import { IsOptional, IsString, IsNumberString } from 'class-validator'
import { ApiPropertyOptional } from '@nestjs/swagger'
import { Type } from 'class-transformer'

export class ListClientsDto {
  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  page?: number

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  limit?: number

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  status?: string
}
