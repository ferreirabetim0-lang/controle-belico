import { Injectable, NotFoundException } from '@nestjs/common'
import { SupabaseService } from '../../supabase/supabase.service'
import { v4 as uuidv4 } from 'uuid'

export type LeadStage = 'NOVO' | 'CONTATO' | 'PROPOSTA' | 'NEGOCIACAO' | 'FECHADO' | 'PERDIDO'

export interface CreateLeadDto {
  name: string
  phone?: string
  email?: string
  city?: string
  source?: string
  value?: number
  notes?: string
  stage?: LeadStage
}

export interface UpdateLeadDto extends Partial<CreateLeadDto> {
  stage?: LeadStage
  order?: number
}

@Injectable()
export class LeadsService {
  constructor(private sb: SupabaseService) {}

  async findAll(companyId: string) {
    const { data, error } = await this.sb
      .from('leads')
      .select('*')
      .eq('companyId', companyId)
      .order('order', { ascending: true })
      .order('createdAt', { ascending: false })
    if (error) throw new Error(error.message)
    return data ?? []
  }

  async create(companyId: string, dto: CreateLeadDto) {
    const { count } = await this.sb
      .from('leads')
      .select('id', { count: 'exact', head: true })
      .eq('companyId', companyId)
      .eq('stage', dto.stage ?? 'NOVO')

    const { data, error } = await this.sb
      .from('leads')
      .insert({
        id: uuidv4(),
        companyId,
        name: dto.name,
        phone: dto.phone ?? null,
        email: dto.email ?? null,
        city: dto.city ?? null,
        source: dto.source ?? null,
        value: dto.value ?? null,
        notes: dto.notes ?? null,
        stage: dto.stage ?? 'NOVO',
        order: (count ?? 0),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      .select()
      .single()
    if (error) throw new Error(error.message)
    return data
  }

  async update(companyId: string, id: string, dto: UpdateLeadDto) {
    const { data, error } = await this.sb
      .from('leads')
      .update({ ...dto, updatedAt: new Date().toISOString() })
      .eq('id', id)
      .eq('companyId', companyId)
      .select()
      .single()
    if (error) throw new Error(error.message)
    if (!data) throw new NotFoundException('Lead não encontrado')
    return data
  }

  async moveStage(companyId: string, id: string, stage: LeadStage, order: number) {
    const { data, error } = await this.sb
      .from('leads')
      .update({ stage, order, updatedAt: new Date().toISOString() })
      .eq('id', id)
      .eq('companyId', companyId)
      .select()
      .single()
    if (error) throw new Error(error.message)
    if (!data) throw new NotFoundException('Lead não encontrado')
    return data
  }

  async reorder(companyId: string, updates: { id: string; stage: LeadStage; order: number }[]) {
    const promises = updates.map(({ id, stage, order }) =>
      this.sb.from('leads')
        .update({ stage, order, updatedAt: new Date().toISOString() })
        .eq('id', id)
        .eq('companyId', companyId)
    )
    await Promise.all(promises)
    return { ok: true }
  }

  async remove(companyId: string, id: string) {
    const { error } = await this.sb
      .from('leads')
      .delete()
      .eq('id', id)
      .eq('companyId', companyId)
    if (error) throw new Error(error.message)
  }
}
