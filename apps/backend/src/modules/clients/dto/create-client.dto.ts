import { IsString, IsOptional, IsEmail, IsDateString, IsArray } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class CreateClientDto {
  @ApiProperty()
  @IsString()
  name: string

  @ApiProperty()
  @IsString()
  cpf: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  rg?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  birthDate?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  phone?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  whatsapp?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsEmail()
  email?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  city?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  state?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  zipCode?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  address?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  profession?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  leadSource?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  observations?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  tags?: string[]

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  responsibleId?: string
}
