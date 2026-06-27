import { Injectable, NotFoundException } from '@nestjs/common'
import { SupabaseService } from '../../supabase/supabase.service'
import { v4 as uuidv4 } from 'uuid'

type FindAllFilters = {
  clientId?: string
  type?: string
  status?: string
  search?: string
  dateFrom?: string
  dateTo?: string
  category?: string
}

@Injectable()
export class FinancialService {
  constructor(private sb: SupabaseService) {}

  // Use paidAt if set, fallback to dueDate, then createdAt
  private refDate(r: { paidAt?: string | null; dueDate?: string | null; createdAt: string }): string {
    return r.paidAt ?? r.dueDate ?? r.createdAt
  }

  async getDashboard(companyId: string, dateFrom?: string, dateTo?: string) {
    const now = new Date()
    const start = dateFrom
      ? new Date(dateFrom).toISOString()
      : new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
    const end = dateTo
      ? new Date(dateTo + 'T23:59:59').toISOString()
      : new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString()

    const { data: allRows } = await this.sb.from('financial_transactions')
      .select('amount, type, paidAt, dueDate, createdAt')
      .eq('companyId', companyId)
      .neq('status', 'CANCELLED')

    const inRange = (allRows ?? []).filter((r) => {
      const d = this.refDate(r)
      return d >= start && d <= end
    })

    const totalIncome = inRange.filter((r) => r.type === 'INCOME').reduce((s, r) => s + Number(r.amount), 0)
    const totalExpenses = inRange.filter((r) => r.type === 'EXPENSE').reduce((s, r) => s + Number(r.amount), 0)

    return {
      totalIncome, totalExpenses,
      profit: totalIncome - totalExpenses,
      margin: totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0,
    }
  }

  async getMonthlyHistory(companyId: string, dateFrom?: string, dateTo?: string) {
    const now = new Date()

    // Build list of months to show
    let months: { year: number; month: number; label: string }[]
    if (dateFrom || dateTo) {
      const start = dateFrom ? new Date(dateFrom) : new Date(now.getFullYear(), now.getMonth() - 5, 1)
      const end = dateTo ? new Date(dateTo) : now
      months = []
      let cur = new Date(start.getFullYear(), start.getMonth(), 1)
      while (cur <= end) {
        months.push({ year: cur.getFullYear(), month: cur.getMonth() + 1, label: cur.toLocaleString('pt-BR', { month: 'short' }) })
        cur = new Date(cur.getFullYear(), cur.getMonth() + 1, 1)
      }
      if (months.length > 12) months = months.slice(-12)
    } else {
      months = Array.from({ length: 6 }, (_, i) => {
        const d = new Date()
        d.setMonth(d.getMonth() - (5 - i))
        return { year: d.getFullYear(), month: d.getMonth() + 1, label: d.toLocaleString('pt-BR', { month: 'short' }) }
      })
    }

    const { data: allRows } = await this.sb.from('financial_transactions')
      .select('amount, type, paidAt, dueDate, createdAt')
      .eq('companyId', companyId)
      .neq('status', 'CANCELLED')

    return months.map((m) => {
      const start = new Date(m.year, m.month - 1, 1).toISOString()
      const end = new Date(m.year, m.month, 0, 23, 59, 59).toISOString()

      const inMonth = (allRows ?? []).filter((r) => {
        const d = this.refDate(r)
        return d >= start && d <= end
      })

      const inc = inMonth.filter((r) => r.type === 'INCOME').reduce((s, r) => s + Number(r.amount), 0)
      const exp = inMonth.filter((r) => r.type === 'EXPENSE').reduce((s, r) => s + Number(r.amount), 0)
      return { month: m.label, receita: inc, despesas: exp, lucro: inc - exp }
    })
  }

  async findAll(companyId: string, filters: FindAllFilters = {}) {
    const { clientId, type, status, search, dateFrom, dateTo, category } = filters

    let q = this.sb.from('financial_transactions')
      .select('*, client:clients(name)').eq('companyId', companyId)

    if (clientId) q = q.eq('clientId', clientId)
    if (type) q = q.eq('type', type)
    if (status) q = q.eq('status', status)
    if (category) q = q.eq('category', category)
    if (search) q = q.ilike('description', `%${search}%`)
    if (dateFrom) q = q.gte('createdAt', new Date(dateFrom).toISOString())
    if (dateTo) {
      const to = new Date(dateTo)
      to.setHours(23, 59, 59, 999)
      q = q.lte('createdAt', to.toISOString())
    }

    const { data, error } = await q.order('createdAt', { ascending: false }).limit(500)
    if (error) throw new Error(error.message)
    return data ?? []
  }

  async create(companyId: string, dto: any) {
    const now = new Date().toISOString()
    // Auto-set paidAt when status is PAID and no date was provided
    const paidAt = dto.status === 'PAID' ? (dto.paidAt || now) : (dto.paidAt || null)
    const { data, error } = await this.sb.from('financial_transactions')
      .insert({ id: uuidv4(), ...dto, paidAt, companyId, createdAt: now, updatedAt: now })
      .select().single()
    if (error) throw new Error(error.message)
    return data
  }

  async update(companyId: string, id: string, dto: any) {
    const { data: existing, error: findErr } = await this.sb.from('financial_transactions')
      .select('id, paidAt').eq('id', id).eq('companyId', companyId).single()
    if (findErr || !existing) throw new NotFoundException('Lançamento não encontrado')

    const { id: _id, companyId: _c, createdAt: _ca, ...safe } = dto
    // Auto-set paidAt when changing to PAID without a date
    if (safe.status === 'PAID' && !safe.paidAt && !(existing as any).paidAt) {
      safe.paidAt = new Date().toISOString()
    }

    const { data, error } = await this.sb.from('financial_transactions')
      .update({ ...safe, updatedAt: new Date().toISOString() })
      .eq('id', id).select('*, client:clients(name)').single()
    if (error) throw new Error(error.message)
    return data
  }

  async remove(companyId: string, id: string) {
    const { data: existing, error: findErr } = await this.sb.from('financial_transactions')
      .select('id').eq('id', id).eq('companyId', companyId).single()
    if (findErr || !existing) throw new NotFoundException('Lançamento não encontrado')

    const { error } = await this.sb.from('financial_transactions').delete().eq('id', id)
    if (error) throw new Error(error.message)
  }
}
