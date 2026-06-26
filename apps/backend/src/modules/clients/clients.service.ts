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

    // Map observations -> metadata for process steps (same as processes.service)
    const processes = (data.processes ?? []).map((p: any) => ({
      ...p,
      steps: (p.steps ?? []).map((s: any) => ({
        ...s,
        metadata: this._parseMeta(s.observations),
      })),
    }))

    return { ...data, processes }
  }

  private _parseMeta(raw: string | null | undefined): Record<string, unknown> {
    if (!raw) return {}
    try { return JSON.parse(raw) } catch { return {} }
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

  async getRadarItems(companyId: string) {
    const today = new Date()
    const in180 = new Date(Date.now() + 180 * 86400000)
    const items: {
      id: string; clientId: string; clientName: string; clientPhone: string; clientCity: string
      processType: string; docType: string; category: string; expiresAt: string; daysUntil: number; urgency: string
    }[] = []

    const diffDays = (dateStr: string) =>
      Math.ceil((new Date(dateStr).getTime() - today.getTime()) / 86400000)

    const urgency = (days: number) =>
      days <= 15 ? 'danger' : days <= 30 ? 'warning' : days <= 60 ? 'info' : 'ok'

    // ── 1. Documents with expiresAt ──────────────────────────────────────────
    const DOC_LABELS: Record<string, string> = {
      PSYCHOLOGICAL_EXAM: 'Exame Psicológico',
      SHOOTING_EXAM: 'Exame de Tiro',
      CR: 'Certificado de Registro (CR)',
      CRAF: 'Certificado CRAF',
      CNH: 'CNH',
      RG: 'RG',
      PROOF_OF_RESIDENCE: 'Comprovante de Endereço',
      PROOF_OF_INCOME: 'Comprovante de Renda',
      CLUB_MEMBERSHIP: 'Filiação ao Clube',
      CERTIFICATIONS: 'Certidões',
      PHOTO_3X4: 'Foto 3x4',
    }

    const { data: docs } = await this.sb.from('documents')
      .select('*, client:clients!inner(id, name, phone, whatsapp, city, companyId)')
      .eq('clients.companyId', companyId)
      .not('expiresAt', 'is', null)
      .gte('expiresAt', today.toISOString())
      .lte('expiresAt', in180.toISOString())
      .order('expiresAt', { ascending: true })

    for (const doc of docs ?? []) {
      const client = (doc as any).client
      if (!client) continue
      const days = diffDays(doc.expiresAt)
      items.push({
        id: `doc-${doc.id}`,
        clientId: client.id,
        clientName: client.name,
        clientPhone: client.phone || client.whatsapp || '',
        clientCity: client.city || '',
        processType: doc.category === 'CRAF' ? 'CRAF' : doc.category === 'CR' ? 'CR' : 'DOC',
        docType: DOC_LABELS[doc.category] ?? doc.category,
        category: doc.category,
        expiresAt: doc.expiresAt,
        daysUntil: days,
        urgency: urgency(days),
      })
    }

    // ── 2. Process step metadata dates ───────────────────────────────────────
    const { data: steps } = await this.sb.from('process_steps')
      .select('*, process:processes!inner(id, type, companyId, client:clients(id, name, phone, whatsapp, city))')
      .eq('processes.companyId', companyId)
      .in('stepKey', ['psych_schedule', 'shooting_schedule', 'approved'])

    for (const step of steps ?? []) {
      const process = (step as any).process
      const client = process?.client
      if (!client) continue

      const meta = this._parseMeta(step.observations)

      // Psych / shooting scheduling date → valid 1 year
      if ((step.stepKey === 'psych_schedule' || step.stepKey === 'shooting_schedule') && meta.schedulingDate) {
        const examDate = new Date(meta.schedulingDate as string)
        const expiresAt = new Date(examDate)
        expiresAt.setFullYear(expiresAt.getFullYear() + 1)
        if (expiresAt >= today && expiresAt <= in180) {
          const days = diffDays(expiresAt.toISOString())
          items.push({
            id: `step-${step.id}`,
            clientId: client.id,
            clientName: client.name,
            clientPhone: client.phone || client.whatsapp || '',
            clientCity: client.city || '',
            processType: process.type,
            docType: step.stepKey === 'psych_schedule' ? 'Exame Psicológico' : 'Exame de Tiro',
            category: step.stepKey === 'psych_schedule' ? 'PSYCHOLOGICAL_EXAM' : 'SHOOTING_EXAM',
            expiresAt: expiresAt.toISOString().slice(0, 10),
            daysUntil: days,
            urgency: urgency(days),
          })
        }
      }

      // CR deferral date → CR valid 5 years
      if (step.stepKey === 'approved' && meta.deferralDate && process.type === 'CR') {
        const deferral = new Date(meta.deferralDate as string)
        const crExpiry = new Date(deferral)
        crExpiry.setFullYear(crExpiry.getFullYear() + 5)
        if (crExpiry >= today && crExpiry <= in180) {
          const days = diffDays(crExpiry.toISOString())
          items.push({
            id: `cr-${step.id}`,
            clientId: client.id,
            clientName: client.name,
            clientPhone: client.phone || client.whatsapp || '',
            clientCity: client.city || '',
            processType: 'CR',
            docType: 'Renovação do CR (5 anos)',
            category: 'CR_RENEWAL',
            expiresAt: crExpiry.toISOString().slice(0, 10),
            daysUntil: days,
            urgency: urgency(days),
          })
        }
      }

      // CRAF deferral → CRAF valid 3 years
      if (step.stepKey === 'approved' && meta.deferralDate && process.type === 'CRAF') {
        const deferral = new Date(meta.deferralDate as string)
        const crafExpiry = new Date(deferral)
        crafExpiry.setFullYear(crafExpiry.getFullYear() + 3)
        if (crafExpiry >= today && crafExpiry <= in180) {
          const days = diffDays(crafExpiry.toISOString())
          items.push({
            id: `craf-${step.id}`,
            clientId: client.id,
            clientName: client.name,
            clientPhone: client.phone || client.whatsapp || '',
            clientCity: client.city || '',
            processType: 'CRAF',
            docType: 'Renovação do CRAF (3 anos)',
            category: 'CRAF_RENEWAL',
            expiresAt: crafExpiry.toISOString().slice(0, 10),
            daysUntil: days,
            urgency: urgency(days),
          })
        }
      }
    }

    // Remove duplicates (same client + same category) keeping nearest
    const seen = new Map<string, typeof items[0]>()
    for (const item of items) {
      const key = `${item.clientId}-${item.category}`
      if (!seen.has(key) || item.daysUntil < seen.get(key)!.daysUntil) seen.set(key, item)
    }

    return [...seen.values()].sort((a, b) => a.daysUntil - b.daysUntil)
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
