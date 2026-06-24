import { Injectable } from '@nestjs/common'
import { SupabaseService } from '../../supabase/supabase.service'
import { v4 as uuidv4 } from 'uuid'

@Injectable()
export class DocumentsService {
  constructor(private sb: SupabaseService) {}

  async findByClient(companyId: string, clientId: string) {
    const { data, error } = await this.sb.from('documents')
      .select('*').eq('clientId', clientId).order('uploadedAt', { ascending: false })
    if (error) throw new Error(error.message)
    return data ?? []
  }

  async create(dto: { clientId: string; category: string; name: string; fileUrl: string; fileKey: string; mimeType: string; fileSize: number; expiresAt?: string }) {
    const { data, error } = await this.sb.from('documents')
      .insert({ id: uuidv4(), ...dto, status: 'RECEIVED', uploadedAt: new Date().toISOString() })
      .select().single()
    if (error) throw new Error(error.message)
    return data
  }

  async getExpiringDocuments(companyId: string, daysAhead = 30) {
    const today = new Date().toISOString()
    const limit = new Date(Date.now() + daysAhead * 86400000).toISOString()

    const { data, error } = await this.sb.from('documents')
      .select('*, client:clients!inner(name, whatsapp, companyId)')
      .eq('clients.companyId', companyId)
      .gte('expiresAt', today).lte('expiresAt', limit)
      .order('expiresAt', { ascending: true })
    if (error) throw new Error(error.message)
    return data ?? []
  }
}
