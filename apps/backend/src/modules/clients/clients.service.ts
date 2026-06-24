import { Injectable, NotFoundException } from '@nestjs/common'
import { SupabaseService } from '../../supabase/supabase.service'
import { CreateClientDto } from './dto/create-client.dto'
import { UpdateClientDto } from './dto/update-client.dto'
import { ListClientsDto } from './dto/list-clients.dto'
import { v4 as uuidv4 } from 'uuid'

@Injectable()
export class ClientsService {
  constructor(private sb: SupabaseService) {}

  async findAll(companyId: string, query: ListClientsDto) {
    const { page = 1, limit = 20, search, status } = query
    const from = (page - 1) * limit
    const to = from + limit - 1

    let q = this.sb.from('clients').select('*, responsible:users!responsibleId(name)', { count: 'exact' })
      .eq('companyId', companyId).eq('isActive', true)

    if (status) q = q.eq('status', status)
    if (search) q = q.or(`name.ilike.%${search}%,cpf.ilike.%${search}%,email.ilike.%${search}%`)

    const { data, count, error } = await q.order('createdAt', { ascending: false }).range(from, to)
    if (error) throw new Error(error.message)

    return {
      data: data ?? [],
      meta: { total: count ?? 0, page, limit, totalPages: Math.ceil((count ?? 0) / limit) },
    }
  }

  async findOne(companyId: string, id: string) {
    const { data, error } = await this.sb.from('clients')
      .select('*, documents(*), processes(*, steps:process_steps(*)), transactions:financial_transactions(*), timeline:client_timeline(*), responsible:users!responsibleId(name)')
      .eq('id', id).eq('companyId', companyId).eq('isActive', true).single()

    if (error || !data) throw new NotFoundException('Cliente não encontrado')
    return data
  }

  async create(companyId: string, userId: string, dto: CreateClientDto) {
    const now = new Date().toISOString()
    const id = uuidv4()

    const { data, error } = await this.sb.from('clients').insert({
      id, ...dto, companyId, tags: [], isActive: true, createdAt: now, updatedAt: now,
    }).select().single()

    if (error) throw new Error(error.message)

    await this.sb.from('client_timeline').insert({
      id: uuidv4(), clientId: id, type: 'created',
      title: 'Cliente cadastrado', createdBy: userId, createdAt: now,
    })

    return data
  }

  async update(companyId: string, id: string, dto: UpdateClientDto) {
    await this.findOne(companyId, id)
    const { data, error } = await this.sb.from('clients')
      .update({ ...dto, updatedAt: new Date().toISOString() })
      .eq('id', id).select().single()

    if (error) throw new Error(error.message)
    return data
  }

  async archive(companyId: string, id: string) {
    await this.findOne(companyId, id)
    const { data, error } = await this.sb.from('clients')
      .update({ isActive: false, updatedAt: new Date().toISOString() })
      .eq('id', id).select().single()

    if (error) throw new Error(error.message)
    return data
  }

  async getTimeline(companyId: string, id: string) {
    await this.findOne(companyId, id)
    const { data, error } = await this.sb.from('client_timeline')
      .select('*').eq('clientId', id).order('createdAt', { ascending: false })

    if (error) throw new Error(error.message)
    return data ?? []
  }

  async getPendencies(companyId: string) {
    const { data: clients } = await this.sb.from('clients')
      .select('id, name, documents(*)')
      .eq('companyId', companyId).eq('isActive', true)

    const pendencies: Record<string, string[]> = {
      NO_PHOTO: [], NO_PROOF_OF_INCOME: [], NO_PROOF_OF_RESIDENCE: [],
      NO_RG_CNH: [], NO_CERTIFICATIONS: [], NO_CLUB_MEMBERSHIP: [],
      EXPIRING_PSYCH_EXAM: [], EXPIRING_SHOOTING_EXAM: [],
      EXPIRING_CR: [], EXPIRING_CRAF: [],
    }

    const in30days = new Date(Date.now() + 30 * 86400000)

    for (const client of clients ?? []) {
      const docs: any[] = (client as any).documents ?? []
      const hasDoc = (cat: string) => docs.some((d) => d.category === cat)
      const getDoc = (cat: string) => docs.find((d) => d.category === cat)

      if (!hasDoc('PHOTO_3X4')) pendencies.NO_PHOTO.push(client.name)
      if (!hasDoc('PROOF_OF_INCOME')) pendencies.NO_PROOF_OF_INCOME.push(client.name)
      if (!hasDoc('PROOF_OF_RESIDENCE')) pendencies.NO_PROOF_OF_RESIDENCE.push(client.name)
      if (!hasDoc('RG') && !hasDoc('CNH')) pendencies.NO_RG_CNH.push(client.name)
      if (!hasDoc('CERTIFICATIONS')) pendencies.NO_CERTIFICATIONS.push(client.name)
      if (!hasDoc('CLUB_MEMBERSHIP')) pendencies.NO_CLUB_MEMBERSHIP.push(client.name)

      const checkExpiring = (cat: string, key: string) => {
        const d = getDoc(cat)
        if (d?.expiresAt && new Date(d.expiresAt) <= in30days) pendencies[key].push(client.name)
      }
      checkExpiring('PSYCHOLOGICAL_EXAM', 'EXPIRING_PSYCH_EXAM')
      checkExpiring('SHOOTING_EXAM', 'EXPIRING_SHOOTING_EXAM')
      checkExpiring('CR', 'EXPIRING_CR')
      checkExpiring('CRAF', 'EXPIRING_CRAF')
    }

    return pendencies
  }

  async getRenewalRadar(companyId: string) {
    const today = new Date().toISOString()
    const in60days = new Date(Date.now() + 60 * 86400000).toISOString()
    const oneYearAgo = new Date(Date.now() - 365 * 86400000).toISOString()

    const [{ count: crExpiring }, { count: crafExpiring }, { count: potentialRebuyers }] = await Promise.all([
      this.sb.from('documents').select('id', { count: 'exact', head: true })
        .eq('category', 'CR').gte('expiresAt', today).lte('expiresAt', in60days),
      this.sb.from('documents').select('id', { count: 'exact', head: true })
        .eq('category', 'CRAF').gte('expiresAt', today).lte('expiresAt', in60days),
      this.sb.from('clients').select('id', { count: 'exact', head: true })
        .eq('companyId', companyId).eq('status', 'COMPLETED').lte('updatedAt', oneYearAgo),
    ])

    return {
      crExpiringSoon: crExpiring ?? 0,
      crafExpiringSoon: crafExpiring ?? 0,
      potentialRebuyers: potentialRebuyers ?? 0,
    }
  }
}
