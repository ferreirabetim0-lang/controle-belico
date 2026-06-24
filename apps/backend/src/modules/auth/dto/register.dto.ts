import { IsEmail, IsString, MinLength, Matches } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class RegisterDto {
  @ApiProperty({ example: 'João Silva' })
  @IsString()
  name: string

  @ApiProperty({ example: 'Despachante Bélico LTDA' })
  @IsString()
  companyName: string

  @ApiProperty({ example: 'despachante-belico' })
  @IsString()
  @Matches(/^[a-z0-9-]+$/, { message: 'Slug deve conter apenas letras minúsculas, números e hífens' })
  slug: string

  @ApiProperty({ example: 'admin@empresa.com' })
  @IsEmail()
  email: string

  @ApiProperty({ example: 'senha123' })
  @IsString()
  @MinLength(8)
  password: string
}
