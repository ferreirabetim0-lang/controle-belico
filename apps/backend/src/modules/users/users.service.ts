import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common'
import * as bcrypt from 'bcrypt'
import { v4 as uuidv4 } from 'uuid'
import { SupabaseService } from '../../supabase/supabase.service'

@Injectable()
export class UsersService {
  constructor(private sb: SupabaseService) {}

  async getMe(userId: string) {
    const { data, error } = await this.sb.from('users')
      .select('id, name, email, phone, avatar, role, notificationSettings, createdAt')
      .eq('id', userId).single()
    if (error || !data) throw new NotFoundException('Usuário não encontrado')
    return data
  }

  async updateMe(userId: string, dto: { name?: string; email?: string; phone?: string; avatar?: string }) {
    const { data, error } = await this.sb.from('users')
      .update({ ...dto, updatedAt: new Date().toISOString() })
      .eq('id', userId)
      .select('id, name, email, phone, avatar, role, notificationSettings, createdAt')
      .single()
    if (error) throw new Error(error.message)
    return data
  }

  async uploadAvatar(userId: string, companyId: string, base64: string, mimeType: string) {
    const ext = mimeType.includes('png') ? 'png' : 'jpg'
    const path = `${companyId}/${userId}.${ext}`
    const buffer = Buffer.from(base64, 'base64')

    const { error } = await this.sb.db.storage
      .from('avatars')
      .upload(path, buffer, { contentType: mimeType, upsert: true })

    if (error) throw new Error(error.message)

    const { data: { publicUrl } } = this.sb.db.storage.from('avatars').getPublicUrl(path)

    await this.sb.from('users')
      .update({ avatar: publicUrl + '?t=' + Date.now(), updatedAt: new Date().toISOString() })
      .eq('id', userId)

    return { url: publicUrl }
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const { data: user } = await this.sb.from('users').select('password').eq('id', userId).single()
    if (!user) throw new NotFoundException('Usuário não encontrado')

    const match = await bcrypt.compare(currentPassword, user.password)
    if (!match) throw new BadRequestException('Senha atual incorreta')

    const hashed = await bcrypt.hash(newPassword, 12)
    await this.sb.from('users')
      .update({ password: hashed, updatedAt: new Date().toISOString() })
      .eq('id', userId)

    return { ok: true }
  }

  async getNotificationSettings(userId: string) {
    const { data } = await this.sb.from('users')
      .select('notificationSettings').eq('id', userId).single()
    return (data as any)?.notificationSettings ?? {}
  }

  async updateNotificationSettings(userId: string, settings: Record<string, boolean>) {
    const { data } = await this.sb.from('users')
      .update({ notificationSettings: settings, updatedAt: new Date().toISOString() })
      .eq('id', userId)
      .select('notificationSettings').single()
    return (data as any)?.notificationSettings ?? settings
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

  async createTeamMember(companyId: string, dto: { name: string; email: string; password: string; role?: string; phone?: string }) {
    const { data: existing } = await this.sb.from('users').select('id').eq('email', dto.email).maybeSingle()
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

  async updateTeamMember(companyId: string, id: string, dto: { name?: string; email?: string; phone?: string; role?: string; isActive?: boolean }) {
    const { data: existing } = await this.sb.from('users').select('id').eq('id', id).eq('companyId', companyId).single()
    if (!existing) throw new NotFoundException('Membro não encontrado')

    const { data, error } = await this.sb.from('users')
      .update({ ...dto, updatedAt: new Date().toISOString() })
      .eq('id', id)
      .select('id, name, email, phone, role, isActive, createdAt').single()
    if (error) throw new Error(error.message)
    return data
  }

  async removeTeamMember(companyId: string, id: string) {
    const { data: existing } = await this.sb.from('users').select('id').eq('id', id).eq('companyId', companyId).single()
    if (!existing) throw new NotFoundException('Membro não encontrado')

    await this.sb.from('users')
      .update({ isActive: false, updatedAt: new Date().toISOString() })
      .eq('id', id)
    return { ok: true }
  }
}
