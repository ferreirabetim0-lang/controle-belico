import { Injectable, NotFoundException } from '@nestjs/common'
import { SupabaseService } from '../../supabase/supabase.service'

@Injectable()
export class SignaturesService {
  constructor(private sb: SupabaseService) {}

  async findAll(companyId: string, filters: { status?: string; search?: string; clientId?: string }) {
    let q = this.sb.from('document_signatures')
      .select('*, client:clients(id, name, phone)')
      .eq('companyId', companyId)
      .order('createdAt', { ascending: false })

    if (filters.status) q = q.eq('status', filters.status) as any
    if (filters.clientId) q = q.eq('clientId', filters.clientId) as any

    const { data, error } = await q
    if (error) throw new Error(error.message)

    let rows = data ?? []
    if (filters.search) {
      const q2 = filters.search.toLowerCase()
      rows = rows.filter((r: any) =>
        r.document?.toLowerCase().includes(q2) ||
        r.client?.name?.toLowerCase().includes(q2)
      )
    }
    return rows
  }

  async create(companyId: string, dto: { clientId: string; document: string }) {
    // Ensure the table exists — will fail gracefully if it doesn't
    const { data, error } = await this.sb.from('document_signatures').insert({
      companyId,
      clientId: dto.clientId,
      document: dto.document,
      status: 'PENDING',
      sentAt: new Date().toISOString(),
    }).select('*, client:clients(id, name, phone)').single()

    if (error) throw new Error(error.message)
    return data
  }

  async update(companyId: string, id: string, dto: { status?: string; signedAt?: string | null }) {
    const { data: existing } = await this.sb.from('document_signatures')
      .select('id').eq('id', id).eq('companyId', companyId).single()
    if (!existing) throw new NotFoundException('Assinatura não encontrada')

    const patch: Record<string, unknown> = { updatedAt: new Date().toISOString() }
    if (dto.status !== undefined) patch.status = dto.status
    if (dto.signedAt !== undefined) patch.signedAt = dto.signedAt
    if (dto.status === 'SIGNED' && !dto.signedAt) patch.signedAt = new Date().toISOString()

    const { data, error } = await this.sb.from('document_signatures')
      .update(patch).eq('id', id).select('*, client:clients(id, name, phone)').single()
    if (error) throw new Error(error.message)
    return data
  }

  async remove(companyId: string, id: string) {
    const { data: existing } = await this.sb.from('document_signatures')
      .select('id').eq('id', id).eq('companyId', companyId).single()
    if (!existing) throw new NotFoundException('Assinatura não encontrada')

    const { error } = await this.sb.from('document_signatures').delete().eq('id', id)
    if (error) throw new Error(error.message)
  }
}
