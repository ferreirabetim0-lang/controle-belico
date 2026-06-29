import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common'
import * as bcrypt from 'bcrypt'
import { v4 as uuidv4 } from 'uuid'
import { SupabaseService } from '../../supabase/supabase.service'

@Injectable()
export class UsersService {
  constructor(private sb: SupabaseService) {}

  async getMe(userId: string) {
    const { data, error } = await this.sb.from('users')
      .select('id, name, email, phone, avatar, role, createdAt, notificationSettings')
      .eq('id', userId).single()
    if (error || !data) throw new NotFoundException('Usuário não encontrado')
    return data
  }

  async updateMe(userId: string, dto: { name?: string; email?: string; phone?: string; avatar?: string }) {
    // Only send defined fields
    const update: Record<string, any> = { updatedAt: new Date().toISOString() }
    if (dto.name  !== undefined) update['name']  = dto.name
    if (dto.email !== undefined) update['email'] = dto.email
    if (dto.phone !== undefined) update['phone'] = dto.phone
    if (dto.avatar !== undefined) update['avatar'] = dto.avatar

    const { data, error } = await this.sb.from('users')
      .update(update)
      .eq('id', userId)
      .select('id, name, email, phone, avatar, role, createdAt')
      .single()
    if (error) throw new Error(error.message)
    return data
  }

  async uploadAvatar(userId: string, companyId: string, base64: string, mimeType: string) {
    // Ensure bucket exists
    await this.sb.db.storage.createBucket('avatars', { public: true }).catch(() => {})

    const ext = mimeType.includes('png') ? 'png' : 'jpg'
    const path = `${companyId}/${userId}.${ext}`
    const buffer = Buffer.from(base64, 'base64')

    const { error: uploadError } = await this.sb.db.storage
      .from('avatars')
      .upload(path, buffer, { contentType: mimeType, upsert: true })

    if (uploadError) throw new Error(`Erro no upload: ${uploadError.message}`)

    const { data: { publicUrl } } = this.sb.db.storage.from('avatars').getPublicUrl(path)
    const avatarUrl = publicUrl + '?t=' + Date.now()

    await this.sb.from('users')
      .update({ avatar: avatarUrl, updatedAt: new Date().toISOString() })
      .eq('id', userId)

    return { url: avatarUrl }
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const { data: user } = await this.sb.from('users')
      .select('password').eq('id', userId).single()
    if (!user) throw new NotFoundException('Usuário não encontrado')

    const match = await bcrypt.compare(currentPassword, (user as any).password)
    if (!match) throw new BadRequestException('Senha atual incorreta')

    const hashed = await bcrypt.hash(newPassword, 12)
    const { error } = await this.sb.from('users')
      .update({ password: hashed, updatedAt: new Date().toISOString() })
      .eq('id', userId)
    if (error) throw new Error(error.message)

    return { ok: true }
  }

  async getNotificationSettings(userId: string) {
    const { data } = await this.sb.from('users')
      .select('notificationSettings').eq('id', userId).single()

    return (data as any)?.notificationSettings ?? {
      email: true, push: true, whatsapp: false,
      processUpdates: true, documentExpiry: true, teamActivity: false,
    }
  }

  async updateNotificationSettings(userId: string, settings: Record<string, boolean>) {
    const { error } = await this.sb.from('users')
      .update({ notificationSettings: settings, updatedAt: new Date().toISOString() })
      .eq('id', userId)
    if (error) throw new Error(error.message)
    return settings
  }

  // ─── Team ────────────────────────────────────────────────────────────────────

  async listTeam(companyId: string) {
    const { data, error } = await this.sb.from('users')
      .select('id, name, email, phone, avatar, role, isActive, createdAt')
      .eq('companyId', companyId)
      .order('createdAt', { ascending: true })
    if (error) throw new Error(error.message)
    return data ?? []
  }

  async createTeamMember(companyId: string, dto: {
    name: string; email: string; password: string; role?: string; phone?: string
  }) {
    const { data: existing } = await this.sb.from('users')
      .select('id').eq('email', dto.email).maybeSingle()
    if (existing) throw new BadRequestException('E-mail já cadastrado')

    const hashed = await bcrypt.hash(dto.password, 12)
    const now = new Date().toISOString()
    const { data, error } = await this.sb.from('users').insert({
      id: uuidv4(), companyId,
      name: dto.name, email: dto.email,
      password: hashed, phone: dto.phone ?? null,
      role: dto.role ?? 'MEMBER', isActive: true,
      twoFactorEnabled: false, createdAt: now, updatedAt: now,
    }).select('id, name, email, phone, role, isActive, createdAt').single()

    if (error) throw new Error(error.message)
    return data
  }

  async updateTeamMember(companyId: string, id: string, dto: {
    name?: string; email?: string; phone?: string; role?: string; isActive?: boolean
  }) {
    const { data: existing } = await this.sb.from('users')
      .select('id').eq('id', id).eq('companyId', companyId).single()
    if (!existing) throw new NotFoundException('Membro não encontrado')

    const update: Record<string, any> = { updatedAt: new Date().toISOString() }
    if (dto.name     !== undefined) update['name']     = dto.name
    if (dto.email    !== undefined) update['email']    = dto.email
    if (dto.phone    !== undefined) update['phone']    = dto.phone
    if (dto.role     !== undefined) update['role']     = dto.role
    if (dto.isActive !== undefined) update['isActive'] = dto.isActive

    const { data, error } = await this.sb.from('users')
      .update(update).eq('id', id)
      .select('id, name, email, phone, role, isActive, createdAt').single()
    if (error) throw new Error(error.message)
    return data
  }

  async removeTeamMember(companyId: string, id: string) {
    const { data: existing } = await this.sb.from('users')
      .select('id').eq('id', id).eq('companyId', companyId).single()
    if (!existing) throw new NotFoundException('Membro não encontrado')

    const { error } = await this.sb.from('users')
      .update({ isActive: false, updatedAt: new Date().toISOString() })
      .eq('id', id)
    if (error) throw new Error(error.message)
    return { ok: true }
  }
}
