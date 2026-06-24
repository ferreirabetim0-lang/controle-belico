import { Injectable, UnauthorizedException } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { ConfigService } from '@nestjs/config'
import { SupabaseService } from '../../../supabase/supabase.service'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    config: ConfigService,
    private sb: SupabaseService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.get('JWT_SECRET'),
    })
  }

  async validate(payload: { sub: string; companyId: string; role: string }) {
    const { data: user } = await this.sb.from('users')
      .select('id, companyId, role, isActive')
      .eq('id', payload.sub).single()

    if (!user || !user.isActive) throw new UnauthorizedException()

    return { userId: user.id, companyId: user.companyId, role: user.role }
  }
}
