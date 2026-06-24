import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import * as bcrypt from 'bcrypt'
import { v4 as uuidv4 } from 'uuid'
import { SupabaseService } from '../../supabase/supabase.service'
import { LoginDto } from './dto/login.dto'
import { RegisterDto } from './dto/register.dto'

@Injectable()
export class AuthService {
  constructor(
    private sb: SupabaseService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
    const { data: existingCompany } = await this.sb.from('companies').select('id').eq('slug', dto.slug).single()
    if (existingCompany) throw new ConflictException('Slug já em uso')

    const { data: existingUser } = await this.sb.from('users').select('id').eq('email', dto.email).maybeSingle()
    if (existingUser) throw new ConflictException('E-mail já cadastrado')

    const hashedPassword = await bcrypt.hash(dto.password, 12)
    const { data: starterPlan } = await this.sb.from('plans').select('id').eq('type', 'STARTER').single()

    const companyId = uuidv4()
    const userId = uuidv4()
    const now = new Date().toISOString()

    const { error: companyErr } = await this.sb.from('companies').insert({
      id: companyId, name: dto.companyName, slug: dto.slug,
      email: dto.email, isActive: true, createdAt: now, updatedAt: now,
    })
    if (companyErr) throw new Error(companyErr.message)

    const { error: userErr } = await this.sb.from('users').insert({
      id: userId, companyId, name: dto.name, email: dto.email,
      password: hashedPassword, role: 'ADMIN', isActive: true,
      twoFactorEnabled: false, createdAt: now, updatedAt: now,
    })
    if (userErr) throw new Error(userErr.message)

    if (starterPlan) {
      const trialEnd = new Date(Date.now() + 7 * 86400000).toISOString()
      await this.sb.from('subscriptions').insert({
        id: uuidv4(), companyId, planId: starterPlan.id, status: 'TRIAL',
        trialEndsAt: trialEnd, currentPeriodStart: now, currentPeriodEnd: trialEnd,
        createdAt: now, updatedAt: now,
      })
    }

    return this.generateTokens(userId, companyId, 'ADMIN')
  }

  async login(dto: LoginDto) {
    const { data: user } = await this.sb.from('users')
      .select('*, company:companies(name)')
      .eq('email', dto.email)
      .eq('isActive', true)
      .single()

    if (!user) throw new UnauthorizedException('Credenciais inválidas')

    const passwordMatch = await bcrypt.compare(dto.password, user.password)
    if (!passwordMatch) throw new UnauthorizedException('Credenciais inválidas')

    await this.sb.from('users').update({ lastLoginAt: new Date().toISOString() }).eq('id', user.id)

    return {
      ...await this.generateTokens(user.id, user.companyId, user.role),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        companyId: user.companyId,
        companyName: user.company?.name,
      },
    }
  }

  async refreshToken(token: string) {
    const { data: saved } = await this.sb.from('refresh_tokens').select('*').eq('token', token).single()
    if (!saved || new Date(saved.expiresAt) < new Date()) {
      throw new UnauthorizedException('Token inválido ou expirado')
    }

    const { data: user } = await this.sb.from('users').select('*').eq('id', saved.userId).single()
    if (!user) throw new UnauthorizedException('Usuário não encontrado')

    await this.sb.from('refresh_tokens').delete().eq('token', token)
    return this.generateTokens(user.id, user.companyId, user.role)
  }

  async logout(token: string) {
    await this.sb.from('refresh_tokens').delete().eq('token', token)
  }

  private async generateTokens(userId: string, companyId: string, role: string) {
    const payload = { sub: userId, companyId, role }
    const accessToken = this.jwt.sign(payload)
    const refreshToken = uuidv4()

    await this.sb.from('refresh_tokens').insert({
      id: uuidv4(),
      userId,
      token: refreshToken,
      expiresAt: new Date(Date.now() + 7 * 86400000).toISOString(),
      createdAt: new Date().toISOString(),
    })

    return { accessToken, refreshToken }
  }
}
