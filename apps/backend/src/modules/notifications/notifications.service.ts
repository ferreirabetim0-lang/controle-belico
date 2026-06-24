import { Injectable } from '@nestjs/common'
import { SupabaseService } from '../../supabase/supabase.service'
import { v4 as uuidv4 } from 'uuid'

@Injectable()
export class NotificationsService {
  constructor(private sb: SupabaseService) {}

  async findAll(companyId: string) {
    const { data, error } = await this.sb.from('notifications')
      .select('*, client:clients(name)').eq('companyId', companyId)
      .neq('status', 'DISMISSED').order('createdAt', { ascending: false }).limit(50)
    if (error) throw new Error(error.message)
    return data ?? []
  }

  async markAsRead(id: string) {
    const { data, error } = await this.sb.from('notifications')
      .update({ status: 'READ', readAt: new Date().toISOString() })
      .eq('id', id).select().single()
    if (error) throw new Error(error.message)
    return data
  }

  async create(dto: { companyId: string; clientId?: string; type: string; title: string; message: string; dueDate?: Date }) {
    const { data, error } = await this.sb.from('notifications').insert({
      id: uuidv4(), ...dto, status: 'UNREAD', createdAt: new Date().toISOString(),
    }).select().single()
    if (error) throw new Error(error.message)
    return data
  }
}
